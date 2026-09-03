from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Message, User
from app.schemas.contact import ContactCreate, MessageResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/contact", tags=["Contact & Messages"])

@router.post("", status_code=status.HTTP_201_CREATED)
def send_contact_message(contact_in: ContactCreate, db: Session = Depends(get_db)):
    msg = Message(**contact_in.model_dump())
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return {"success": True, "message": "Your message has been sent successfully!"}

@router.get("/messages", response_model=List[MessageResponse])
def get_messages(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Message).order_by(Message.created_at.desc()).all()

@router.delete("/messages/{id}")
def delete_message(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    msg = db.query(Message).filter(Message.id == id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    db.delete(msg)
    db.commit()
    return {"success": True, "message": "Message deleted"}
