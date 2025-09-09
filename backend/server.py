from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, File, UploadFile, Query, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid, bcrypt, jwt
from datetime import datetime, timedelta, timezone, date
from enum import Enum
import shutil
import secrets

# OAuth providers will be imported after env loading

# Counter Statistics Model
class CounterStats(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    projects_completed: int = Field(default=13)
    testimonials_count: int = Field(default=1)
    team_members: int = Field(default=6)
    support_available: str = Field(default="24/7")
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_by: Optional[str] = None

# Testimonial Model
class Testimonial(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    client_role: str = ""
    client_avatar: str = ""
    rating: int = Field(default=5, ge=1, le=5, description="Rating must be between 1 and 5")
    title: str
    content: str
    highlights: List[str] = Field(default_factory=list)
    is_featured: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    approved: bool = Field(default=False)

class TestimonialCreate(BaseModel):
    client_name: str
    client_role: str = ""
    client_avatar: str = ""
    rating: int = Field(default=5, ge=1, le=5, description="Rating must be between 1 and 5")
    title: str
    content: str
    highlights: List[str] = Field(default_factory=list)
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Import OAuth providers after environment loading
from auth.oauth_providers import oauth_manager

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Eternals Studio API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# OAuth2 setup
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
SECRET_KEY = os.environ.get("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Enhanced Role System
class UserRole(str, Enum):
    CLIENT = "client"
    CLIENT_MANAGER = "client_manager"  # New role: can manage clients + content
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

# Project Status Enum
class ProjectStatus(str, Enum):
    DRAFT = "draft"
    IN_PROGRESS = "in_progress"  
    REVIEW = "review"
    REVISION = "revision"
    APPROVED = "approved"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"
    CANCELLED = "cancelled"

# Invoice Status Enum
class InvoiceStatus(str, Enum):
    DRAFT = "draft"
    SENT = "sent"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"

# Message Status Enum
class MessageStatus(str, Enum):
    UNREAD = "unread"
    READ = "read"
    ARCHIVED = "archived"

# File Access Type Enum
class FileAccessType(str, Enum):
    FREE = "free"           # Always accessible
    PAID = "paid"           # Requires payment/invoice completion
    CONTRACT = "contract"   # Contract work - always accessible to client

# Workflow Step Status
class WorkflowStepStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    SKIPPED = "skipped"

# Enhanced User Model
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.CLIENT
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None
    avatar_url: Optional[str] = None
    
    # Contact Information
    company: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    website: Optional[str] = None
    
    # Business Information
    industry: Optional[str] = None
    company_size: Optional[str] = None
    annual_revenue: Optional[str] = None
    referral_source: Optional[str] = None
    notes: Optional[str] = None
    
    # Account Information
    oauth_providers: Dict[str, Dict[str, Any]] = Field(default_factory=dict)
    last_login: Optional[datetime] = None
    login_method: Optional[str] = None
    assigned_client_manager: Optional[str] = None  # User ID of assigned client manager
    
    # Preferences
    email_notifications: bool = True
    project_notifications: bool = True
    marketing_emails: bool = False

# Project File Model
class ProjectFile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    original_filename: str
    file_path: str
    file_size: int
    file_type: str
    access_type: FileAccessType = FileAccessType.FREE
    uploaded_by: str  # User ID
    uploaded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    description: Optional[str] = None
    is_active: bool = True
    requires_payment: bool = False
    associated_invoice: Optional[str] = None  # Invoice ID if payment required

# Project Workflow Step Model
class WorkflowStep(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    step_number: int
    title: str
    description: str
    status: WorkflowStepStatus = WorkflowStepStatus.PENDING
    estimated_duration: Optional[str] = None  # "3-5 days"
    completed_at: Optional[datetime] = None
    assigned_to: Optional[str] = None  # User ID
    client_approval_required: bool = False
    client_approved: bool = False
    client_approved_at: Optional[datetime] = None
    notes: Optional[str] = None

# Enhanced Project Model
class ClientProject(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    client_id: str  # User ID
    assigned_team_members: List[str] = Field(default_factory=list)  # User IDs
    status: ProjectStatus = ProjectStatus.DRAFT
    priority: str = "medium"  # low, medium, high, urgent
    
    # Project Details
    project_type: str  # "Logo Design", "Web Development", etc.
    budget: Optional[float] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = 0
    start_date: Optional[date] = None
    due_date: Optional[date] = None
    completed_date: Optional[date] = None
    
    # Workflow
    workflow_steps: List[WorkflowStep] = Field(default_factory=list)
    current_step: Optional[int] = None
    
    # Files and Assets
    files: List[ProjectFile] = Field(default_factory=list)
    client_files: List[str] = Field(default_factory=list)  # Files uploaded by client
    deliverables: List[str] = Field(default_factory=list)  # Final deliverable file IDs
    
    # Communication
    last_activity: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    client_last_seen: Optional[datetime] = None
    
    # Metadata
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None
    is_template: bool = False
    template_name: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    custom_fields: Dict[str, Any] = Field(default_factory=dict)

# Message Model for Communication System
class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: Optional[str] = None  # Can be project-specific or general
    sender_id: str  # User ID
    recipient_id: Optional[str] = None  # If specific recipient, otherwise all project members
    subject: Optional[str] = None
    content: str
    message_type: str = "text"  # text, file, system_notification
    status: MessageStatus = MessageStatus.UNREAD
    sent_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    read_at: Optional[datetime] = None
    email_sent: bool = False
    email_sent_at: Optional[datetime] = None
    attachments: List[str] = Field(default_factory=list)  # File IDs
    is_system_message: bool = False

# Enhanced Invoice Model
class Invoice(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    invoice_number: str = Field(default_factory=lambda: f"INV-{int(datetime.now().timestamp())}")
    client_id: str  # User ID
    project_id: Optional[str] = None
    status: InvoiceStatus = InvoiceStatus.DRAFT
    
    # Invoice Details
    title: str
    description: Optional[str] = None
    subtotal: float
    tax_rate: float = 0.0
    tax_amount: float = 0.0
    discount_amount: float = 0.0
    total_amount: float
    
    # Payment Information
    due_date: date
    paid_date: Optional[date] = None
    payment_method: Optional[str] = None
    payment_reference: Optional[str] = None
    
    # Dates
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    sent_at: Optional[datetime] = None
    
    # Access Control
    locked_files: List[str] = Field(default_factory=list)  # File IDs locked until payment
    unlocked_at: Optional[datetime] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole = UserRole.CLIENT
    company: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class OAuthCallback(BaseModel):
    code: str
    state: str

class OAuthUserCreate(BaseModel):
    email: EmailStr
    full_name: str
    avatar_url: Optional[str] = None
    provider: str
    provider_id: str
    role: UserRole = UserRole.CLIENT

class ProjectPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

# Legacy Project Model (for backward compatibility)
class Project(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    client_id: str
    assigned_admin_id: Optional[str] = None
    status: ProjectStatus = ProjectStatus.DRAFT
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    due_date: Optional[datetime] = None
    files: List[str] = []
    invoice_id: Optional[str] = None
    is_locked: bool = False

# Legacy Project Create Model
class ProjectCreate(BaseModel):
    title: str
    description: str
    client_id: str
    due_date: Optional[datetime] = None

# Legacy Invoice Create Model
class InvoiceCreate(BaseModel):
    project_id: str
    amount: float
    description: str
    due_date: Optional[datetime] = None

# Legacy Message Create Model
class MessageCreate(BaseModel):
    project_id: str
    content: str

# Content Management Models
class ContentSection(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    section_name: str
    content: Dict[str, Any]
    page: str = "home"
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_by: str

class ContentSectionUpdate(BaseModel):
    content: Dict[str, Any]

# Message System Models
class MessageType(str, Enum):
    PROJECT_UPDATE = "project_update"
    GENERAL = "general"
    INVOICE = "invoice"
    SYSTEM = "system"

class ClientMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    from_user_id: str
    to_user_id: str
    subject: str
    content: str
    message_type: MessageType = MessageType.GENERAL
    project_id: Optional[str] = None
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    attachments: List[str] = Field(default_factory=list)

class MessageCreate(BaseModel):
    to_user_id: str
    subject: str
    content: str
    message_type: MessageType = MessageType.GENERAL
    project_id: Optional[str] = None

class Project(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    client_id: str
    assigned_admin_id: Optional[str] = None
    status: ProjectStatus = ProjectStatus.DRAFT
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    due_date: Optional[datetime] = None
    files: List[str] = []
    invoice_id: Optional[str] = None
    is_locked: bool = False

class ProjectCreate(BaseModel):
    title: str
    description: str
    client_id: str
    due_date: Optional[datetime] = None

class Invoice(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    amount: float
    status: InvoiceStatus = InvoiceStatus.DRAFT
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    due_date: Optional[datetime] = None
    description: str

class InvoiceCreate(BaseModel):
    project_id: str
    amount: float
    description: str
    due_date: Optional[datetime] = None

class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    sender_id: str
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_read: bool = False

class MessageCreate(BaseModel):
    project_id: str
    content: str

class ContentSection(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    section_name: str
    content: Dict[str, Any]
    page: str = "home"
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_by: str

class ContentSectionUpdate(BaseModel):
    content: Dict[str, Any]

# Utility functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    user_dict = await db.users.find_one({"email": email})
    if user_dict is None:
        raise credentials_exception
    return User(**user_dict)

# OAuth Helper Functions
async def create_or_update_oauth_user(oauth_user_data: Dict[str, Any]) -> User:
    """Create or update user from OAuth provider data"""
    provider = oauth_user_data.get("provider")
    provider_id = oauth_user_data.get("provider_id")
    email = oauth_user_data.get("email")
    
    # Check if user exists by OAuth provider ID
    existing_user = await db.users.find_one({
        f"oauth_providers.{provider}.provider_id": provider_id
    })
    
    if existing_user:
        # Update existing user's last login and OAuth data
        await db.users.update_one(
            {"id": existing_user["id"]},
            {
                "$set": {
                    f"oauth_providers.{provider}": {
                        "provider_id": provider_id,
                        "email": email,
                        "last_login": datetime.now(timezone.utc)
                    },
                    "last_login": datetime.now(timezone.utc),
                    "login_method": provider,
                    "avatar_url": oauth_user_data.get("avatar") or existing_user.get("avatar_url")
                }
            }
        )
        updated_user = await db.users.find_one({"id": existing_user["id"]})
        return User(**updated_user)
    
    # Check if user exists by email
    existing_user_by_email = await db.users.find_one({"email": email})
    
    if existing_user_by_email:
        # Link OAuth provider to existing email account
        await db.users.update_one(
            {"id": existing_user_by_email["id"]},
            {
                "$set": {
                    f"oauth_providers.{provider}": {
                        "provider_id": provider_id,
                        "email": email,
                        "last_login": datetime.now(timezone.utc)
                    },
                    "last_login": datetime.now(timezone.utc),
                    "login_method": provider,
                    "avatar_url": oauth_user_data.get("avatar") or existing_user_by_email.get("avatar_url")
                }
            }
        )
        updated_user = await db.users.find_one({"id": existing_user_by_email["id"]})
        return User(**updated_user)
    
    # Create new user
    new_user = User(
        email=email,
        full_name=oauth_user_data.get("display_name") or oauth_user_data.get("name"),
        avatar_url=oauth_user_data.get("avatar"),
        role=UserRole.CLIENT,  # Default role for OAuth users
        oauth_providers={
            provider: {
                "provider_id": provider_id,
                "email": email,
                "last_login": datetime.now(timezone.utc)
            }
        },
        last_login=datetime.now(timezone.utc),
        login_method=provider
    )
    
    await db.users.insert_one(new_user.dict())
    return new_user

def determine_redirect_url(user: User) -> str:
    """Determine where to redirect user based on their role"""
    if user.role in [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CLIENT_MANAGER]:
        return "https://graphix-hub-4.preview.emergentagent.com/dashboard"
    else:
        return "https://graphix-hub-4.preview.emergentagent.com/client-portal"

# Authentication routes
@api_router.post("/auth/register", response_model=User)
async def register_user(user_data: UserCreate):
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = hash_password(user_data.password)
    user_dict = user_data.dict()
    del user_dict['password']
    user_obj = User(**user_dict)
    
    user_with_password = {**user_obj.dict(), 'password': hashed_password}
    await db.users.insert_one(user_with_password)
    return user_obj

@api_router.post("/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user_dict = await db.users.find_one({"email": form_data.username})
    if not user_dict or not verify_password(form_data.password, user_dict['password']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_dict['email']}, expires_delta=access_token_expires
    )
    user = User(**user_dict)
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@api_router.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

# OAuth Authentication Routes
@api_router.get("/auth/{provider}/login")
async def oauth_login(provider: str):
    """Initiate OAuth login for specified provider"""
    try:
        provider_instance = oauth_manager.get_provider(provider)
        if not provider_instance:
            raise HTTPException(status_code=400, detail=f"OAuth provider '{provider}' not available")
        
        # Generate state for CSRF protection
        state = secrets.token_urlsafe(32)
        
        # Store state in session (in production, use Redis or similar)
        # For now, we'll include it in the callback URL
        
        authorization_url, _ = provider_instance.get_authorization_url(state=state)
        
        return {
            "authorization_url": authorization_url,
            "state": state,
            "provider": provider
        }
        
    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is
    except Exception as e:
        logger.error(f"OAuth login error for {provider}: {e}")
        raise HTTPException(status_code=500, detail=f"OAuth login failed: {str(e)}")

@api_router.get("/auth/{provider}/callback")
async def oauth_callback(
    provider: str,
    code: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    error: Optional[str] = Query(None),
    error_description: Optional[str] = Query(None)
):
    """Handle OAuth callback from provider (both success and error scenarios)"""
    try:
        # Check if OAuth provider returned an error
        if error:
            logger.error(f"OAuth error from {provider}: {error} - {error_description}")
            error_message = error_description or error
            # Redirect to frontend with OAuth error
            error_url = f"https://graphix-hub-4.preview.emergentagent.com/auth?error={error}&provider={provider}&message={error_message}"
            return RedirectResponse(url=error_url)
        
        # Check if we have required success parameters
        if not code or not state:
            logger.error(f"OAuth callback missing required parameters: code={bool(code)}, state={bool(state)}")
            error_url = f"https://graphix-hub-4.preview.emergentagent.com/auth?error=missing_parameters&provider={provider}&message=Missing required OAuth parameters"
            return RedirectResponse(url=error_url)
        
        logger.info(f"OAuth callback received for {provider} with code: {code[:10]}...")
        
        provider_instance = oauth_manager.get_provider(provider)
        if not provider_instance:
            logger.error(f"OAuth provider '{provider}' not available")
            raise HTTPException(status_code=400, detail=f"OAuth provider '{provider}' not available")
        
        # Exchange code for access token
        logger.info(f"Exchanging code for access token with {provider}")
        token_data = await provider_instance.get_access_token(code, state)
        logger.info(f"Token data received: {list(token_data.keys()) if token_data else 'None'}")
        
        access_token = token_data.get("access_token")
        
        if not access_token:
            logger.error(f"No access token received from {provider}")
            raise HTTPException(status_code=400, detail="Failed to get access token")
        
        # Get user info from provider
        logger.info(f"Getting user info from {provider}")
        user_info = await provider_instance.get_user_info(access_token)
        logger.info(f"User info received: email={user_info.get('email')}, name={user_info.get('name')}")
        
        # Create or update user in database  
        logger.info(f"Creating/updating user in database")
        user = await create_or_update_oauth_user(user_info)
        logger.info(f"User created/updated: {user.email}, role: {user.role}")
        
        # Generate JWT token for our app
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        jwt_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        logger.info(f"JWT token generated for user: {user.email}")
        
        # Determine redirect URL based on user role
        redirect_url = determine_redirect_url(user)
        logger.info(f"Redirecting to: {redirect_url}")
        
        # Add token to redirect URL as query parameter (frontend will handle it)
        redirect_url_with_token = f"{redirect_url}?token={jwt_token}&user_id={user.id}&provider={provider}"
        
        return RedirectResponse(url=redirect_url_with_token)
        
    except Exception as e:
        logger.error(f"OAuth callback error for {provider}: {str(e)}", exc_info=True)
        # Redirect to frontend with error
        error_url = f"https://graphix-hub-4.preview.emergentagent.com/auth?error=oauth_failed&provider={provider}&message={str(e)}"
        return RedirectResponse(url=error_url)

@api_router.get("/auth/providers")
async def get_available_providers():
    """Get list of available OAuth providers"""
    return {
        "providers": oauth_manager.get_available_providers(),
        "enabled": {
            "discord": oauth_manager.is_provider_available("discord"),
            "google": oauth_manager.is_provider_available("google"),
            "apple": oauth_manager.is_provider_available("apple"),
            "linkedin": oauth_manager.is_provider_available("linkedin")
        }
    }

# =============================================
# ENHANCED PROJECT MANAGEMENT API ENDPOINTS
# =============================================

# Enhanced Project Management
@api_router.post("/projects/create", response_model=ClientProject)
async def create_enhanced_project(project: ProjectCreate, current_user: User = Depends(get_current_user)):
    """Create a new project with workflow steps"""
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CLIENT_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized to create projects")
    
    project_data = {
        "id": str(uuid.uuid4()),
        "title": project.title,
        "description": project.description,
        "client_id": project.client_id,
        "project_type": "General",
        "status": ProjectStatus.DRAFT,
        "priority": "medium",
        "workflow_steps": [],
        "files": [],
        "client_files": [],
        "deliverables": [],
        "assigned_team_members": [],
        "tags": [],
        "custom_fields": {},
        "created_at": datetime.now(timezone.utc),
        "last_activity": datetime.now(timezone.utc)
    }
    
    await db.enhanced_projects.insert_one(project_data)
    return ClientProject(**project_data)

@api_router.get("/projects/enhanced", response_model=List[ClientProject])
async def get_enhanced_projects(current_user: User = Depends(get_current_user)):
    """Get all projects for admin users or client's projects for client users"""
    if current_user.role == UserRole.CLIENT:
        projects = await db.enhanced_projects.find({"client_id": current_user.id}).to_list(length=None)
    else:
        projects = await db.enhanced_projects.find().to_list(length=None)
    
    return [ClientProject(**project) for project in projects]

@api_router.get("/projects/enhanced/{project_id}", response_model=ClientProject)
async def get_enhanced_project(project_id: str, current_user: User = Depends(get_current_user)):
    """Get specific project details"""
    project = await db.enhanced_projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check permissions
    if (current_user.role == UserRole.CLIENT and project["client_id"] != current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to view this project")
    
    return ClientProject(**project)

# Client Management API
@api_router.get("/clients", response_model=List[User])
async def get_clients(current_user: User = Depends(get_current_user)):
    """Get all clients for admin users"""
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CLIENT_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized to view clients")
    
    # Client managers can only see their assigned clients
    if current_user.role == UserRole.CLIENT_MANAGER:
        clients = await db.users.find({
            "$or": [
                {"assigned_client_manager": current_user.id},
                {"role": UserRole.CLIENT}
            ]
        }).to_list(length=None)
    else:
        clients = await db.users.find({"role": UserRole.CLIENT}).to_list(length=None)
    
    return [User(**client) for client in clients]

@api_router.get("/clients/{client_id}/projects", response_model=List[ClientProject])
async def get_client_projects(client_id: str, current_user: User = Depends(get_current_user)):
    """Get all projects for a specific client"""
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CLIENT_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    projects = await db.enhanced_projects.find({"client_id": client_id}).to_list(length=None)
    return [ClientProject(**project) for project in projects]

@api_router.put("/clients/{client_id}/assign-manager")
async def assign_client_manager(client_id: str, manager_data: dict, current_user: User = Depends(get_current_user)):
    """Assign a client manager to a client"""
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    manager_id = manager_data.get("manager_id")
    await db.users.update_one(
        {"id": client_id},
        {"$set": {"assigned_client_manager": manager_id, "updated_at": datetime.now(timezone.utc)}}
    )
    
    return {"message": "Client manager assigned successfully"}

# File Management API
@api_router.post("/projects/{project_id}/files/upload")
async def upload_project_file(
    project_id: str,
    file: UploadFile = File(...),
    access_type: str = Form("free"),
    description: str = Form(""),
    current_user: User = Depends(get_current_user)
):
    """Upload a file to a project"""
    # Create uploads directory if it doesn't exist
    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)
    
    # Generate unique filename
    file_id = str(uuid.uuid4())
    file_extension = Path(file.filename).suffix
    stored_filename = f"{file_id}{file_extension}"
    file_path = upload_dir / stored_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create file record
    project_file = {
        "id": file_id,
        "filename": stored_filename,
        "original_filename": file.filename,
        "file_path": str(file_path),
        "file_size": file_path.stat().st_size,
        "file_type": file.content_type,
        "access_type": FileAccessType(access_type),
        "uploaded_by": current_user.id,
        "uploaded_at": datetime.now(timezone.utc),
        "description": description,
        "is_active": True,
        "requires_payment": access_type == "paid",
        "associated_invoice": None
    }
    
    # Add file to project
    await db.enhanced_projects.update_one(
        {"id": project_id},
        {
            "$push": {"files": project_file},
            "$set": {"updated_at": datetime.now(timezone.utc)}
        }
    )
    
    return {"message": "File uploaded successfully", "file_id": file_id}

@api_router.get("/projects/{project_id}/files")
async def get_project_files(project_id: str, current_user: User = Depends(get_current_user)):
    """Get all files for a project"""
    project = await db.enhanced_projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check permissions
    if (current_user.role == UserRole.CLIENT and project["client_id"] != current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    files = project.get("files", [])
    
    # Filter files based on access permissions for clients
    if current_user.role == UserRole.CLIENT:
        accessible_files = []
        for file_data in files:
            if (file_data["access_type"] == "free" or 
                file_data["access_type"] == "contract" or
                not file_data["requires_payment"]):
                accessible_files.append(file_data)
        files = accessible_files
    
    return files

# Workflow Management API
@api_router.post("/projects/{project_id}/workflow/step")
async def add_workflow_step(
    project_id: str, 
    step_data: dict, 
    current_user: User = Depends(get_current_user)
):
    """Add a workflow step to a project"""
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CLIENT_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    workflow_step = {
        "id": str(uuid.uuid4()),
        "step_number": step_data["step_number"],
        "title": step_data["title"],
        "description": step_data["description"],
        "status": WorkflowStepStatus.PENDING,
        "estimated_duration": step_data.get("estimated_duration"),
        "assigned_to": step_data.get("assigned_to"),
        "client_approval_required": step_data.get("client_approval_required", False),
        "client_approved": False,
        "notes": step_data.get("notes", "")
    }
    
    await db.enhanced_projects.update_one(
        {"id": project_id},
        {
            "$push": {"workflow_steps": workflow_step},
            "$set": {"updated_at": datetime.now(timezone.utc)}
        }
    )
    
    return {"message": "Workflow step added successfully", "step_id": workflow_step["id"]}

@api_router.put("/projects/{project_id}/workflow/step/{step_id}/complete")
async def complete_workflow_step(
    project_id: str, 
    step_id: str, 
    current_user: User = Depends(get_current_user)
):
    """Mark a workflow step as completed"""
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CLIENT_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.enhanced_projects.update_one(
        {"id": project_id, "workflow_steps.id": step_id},
        {
            "$set": {
                "workflow_steps.$.status": WorkflowStepStatus.COMPLETED,
                "workflow_steps.$.completed_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    # Send notification to client
    await create_system_notification(
        project_id=project_id,
        message=f"Workflow step completed: {step_id}",
        recipient_role=UserRole.CLIENT
    )
    
    return {"message": "Workflow step completed successfully"}

# Communication System API
@api_router.post("/messages/send")
async def send_message(message_data: dict, current_user: User = Depends(get_current_user)):
    """Send a message"""
    message = {
        "id": str(uuid.uuid4()),
        "project_id": message_data.get("project_id"),
        "sender_id": current_user.id,
        "recipient_id": message_data.get("recipient_id"),
        "subject": message_data.get("subject"),
        "content": message_data["content"],
        "message_type": message_data.get("message_type", "text"),
        "status": MessageStatus.UNREAD,
        "sent_at": datetime.now(timezone.utc),
        "email_sent": False,
        "attachments": message_data.get("attachments", []),
        "is_system_message": False
    }
    
    await db.messages.insert_one(message)
    
    # TODO: Send email notification
    
    return {"message": "Message sent successfully", "message_id": message["id"]}

@api_router.get("/messages")
async def get_messages(
    project_id: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Get messages for current user"""
    query = {
        "$or": [
            {"sender_id": current_user.id},
            {"recipient_id": current_user.id},
            {"recipient_id": None}  # Broadcast messages
        ]
    }
    
    if project_id:
        query["project_id"] = project_id
    
    messages = await db.messages.find(query).sort("sent_at", -1).to_list(length=100)
    return [Message(**message) for message in messages]

# System notification helper
async def create_system_notification(project_id: str, message: str, recipient_role: UserRole = None):
    """Create a system notification"""
    system_message = {
        "id": str(uuid.uuid4()),
        "project_id": project_id,
        "sender_id": "system",
        "recipient_id": None,
        "subject": "Project Update",
        "content": message,
        "message_type": "system_notification",
        "status": MessageStatus.UNREAD,
        "sent_at": datetime.now(timezone.utc),
        "email_sent": False,
        "attachments": [],
        "is_system_message": True
    }
    
    await db.messages.insert_one(system_message)

# Enhanced Invoice Management
@api_router.post("/invoices/create", response_model=Invoice)
async def create_enhanced_invoice(invoice_data: dict, current_user: User = Depends(get_current_user)):
    """Create a new invoice"""
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CLIENT_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    invoice = {
        "id": str(uuid.uuid4()),
        "invoice_number": f"INV-{int(datetime.now().timestamp())}",
        "client_id": invoice_data["client_id"],
        "project_id": invoice_data.get("project_id"),
        "status": InvoiceStatus.DRAFT,
        "title": invoice_data["title"],
        "description": invoice_data.get("description"),
        "subtotal": invoice_data["subtotal"],
        "tax_rate": invoice_data.get("tax_rate", 0.0),
        "tax_amount": invoice_data.get("tax_amount", 0.0),
        "discount_amount": invoice_data.get("discount_amount", 0.0),
        "total_amount": invoice_data["total_amount"],
        "due_date": datetime.strptime(invoice_data["due_date"], "%Y-%m-%d").date(),
        "created_at": datetime.now(timezone.utc),
        "locked_files": invoice_data.get("locked_files", [])
    }
    
    await db.enhanced_invoices.insert_one(invoice)
    return Invoice(**invoice)

@api_router.get("/invoices", response_model=List[Invoice])
async def get_enhanced_invoices(current_user: User = Depends(get_current_user)):
    """Get invoices"""
    if current_user.role == UserRole.CLIENT:
        invoices = await db.enhanced_invoices.find({"client_id": current_user.id}).to_list(length=None)
    else:
        invoices = await db.enhanced_invoices.find().to_list(length=None)
    
    return [Invoice(**invoice) for invoice in invoices]

# Role Management API
@api_router.post("/admin/roles/create")
async def create_custom_role(role_data: dict, current_user: User = Depends(get_current_user)):
    """Create a custom role (Super Admin only)"""
    if current_user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Only Super Admin can create roles")
    
    custom_role = {
        "id": str(uuid.uuid4()),
        "name": role_data["name"],
        "display_name": role_data["display_name"],
        "permissions": role_data["permissions"],
        "created_by": current_user.id,
        "created_at": datetime.now(timezone.utc),
        "is_active": True
    }
    
    await db.custom_roles.insert_one(custom_role)
    return {"message": "Custom role created successfully", "role_id": custom_role["id"]}

@api_router.get("/admin/roles")
async def get_custom_roles(current_user: User = Depends(get_current_user)):
    """Get all custom roles"""
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    roles = await db.custom_roles.find({"is_active": True}).to_list(length=None)
    return roles

# Content Management API
@api_router.put("/admin/content/{section}")
async def update_content_section(
    section: str, 
    content_data: dict, 
    current_user: User = Depends(get_current_user)
):
    """Update content section"""
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CLIENT_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    content_update = {
        "id": str(uuid.uuid4()),
        "section_name": section,
        "content": content_data["content"],
        "page": content_data.get("page", "home"),
        "updated_at": datetime.now(timezone.utc),
        "updated_by": current_user.id
    }
    
    await db.content_sections.replace_one(
        {"section_name": section},
        content_update,
        upsert=True
    )
    
    return {"message": "Content updated successfully"}

@api_router.get("/content/{section}")
async def get_content_section(section: str):
    """Get content section (public endpoint)"""
    content = await db.content_sections.find_one({"section_name": section})
    if not content:
        return {"content": {}}
    
    return {"content": content["content"]}

# =============================================
# LEGACY API ENDPOINTS (for backward compatibility)
# =============================================
@api_router.post("/projects", response_model=Project)
async def create_project(project_data: ProjectCreate, current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized to create projects")
    
    project_obj = Project(**project_data.dict())
    await db.projects.insert_one(project_obj.dict())
    return project_obj

@api_router.get("/projects", response_model=List[Project])
async def get_projects(current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.CLIENT:
        projects = await db.projects.find({"client_id": current_user.id}).to_list(1000)
    else:
        projects = await db.projects.find().to_list(1000)
    return [Project(**project) for project in projects]

@api_router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str, current_user: User = Depends(get_current_user)):
    project_dict = await db.projects.find_one({"id": project_id})
    if not project_dict:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = Project(**project_dict)
    if current_user.role == UserRole.CLIENT and project.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this project")
    
    return project

# Invoice routes
@api_router.post("/invoices", response_model=Invoice)
async def create_invoice(invoice_data: InvoiceCreate, current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized to create invoices")
    
    invoice_obj = Invoice(**invoice_data.dict())
    await db.invoices.insert_one(invoice_obj.dict())
    
    # Lock the project until payment
    await db.projects.update_one(
        {"id": invoice_data.project_id},
        {"$set": {"invoice_id": invoice_obj.id, "is_locked": True, "status": ProjectStatus.LOCKED}}
    )
    
    return invoice_obj

@api_router.get("/invoices", response_model=List[Invoice])
async def get_invoices(current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.CLIENT:
        # Get client's project invoices
        user_projects = await db.projects.find({"client_id": current_user.id}).to_list(1000)
        project_ids = [p['id'] for p in user_projects]
        invoices = await db.invoices.find({"project_id": {"$in": project_ids}}).to_list(1000)
    else:
        invoices = await db.invoices.find().to_list(1000)
    return [Invoice(**invoice) for invoice in invoices]

@api_router.put("/invoices/{invoice_id}/pay")
async def pay_invoice(invoice_id: str, current_user: User = Depends(get_current_user)):
    invoice_dict = await db.invoices.find_one({"id": invoice_id})
    if not invoice_dict:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Update invoice status
    await db.invoices.update_one(
        {"id": invoice_id},
        {"$set": {"status": InvoiceStatus.PAID}}
    )
    
    # Unlock the project
    await db.projects.update_one(
        {"invoice_id": invoice_id},
        {"$set": {"is_locked": False, "status": ProjectStatus.IN_PROGRESS}}
    )
    
    return {"message": "Invoice paid successfully"}

# Message routes
@api_router.post("/messages", response_model=Message)
async def create_message(message_data: MessageCreate, current_user: User = Depends(get_current_user)):
    message_obj = Message(**message_data.dict(), sender_id=current_user.id)
    await db.messages.insert_one(message_obj.dict())
    return message_obj

@api_router.get("/messages/{project_id}", response_model=List[Message])
async def get_project_messages(project_id: str, current_user: User = Depends(get_current_user)):
    # Check project access
    project_dict = await db.projects.find_one({"id": project_id})
    if not project_dict:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = Project(**project_dict)
    if current_user.role == UserRole.CLIENT and project.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view these messages")
    
    messages = await db.messages.find({"project_id": project_id}).to_list(1000)
    return [Message(**message) for message in messages]

# Content Management routes
@api_router.get("/content", response_model=List[ContentSection])
async def get_content():
    content = await db.content.find().to_list(1000)
    return [ContentSection(**section) for section in content]

@api_router.get("/content/{section_name}", response_model=ContentSection)
async def get_content_section(section_name: str):
    content_dict = await db.content.find_one({"section_name": section_name})
    if not content_dict:
        raise HTTPException(status_code=404, detail="Content section not found")
    return ContentSection(**content_dict)

@api_router.put("/content/{section_name}", response_model=ContentSection)
async def update_content_section(
    section_name: str, 
    content_update: ContentSectionUpdate, 
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CLIENT_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized to update content")
    
    updated_content = ContentSection(
        section_name=section_name,
        content=content_update.content,
        updated_by=current_user.id
    )
    
    await db.content.update_one(
        {"section_name": section_name},
        {"$set": updated_content.dict()},
        upsert=True
    )
    
    return updated_content

# File upload routes
@api_router.post("/files/upload")
async def upload_file(
    file: UploadFile = File(...),
    project_id: str = None,
    current_user: User = Depends(get_current_user)
):
    # Create uploads directory if it doesn't exist
    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)
    
    file_id = str(uuid.uuid4())
    file_extension = file.filename.split('.')[-1] if '.' in file.filename else ''
    filename = f"{file_id}.{file_extension}" if file_extension else file_id
    file_path = upload_dir / filename
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    file_record = {
        "id": file_id,
        "original_name": file.filename,
        "filename": filename,
        "file_path": str(file_path),
        "project_id": project_id,
        "uploaded_by": current_user.id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.files.insert_one(file_record)
    
    if project_id:
        await db.projects.update_one(
            {"id": project_id},
            {"$push": {"files": file_id}}
        )
    
    return {"file_id": file_id, "filename": filename}

# Counter Statistics routes
@api_router.get("/counter-stats", response_model=CounterStats)
async def get_counter_stats():
    """Get current counter statistics synced with actual visible website content"""
    try:
        # Count actual visible content on website pages
        # Projects: Count projects displayed on portfolio page (currently 13 projects)
        project_count = 13  # All projects shown on portfolio page
        
        # Team Members: Count team members shown on about page (currently 6 members)
        team_count = 6  # Team members shown on about page: Fives, Psyphonic, Kiran, In Gloom Media, Griff, Corbyn
        
        # Testimonials: Count testimonials shown on home page testimonial section
        testimonial_count = await db.testimonials.count_documents({"approved": True}) or 1  # Default to 1 (current testimonial)
        
        stats = await db.counter_stats.find_one()
        if not stats:
            # Create default stats if none exist
            default_stats = CounterStats(
                projects_completed=project_count,
                testimonials_count=testimonial_count,
                team_members=team_count
            )
            stats_dict = default_stats.dict()
            await db.counter_stats.insert_one(stats_dict)
            return default_stats
        
        # Update all counts to match visible website content
        stats["projects_completed"] = project_count
        stats["testimonials_count"] = testimonial_count
        stats["team_members"] = team_count
        
        # Remove MongoDB's _id field
        if "_id" in stats:
            del stats["_id"]
        
        return CounterStats(**stats)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching counter stats: {str(e)}")

@api_router.put("/counter-stats", response_model=CounterStats)
async def update_counter_stats(
    stats: CounterStats,
    current_user: User = Depends(get_current_user)
):
    """Update counter statistics (Admin only) - Counters sync with visible website content"""
    try:
        # Check if user is admin
        if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Sync all counts with actual visible website content (ignore manual input)
        project_count = 13  # Projects shown on portfolio page
        team_count = 6     # Team members shown on about page
        testimonial_count = await db.testimonials.count_documents({"approved": True}) or 1  # Testimonials shown on home page
        
        stats.projects_completed = project_count
        stats.testimonials_count = testimonial_count
        stats.team_members = team_count
        
        # Update timestamps and user
        stats.last_updated = datetime.now(timezone.utc)
        stats.updated_by = current_user.email
        
        # Prepare data for MongoDB
        stats_dict = stats.dict()
        
        # Update or insert counter stats
        result = await db.counter_stats.replace_one(
            {},  # Match any document (there should only be one)
            stats_dict,
            upsert=True
        )
        
        return stats
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating counter stats: {str(e)}")

# User Management Routes (Super Admin only)
@api_router.get("/users", response_model=List[User])
async def get_all_users(current_user: User = Depends(get_current_user)):
    """Get all users (Super Admin only)"""
    if current_user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Super admin access required")
    
    users = await db.users.find().to_list(length=None)
    return [User(**user) for user in users]

@api_router.put("/users/{user_id}/role")
async def update_user_role(user_id: str, new_role: UserRole, current_user: User = Depends(get_current_user)):
    """Update user role (Super Admin only)"""
    if current_user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Super admin access required")
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"role": new_role.value}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": f"User role updated to {new_role.value}"}

@api_router.put("/users/{user_id}/status")
async def toggle_user_status(user_id: str, current_user: User = Depends(get_current_user)):
    """Toggle user active status (Super Admin only)"""
    if current_user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Super admin access required")
    
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_status = not user.get("is_active", True)
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"is_active": new_status}}
    )
    
    return {"message": f"User {'activated' if new_status else 'deactivated'} successfully"}

# Enhanced Project Management Routes
@api_router.get("/admin/projects", response_model=List[Project])
async def get_all_admin_projects(current_user: User = Depends(get_current_user)):
    """Get all projects for admin dashboard"""
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CLIENT_MANAGER]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    projects = await db.projects.find().to_list(length=None)
    return [Project(**project) for project in projects]

@api_router.put("/projects/{project_id}/status")
async def update_project_status(project_id: str, status: str, current_user: User = Depends(get_current_user)):
    """Update project status"""
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CLIENT_MANAGER]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.projects.update_one(
        {"id": project_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc)}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return {"message": "Project status updated successfully"}

# Dashboard Analytics Routes
@api_router.get("/admin/analytics")
async def get_dashboard_analytics(current_user: User = Depends(get_current_user)):
    """Get dashboard analytics data"""
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Count various entities
    total_users = await db.users.count_documents({})
    active_users = await db.users.count_documents({"is_active": True})
    total_projects = await db.projects.count_documents({})
    completed_projects = await db.projects.count_documents({"status": "completed"})
    pending_testimonials = await db.testimonials.count_documents({"approved": False})
    approved_testimonials = await db.testimonials.count_documents({"approved": True})
    
    # Recent activity (last 30 days)
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    recent_users = await db.users.count_documents({"created_at": {"$gte": thirty_days_ago}})
    recent_projects = await db.projects.count_documents({"created_at": {"$gte": thirty_days_ago}})
    recent_testimonials = await db.testimonials.count_documents({"created_at": {"$gte": thirty_days_ago}})
    
    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "recent": recent_users
        },
        "projects": {
            "total": total_projects,
            "completed": completed_projects,
            "recent": recent_projects
        },
        "testimonials": {
            "total": approved_testimonials + pending_testimonials,
            "approved": approved_testimonials,
            "pending": pending_testimonials,
            "recent": recent_testimonials
        }
    }
# Testimonial Management Endpoints
# Public testimonials (approved only)
@api_router.get("/testimonials", response_model=List[Testimonial])
async def get_testimonials():
    """Get all approved testimonials for public display"""
    try:
        testimonials = await db.testimonials.find({"approved": True}).to_list(length=None)
        
        # Remove MongoDB's _id field from each testimonial
        for testimonial in testimonials:
            if "_id" in testimonial:
                del testimonial["_id"]
        
        return [Testimonial(**testimonial) for testimonial in testimonials]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching testimonials: {str(e)}")

# Admin testimonials (all testimonials for review)
@api_router.get("/testimonials/all", response_model=List[Testimonial])
async def get_all_testimonials(current_user: User = Depends(get_current_user)):
    """Get all testimonials (approved and unapproved) for admin review"""
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CLIENT_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized to view all testimonials")
    
    try:
        testimonials = await db.testimonials.find().to_list(length=None)
        
        # Remove MongoDB's _id field from each testimonial
        for testimonial in testimonials:
            if "_id" in testimonial:
                del testimonial["_id"]
        
        return [Testimonial(**testimonial) for testimonial in testimonials]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching all testimonials: {str(e)}")

@api_router.post("/testimonials", response_model=Testimonial)
async def create_testimonial(testimonial: TestimonialCreate):
    """Create a new testimonial (requires admin approval)"""
    try:
        testimonial_dict = testimonial.dict()
        testimonial_dict["id"] = str(uuid.uuid4())
        testimonial_dict["created_at"] = datetime.now(timezone.utc)
        testimonial_dict["approved"] = False  # Requires admin approval
        
        result = await db.testimonials.insert_one(testimonial_dict)
        
        return Testimonial(**testimonial_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating testimonial: {str(e)}")

# Enhanced Testimonial Management Endpoints
@api_router.put("/testimonials/{testimonial_id}", response_model=Testimonial)
async def update_testimonial(
    testimonial_id: str, 
    testimonial_data: dict, 
    current_user: User = Depends(get_current_user)
):
    """Update a testimonial (admin only)"""
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CLIENT_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized to update testimonials")
    
    try:
        # Update testimonial in database
        update_data = {
            "client_name": testimonial_data.get("client_name"),
            "client_role": testimonial_data.get("client_role"),
            "title": testimonial_data.get("title"),
            "content": testimonial_data.get("content"),
            "rating": testimonial_data.get("rating", 5),
            "is_featured": testimonial_data.get("is_featured", False),
            "updated_at": datetime.now(timezone.utc)
        }
        
        result = await db.testimonials.update_one(
            {"id": testimonial_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Testimonial not found")
        
        # Get updated testimonial
        updated_testimonial = await db.testimonials.find_one({"id": testimonial_id})
        if "_id" in updated_testimonial:
            del updated_testimonial["_id"]
            
        return Testimonial(**updated_testimonial)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating testimonial: {str(e)}")

@api_router.put("/testimonials/{testimonial_id}/featured")
async def toggle_testimonial_featured(
    testimonial_id: str, 
    featured_data: dict, 
    current_user: User = Depends(get_current_user)
):
    """Toggle testimonial featured status (admin only)"""
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CLIENT_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized to feature testimonials")
    
    try:
        result = await db.testimonials.update_one(
            {"id": testimonial_id},
            {"$set": {"is_featured": featured_data.get("is_featured", False)}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Testimonial not found")
            
        return {"message": "Testimonial featured status updated successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating featured status: {str(e)}")

@api_router.delete("/testimonials/{testimonial_id}")
async def delete_testimonial(testimonial_id: str, current_user: User = Depends(get_current_user)):
    """Delete a testimonial (admin only)"""
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CLIENT_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized to delete testimonials")
    
    try:
        result = await db.testimonials.delete_one({"id": testimonial_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Testimonial not found")
            
        return {"message": "Testimonial deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting testimonial: {str(e)}")

# Enhanced Client Management Endpoints
@api_router.post("/clients/create", response_model=User)
async def create_client(client_data: dict, current_user: User = Depends(get_current_user)):
    """Create a new client (admin only)"""
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CLIENT_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized to create clients")
    
    try:
        # Check if email already exists
        existing_user = await db.users.find_one({"email": client_data["email"]})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already exists")
        
        # Create new client
        new_client = {
            "id": str(uuid.uuid4()),
            "email": client_data["email"],
            "full_name": client_data["full_name"],
            "role": UserRole.CLIENT,
            "is_active": True,
            "created_at": datetime.now(timezone.utc),
            "company": client_data.get("company"),
            "phone": client_data.get("phone"),
            "address": client_data.get("address"),
            "city": client_data.get("city"),
            "state": client_data.get("state"),
            "zip_code": client_data.get("zip_code"),
            "country": client_data.get("country"),
            "website": client_data.get("website"),
            "industry": client_data.get("industry"),
            "notes": client_data.get("notes"),
            "assigned_client_manager": client_data.get("assigned_client_manager"),
            "email_notifications": True,
            "project_notifications": True,
            "marketing_emails": False,
            "oauth_providers": {}
        }
        
        await db.users.insert_one(new_client)
        
        # Remove MongoDB's _id field
        if "_id" in new_client:
            del new_client["_id"]
            
        return User(**new_client)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating client: {str(e)}")

@api_router.put("/clients/{client_id}", response_model=User)
async def update_client(
    client_id: str, 
    client_data: dict, 
    current_user: User = Depends(get_current_user)
):
    """Update client information (admin only)"""
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CLIENT_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized to update clients")
    
    try:
        update_data = {
            "full_name": client_data.get("full_name"),
            "company": client_data.get("company"),
            "phone": client_data.get("phone"),
            "address": client_data.get("address"),
            "city": client_data.get("city"),
            "state": client_data.get("state"),
            "zip_code": client_data.get("zip_code"),
            "country": client_data.get("country"),
            "website": client_data.get("website"),
            "industry": client_data.get("industry"),
            "notes": client_data.get("notes"),
            "assigned_client_manager": client_data.get("assigned_client_manager"),
            "updated_at": datetime.now(timezone.utc)
        }
        
        # Remove None values
        update_data = {k: v for k, v in update_data.items() if v is not None}
        
        result = await db.users.update_one(
            {"id": client_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Client not found")
        
        # Get updated client
        updated_client = await db.users.find_one({"id": client_id})
        if "_id" in updated_client:
            del updated_client["_id"]
            
        return User(**updated_client)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating client: {str(e)}")

@api_router.delete("/clients/{client_id}")
async def delete_client(client_id: str, current_user: User = Depends(get_current_user)):
    """Delete a client (super admin only)"""
    if current_user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Only super admin can delete clients")
    
    try:
        # Check if client has active projects
        active_projects = await db.enhanced_projects.find({"client_id": client_id}).to_list(length=1)
        if active_projects:
            raise HTTPException(status_code=400, detail="Cannot delete client with active projects")
        
        result = await db.users.delete_one({"id": client_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Client not found")
            
        return {"message": "Client deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting client: {str(e)}")

# Enhanced Project Management Endpoints
@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, current_user: User = Depends(get_current_user)):
    """Delete a project (admin only)"""
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CLIENT_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized to delete projects")
    
    try:
        result = await db.enhanced_projects.delete_one({"id": project_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Project not found")
            
        return {"message": "Project deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting project: {str(e)}")

# Client Portal Access for Admins
@api_router.get("/clients/{client_id}/portal-view")
async def get_client_portal_view(client_id: str, current_user: User = Depends(get_current_user)):
    """Get client portal view for admin users"""
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CLIENT_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized to view client portals")
    
    try:
        # Get client information
        client = await db.users.find_one({"id": client_id})
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        # Get client's projects
        projects = await db.enhanced_projects.find({"client_id": client_id}).to_list(length=None)
        
        # Get client's messages
        messages = await db.messages.find({
            "$or": [
                {"sender_id": client_id},
                {"recipient_id": client_id}
            ]
        }).sort("sent_at", -1).to_list(length=50)
        
        # Get client's invoices
        invoices = await db.enhanced_invoices.find({"client_id": client_id}).to_list(length=None)
        
        # Clean MongoDB _id fields
        for item_list in [projects, messages, invoices]:
            for item in item_list:
                if "_id" in item:
                    del item["_id"]
        
        if "_id" in client:
            del client["_id"]
        
        return {
            "client": client,
            "projects": projects,
            "messages": messages,
            "invoices": invoices
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting client portal view: {str(e)}")

# Message System Endpoints
@api_router.post("/messages/send-to-client")
async def send_message_to_client(message_data: dict, current_user: User = Depends(get_current_user)):
    """Send a message to a client"""
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CLIENT_MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized to send messages")
    
    try:
        message = {
            "id": str(uuid.uuid4()),
            "project_id": message_data.get("project_id"),
            "sender_id": current_user.id,
            "recipient_id": message_data["client_id"],
            "subject": message_data.get("subject", "Message from Admin"),
            "content": message_data["content"],
            "message_type": "text",
            "status": MessageStatus.UNREAD,
            "sent_at": datetime.now(timezone.utc),
            "email_sent": False,
            "attachments": message_data.get("attachments", []),
            "is_system_message": False
        }
        
        await db.messages.insert_one(message)
        
        return {"message": "Message sent successfully", "message_id": message["id"]}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending message: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()