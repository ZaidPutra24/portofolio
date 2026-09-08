from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# Siapkan connect_args untuk SSL jika terhubung ke Aiven/Remote DB
connect_args = {}
db_url = settings.sync_database_url

if "localhost" not in db_url and "127.0.0.1" not in db_url:
    # PyMySQL menggunakan dict ssl={"ssl_mode": ...} atau ssl_mode langsung via URL
    if "ssl_mode=" not in db_url:
        connect_args["ssl"] = {"ssl_mode": settings.DB_SSL_MODE or "REQUIRED"}

engine = create_engine(
    db_url,
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args=connect_args,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
