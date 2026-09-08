import sys
import os

# Add backend directory to path safely across all environments (Vercel Serverless & Local)
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.abspath(os.path.join(current_dir, ".."))
backend_dir = os.path.join(root_dir, "backend")

for path in [backend_dir, root_dir]:
    if path not in sys.path:
        sys.path.insert(0, path)

# Import the existing FastAPI application instance
from app.main import app

# Export app for Vercel Serverless Function handler
