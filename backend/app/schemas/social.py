from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SocialLinkBase(BaseModel):
    platform_name: str
    url: str
    icon_name: Optional[str] = None
    order_index: int = 0
    is_active: bool = True

class SocialLinkCreate(SocialLinkBase):
    pass

class SocialLinkUpdate(BaseModel):
    platform_name: Optional[str] = None
    url: Optional[str] = None
    icon_name: Optional[str] = None
    order_index: Optional[int] = None
    is_active: Optional[bool] = None

class SocialLinkResponse(SocialLinkBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
