from fastapi import APIRouter
from schemas import UserCreate, ProfileUpdate, PasswordChange

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

def user_out(user: User):
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "avatar": user.avatar,
    }


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return user_out(current_user)


# Update username, email and/or profile picture. Tokens are tied to the email,
# so a new one is returned when it changes.
@router.patch("/me")
def update_me(
    changes: ProfileUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: User = Depends(get_current_user),
):
    if changes.username is not None and changes.username != current_user.username:
        taken = db.execute(select(User).where(User.username == changes.username)).scalars().first()
        if taken:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")
        current_user.username = changes.username

    email_changed = False
    if changes.email is not None:
        new_email = changes.email.lower()
        if new_email != current_user.email:
            taken = db.execute(select(User).where(User.email == new_email)).scalars().first()
            if taken:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
            current_user.email = new_email
            email_changed = True

    if changes.avatar is not None:
        if changes.avatar and not changes.avatar.startswith("data:image/"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Profile picture must be an image")
        current_user.avatar = changes.avatar or None

    db.commit()
    db.refresh(current_user)
    result = user_out(current_user)
    if email_changed:
        result["access_token"] = create_access_token(data={"sub": current_user.email})
    return result


@router.post("/me/password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    body: PasswordChange,
    db: Annotated[Session, Depends(get_db)],
    current_user: User = Depends(get_current_user),
):
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")
    current_user.hashed_password = hash_password(body.new_password)
    db.commit()
  



   

