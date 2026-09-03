from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Profile, User
from app.schemas.profile import ProfileResponse, ProfileUpdate
from app.api.deps import get_current_user
from app.api.v1.upload import delete_local_file

router = APIRouter(prefix="/profile", tags=["Profile"])

@router.get("", response_model=ProfileResponse)
def get_profile(db: Session = Depends(get_db)):
    profile = db.query(Profile).first()
    if not profile:
        admin = db.query(User).first()
        admin_id = admin.id if admin else 1
        profile = Profile(
            user_id=admin_id,
            full_name="Zaid Helsinki",
            headline="Full-Stack Engineer & AI Researcher",
            bio="I started with a deep fascination for clean code and robust systems — building APIs, databases, and structured backends. That foundation naturally expanded into integrating AI models, vector databases, and responsive frontends.\n\nToday I focus on building complete digital solutions that are lightning fast, elegant, and maintainable. I care deeply about architecture, user experience, and delivering software that truly works.",
            career_focus="Grounded in full-stack architecture, focused on scalable backend APIs and modern web interfaces.",
            research_interests="Machine Learning Infrastructure, Web Systems"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.put("", response_model=ProfileResponse)
def update_profile(profile_in: ProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id, full_name=profile_in.full_name or "Admin")
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    old_avatar = profile.avatar_url
    old_cv = profile.cv_url

    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
    
    if old_avatar and (profile_in.avatar_url is None or profile_in.avatar_url == "" or old_avatar != profile_in.avatar_url):
        delete_local_file(old_avatar)
        if profile_in.avatar_url == "":
            profile.avatar_url = None
    if old_cv and (profile_in.cv_url is None or profile_in.cv_url == "" or old_cv != profile_in.cv_url):
        delete_local_file(old_cv)
        if profile_in.cv_url == "":
            profile.cv_url = None

    db.commit()
    db.refresh(profile)
    return profile
