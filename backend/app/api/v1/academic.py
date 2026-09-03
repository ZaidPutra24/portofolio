from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Publication, Achievement, Certificate, User
from app.schemas.academic import (
    PublicationResponse, PublicationCreate, PublicationUpdate,
    AchievementResponse, AchievementCreate, AchievementUpdate,
    CertificateResponse, CertificateCreate, CertificateUpdate
)
from app.api.deps import get_current_user
from app.api.v1.upload import delete_local_file

router = APIRouter(prefix="/academic", tags=["Publications, Achievements & Certificates"])

# Publications
@router.get("/publications", response_model=List[PublicationResponse])
def get_publications(db: Session = Depends(get_db)):
    return db.query(Publication).order_by(Publication.year.desc()).all()

@router.post("/publications", response_model=PublicationResponse, status_code=status.HTTP_201_CREATED)
def create_publication(pub_in: PublicationCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    pub = Publication(**pub_in.model_dump())
    db.add(pub)
    db.commit()
    db.refresh(pub)
    return pub

@router.put("/publications/{id}", response_model=PublicationResponse)
def update_publication(id: int, pub_in: PublicationUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    pub = db.query(Publication).filter(Publication.id == id).first()
    if not pub:
        raise HTTPException(status_code=404, detail="Publication not found")
    update_data = pub_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(pub, field, value)
    db.commit()
    db.refresh(pub)
    return pub

@router.delete("/publications/{id}")
def delete_publication(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    pub = db.query(Publication).filter(Publication.id == id).first()
    if not pub:
        raise HTTPException(status_code=404, detail="Publication not found")
    db.delete(pub)
    db.commit()
    return {"success": True, "message": "Publication deleted"}

# Achievements
@router.get("/achievements", response_model=List[AchievementResponse])
def get_achievements(db: Session = Depends(get_db)):
    return db.query(Achievement).order_by(Achievement.year_date.desc()).all()

@router.post("/achievements", response_model=AchievementResponse, status_code=status.HTTP_201_CREATED)
def create_achievement(ach_in: AchievementCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ach = Achievement(**ach_in.model_dump())
    db.add(ach)
    db.commit()
    db.refresh(ach)
    return ach

@router.put("/achievements/{id}", response_model=AchievementResponse)
def update_achievement(id: int, ach_in: AchievementUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ach = db.query(Achievement).filter(Achievement.id == id).first()
    if not ach:
        raise HTTPException(status_code=404, detail="Achievement not found")
    old_evidence = ach.evidence_url
    update_data = ach_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(ach, field, value)
    if old_evidence and (ach_in.evidence_url is None or ach_in.evidence_url == "" or old_evidence != ach_in.evidence_url):
        delete_local_file(old_evidence)
        if ach_in.evidence_url == "":
            ach.evidence_url = None
    db.commit()
    db.refresh(ach)
    return ach

@router.delete("/achievements/{id}")
def delete_achievement(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ach = db.query(Achievement).filter(Achievement.id == id).first()
    if not ach:
        raise HTTPException(status_code=404, detail="Achievement not found")
    if ach.evidence_url:
        delete_local_file(ach.evidence_url)
    db.delete(ach)
    db.commit()
    return {"success": True, "message": "Achievement deleted"}

# Certificates
@router.get("/certificates", response_model=List[CertificateResponse])
def get_certificates(db: Session = Depends(get_db)):
    return db.query(Certificate).order_by(Certificate.issue_date.desc()).all()

@router.post("/certificates", response_model=CertificateResponse, status_code=status.HTTP_201_CREATED)
def create_certificate(cert_in: CertificateCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cert = Certificate(**cert_in.model_dump())
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return cert

@router.put("/certificates/{id}", response_model=CertificateResponse)
def update_certificate(id: int, cert_in: CertificateUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cert = db.query(Certificate).filter(Certificate.id == id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    old_image = cert.image_url
    update_data = cert_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(cert, field, value)
    if old_image and (cert_in.image_url is None or cert_in.image_url == "" or old_image != cert_in.image_url):
        delete_local_file(old_image)
        if cert_in.image_url == "":
            cert.image_url = None
    db.commit()
    db.refresh(cert)
    return cert

@router.delete("/certificates/{id}")
def delete_certificate(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cert = db.query(Certificate).filter(Certificate.id == id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    if cert.image_url:
        delete_local_file(cert.image_url)
    db.delete(cert)
    db.commit()
    return {"success": True, "message": "Certificate deleted"}
