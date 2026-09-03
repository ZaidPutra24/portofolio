import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import auth, profile, settings as settings_router, projects, skills, experiences, academic, contact, upload, social

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Backend REST API for Personal Portfolio & CMS"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory exists safely on serverless environments
try:
    os.makedirs("/tmp/uploads/projects", exist_ok=True)
    os.makedirs("/tmp/uploads/certificates", exist_ok=True)
    os.makedirs("/tmp/uploads/cv", exist_ok=True)
    uploads_dir = "/tmp/uploads"
except Exception:
    os.makedirs("uploads/projects", exist_ok=True)
    os.makedirs("uploads/certificates", exist_ok=True)
    os.makedirs("uploads/cv", exist_ok=True)
    uploads_dir = "uploads"

# Mount static files for uploads
if os.path.exists("uploads"):
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
elif os.path.exists("/tmp/uploads"):
    app.mount("/uploads", StaticFiles(directory="/tmp/uploads"), name="uploads")

# Include API routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(profile.router, prefix="/api/v1")
app.include_router(settings_router.router, prefix="/api/v1")
app.include_router(projects.router, prefix="/api/v1")
app.include_router(skills.router, prefix="/api/v1")
app.include_router(experiences.router, prefix="/api/v1")
app.include_router(academic.router, prefix="/api/v1")
app.include_router(contact.router, prefix="/api/v1")
app.include_router(social.router, prefix="/api/v1")
app.include_router(upload.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to Personal Portfolio & CMS API v1.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
