from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, File, UploadFile
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid, bcrypt, jwt
from datetime import datetime, timedelta, timezone
from enum import Enum
import shutil

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
    rating: int = Field(default=5)
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
    rating: int = Field(default=5)
    title: str
    content: str
    highlights: List[str] = Field(default_factory=list)
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

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

# User Roles
class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    EDITOR = "editor"
    CLIENT = "client"

class ProjectStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    COMPLETED = "completed"
    LOCKED = "locked"

class InvoiceStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.CLIENT
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    avatar_url: Optional[str] = None
    company: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole = UserRole.CLIENT
    company: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Project(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    client_id: str
    assigned_admin_id: Optional[str] = None
    status: ProjectStatus = ProjectStatus.PENDING
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
    status: InvoiceStatus = InvoiceStatus.PENDING
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

# Project routes
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
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR]:
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

# Testimonial Management Endpoints
@api_router.get("/testimonials", response_model=List[Testimonial])
async def get_testimonials():
    """Get all approved testimonials"""
    try:
        testimonials = await db.testimonials.find({"approved": True}).to_list(length=None)
        
        # Remove MongoDB's _id field from each testimonial
        for testimonial in testimonials:
            if "_id" in testimonial:
                del testimonial["_id"]
        
        return [Testimonial(**testimonial) for testimonial in testimonials]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching testimonials: {str(e)}")

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

@api_router.put("/testimonials/{testimonial_id}/approve", response_model=Testimonial)
async def approve_testimonial(
    testimonial_id: str,
    current_user: User = Depends(get_current_user)
):
    """Approve a testimonial (Admin only)"""
    try:
        # Check if user is admin
        if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Find and approve testimonial
        result = await db.testimonials.update_one(
            {"id": testimonial_id},
            {"$set": {"approved": True}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Testimonial not found")
        
        # Get updated testimonial
        testimonial = await db.testimonials.find_one({"id": testimonial_id})
        if "_id" in testimonial:
            del testimonial["_id"]
            
        return Testimonial(**testimonial)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error approving testimonial: {str(e)}")

@api_router.delete("/testimonials/{testimonial_id}")
async def delete_testimonial(
    testimonial_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a testimonial (Admin only)"""
    try:
        # Check if user is admin
        if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        result = await db.testimonials.delete_one({"id": testimonial_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Testimonial not found")
        
        return {"message": "Testimonial deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting testimonial: {str(e)}")

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