from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# DB Engine Creation
engine = create_engine(
  DATABASE_URL, 
  pool_pre_ping=True
)

# SessionLocal Creation
SessionLocal = sessionmaker(
 autocommit=False,
 autoflush=False,
 bind=engine
)

#₹ Base Class Creation
class Base(DeclarativeBase):
    pass

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

