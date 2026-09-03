from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import SocialLink, User
from app.schemas.social import SocialLinkResponse, SocialLinkCreate, SocialLinkUpdate
from app.api.deps import get_current_user

router = APIRouter(prefix="/social", tags=["Social Links"])

@router.get("", response_model=List[SocialLinkResponse])
def get_social_links(db: Session = Depends(get_db)):
    return db.query(SocialLink).order_by(SocialLink.order_index).all()

@router.post("", response_model=SocialLinkResponse, status_code=status.HTTP_201_CREATED)
def create_social_link(link_in: SocialLinkCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    link = SocialLink(**link_in.model_dump())
    db.add(link)
    db.commit()
    db.refresh(link)
    return link

@router.put("/{id}", response_model=SocialLinkResponse)
def update_social_link(id: int, link_in: SocialLinkUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    link = db.query(SocialLink).filter(SocialLink.id == id).first()
    if not link:
        raise HTTPException(status_code=404, detail="Social link not found")
    update_data = link_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(link, field, value)
    db.commit()
    db.refresh(link)
    return link

@router.delete("/{id}")
def delete_social_link(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    link = db.query(SocialLink).filter(SocialLink.id == id).first()
    if not link:
        raise HTTPException(status_code=404, detail="Social link not found")
    db.delete(link)
    db.commit()
    return {"success": True, "message": "Social link deleted"}
