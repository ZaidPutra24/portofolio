from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.models import Experience, ExperienceMedia, Skill, User
from app.schemas.experience import ExperienceResponse, ExperienceCreate, ExperienceUpdate
from app.api.deps import get_current_user

router = APIRouter(prefix="/experiences", tags=["Experiences"])

@router.get("", response_model=List[ExperienceResponse])
def get_experiences(db: Session = Depends(get_db)):
    experiences = db.query(Experience).all()
    
    month_map = {
        "January": 1, "February": 2, "March": 3, "April": 4,
        "May": 5, "June": 6, "July": 7, "August": 8,
        "September": 9, "October": 10, "November": 11, "December": 12
    }
    
    def sort_key(exp):
        year = exp.start_year if exp.start_year is not None else 0
        month_str = exp.start_month if exp.start_month else "January"
        month = month_map.get(month_str, 1)
        sort_ord = exp.sort_order if exp.sort_order is not None else 0
        return (year, month, sort_ord)

    sorted_experiences = sorted(experiences, key=sort_key, reverse=True)
    return sorted_experiences

@router.post("", response_model=ExperienceResponse, status_code=status.HTTP_201_CREATED)
def create_experience(exp_in: ExperienceCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    data = exp_in.model_dump(exclude={"skill_ids", "media"})
    exp = Experience(**data)
    
    if exp_in.skill_ids is not None:
        skills = db.query(Skill).filter(Skill.id.in_(exp_in.skill_ids)).all()
        exp.skills = skills

    if exp_in.media:
        media_items = [ExperienceMedia(**media.model_dump()) for media in exp_in.media]
        exp.media = media_items

    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp

@router.put("/{id}", response_model=ExperienceResponse)
def update_experience(id: int, exp_in: ExperienceUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    exp = db.query(Experience).filter(Experience.id == id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    
    update_data = exp_in.model_dump(exclude_unset=True, exclude={"skill_ids", "media"})
    for field, value in update_data.items():
        setattr(exp, field, value)

    if exp_in.skill_ids is not None:
        skills = db.query(Skill).filter(Skill.id.in_(exp_in.skill_ids)).all()
        exp.skills = skills

    if exp_in.media is not None:
        db.query(ExperienceMedia).filter(ExperienceMedia.experience_id == exp.id).delete()
        media_items = [ExperienceMedia(experience_id=exp.id, **media.model_dump()) for media in exp_in.media]
        exp.media = media_items

    db.commit()
    db.refresh(exp)
    return exp

@router.delete("/{id}")
def delete_experience(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    exp = db.query(Experience).filter(Experience.id == id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    db.delete(exp)
    db.commit()
    return {"success": True, "message": "Experience deleted"}
