from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Setting, User
from app.schemas.settings import SettingResponse, SettingUpdate, SettingCreate
from app.api.deps import get_current_user

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("", response_model=List[SettingResponse])
def get_settings(db: Session = Depends(get_db)):
    settings_list = db.query(Setting).all()
    return settings_list

@router.put("/{key}", response_model=SettingResponse)
def update_setting(key: str, setting_in: SettingUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    setting = db.query(Setting).filter(Setting.key == key).first()
    if not setting:
        setting = Setting(key=key, value=setting_in.value, description=setting_in.description)
        db.add(setting)
    else:
        if setting_in.value is not None:
            setting.value = setting_in.value
        if setting_in.description is not None:
            setting.description = setting_in.description
            
    db.commit()
    db.refresh(setting)
    return setting
