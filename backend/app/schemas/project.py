from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime

class TechnologyResponse(BaseModel):
    id: int
    name: str
    icon_name: Optional[str] = None

    class Config:
        from_attributes = True

class ProjectImageResponse(BaseModel):
    id: int
    image_url: str
    caption: Optional[str] = None
    order_index: int

    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    title: str
    slug: str
    summary: str
    description: Optional[str] = None
    background: Optional[str] = None
    problem: Optional[str] = None
    solution: Optional[str] = None
    implementation: Optional[str] = None
    results: Optional[str] = None
    year: int
    status: str = "draft"
    is_featured: bool = False
    github_url: Optional[str] = None
    demo_url: Optional[str] = None
    thumbnail_url: Optional[str] = None

class ProjectCreate(ProjectBase):
    technology_ids: Optional[List[int]] = []
    images: Optional[List[dict]] = []

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    summary: Optional[str] = None
    description: Optional[str] = None
    background: Optional[str] = None
    problem: Optional[str] = None
    solution: Optional[str] = None
    implementation: Optional[str] = None
    results: Optional[str] = None
    year: Optional[int] = None
    status: Optional[str] = None
    is_featured: Optional[bool] = None
    github_url: Optional[str] = None
    demo_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    technology_ids: Optional[List[int]] = None

class ProjectResponse(ProjectBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    technologies: List[TechnologyResponse] = []
    images: List[ProjectImageResponse] = []

    class Config:
        from_attributes = True
