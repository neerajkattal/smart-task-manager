# Smart Task Manager

Full-stack task management application with React frontend and FastAPI backend.

**Live:** [smart-task-manager-self-five.vercel.app](https://smart-task-manager-self-five.vercel.app/)

## Tech Stack

- **Frontend**: React 19, React Router, Axios
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL
- **Authentication**: JWT, Passlib
- **Deployment**: Vercel (frontend), Render (backend)

## Running with Docker (Local Development)

```bash
# Clone the repository
git clone https://github.com/neerajkattal/smart-task-manager.git

# Navigate to project folder
cd smart-task-manager

# Build and run containers
docker-compose up --build

# Access the application:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
# - API Docs: http://localhost:8000/docs
```

## Running Without Docker

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm start
```


## 🚀 Features
- JWT Authentication
- Project & Task Management
- Search Tasks
- Priority & Deadline
- Real-time UI updates