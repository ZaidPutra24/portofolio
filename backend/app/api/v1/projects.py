from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.models import Project, Technology, ProjectImage, User
from app.schemas.project import ProjectResponse, ProjectCreate, ProjectUpdate
from app.api.deps import get_current_user
from app.api.v1.upload import delete_local_file

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectResponse])
def get_projects(
    status_filter: Optional[str] = Query(None, alias="status"),
    is_featured: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Project)
    if status_filter:
        query = query.filter(Project.status == status_filter)
    if is_featured is not None:
        query = query.filter(Project.is_featured == is_featured)
    projects = query.order_by(Project.year.desc(), Project.created_at.desc()).all()
    return projects

@router.get("/{slug}", response_model=ProjectResponse)
def get_project_by_slug(slug: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.slug == slug).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(project_in: ProjectCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(Project).filter(Project.slug == project_in.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Project with this slug already exists")
    
    data = project_in.model_dump(exclude={"technology_ids", "images"})
    project = Project(**data)
    
    if project_in.technology_ids:
        techs = db.query(Technology).filter(Technology.id.in_(project_in.technology_ids)).all()
        project.technologies = techs
        
    db.add(project)
    db.commit()
    db.refresh(project)
    
    if project_in.images:
        for img in project_in.images:
            db_img = ProjectImage(project_id=project.id, image_url=img.get("image_url"), caption=img.get("caption"), order_index=img.get("order_index", 0))
            db.add(db_img)
        db.commit()
        db.refresh(project)
        
    return project

@router.put("/{id}", response_model=ProjectResponse)
def update_project(id: int, project_in: ProjectUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    old_thumbnail = project.thumbnail_url
    update_data = project_in.model_dump(exclude_unset=True, exclude={"technology_ids"})
    for field, value in update_data.items():
        setattr(project, field, value)
        
    if old_thumbnail and (project_in.thumbnail_url is None or project_in.thumbnail_url == "" or old_thumbnail != project_in.thumbnail_url):
        delete_local_file(old_thumbnail)
        if project_in.thumbnail_url == "":
            project.thumbnail_url = None

    if project_in.technology_ids is not None:
        techs = db.query(Technology).filter(Technology.id.in_(project_in.technology_ids)).all()
        project.technologies = techs
        
    db.commit()
    db.refresh(project)
    return project

@router.delete("/{id}")
def delete_project(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.thumbnail_url:
        delete_local_file(project.thumbnail_url)
    for img in project.images:
        if img.image_url:
            delete_local_file(img.image_url)

    db.delete(project)
    db.commit()
    return {"success": True, "message": "Project deleted successfully"}
