from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

# Publications
class PublicationBase(BaseModel):
    title: str
    authors: str
    publisher_venue: str
    year: int
    abstract: Optional[str] = None
    doi: Optional[str] = None
    publication_url: Optional[str] = None
    pdf_url: Optional[str] = None

class PublicationCreate(PublicationBase):
    pass

class PublicationUpdate(BaseModel):
    title: Optional[str] = None
    authors: Optional[str] = None
    publisher_venue: Optional[str] = None
    year: Optional[int] = None
    abstract: Optional[str] = None
    doi: Optional[str] = None
    publication_url: Optional[str] = None
    pdf_url: Optional[str] = None

class PublicationResponse(PublicationBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Achievements
class AchievementBase(BaseModel):
    title: str
    category: str
    issuer: str
    year_date: date
    description: Optional[str] = None
    credential_url: Optional[str] = None
    evidence_url: Optional[str] = None

class AchievementCreate(AchievementBase):
    pass

class AchievementUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    issuer: Optional[str] = None
    year_date: Optional[date] = None
    description: Optional[str] = None
    credential_url: Optional[str] = None
    evidence_url: Optional[str] = None

class AchievementResponse(AchievementBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Certificates
class CertificateBase(BaseModel):
    name: str
    issuer: str
    issue_date: date
    expiry_date: Optional[date] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None
    image_url: Optional[str] = None

class CertificateCreate(CertificateBase):
    pass

class CertificateUpdate(BaseModel):
    name: Optional[str] = None
    issuer: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None
    image_url: Optional[str] = None

class CertificateResponse(CertificateBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
