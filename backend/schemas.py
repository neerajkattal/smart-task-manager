from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime 

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., max_length=72)
    username: str
    
class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., max_length=72)
    
class ProfileUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    # A data:image/... URL, or "" to remove the picture.
    avatar: Optional[str] = Field(None, max_length=300_000)

class PasswordChange(BaseModel):
    current_password: str = Field(..., max_length=72)
    new_password: str = Field(..., min_length=8, max_length=72)

class ProjectCreate(BaseModel):
    title: str
    description: str

class TaskCreate(BaseModel):
    title: str
    description: str
    priority: str = "medium"
    deadline: Optional[datetime] = None
  

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[str] = None
    deadline: Optional[datetime] = None