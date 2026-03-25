from fastapi import APIRouter;
from fastapi import Depends, HTTPException, status
from typing import Annotated
from sqlalchemy.orm import Session
from auth import get_current_user
from database import get_db
from sqlalchemy import select
from schemas import ProjectCreate
from models import User, Project


router = APIRouter()



# Project Endpoints
# Create a new project 

@router.post("/projects", status_code=status.HTTP_201_CREATED)
def create_project(
  project: ProjectCreate, 
  db: Annotated[Session, Depends(get_db)],
  current_user: User = Depends(get_current_user)
  ):
    new_project = Project(
      title=project.title,
      description=project.description,
      owner_id=current_user.id
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return {
    "id": new_project.id,
    "title": new_project.title,
    "description": new_project.description
}
    
# Get all projects for the current user
@router.get("/projects")
def get_projects(
  db: Annotated[Session, Depends(get_db)],
  current_user: User = Depends(get_current_user)
  ):
    result = db.execute(select(Project).where(Project.owner_id == current_user.id))
    projects = result.scalars().all()
    return [
      {
          "id": project.id,
          "title": project.title,
          "description": project.description
      }
      for project in projects
    ] 


# delete a project and all its task

@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
  project_id: int,
  db: Annotated[Session, Depends(get_db)],
  current_user: User = Depends(get_current_user)
):
  # check if the project belong to the current user
  result = db.execute(select(Project).where(Project.id == project_id, Project.owner_id == current_user.id))
  project = result.scalars().first()

  if not project:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Project not found or does not belong to the current user",
    )
  
  db.delete(project)
  db.commit()
  return


