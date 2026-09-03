from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class ContactCreate(BaseModel):
    sender_name: str
    sender_email: EmailStr
    subject: str
    message: str

class MessageResponse(BaseModel):
    id: int
    sender_name: str
    sender_email: str
    subject: str
    message: str
    is_read: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
