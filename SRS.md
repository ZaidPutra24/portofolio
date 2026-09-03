# Software Requirements Specification (SRS) — Personal Portfolio & CMS

**Versi:** 1.0  
**Status:** Draft Final  
**Tipe Produk:** Software Requirements Document  
**Tanggal:** 6 Agustus 2026  

---

## 1. Purpose & Scope
Dokumen **Software Requirements Specification (SRS)** ini mendefinisikan kebutuhan teknis, fungsional, dan non-fungsional secara rinci untuk pembangunan sistem **Personal Portfolio & CMS v1.0**. Dokumen ini menjadi acuan utama bagi pengembang *frontend*, *backend*, dan administrator basis data.

---

## 2. System Architecture

Sistem menggunakan arsitektur *decoupled full-stack* berorientasi REST API:

```text
 Client Browser (Guest / Admin)
          │
          ▼
   Next.js (Frontend)
    [TypeScript + Tailwind CSS]
          │
          │  HTTPS / REST API (JSON)
          ▼
   FastAPI (Backend)
    [Python 3.11+]
          │
          ├──> SQLAlchemy ORM ──> MySQL 8.x Database
          │
          └──> File Storage Handler ──> Media / Document Storage
```

---

## 3. Technology Stack

### 3.1 Frontend
* **Framework:** Next.js (App Router / React)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **UI Components:** Lucide Icons, Headless UI / Radix UI, Framer Motion (terbatas untuk transisi halus)

### 3.2 Backend
* **Framework:** FastAPI (Python)
* **ORM:** SQLAlchemy 2.0
* **Data Validation:** Pydantic v2
* **Migration Tool:** Alembic
* **Password Hashing:** Passlib (Bcrypt / Argon2)
* **JWT Token:** PyJWT / python-jose

### 3.3 Database & Storage
* **Database Engine:** MySQL 8.x
* **Storage Provider:** External Object/Media Storage (misal: AWS S3, Cloudinary, atau folder uploads terkonfigurasi)

---

## 4. System Actors & Functional Requirements

### 4.1 System Actors
1. **Guest (Pengunjung Publik):** Pengguna tanpa autentikasi yang dapat melihat seluruh informasi portofolio dan mengirimkan pesan kontak.
2. **Administrator (Pemilik Website):** Pengguna terautentikasi dengan hak akses penuh ke Admin CMS.

---

### 4.2 Guest Requirements (Functional Requirements)

| Requirement ID | Description |
| :--- | :--- |
| **FR-G01** | Mengakses halaman *homepage* utama. |
| **FR-G02** | Melihat informasi profil ringkas dan biografi lengkap (*About*). |
| **FR-G03** | Melihat daftar *skills* yang dikelompokkan per kategori. |
| **FR-G04** | Melihat *timeline* rekam jejak pengalaman (*Experience*). |
| **FR-G05** | Melihat daftar proyek (*Projects*) beserta filter kategori. |
| **FR-G06** | Membuka dan membaca halaman detail proyek (`/projects/{slug}`). |
| **FR-G07** | Melihat daftar publikasi ilmiah (*Publications*) dan mengklik link tautan/PDF. |
| **FR-G08** | Melihat daftar penghargaan dan prestasi (*Achievements*). |
| **FR-G09** | Melihat sertifikat profesional (*Certifications*) beserta kredensial. |
| **FR-G10** | Mengakses dan mengunduh berkas CV digital. |
| **FR-G11** | Mengakses tautan media sosial dan platform eksternal (*Social Links*). |
| **FR-G12** | Mengirimkan pesan melalui *Contact Form*. |

---

### 4.3 Administrator Requirements (Functional Requirements)

| Requirement ID | Description |
| :--- | :--- |
| **FR-A01** | Melakukan *Login* aman ke Admin Dashboard menggunakan Email dan Password. |
| **FR-A02** | Melakukan *Logout* dan menghapus sesi/token aktif. |
| **FR-A03** | Mengakses panel *Dashboard* utama dan melihat ringkasan statistik. |
| **FR-A04** | Memperbarui data profil diri, foto, bio, dan minat (*Profile Management*). |
| **FR-A05** | Mengelola data proyek: *Create, Read, Update, Delete, Publish/Unpublish, Featured Flag*. |
| **FR-A06** | Mengelola data *skills* dan kategori *skill*. |
| **FR-A07** | Mengelola data *timeline* pengalaman (*Work, Internship, Research, dll*). |
| **FR-A08** | Mengelola data publikasi ilmiah (*Publications*). |
| **FR-A09** | Mengelola data prestasi dan penghargaan (*Achievements*). |
| **FR-A10** | Mengelola data sertifikasi profesional dan berkas pendukung. |
| **FR-A11** | Membaca, mengoreksi, dan menghapus pesan kontak masuk (*Messages*). |
| **FR-A12** | Mengelola tautan media sosial (*Social Links*). |
| **FR-A13** | Mengelola pengaturan umum website (*SEO Meta, Site Title, Footer*). |

---

## 5. Database Schema & ERD Structure

### 5.1 Tables Overview (MySQL 8.x)
1. `users` — Akun administrator (id, email, hashed_password, created_at, updated_at).
2. `profiles` — Informasi diri detail (id, user_id, full_name, headline, bio, education, career_focus, research_interests, avatar_url, cv_url).
3. `skill_categories` — Kategori keahlian (id, name, order_index).
4. `skills` — Item keahlian (id, category_id, name, level, icon_name, order_index).
5. `projects` — Data proyek (id, title, slug, summary, description, background, problem, solution, implementation, results, year, status, is_featured, github_url, demo_url, thumbnail_url, created_at, updated_at).
6. `technologies` — Master teknologi/tools (id, name, icon).
7. `project_technologies` — Relasi Many-to-Many proyek dan teknologi (project_id, technology_id).
8. `project_images` — Galeri screenshot proyek (id, project_id, image_url, caption, order_index).
9. `experiences` — Timeline pengalaman (id, title, company_organization, location, category, start_date, end_date, is_current, description, order_index).
10. `publications` — Publikasi ilmiah (id, title, authors, publisher_venue, year, abstract, doi, publication_url, pdf_url).
11. `achievements` — Prestasi/penghargaan (id, title, category, issuer, year_date, description, credential_url).
12. `certificates` — Sertifikasi (id, name, issuer, issue_date, expiry_date, credential_id, credential_url, image_url).
13. `messages` — Pesan masuk kontak (id, sender_name, sender_email, subject, message, is_read, created_at).
14. `social_links` — Tautan media sosial (id, platform_name, url, icon_name, order_index, is_active).
15. `settings` — Konfigurasi global (id, key, value, description).

---

## 6. REST API Specification

### 6.1 Endpoints Directory

#### Authentication
* `POST /api/v1/auth/login` — Login admin & penerbitan JWT access token.
* `POST /api/v1/auth/logout` — Logout & invalidasi token.

#### Profile & Settings
* `GET /api/v1/profile` — (Public) Ambil profil publik.
* `PUT /api/v1/profile` — (Admin) Perbarui profil.
* `GET /api/v1/settings` — (Public) Ambil setting umum.
* `PUT /api/v1/settings` — (Admin) Perbarui setting.

#### Projects
* `GET /api/v1/projects` — (Public) Ambil daftar proyek publik (filter by category/featured).
* `GET /api/v1/projects/{slug}` — (Public) Detail proyek berdasarkan slug.
* `POST /api/v1/projects` — (Admin) Tambah proyek baru.
* `PUT /api/v1/projects/{id}` — (Admin) Perbarui proyek.
* `DELETE /api/v1/projects/{id}` — (Admin) Hapus proyek.

#### Skills & Experience
* `GET /api/v1/skills` — (Public) Ambil kategori & list skill.
* `POST / PUT / DELETE /api/v1/skills` — (Admin) Kelola skill.
* `GET /api/v1/experiences` — (Public) Ambil timeline pengalaman.
* `POST / PUT / DELETE /api/v1/experiences` — (Admin) Kelola pengalaman.

#### Publications, Achievements, Certificates
* `GET /api/v1/publications` — (Public) List publikasi.
* `GET /api/v1/achievements` — (Public) List prestasi.
* `GET /api/v1/certificates` — (Public) List sertifikat.
* `POST / PUT / DELETE` endpoints terproteksi untuk Admin pada masing-masing modul.

#### Contact & Messages
* `POST /api/v1/contact` — (Public) Kirim pesan baru (dengan rate limiting).
* `GET /api/v1/messages` — (Admin) Daftar pesan masuk.
* `GET /api/v1/messages/{id}` — (Admin) Detail pesan.
* `DELETE /api/v1/messages/{id}` — (Admin) Hapus pesan.

---

### 6.2 Standard API Responses

#### Success Response Format:
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {}
}
```

#### Error Response Format:
```json
{
  "success": false,
  "message": "Resource not found or invalid request",
  "errors": null
}
```

---

## 7. Security & Non-Functional Requirements

### 7.1 Security Requirements
* **Password Hashing:** Menggunakan algoritma Bcrypt / Argon2. Plaintext password dilarang keras disimpan di DB.
* **Authentication & Authorization:** Endpoint admin diisolasi menggunakan JSON Web Token (JWT) dengan skema `Bearer`.
* **SQL Injection Protection:** Seluruh kueri basis data wajib menggunakan SQLAlchemy ORM / *Parameterized Queries*.
* **Input Validation:** Pydantic v2 digunakan untuk memvalidasi tipe data, format email, URL, dan batas karakter pada setiap request body API.
* **Rate Limiting:** Diterapkan pada endpoint sensitif seperti `POST /api/v1/contact` dan `POST /api/v1/auth/login` (misal maks 5 req/menit).
* **CORS Configuration:** Dibatasi hanya untuk domain frontend yang diizinkan.
* **File Upload Safety:** Validasi tipe MIME file (JPG, PNG, WebP, PDF) dan pembatasan ukuran file (misal max 5MB/file).

### 7.2 Performance & Reliability
* Response time API rata-rata < 200ms untuk read operation.
* Penggunaan indeks pada kolom kueri utama (`slug`, `email`, `category_id`, `status`).
* Penanganan gracefully pada koneksi database timeout/retry.

### 7.3 Logging & Error Handling
* Backend melakukan logging untuk:
  - Error sistem/server (HTTP 500).
  - Percobaan login gagal (Security Event).
  - API Validation Errors.
* Informasi kredensial/token wajib di-masking dan tidak boleh muncul di log.

---

## 8. MVP Definition & Release Acceptance Criteria

Sistem versi **1.0 (MVP)** dinyatakan siap rilis apabila:
1. Public Website berfungsi penuh dan responsif di Desktop, Tablet, dan Smartphone.
2. Admin Dashboard dapat diakses setelah login dan seluruh modul CRUD (Profile, Project, Experience, Skill, Publication, Achievement, Certificate, Contact, Social) berfungsi normal.
3. Database MySQL terintegrasi dengan struktur tabel sesuai skema.
4. Upload gambar proyek dan dokumen CV berfungsi tanpa kendala.
5. Fitur SEO dasar (dynamic metadata, sitemap) telah terkonfigurasi.
6. Deployment backend (FastAPI) dan frontend (Next.js) terhubung secara aman via HTTPS.

---
