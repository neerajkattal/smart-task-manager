from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine

from sqlalchemy import select, inspect, text

# from schemas import UserCreate, UserLogin

from routers import projects, tasks, auth

from models import User, Project, Task




app = FastAPI(title="Smart Task Manager API", version="1.0.0", description="API for managing tasks with AI capabilities")

# create_all only creates missing tables, so columns added to an existing
# table later (users.avatar) are added here instead.
def add_missing_columns():
    columns = {c["name"] for c in inspect(engine).get_columns("users")}
    if "avatar" not in columns:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN avatar TEXT"))

@app.on_event("startup")
async def on_startup():
    try:
        Base.metadata.create_all(bind=engine)
        add_missing_columns()
        print("Database connected successfully")
    except Exception as e:
        print("Database connection failed:", e)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for simplicity
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
    allow_credentials=True,  # Allow credentials (cookies, authorization headers, etc.)
)

# Including router for project
app.include_router(projects.router, tags=["Projects"])

# Including router for tasks
app.include_router(tasks.router, tags=["Tasks"])

# Including router for Auth / User creation
app.include_router(auth.router, tags=["Auth"])


@app.get("/", tags=["Root"])
def root():
    return {"message": "Smart Task Manager API running"}

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}
