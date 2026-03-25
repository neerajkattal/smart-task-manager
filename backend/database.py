from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

# DB Engine Creation
engine = create_engine(
  SQLALCHEMY_DATABASE_URL,
  connect_args={"check_same_thread": False}
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

