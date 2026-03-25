from fastapi import APIRouter
from schemas import UserCreate

from models import User
from fastapi import HTTPException, status, Depends
from auth import get_current_user, create_access_token, verify_password, hash_password
from typing import Annotated
from database import get_db
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi.security import OAuth2PasswordRequestForm





router = APIRouter()




@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(user: UserCreate, db: Annotated[Session, Depends(get_db)]):
  # Check if username or email already exists
  result =  db.execute(
    select(User).where((User.username) == user.username),
  )

  existing_user = result.scalars().first()
  if existing_user:
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Username already exists",
    )

  result = db.execute(
    select(User).where(User.email == user.email),
  )
  existing_email = result.scalars().first()
  if existing_email:
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Email already registered",
    )
  
# Create new user
  new_user = User(
    username=user.username,
    email=user.email.lower(),
    hashed_password=hash_password(user.password)
  )
  
  db.add(new_user)
  db.commit()
  db.refresh(new_user)
  return {"message": "User created successfully"}


@router.post("/login")
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[Session, Depends(get_db)],
):
  # Oauth2PasswordRequestForm gives us username and password fields, we will use username field to get email
  result = db.execute(select(User).where(User.email == form_data.username))

  existing_user = result.scalars().first()

  if not existing_user or not verify_password(form_data.password, existing_user.hashed_password):
      raise HTTPException(
          status_code=status.HTTP_401_UNAUTHORIZED,
          detail="Incorrect email or password",
      )

  # Generate JWT token for the authenticated user
  access_token = create_access_token(
      data={"sub": str(existing_user.email)}
  )
  return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
    "id": current_user.id,
    "email": current_user.email,
    "username": current_user.username
}
  



   

