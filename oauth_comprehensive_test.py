#!/usr/bin/env python3
"""
COMPREHENSIVE OAUTH FLOW TESTING - CRITICAL DEBUGGING
Tests complete OAuth authentication flows for Google and Discord to identify end-to-end issues
"""

import requests
import sys
import json
from datetime import datetime
import uuid
import urllib.parse
import time

class ComprehensiveOAuthTester:
    def __init__(self, base_url="https://graphix-hub-4.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.test_results = {}
        self.critical_issues = []
        self.tests_run = 0
        self.tests_passed = 0
        
        print(f"🔐 COMPREHENSIVE OAUTH FLOW TESTING - CRITICAL DEBUGGING")
        print(f"📍 Base URL: {self.base_url}")
        print(f"📍 API URL: {self.api_url}")
        print("=" * 80)

    def log_test(self, name, success, details="", issue_level="info"):
        """Log test results with detailed information"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ Test {self.tests_run}: {name}")
        else:
            print(f"❌ Test {self.tests_run}: {name}")
            if issue_level == "critical":
                self.critical_issues.append(f"{name}: {details}")
        
        if details:
            print(f"   📄 {details}")
        
        self.test_results[name] = {
            "success": success,
            "details": details,
            "issue_level": issue_level
        }
        return success

    def test_oauth_environment_configuration(self):
        """Test 1: Verify OAuth environment variables and configuration"""
        print("\n" + "="*80)
        print("🔧 TEST 1: OAUTH ENVIRONMENT CONFIGURATION")
        print("="*80)
        
        try:
            # Test providers endpoint
            response = requests.get(f"{self.api_url}/auth/providers", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                providers = data.get("providers", [])
                enabled = data.get("enabled", {})
                
                # Check Discord configuration
                discord_configured = "discord" in providers and enabled.get("discord", False)
                self.log_test(
                    "Discord OAuth Configuration", 
                    discord_configured,
                    f"Discord in providers: {'discord' in providers}, Discord enabled: {enabled.get('discord', False)}",
                    "critical" if not discord_configured else "info"
                )
                
                # Check Google configuration
                google_configured = "google" in providers and enabled.get("google", False)
                self.log_test(
                    "Google OAuth Configuration", 
                    google_configured,
                    f"Google in providers: {'google' in providers}, Google enabled: {enabled.get('google', False)}",
                    "critical" if not google_configured else "info"
                )
                
                return discord_configured and google_configured
            else:
                self.log_test(
                    "OAuth Providers Endpoint", 
                    False,
                    f"Status: {response.status_code}, Response: {response.text[:200]}",
                    "critical"
                )
                return False
                
        except Exception as e:
            self.log_test(
                "OAuth Environment Configuration", 
                False,
                f"Error: {str(e)}",
                "critical"
            )
            return False

    def test_oauth_authorization_urls(self):
        """Test 2: Test OAuth authorization URL generation"""
        print("\n" + "="*80)
        print("🔗 TEST 2: OAUTH AUTHORIZATION URL GENERATION")
        print("="*80)
        
        providers_to_test = ["discord", "google"]
        all_passed = True
        
        for provider in providers_to_test:
            try:
                response = requests.get(f"{self.api_url}/auth/{provider}/login", timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    auth_url = data.get("authorization_url", "")
                    state = data.get("state", "")
                    
                    # Validate authorization URL structure
                    url_valid = self.validate_authorization_url(provider, auth_url)
                    state_valid = len(state) > 20  # State should be secure
                    
                    success = url_valid and state_valid
                    self.log_test(
                        f"{provider.title()} Authorization URL Generation",
                        success,
                        f"URL valid: {url_valid}, State length: {len(state)}, URL: {auth_url[:100]}...",
                        "critical" if not success else "info"
                    )
                    
                    if success:
                        # Store for callback testing
                        self.test_results[f"{provider}_auth_data"] = {
                            "authorization_url": auth_url,
                            "state": state
                        }
                    
                    all_passed = all_passed and success
                else:
                    self.log_test(
                        f"{provider.title()} Authorization URL Generation",
                        False,
                        f"Status: {response.status_code}, Response: {response.text[:200]}",
                        "critical"
                    )
                    all_passed = False
                    
            except Exception as e:
                self.log_test(
                    f"{provider.title()} Authorization URL Generation",
                    False,
                    f"Error: {str(e)}",
                    "critical"
                )
                all_passed = False
        
        return all_passed

    def validate_authorization_url(self, provider, url):
        """Validate OAuth authorization URL structure"""
        try:
            parsed = urllib.parse.urlparse(url)
            params = urllib.parse.parse_qs(parsed.query)
            
            if provider == "discord":
                expected_host = "discord.com"
                expected_path = "/api/oauth2/authorize"
                required_params = ["client_id", "redirect_uri", "scope", "state", "response_type"]
            elif provider == "google":
                expected_host = "accounts.google.com"
                expected_path = "/o/oauth2/v2/auth"
                required_params = ["client_id", "redirect_uri", "scope", "state", "response_type"]
            else:
                return False
            
            # Check host and path
            if expected_host not in parsed.netloc or parsed.path != expected_path:
                return False
            
            # Check required parameters
            for param in required_params:
                if param not in params:
                    return False
            
            return True
            
        except Exception:
            return False

    def test_oauth_callback_success_simulation(self):
        """Test 3: Simulate OAuth callback with success parameters"""
        print("\n" + "="*80)
        print("✅ TEST 3: OAUTH CALLBACK SUCCESS SIMULATION")
        print("="*80)
        
        providers_to_test = ["discord", "google"]
        all_passed = True
        
        for provider in providers_to_test:
            try:
                # Generate mock success callback parameters
                mock_code = f"mock_auth_code_{provider}_{int(time.time())}"
                mock_state = f"mock_state_{provider}_{int(time.time())}"
                
                # Test callback with success parameters
                callback_url = f"{self.api_url}/auth/{provider}/callback"
                params = {
                    "code": mock_code,
                    "state": mock_state
                }
                
                response = requests.get(callback_url, params=params, allow_redirects=False, timeout=10)
                
                # Should get a redirect (3xx) or error response, not 200 HTML
                if response.status_code in [301, 302, 307, 400, 401, 422, 500]:
                    # Check if it's redirecting to frontend with error (expected for mock data)
                    if response.status_code in [301, 302, 307]:
                        location = response.headers.get('Location', '')
                        if 'error=' in location:
                            success = True
                            details = f"Correctly redirected to frontend with error (expected for mock data). Status: {response.status_code}"
                        else:
                            success = False
                            details = f"Redirected but no error in URL. Status: {response.status_code}, Location: {location}"
                    else:
                        success = True
                        details = f"Returned appropriate error status: {response.status_code}"
                else:
                    success = False
                    details = f"Unexpected response: Status {response.status_code}, Content-Type: {response.headers.get('content-type', 'unknown')}"
                
                self.log_test(
                    f"{provider.title()} Callback Success Simulation",
                    success,
                    details,
                    "critical" if not success else "info"
                )
                
                all_passed = all_passed and success
                
            except Exception as e:
                self.log_test(
                    f"{provider.title()} Callback Success Simulation",
                    False,
                    f"Error: {str(e)}",
                    "critical"
                )
                all_passed = False
        
        return all_passed

    def test_oauth_callback_error_scenarios(self):
        """Test 4: Test OAuth callback error handling"""
        print("\n" + "="*80)
        print("🚨 TEST 4: OAUTH CALLBACK ERROR SCENARIOS")
        print("="*80)
        
        error_scenarios = [
            ("redirect_uri_mismatch", "Invalid OAuth2 redirect_uri"),
            ("access_denied", "User denied access"),
            ("invalid_request", "The request is missing a required parameter"),
            ("unauthorized_client", "The client is not authorized"),
            ("unsupported_response_type", "The authorization server does not support this response type"),
            ("invalid_scope", "The requested scope is invalid"),
            ("server_error", "The authorization server encountered an unexpected condition"),
            ("temporarily_unavailable", "The authorization server is currently unable to handle the request")
        ]
        
        providers_to_test = ["discord", "google"]
        all_passed = True
        
        for provider in providers_to_test:
            provider_passed = True
            
            for error_code, error_description in error_scenarios:
                try:
                    callback_url = f"{self.api_url}/auth/{provider}/callback"
                    params = {
                        "error": error_code,
                        "error_description": error_description
                    }
                    
                    response = requests.get(callback_url, params=params, allow_redirects=False, timeout=10)
                    
                    # Should redirect to frontend with error (3xx status)
                    if response.status_code in [301, 302, 307]:
                        location = response.headers.get('Location', '')
                        if 'error=' in location and error_code in location:
                            success = True
                            details = f"Correctly handled error: {error_code}"
                        else:
                            success = False
                            details = f"Redirected but error not properly formatted in URL: {location}"
                    else:
                        success = False
                        details = f"Should redirect to frontend, got status: {response.status_code}"
                    
                    if not success:
                        provider_passed = False
                        self.log_test(
                            f"{provider.title()} Error Handling - {error_code}",
                            success,
                            details,
                            "critical"
                        )
                    
                except Exception as e:
                    provider_passed = False
                    self.log_test(
                        f"{provider.title()} Error Handling - {error_code}",
                        False,
                        f"Error: {str(e)}",
                        "critical"
                    )
            
            if provider_passed:
                self.log_test(
                    f"{provider.title()} Error Handling - All Scenarios",
                    True,
                    f"All {len(error_scenarios)} error scenarios handled correctly"
                )
            
            all_passed = all_passed and provider_passed
        
        return all_passed

    def test_oauth_missing_parameters(self):
        """Test 5: Test OAuth callback with missing parameters"""
        print("\n" + "="*80)
        print("❓ TEST 5: OAUTH CALLBACK MISSING PARAMETERS")
        print("="*80)
        
        providers_to_test = ["discord", "google"]
        all_passed = True
        
        for provider in providers_to_test:
            try:
                callback_url = f"{self.api_url}/auth/{provider}/callback"
                
                # Test with no parameters
                response = requests.get(callback_url, allow_redirects=False, timeout=10)
                
                # Should redirect to frontend with error (3xx status)
                if response.status_code in [301, 302, 307]:
                    location = response.headers.get('Location', '')
                    if 'error=' in location:
                        success = True
                        details = f"Correctly redirected to frontend with error for missing parameters. Status: {response.status_code}"
                    else:
                        success = False
                        details = f"Redirected but no error in URL: {location}"
                elif response.status_code == 422:
                    success = False
                    details = f"Still returning 422 validation error instead of redirecting to frontend"
                else:
                    success = False
                    details = f"Unexpected status: {response.status_code}, Content-Type: {response.headers.get('content-type', 'unknown')}"
                
                self.log_test(
                    f"{provider.title()} Missing Parameters Handling",
                    success,
                    details,
                    "critical" if not success else "info"
                )
                
                all_passed = all_passed and success
                
            except Exception as e:
                self.log_test(
                    f"{provider.title()} Missing Parameters Handling",
                    False,
                    f"Error: {str(e)}",
                    "critical"
                )
                all_passed = False
        
        return all_passed

    def test_oauth_provider_configuration_details(self):
        """Test 6: Deep dive into OAuth provider configuration"""
        print("\n" + "="*80)
        print("🔍 TEST 6: OAUTH PROVIDER CONFIGURATION DEEP DIVE")
        print("="*80)
        
        try:
            # Test each provider's login endpoint for detailed configuration
            providers_to_test = ["discord", "google"]
            all_passed = True
            
            for provider in providers_to_test:
                response = requests.get(f"{self.api_url}/auth/{provider}/login", timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    auth_url = data.get("authorization_url", "")
                    
                    # Parse URL to check configuration details
                    parsed = urllib.parse.urlparse(auth_url)
                    params = urllib.parse.parse_qs(parsed.query)
                    
                    # Check specific configuration details
                    client_id = params.get("client_id", [""])[0]
                    redirect_uri = params.get("redirect_uri", [""])[0]
                    scope = params.get("scope", [""])[0]
                    
                    # Validate configuration
                    config_issues = []
                    
                    if not client_id:
                        config_issues.append("Missing client_id")
                    elif len(client_id) < 10:
                        config_issues.append("Client ID seems too short")
                    
                    if not redirect_uri:
                        config_issues.append("Missing redirect_uri")
                    elif self.base_url not in redirect_uri:
                        config_issues.append(f"Redirect URI doesn't match base URL: {redirect_uri}")
                    
                    if not scope:
                        config_issues.append("Missing scope")
                    
                    success = len(config_issues) == 0
                    details = f"Client ID: {client_id[:20]}..., Redirect URI: {redirect_uri}, Scope: {scope}"
                    if config_issues:
                        details += f", Issues: {', '.join(config_issues)}"
                    
                    self.log_test(
                        f"{provider.title()} Configuration Details",
                        success,
                        details,
                        "critical" if not success else "info"
                    )
                    
                    all_passed = all_passed and success
                else:
                    self.log_test(
                        f"{provider.title()} Configuration Details",
                        False,
                        f"Failed to get login endpoint: Status {response.status_code}",
                        "critical"
                    )
                    all_passed = False
            
            return all_passed
            
        except Exception as e:
            self.log_test(
                "OAuth Provider Configuration Deep Dive",
                False,
                f"Error: {str(e)}",
                "critical"
            )
            return False

    def test_oauth_token_exchange_simulation(self):
        """Test 7: Simulate OAuth token exchange process"""
        print("\n" + "="*80)
        print("🔄 TEST 7: OAUTH TOKEN EXCHANGE SIMULATION")
        print("="*80)
        
        # This test simulates what happens during token exchange
        # We can't do real token exchange without valid OAuth codes,
        # but we can test the endpoint behavior
        
        providers_to_test = ["discord", "google"]
        all_passed = True
        
        for provider in providers_to_test:
            try:
                # Test with invalid but properly formatted code
                mock_code = "invalid_mock_code_for_testing"
                mock_state = "mock_state_for_testing"
                
                callback_url = f"{self.api_url}/auth/{provider}/callback"
                params = {
                    "code": mock_code,
                    "state": mock_state
                }
                
                response = requests.get(callback_url, params=params, allow_redirects=False, timeout=10)
                
                # Should handle the invalid code gracefully (redirect with error)
                if response.status_code in [301, 302, 307]:
                    location = response.headers.get('Location', '')
                    if 'error=' in location:
                        success = True
                        details = f"Correctly handled invalid token exchange (redirected with error)"
                    else:
                        success = False
                        details = f"Redirected but no error indication: {location}"
                elif response.status_code in [400, 401, 500]:
                    success = True
                    details = f"Returned appropriate error status for invalid code: {response.status_code}"
                else:
                    success = False
                    details = f"Unexpected response to invalid code: Status {response.status_code}"
                
                self.log_test(
                    f"{provider.title()} Token Exchange Simulation",
                    success,
                    details,
                    "critical" if not success else "info"
                )
                
                all_passed = all_passed and success
                
            except Exception as e:
                self.log_test(
                    f"{provider.title()} Token Exchange Simulation",
                    False,
                    f"Error: {str(e)}",
                    "critical"
                )
                all_passed = False
        
        return all_passed

    def test_oauth_user_creation_flow(self):
        """Test 8: Test OAuth user creation/update flow components"""
        print("\n" + "="*80)
        print("👤 TEST 8: OAUTH USER CREATION FLOW COMPONENTS")
        print("="*80)
        
        try:
            # Test if user model supports OAuth fields by checking existing user
            # First, create a test user to check the model structure
            test_user_data = {
                "email": f"oauth_test_{int(time.time())}@test.com",
                "password": "TestPassword123!",
                "full_name": "OAuth Test User",
                "role": "client"
            }
            
            # Register test user
            response = requests.post(
                f"{self.api_url}/auth/register",
                json=test_user_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                user_data = response.json()
                
                # Check if OAuth fields are present
                oauth_fields = ["oauth_providers", "last_login", "login_method"]
                missing_fields = []
                
                for field in oauth_fields:
                    if field not in user_data:
                        missing_fields.append(field)
                
                success = len(missing_fields) == 0
                details = f"OAuth fields present: {[f for f in oauth_fields if f in user_data]}"
                if missing_fields:
                    details += f", Missing: {missing_fields}"
                
                self.log_test(
                    "User Model OAuth Compatibility",
                    success,
                    details,
                    "critical" if not success else "info"
                )
                
                return success
            else:
                self.log_test(
                    "User Model OAuth Compatibility",
                    False,
                    f"Failed to create test user: Status {response.status_code}",
                    "critical"
                )
                return False
                
        except Exception as e:
            self.log_test(
                "User Model OAuth Compatibility",
                False,
                f"Error: {str(e)}",
                "critical"
            )
            return False

    def test_oauth_redirect_url_validation(self):
        """Test 9: Validate OAuth redirect URLs match configuration"""
        print("\n" + "="*80)
        print("🔗 TEST 9: OAUTH REDIRECT URL VALIDATION")
        print("="*80)
        
        providers_to_test = ["discord", "google"]
        all_passed = True
        
        for provider in providers_to_test:
            try:
                response = requests.get(f"{self.api_url}/auth/{provider}/login", timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    auth_url = data.get("authorization_url", "")
                    
                    # Parse redirect URI from authorization URL
                    parsed = urllib.parse.urlparse(auth_url)
                    params = urllib.parse.parse_qs(parsed.query)
                    redirect_uri = params.get("redirect_uri", [""])[0]
                    
                    # Expected redirect URI
                    expected_redirect = f"{self.base_url}/api/auth/{provider}/callback"
                    
                    success = redirect_uri == expected_redirect
                    details = f"Expected: {expected_redirect}, Got: {redirect_uri}"
                    
                    self.log_test(
                        f"{provider.title()} Redirect URL Validation",
                        success,
                        details,
                        "critical" if not success else "info"
                    )
                    
                    all_passed = all_passed and success
                else:
                    self.log_test(
                        f"{provider.title()} Redirect URL Validation",
                        False,
                        f"Failed to get authorization URL: Status {response.status_code}",
                        "critical"
                    )
                    all_passed = False
                    
            except Exception as e:
                self.log_test(
                    f"{provider.title()} Redirect URL Validation",
                    False,
                    f"Error: {str(e)}",
                    "critical"
                )
                all_passed = False
        
        return all_passed

    def run_comprehensive_oauth_tests(self):
        """Run all comprehensive OAuth tests"""
        print("🚀 Starting Comprehensive OAuth Flow Testing...")
        print("This will identify specific issues preventing end-to-end OAuth authentication")
        print()
        
        test_functions = [
            self.test_oauth_environment_configuration,
            self.test_oauth_authorization_urls,
            self.test_oauth_callback_success_simulation,
            self.test_oauth_callback_error_scenarios,
            self.test_oauth_missing_parameters,
            self.test_oauth_provider_configuration_details,
            self.test_oauth_token_exchange_simulation,
            self.test_oauth_user_creation_flow,
            self.test_oauth_redirect_url_validation
        ]
        
        passed_tests = 0
        for test_func in test_functions:
            if test_func():
                passed_tests += 1
        
        # Generate comprehensive report
        self.generate_comprehensive_report(passed_tests, len(test_functions))

    def generate_comprehensive_report(self, passed_tests, total_tests):
        """Generate comprehensive OAuth testing report"""
        print("\n" + "="*80)
        print("📊 COMPREHENSIVE OAUTH TESTING REPORT")
        print("="*80)
        
        print(f"Overall Results: {self.tests_passed}/{self.tests_run} individual tests passed")
        print(f"Test Categories: {passed_tests}/{total_tests} categories passed")
        print()
        
        if self.critical_issues:
            print("🚨 CRITICAL ISSUES IDENTIFIED:")
            for i, issue in enumerate(self.critical_issues, 1):
                print(f"   {i}. {issue}")
            print()
        
        # Analyze results and provide recommendations
        print("🔍 ANALYSIS AND RECOMMENDATIONS:")
        
        if passed_tests == total_tests:
            print("   ✅ All OAuth tests passed - OAuth backend appears to be working correctly")
            print("   💡 If users are still experiencing issues, the problem may be in:")
            print("      - Frontend OAuth button implementation")
            print("      - Frontend callback parameter handling")
            print("      - User interface feedback (toast notifications)")
            print("      - Browser-specific issues or CORS problems")
        else:
            print("   ❌ OAuth backend has critical issues that need to be addressed:")
            
            # Specific recommendations based on failed tests
            if any("Configuration" in issue for issue in self.critical_issues):
                print("      🔧 Fix OAuth environment variable configuration")
                print("      🔧 Verify client IDs, secrets, and redirect URIs are correct")
            
            if any("Callback" in issue for issue in self.critical_issues):
                print("      🔧 Fix OAuth callback endpoint handling")
                print("      🔧 Ensure proper error handling and redirects")
            
            if any("Token Exchange" in issue for issue in self.critical_issues):
                print("      🔧 Fix OAuth token exchange implementation")
                print("      🔧 Verify API calls to OAuth providers are working")
            
            if any("User" in issue for issue in self.critical_issues):
                print("      🔧 Fix user model OAuth field compatibility")
                print("      🔧 Ensure user creation/update flow supports OAuth")
        
        print()
        print("🎯 NEXT STEPS:")
        if self.critical_issues:
            print("   1. Address all critical issues listed above")
            print("   2. Re-run this test suite to verify fixes")
            print("   3. Test frontend OAuth integration")
            print("   4. Perform end-to-end user testing")
        else:
            print("   1. Test frontend OAuth button functionality")
            print("   2. Verify frontend callback parameter handling")
            print("   3. Check user interface feedback systems")
            print("   4. Test with real OAuth providers (Google/Discord)")
        
        print("\n" + "="*80)

if __name__ == "__main__":
    tester = ComprehensiveOAuthTester()
    tester.run_comprehensive_oauth_tests()