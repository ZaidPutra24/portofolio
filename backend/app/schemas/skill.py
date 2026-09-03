from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SkillBase(BaseModel):
    name: str
    level: Optional[str] = None
    icon_name: Optional[str] = None
    order_index: int = 0

class SkillCreate(SkillBase):
    category_id: int

class SkillUpdate(BaseModel):
    name: Optional[str] = None
    level: Optional[str] = None
    icon_name: Optional[str] = None
    order_index: Optional[int] = None
    category_id: Optional[int] = None

class SkillResponse(SkillBase):
    id: int
    category_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SkillCategoryBase(BaseModel):
    name: str
    order_index: int = 0

class SkillCategoryCreate(SkillCategoryBase):
    pass

class SkillCategoryUpdate(BaseModel):
    name: Optional[str] = None
    order_index: Optional[int] = None

class SkillCategoryResponse(SkillCategoryBase):
    id: int
    created_at: Optional[datetime] = None
    skills: List[SkillResponse] = []

    class Config:
        from_attributes = True
