from typing import Optional
from urllib.parse import quote_plus
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Personal Portfolio & CMS API"
    
    # Konfigurasi Database Individual
    DB_HOST: Optional[str] = None
    DB_PORT: int = 3306
    DB_USER: Optional[str] = None
    DB_PASSWORD: Optional[str] = None
    DB_NAME: Optional[str] = "defaultdb"
    DB_SSL_MODE: Optional[str] = "REQUIRED"
    
    # Connection string tunggal (opsional)
    DATABASE_URL: Optional[str] = None

    # Flag untuk auto migration dan seeding di startup (default False demi keamanan Aiven)
    AUTO_MIGRATE_AND_SEED: bool = False

    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 hours

    # CORS Origins (Comma separated string or list, default "*" for development)
    CORS_ORIGINS: str = "*"

    @property
    def cors_origins_list(self) -> list:
        if not self.CORS_ORIGINS or self.CORS_ORIGINS == "*":
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def sync_database_url(self) -> str:
        # Prioritaskan DB_HOST jika diatur (misal Aiven), baru kemudian DATABASE_URL, lalu fallback localhost
        if self.DB_HOST and self.DB_USER:
            password_part = f":{quote_plus(self.DB_PASSWORD)}" if self.DB_PASSWORD else ""
            url = f"mysql+pymysql://{self.DB_USER}{password_part}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME or 'defaultdb'}"
        elif self.DATABASE_URL:
            url = self.DATABASE_URL
        else:
            url = "mysql+pymysql://root:@localhost:3306/portfolio_db"

        # Parameter ssl_mode untuk PyMySQL versi 1.1.0 disalurkan melalui connect_args di database.py
        return url

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
