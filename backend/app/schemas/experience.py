from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.skill import SkillResponse

class ExperienceMediaBase(BaseModel):
    title: str
    url: str
    media_type: str # GitHub, Project, Publication, Certificate, Presentation, Portfolio

class ExperienceMediaCreate(ExperienceMediaBase):
    pass

class ExperienceMediaResponse(ExperienceMediaBase):
    id: int
    experience_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ExperienceBase(BaseModel):
    position_title: str
    organization_name: str
    location: Optional[str] = None
    location_type: Optional[str] = None # On-site, Hybrid, Remote
    employment_type: Optional[str] = None # Full-time, Part-time, Contract, Internship, Freelance, Self-employed, Volunteer
    start_month: str
    start_year: int
    end_month: Optional[str] = None
    end_year: Optional[int] = None
    is_current: bool = False
    description: Optional[str] = None
    sort_order: Optional[int] = 0
    skill_ids: Optional[List[int]] = []
    media: Optional[List[ExperienceMediaCreate]] = []

class ExperienceCreate(ExperienceBase):
    pass

class ExperienceUpdate(BaseModel):
    position_title: Optional[str] = None
    organization_name: Optional[str] = None
    location: Optional[str] = None
    location_type: Optional[str] = None
    employment_type: Optional[str] = None
    start_month: Optional[str] = None
    start_year: Optional[int] = None
    end_month: Optional[str] = None
    end_year: Optional[int] = None
    is_current: Optional[bool] = None
    description: Optional[str] = None
    sort_order: Optional[int] = None
    skill_ids: Optional[List[int]] = None
    media: Optional[List[ExperienceMediaCreate]] = None

class ExperienceResponse(BaseModel):
    id: int
    position_title: str
    organization_name: str
    location: Optional[str] = None
    location_type: Optional[str] = None
    employment_type: Optional[str] = None
    start_month: str
    start_year: int
    end_month: Optional[str] = None
    end_year: Optional[int] = None
    is_current: bool
    description: Optional[str] = None
    sort_order: Optional[int] = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    skills: List[SkillResponse] = []
    media: List[ExperienceMediaResponse] = []

    class Config:
        from_attributes = True
