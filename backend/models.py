
from database import Base
from sqlalchemy import Integer, String, DateTime, ForeignKey , Boolean
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime, UTC
from typing import Optional
from pydantic import BaseModel, EmailStr

class User(Base):
  __tablename__ = "users"
  id :   Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
  email : Mapped[str] = mapped_column(String(100), unique=True, index=True)
  username : Mapped[str] = mapped_column(String(100), unique=True, index=True)
  hashed_password : Mapped[str] = mapped_column(String(100))
  created_at : Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC))
  projects: Mapped[list["Project"]] = relationship(back_populates="owner", cascade="all, delete-orphan")
  

class Project(Base):
  __tablename__ = "projects"

  id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
  title: Mapped[str] = mapped_column(String(50), index=True ,nullable=False)
  description: Mapped[str] = mapped_column(String(255))

  owner_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
  created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC))

  owner: Mapped["User"] = relationship(back_populates="projects")
  tasks: Mapped[list["Task"]] = relationship(back_populates="project", cascade="all, delete-orphan")

class Task(Base):
  __tablename__ = "tasks"

  id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
  title: Mapped[str] = mapped_column(String(50), index=True ,nullable=False)
  description: Mapped[str] = mapped_column(String(255))
  completed: Mapped[bool] = mapped_column(Boolean, default=False)
  priority: Mapped[str] = mapped_column(String(20), default="medium")
  
  deadline: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
  
  project_id: Mapped[int] = mapped_column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
  created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC))

  project: Mapped["Project"] = relationship(back_populates="tasks")