import os
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from app.models.models import User
from app.api.deps import get_current_user

router = APIRouter(prefix="/upload", tags=["File Upload"])

UPLOAD_BASE_DIR = "uploads"
ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
ALLOWED_DOC_TYPES = ["application/pdf"]
MAX_FILE_SIZE = 5 * 1024 * 1024 # 5 MB

def save_upload_file(file: UploadFile, subfolder: str, allowed_types: list) -> str:
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type: {file.content_type}. Allowed types: {allowed_types}"
        )
    
    contents = file.file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum limit of 5MB"
        )
    
    folder_path = os.path.join(UPLOAD_BASE_DIR, subfolder)
    os.makedirs(folder_path, exist_ok=True)
    
    ext = os.path.splitext(file.filename)[1] if file.filename else ".bin"
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(folder_path, unique_filename)
    
    with open(file_path, "wb") as f:
        f.write(contents)
        
    return f"/uploads/{subfolder}/{unique_filename}"

def delete_local_file(url: Optional[str]):
    if not url or not url.startswith("/uploads/"):
        return
    try:
        relative_path = url.lstrip("/")
        if os.path.exists(relative_path):
            os.remove(relative_path)
    except Exception as e:
        print(f"Error deleting local file {url}: {e}")

@router.post("/project")
def upload_project_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    url = save_upload_file(file, "projects", ALLOWED_IMAGE_TYPES)
    return {"success": True, "url": url, "message": "Project image uploaded successfully"}

@router.post("/certificate")
def upload_certificate_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    url = save_upload_file(file, "certificates", ALLOWED_IMAGE_TYPES + ALLOWED_DOC_TYPES)
    return {"success": True, "url": url, "message": "Certificate file uploaded successfully"}

@router.post("/cv")
def upload_cv_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    url = save_upload_file(file, "cv", ALLOWED_DOC_TYPES)
    return {"success": True, "url": url, "message": "CV document uploaded successfully"}
