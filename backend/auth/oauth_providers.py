"""
OAuth Providers Configuration and Management
Handles Discord, Google, Apple, and LinkedIn OAuth integration
"""

import os
import secrets
from typing import Dict, Any, Optional
from authlib.integrations.requests_client import OAuth2Session
from authlib.common.errors import AuthlibBaseError
import httpx
import logging

logger = logging.getLogger(__name__)

class OAuthProvider:
    """Base OAuth provider class"""
    
    def __init__(self, client_id: str, client_secret: str, redirect_uri: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri
        self.session = None
    
    def get_authorization_url(self, state: str = None) -> tuple[str, str]:
        """Generate authorization URL and state"""
        raise NotImplementedError
    
    async def get_access_token(self, code: str, state: str = None) -> Dict[str, Any]:
        """Exchange authorization code for access token"""
        raise NotImplementedError
    
    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """Get user information using access token"""
        raise NotImplementedError

class DiscordOAuthProvider(OAuthProvider):
    """Discord OAuth Provider"""
    
    AUTHORIZATION_BASE_URL = "https://discord.com/api/oauth2/authorize"
    TOKEN_URL = "https://discord.com/api/oauth2/token"
    USER_INFO_URL = "https://discord.com/api/users/@me"
    SCOPES = ["identify", "email"]
    
    def get_authorization_url(self, state: str = None) -> tuple[str, str]:
        """Generate Discord authorization URL"""
        if not state:
            state = secrets.token_urlsafe(32)
        
        # Build authorization URL manually for Discord
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
            "scope": " ".join(self.SCOPES),
            "state": state
        }
        
        from urllib.parse import urlencode
        authorization_url = f"{self.AUTHORIZATION_BASE_URL}?{urlencode(params)}"
        
        return authorization_url, state
    
    async def get_access_token(self, code: str, state: str = None) -> Dict[str, Any]:
        """Exchange authorization code for Discord access token"""
        try:
            data = {
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": self.redirect_uri,
                "scope": " ".join(self.SCOPES)
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.TOKEN_URL,
                    data=data,
                    headers={"Content-Type": "application/x-www-form-urlencoded"}
                )
                response.raise_for_status()
                return response.json()
                
        except Exception as e:
            logger.error(f"Error getting Discord access token: {e}")
            raise AuthlibBaseError(f"Token exchange failed: {e}")
    
    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """Get Discord user information"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    self.USER_INFO_URL,
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                response.raise_for_status()
                user_data = response.json()
                
                # Normalize user data to common format
                return {
                    "id": user_data.get("id"),
                    "email": user_data.get("email"),
                    "name": user_data.get("username"),
                    "display_name": user_data.get("global_name") or user_data.get("username"),
                    "avatar": f"https://cdn.discordapp.com/avatars/{user_data.get('id')}/{user_data.get('avatar')}.png" if user_data.get("avatar") else None,
                    "provider": "discord",
                    "provider_id": user_data.get("id"),
                    "raw_data": user_data
                }
                
        except Exception as e:
            logger.error(f"Error getting Discord user info: {e}")
            raise AuthlibBaseError(f"User info retrieval failed: {e}")

class GoogleOAuthProvider(OAuthProvider):
    """Google OAuth Provider (placeholder for future implementation)"""
    
    AUTHORIZATION_BASE_URL = "https://accounts.google.com/o/oauth2/v2/auth"
    TOKEN_URL = "https://oauth2.googleapis.com/token"
    USER_INFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"
    SCOPES = ["openid", "profile", "email"]
    
    def get_authorization_url(self, state: str = None) -> tuple[str, str]:
        """Generate Google authorization URL"""
        if not state:
            state = secrets.token_urlsafe(32)
        
        # Build authorization URL manually for Google
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
            "scope": " ".join(self.SCOPES),
            "state": state,
            "access_type": "offline",
            "prompt": "select_account"
        }
        
        from urllib.parse import urlencode
        authorization_url = f"{self.AUTHORIZATION_BASE_URL}?{urlencode(params)}"
        
        return authorization_url, state
    
    async def get_access_token(self, code: str, state: str = None) -> Dict[str, Any]:
        """Exchange authorization code for Google access token"""
        try:
            data = {
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": self.redirect_uri,
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.TOKEN_URL,
                    data=data,
                    headers={"Content-Type": "application/x-www-form-urlencoded"}
                )
                response.raise_for_status()
                return response.json()
                
        except Exception as e:
            logger.error(f"Error getting Google access token: {e}")
            raise AuthlibBaseError(f"Token exchange failed: {e}")
    
    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """Get Google user information"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.USER_INFO_URL}?access_token={access_token}"
                )
                response.raise_for_status()
                user_data = response.json()
                
                # Normalize user data to common format
                return {
                    "id": user_data.get("id"),
                    "email": user_data.get("email"),
                    "name": user_data.get("name"),
                    "display_name": user_data.get("name"),
                    "avatar": user_data.get("picture"),
                    "provider": "google",
                    "provider_id": user_data.get("id"),
                    "raw_data": user_data
                }
                
        except Exception as e:
            logger.error(f"Error getting Google user info: {e}")
            raise AuthlibBaseError(f"User info retrieval failed: {e}")

class OAuthManager:
    """OAuth Manager to handle multiple providers"""
    
    def __init__(self):
        self.providers = {}
        self._initialize_providers()
    
    def _initialize_providers(self):
        """Initialize OAuth providers based on environment variables"""
        
        # Discord
        discord_client_id = os.getenv("DISCORD_CLIENT_ID")
        discord_client_secret = os.getenv("DISCORD_CLIENT_SECRET")
        discord_redirect_uri = os.getenv("DISCORD_REDIRECT_URI")
        
        if discord_client_id and discord_client_secret and discord_redirect_uri:
            self.providers["discord"] = DiscordOAuthProvider(
                client_id=discord_client_id,
                client_secret=discord_client_secret,
                redirect_uri=discord_redirect_uri
            )
            logger.info("Discord OAuth provider initialized")
        
        # Google (placeholder)
        google_client_id = os.getenv("GOOGLE_CLIENT_ID")
        google_client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
        google_redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
        
        if google_client_id and google_client_secret and google_redirect_uri:
            self.providers["google"] = GoogleOAuthProvider(
                client_id=google_client_id,
                client_secret=google_client_secret,
                redirect_uri=google_redirect_uri
            )
            logger.info("Google OAuth provider initialized")
    
    def get_provider(self, provider_name: str) -> Optional[OAuthProvider]:
        """Get OAuth provider by name"""
        return self.providers.get(provider_name.lower())
    
    def get_available_providers(self) -> list[str]:
        """Get list of available OAuth providers"""
        return list(self.providers.keys())
    
    def is_provider_available(self, provider_name: str) -> bool:
        """Check if provider is available"""
        return provider_name.lower() in self.providers

# Global OAuth manager instance
oauth_manager = OAuthManager()