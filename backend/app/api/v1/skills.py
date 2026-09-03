from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import SkillCategory, Skill, User
from app.schemas.skill import SkillCategoryResponse, SkillCategoryCreate, SkillCategoryUpdate, SkillResponse, SkillCreate, SkillUpdate
from app.api.deps import get_current_user

router = APIRouter(prefix="/skills", tags=["Skills"])

@router.get("", response_model=List[SkillCategoryResponse])
def get_skill_categories(db: Session = Depends(get_db)):
    categories = db.query(SkillCategory).order_by(SkillCategory.order_index).all()
    return categories

@router.post("/categories", response_model=SkillCategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(cat_in: SkillCategoryCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cat = SkillCategory(**cat_in.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat

@router.put("/categories/{id}", response_model=SkillCategoryResponse)
def update_category(id: int, cat_in: SkillCategoryUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cat = db.query(SkillCategory).filter(SkillCategory.id == id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    update_data = cat_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(cat, field, value)
    db.commit()
    db.refresh(cat)
    return cat

@router.post("", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
def create_skill(skill_in: SkillCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    skill = Skill(**skill_in.model_dump())
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill

@router.put("/{id}", response_model=SkillResponse)
def update_skill(id: int, skill_in: SkillUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    skill = db.query(Skill).filter(Skill.id == id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    update_data = skill_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(skill, field, value)
    db.commit()
    db.refresh(skill)
    return skill

@router.delete("/categories/{id}")
def delete_category(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cat = db.query(SkillCategory).filter(SkillCategory.id == id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(cat)
    db.commit()
    return {"success": True, "message": "Category deleted"}

@router.delete("/{id}")
def delete_skill(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    skill = db.query(Skill).filter(Skill.id == id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    db.delete(skill)
    db.commit()
    return {"success": True, "message": "Skill deleted"}
