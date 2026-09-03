# Personal Portfolio & Admin CMS v1.0

A modern, full-stack personal portfolio and admin CMS platform built with **Next.js (TypeScript & Tailwind CSS)** for the public frontend and admin dashboard, and **FastAPI (Python & SQLAlchemy & MySQL)** for the robust REST API backend.

---

## Architecture & Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Lucide Icons.
- **Backend:** FastAPI (Python 3.11+), SQLAlchemy ORM, Pydantic v2, Alembic, python-jose (JWT), Passlib (Bcrypt).
- **Database & Storage:** MySQL 8.x, local/object media storage (`/uploads`).

---

## Setup & Installation Instructions

### 1. Backend Setup (FastAPI & MySQL)

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables (`.env`):
   Create a `.env` file in `backend/` based on `.env.example`:
   ```env
   PROJECT_NAME="Personal Portfolio & CMS"
   DATABASE_URL="mysql+pymysql://root:password@localhost:3306/portfolio_db"
   SECRET_KEY="your-super-secret-jwt-key"
   ALGORITHM="HS256"
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   ```
5. Run database migrations and seeders:
   ```bash
   alembic upgrade head
   python seed.py
   ```
6. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### 2. Frontend Setup (Next.js)

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (`.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
5. Access the application at `http://localhost:3000`.

---

## API Endpoints Overview

- **Auth:** `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`
- **Profile:** `GET /api/v1/profile`, `PUT /api/v1/profile`
- **Projects:** `GET /api/v1/projects`, `GET /api/v1/projects/{slug}`, `POST /PUT /DELETE /api/v1/projects`
- **Skills & Experience:** `GET /api/v1/skills`, `GET /api/v1/experiences`
- **Academic & Certificates:** `GET /api/v1/academic/publications`, `GET /api/v1/academic/certificates`
- **Contact:** `POST /api/v1/contact`, `GET /api/v1/contact/messages`
- **Uploads:** `POST /api/v1/upload/project`, `POST /api/v1/upload/certificate`, `POST /api/v1/upload/cv`

---

## Deployment Guide

1. **Backend Deployment:**
   - Deploy FastAPI using Gunicorn/Uvicorn on a Linux VPS (e.g., Ubuntu with Nginx reverse proxy).
   - Configure MySQL database instance and run Alembic migrations (`alembic upgrade head`).
   - Set environment variables (`DATABASE_URL`, `SECRET_KEY`).
2. **Frontend Deployment:**
   - Deploy Next.js on Vercel or Node.js hosting.
   - Set `NEXT_PUBLIC_API_URL` to point to the production backend API URL.

---

## Production Checklist

- [ ] Strong JWT `SECRET_KEY` configured.
- [ ] Database credentials secured and restricted.
- [ ] HTTPS enabled on both frontend and backend.
- [ ] CORS policies appropriately restricted.
- [ ] File upload MIME type and size limitations verified.
- [ ] Production build verification (`npm run build`, `alembic upgrade head`).
