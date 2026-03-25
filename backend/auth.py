
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta, UTC
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User
from sqlalchemy import select

# for .env file
import os
from dotenv import load_dotenv


load_dotenv()


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


# Password hashing setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# JWT config
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.now(UTC) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt
  

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
  ) -> str:
  
  try:
    payload = jwt.decode(
      token,
      SECRET_KEY,
      algorithms=[ALGORITHM]
    )
    email = payload.get("sub")
      
    if email is None:
      raise HTTPException(
          status_code=status.HTTP_401_UNAUTHORIZED,
          detail="Invalid token"
      )
            
  except JWTError:
      raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
      )
  result = db.execute(select(User).where(User.email == email))
  user = result.scalars().first()
  if not user:
      raise HTTPException(
          status_code=status.HTTP_401_UNAUTHORIZED,
          detail="User not found"
      )

  return user
