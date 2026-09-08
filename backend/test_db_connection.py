import sys
import os

# Ensure backend directory is in path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from sqlalchemy import text, inspect
from app.core.database import engine, SessionLocal
from app.core.config import settings

def test_connection():
    print("==========================================")
    print(" TESTING FASTAPI TO AIVEN MYSQL CONNECTION ")
    print("==========================================")
    
    # 1. Test raw query: SELECT DATABASE();
    try:
        with engine.connect() as conn:
            current_db = conn.execute(text("SELECT DATABASE();")).scalar()
            print(f"[SUCCESS] Connected successfully!")
            print(f"  Current Active Database: {current_db}")
            
            # Verify SSL status
            ssl_status = conn.execute(text("SHOW STATUS LIKE 'Ssl_cipher';")).fetchone()
            if ssl_status and ssl_status[1]:
                print(f"  SSL Cipher in use: {ssl_status[1]} (SSL Active)")
            else:
                print("  SSL Status: Plain/Unencrypted")
    except Exception as e:
        print(f"[ERROR] Failed to connect to database: {e}")
        return

    # 2. Inspect tables using SQLAlchemy
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"\n[SUCCESS] Found {len(tables)} tables in database:")
        for t in sorted(tables):
            print(f"  - {t}")
    except Exception as e:
        print(f"[ERROR] Failed to inspect tables: {e}")
        return

    # 3. Test SELECT query on users table
    try:
        with engine.connect() as conn:
            user_count = conn.execute(text("SELECT COUNT(*) FROM users;")).scalar()
            print(f"\n[SUCCESS] Test Query Execution:")
            print(f"  SELECT COUNT(*) FROM users; -> Result: {user_count} user(s)")
    except Exception as e:
        print(f"[ERROR] Failed to query users table: {e}")

if __name__ == "__main__":
    test_connection()
