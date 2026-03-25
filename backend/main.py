from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine

from sqlalchemy import select

# from schemas import UserCreate, UserLogin

from routers import projects, tasks, auth




app = FastAPI(title="Smart Task Manager API", version="1.0.0", description="API for managing tasks with AI capabilities")

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://smart-task-manager-nine-theta.vercel.app/"],  # Allow all origins for simplicity
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
