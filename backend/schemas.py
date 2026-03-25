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