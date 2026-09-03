from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime

class ProfileBase(BaseModel):
    full_name: str
    headline: Optional[str] = None
    bio: Optional[str] = None
    education: Optional[str] = None
    career_focus: Optional[str] = None
    research_interests: Optional[str] = None
    avatar_url: Optional[str] = None
    cv_url: Optional[str] = None

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    education: Optional[str] = None
    career_focus: Optional[str] = None
    research_interests: Optional[str] = None
    avatar_url: Optional[str] = None
    cv_url: Optional[str] = None

class ProfileResponse(ProfileBase):
    id: int
    user_id: int
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
