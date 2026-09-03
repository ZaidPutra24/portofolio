from sqlalchemy import Column, BIGINT, Integer, SMALLINT, String, Text, Boolean, Date, DateTime, Enum, ForeignKey, Table, TIMESTAMP, text
from sqlalchemy.orm import relationship
from app.core.database import Base

# Junction table for Many-to-Many between projects and technologies
project_technologies = Table(
    "project_technologies",
    Base.metadata,
    Column("project_id", BIGINT, ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True),
    Column("technology_id", BIGINT, ForeignKey("technologies.id", ondelete="CASCADE"), primary_key=True)
)

# Junction table for Many-to-Many between experiences and skills
experience_skills = Table(
    "experience_skills",
    Base.metadata,
    Column("experience_id", BIGINT, ForeignKey("experiences.id", ondelete="CASCADE"), primary_key=True),
    Column("skill_id", BIGINT, ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(BIGINT, primary_key=True, autoincrement=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))

    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(BIGINT, primary_key=True, autoincrement=True)
    user_id = Column(BIGINT, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    headline = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    education = Column(Text, nullable=True)
    career_focus = Column(String(255), nullable=True)
    research_interests = Column(Text, nullable=True)
    avatar_url = Column(String(512), nullable=True)
    cv_url = Column(String(512), nullable=True)
    updated_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))

    user = relationship("User", back_populates="profile")


class SkillCategory(Base):
    __tablename__ = "skill_categories"

    id = Column(BIGINT, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    order_index = Column(Integer, default=0)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))

    skills = relationship("Skill", back_populates="category", cascade="all, delete-orphan")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(BIGINT, primary_key=True, autoincrement=True)
    category_id = Column(BIGINT, ForeignKey("skill_categories.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    level = Column(String(50), nullable=True)
    icon_name = Column(String(100), nullable=True)
    order_index = Column(Integer, default=0)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))

    category = relationship("SkillCategory", back_populates="skills")


class Project(Base):
    __tablename__ = "projects"

    id = Column(BIGINT, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    summary = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    background = Column(Text, nullable=True)
    problem = Column(Text, nullable=True)
    solution = Column(Text, nullable=True)
    implementation = Column(Text, nullable=True)
    results = Column(Text, nullable=True)
    year = Column(SMALLINT, nullable=False)
    status = Column(Enum('draft', 'published', 'archived'), default='draft', index=True)
    is_featured = Column(Boolean, default=False, index=True)
    github_url = Column(String(512), nullable=True)
    demo_url = Column(String(512), nullable=True)
    thumbnail_url = Column(String(512), nullable=True)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))

    images = relationship("ProjectImage", back_populates="project", cascade="all, delete-orphan")
    technologies = relationship("Technology", secondary=project_technologies, back_populates="projects")


class Technology(Base):
    __tablename__ = "technologies"

    id = Column(BIGINT, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    icon_name = Column(String(100), nullable=True)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))

    projects = relationship("Project", secondary=project_technologies, back_populates="technologies")


class ProjectImage(Base):
    __tablename__ = "project_images"

    id = Column(BIGINT, primary_key=True, autoincrement=True)
    project_id = Column(BIGINT, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url = Column(String(512), nullable=False)
    caption = Column(String(255), nullable=True)
    order_index = Column(Integer, default=0)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))

    project = relationship("Project", back_populates="images")


class ExperienceMedia(Base):
    __tablename__ = "experience_media"

    id = Column(BIGINT, primary_key=True, autoincrement=True)
    experience_id = Column(BIGINT, ForeignKey("experiences.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    url = Column(String(512), nullable=False)
    media_type = Column(String(50), nullable=False) # GitHub, Project, Publication, Certificate, Presentation, Portfolio
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))

    experience = relationship("Experience", back_populates="media")


class Experience(Base):
    __tablename__ = "experiences"

    id = Column(BIGINT, primary_key=True, autoincrement=True)
    position_title = Column(String(255), nullable=False)
    organization_name = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    location_type = Column(String(50), nullable=True) # On-site, Hybrid, Remote
    employment_type = Column(String(50), nullable=True) # Full-time, Part-time, Contract, Internship, Freelance, Self-employed, Volunteer
    start_month = Column(String(20), nullable=False, default="January")
    start_year = Column(Integer, nullable=False, default=2023)
    end_month = Column(String(20), nullable=True)
    end_year = Column(Integer, nullable=True)
    is_current = Column(Boolean, default=False)
    description = Column(Text, nullable=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))

    skills = relationship("Skill", secondary=experience_skills, backref="experiences")
    media = relationship("ExperienceMedia", back_populates="experience", cascade="all, delete-orphan")


class Publication(Base):
    __tablename__ = "publications"

    id = Column(BIGINT, primary_key=True, autoincrement=True)
    title = Column(String(500), nullable=False)
    authors = Column(Text, nullable=False)
    publisher_venue = Column(String(255), nullable=False)
    year = Column(SMALLINT, nullable=False)
    abstract = Column(Text, nullable=True)
    doi = Column(String(255), nullable=True)
    publication_url = Column(String(512), nullable=True)
    pdf_url = Column(String(512), nullable=True)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(BIGINT, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    category = Column(Enum('competition', 'scholarship', 'academic', 'professional', 'recognition'), nullable=False)
    issuer = Column(String(255), nullable=False)
    year_date = Column(Date, nullable=False)
    description = Column(Text, nullable=True)
    credential_url = Column(String(512), nullable=True)
    evidence_url = Column(String(512), nullable=True)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(BIGINT, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    issuer = Column(String(255), nullable=False)
    issue_date = Column(Date, nullable=False)
    expiry_date = Column(Date, nullable=True)
    credential_id = Column(String(255), nullable=True)
    credential_url = Column(String(512), nullable=True)
    image_url = Column(String(512), nullable=True)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))


class Message(Base):
    __tablename__ = "messages"

    id = Column(BIGINT, primary_key=True, autoincrement=True)
    sender_name = Column(String(100), nullable=False)
    sender_email = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, index=True)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"), index=True)


class SocialLink(Base):
    __tablename__ = "social_links"

    id = Column(BIGINT, primary_key=True, autoincrement=True)
    platform_name = Column(String(100), nullable=False)
    url = Column(String(512), nullable=False)
    icon_name = Column(String(100), nullable=True)
    order_index = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))


class Setting(Base):
    __tablename__ = "settings"

    id = Column(BIGINT, primary_key=True, autoincrement=True)
    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(Text, nullable=True)
    description = Column(String(255), nullable=True)
    updated_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))
