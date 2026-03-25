from fastapi import APIRouter
from sqlalchemy import select
from schemas import TaskCreate, TaskUpdate
from models import User, Task, Project
from fastapi import HTTPException, Depends, status
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
from typing import Annotated, Optional


router = APIRouter()




#  Create  task for a specific project
@router.post("/projects/{project_id}/tasks",status_code=status.HTTP_201_CREATED)
def create_task(
    project_id: int,
    task: TaskCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: User = Depends(get_current_user)
  ):
  # check if project exists and belongs to the current user
    result = db.execute(select(Project).where(Project.id == project_id))
    project = result.scalars().first()

    if not project:
      raise HTTPException(
          status_code=status.HTTP_404_NOT_FOUND,
          detail="Project not found or does not belong to the current user",
      )
    
    # check if the project belongs to the current user
    if project.owner_id != current_user.id:
      raise HTTPException(
          status_code=status.HTTP_403_FORBIDDEN,
          detail="Not authorized to add tasks to this project",
      )
        
    new_task = Task(
      title=task.title,
      description=task.description,
      project_id=project.id,
      priority=task.priority,
      deadline=task.deadline,
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return {
    "id": new_task.id,
    "title": new_task.title,
    "description": new_task.description,
    "priority": new_task.priority, 
    "deadline": new_task.deadline,
}


# Get all tasks for a specific project
@router.get("/projects/{project_id}/tasks", status_code=status.HTTP_200_OK)
def get_tasks(  
    project_id: int,
    db: Annotated[Session, Depends(get_db)],
    limit: int = 10,
    skip: int = 0,
    completed: Optional[bool] = None,
    current_user: User = Depends(get_current_user)
  ):
  # check if project exists and belongs to the current user
    result = db.execute(select(Project).where(Project.id == project_id, Project.owner_id == current_user.id))
    project = result.scalars().first()

    if not project:
      raise HTTPException(
          status_code=status.HTTP_404_NOT_FOUND,
          detail="Project not found",
      )

    query = select(Task).where(Task.project_id == project_id)

    # Filtering
    if completed is not None:
        query = query.where(Task.completed == completed)

    # Sorting
    query = query.order_by(Task.created_at.desc())
    # Pagination
    query = query.offset(skip).limit(limit)

    result = db.execute(query)
    tasks = result.scalars().all()
    return [
      {
          "id": task.id,
          "title": task.title,
          "description": task.description,
          "completed": task.completed,
          "priority": task.priority,
          "deadline": task.deadline.isoformat() if task.deadline else None
      }
      for task in tasks
    ]
    
    
@router.patch("/tasks/{task_id}", status_code=status.HTTP_200_OK)
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: User = Depends(get_current_user)
  ):
    # check if task exists and belongs to the current user
    result = db.execute(select(Task).where(Task.id == task_id))
    task = result.scalars().first()

    if not task:
      raise HTTPException(
          status_code=status.HTTP_404_NOT_FOUND,
          detail="Task not found or does not belong to the current user",
      )
      
    # check if the task belongs to the current user
    result = db.execute(select(Project).where(Project.id == task.project_id))
    project = result.scalars().first()

    if project.owner_id != current_user.id:
      raise HTTPException(
        status_code=403,
        detail="Not authorized to update this task",
    )

    # update task fields
    if task_update.title is not None:
      task.title = task_update.title

    if task_update.description is not None:
        task.description = task_update.description

    if task_update.completed is not None:
        task.completed = task_update.completed

    if task_update.priority is not None:
        task.priority = task_update.priority

    if task_update.deadline is not None:
        task.deadline = task_update.deadline

    db.commit()
    db.refresh(task)
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "completed": task.completed,
        "priority": task.priority,
        "deadline": task.deadline.isoformat() if task.deadline else None
    }
    
# /delete task from a project
@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: User = Depends(get_current_user)
  ):
    # check if task exists and belongs to the current user
    result = db.execute(select(Task).where(Task.id == task_id))
    task = result.scalars().first()

    if not task:
      raise HTTPException(
          status_code=status.HTTP_404_NOT_FOUND,
          detail="Task not found",
      )


    # Ownership check
    result = db.execute(select(Project).where(Project.id == task.project_id))
    project = result.scalars().first()

    if project.owner_id != current_user.id:
      raise HTTPException(
          status_code=status.HTTP_403_FORBIDDEN,
          detail="Not authorized to delete this task",
      )

    db.delete(task)
    db.commit()
    return