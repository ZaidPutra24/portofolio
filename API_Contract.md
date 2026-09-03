# API Contract Specification

**Version:** 1.0.0  
**API Version:** OpenAPI 3.0.3  
**Format Document:** Markdown (`.md`)

Dokumen ini merupakan spesifikasi API (API Contract) yang menyelaraskan arsitektur Backend (FastAPI), Frontend, dan dokumen desain proyek (PRD, SRS, dan ERD 15 Tabel).

---

## 1. Base URLs
*   **Local Development:** `http://localhost:8000/api/v1`
*   **Production Server:** `https://api.production-domain.com/v1`

---

## 2. Authentication (JWT)
Seluruh endpoint yang bersifat *restricted* (dilindungi) memerlukan header autentikasi menggunakan format Bearer Token.
`Authorization: Bearer <access_token>`

### 2.1. Login User
*   **Endpoint:** `POST /auth/login`
*   **Deskripsi:** Autentikasi user dan mendapatkan JWT Access Token.
*   **Request Body (`application/x-www-form-urlencoded`):**
    *   `username` *(string, required)*: Email pengguna.
    *   `password` *(string, required)*: Kata sandi pengguna.
*   **Responses:**
    *   `200 OK`: Berhasil login, mengembalikan `access_token` dan `token_type`.
    *   `401 Unauthorized`: Kredensial tidak valid.

---

## 3. Users & Profiles

### 3.1. Get List Users
*   **Endpoint:** `GET /users`
*   **Security:** Bearer Auth
*   **Parameters (Query):**
    *   `page` *(integer, default: 1)*: Nomor halaman.
    *   `limit` *(integer, default: 10)*: Jumlah data per halaman.
*   **Responses:**
    *   `200 OK`: Mengembalikan daftar user dengan format paginasi terstruktur.

### 3.2. Get Current User Profile
*   **Endpoint:** `GET /users/me`
*   **Security:** Bearer Auth
*   **Responses:**
    *   `200 OK`: Data profil pengguna yang sedang login berdasarkan token yang valid.

---

## 4. Content Management (Posts)

### 4.1. Get List Posts
*   **Endpoint:** `GET /posts`
*   **Security:** None (Public)
*   **Parameters (Query):**
    *   `category` *(string, optional)*: Filter berdasarkan slug kategori.
    *   `status` *(string, optional)*: Enum `[DRAFT, PUBLISHED, ARCHIVED]`.
    *   `page` *(integer, default: 1)*.
    *   `limit` *(integer, default: 10)*.
*   **Responses:**
    *   `200 OK`: Mengembalikan daftar artikel/post secara paginasi.

### 4.2. Create New Post
*   **Endpoint:** `POST /posts`
*   **Security:** Bearer Auth (Role: Admin / Author)
*   **Request Body (`application/json`):**
    *   `title` *(string, required)*
    *   `content` *(string, required)*
    *   `category_id` *(integer, required)*
    *   `tag_ids` *(array of integers, optional)*
    *   `status` *(string, enum, default: DRAFT)*
*   **Responses:**
    *   `201 Created`: Post berhasil dibuat.

### 4.3. Get Post Detail by Slug
*   **Endpoint:** `GET /posts/{slug}`
*   **Security:** None (Public)
*   **Parameters (Path):**
    *   `slug` *(string, required)*: Slug artikel yang unik dan *SEO-friendly*.
*   **Responses:**
    *   `200 OK`: Data detail post termasuk relasi ke entitas `category`, `tags`, dan `author`.
    *   `404 Not Found`: Post tidak ditemukan.

---

## 5. Taxonomy (Categories & Tags)

### 5.1. Get Categories
*   **Endpoint:** `GET /categories`
*   **Security:** None (Public)
*   **Responses:**
    *   `200 OK`: Mengembalikan *array* list semua kategori aktif.

---

## 6. Spesifikasi Lengkap OpenAPI (YAML)

Blok kode di bawah ini memuat spesifikasi penuh untuk memudahkan integrasi otomatis ke platform seperti Swagger UI, Postman, atau Redoc.

```yaml
openapi: 3.0.3
info:
  title: API Core System - FastAPI
  description: |
    API Contract komprehensif berdasarkan PRD, SRS, dan ERD 15 Tabel.
    Modul meliputi: Auth (JWT), RBAC (Role-Based Access Control), Content Management (Posts, Categories, Tags), Media, dan Settings.
  version: 1.0.0
  contact:
    name: Backend & Architect Team
servers:
  - url: http://localhost:8000/api/v1
    description: Local Development Server
  - url: https://api.production-domain.com/v1
    description: Production Server

tags:
  - name: Auth
    description: Autentikasi dan JWT Token
  - name: Users
    description: Manajemen Pengguna & Profil
  - name: RBAC
    description: Manajemen Roles dan Permissions
  - name: Content
    description: Manajemen Artikel / Posts
  - name: Taxonomy
    description: Manajemen Kategori dan Tag
  - name: Media
    description: Manajemen File dan Upload
  - name: System
    description: Pengaturan Sistem dan Audit Logs

paths:
  # ----------------------------------------
  # AUTHENTICATION
  # ----------------------------------------
  /auth/login:
    post:
      tags: [Auth]
      summary: Login User
      requestBody:
        required: true
        content:
          application/x-www-form-urlencoded:
            schema:
              type: object
              properties:
                username:
                  type: string
                  description: Email user
                password:
                  type: string
              required: [username, password]
      responses:
        '200':
          description: Berhasil login
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TokenResponse'
        '401':
          $ref: '#/components/responses/UnauthorizedError'

  # ----------------------------------------
  # USERS & PROFILE (Tabel: users, user_profiles)
  # ----------------------------------------
  /users:
    get:
      tags: [Users]
      summary: Dapatkan daftar Pengguna
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/PageParam'
        - $ref: '#/components/parameters/LimitParam'
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PaginatedUsers'
  
  /users/me:
    get:
      tags: [Users]
      summary: Profil Pengguna Login
      security:
        - bearerAuth: []
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserResponse'

  # ----------------------------------------
  # CONTENT / POSTS (Tabel: posts)
  # ----------------------------------------
  /posts:
    get:
      tags: [Content]
      summary: List Publikasi / Artikel
      parameters:
        - name: category
          in: query
          schema:
            type: string
        - name: status
          in: query
          schema:
            type: string
            enum: [DRAFT, PUBLISHED, ARCHIVED]
        - $ref: '#/components/parameters/PageParam'
        - $ref: '#/components/parameters/LimitParam'
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PaginatedPosts'
    post:
      tags: [Content]
      summary: Buat Post Baru
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/PostCreate'
      responses:
        '201':
          description: Post Dibuat
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PostResponse'

  /posts/{slug}:
    get:
      tags: [Content]
      summary: Detail Post berdasarkan Slug
      parameters:
        - name: slug
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PostDetailResponse'
        '404':
          $ref: '#/components/responses/NotFoundError'

  # ----------------------------------------
  # TAXONOMY (Tabel: categories, tags)
  # ----------------------------------------
  /categories:
    get:
      tags: [Taxonomy]
      summary: List Kategori
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/CategoryResponse'

# ==========================================
# COMPONENTS (SCHEMAS, PARAMS, RESPONSES)
# ==========================================
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  parameters:
    PageParam:
      name: page
      in: query
      description: Nomor halaman
      schema:
        type: integer
        default: 1
    LimitParam:
      name: limit
      in: query
      description: Jumlah data per halaman
      schema:
        type: integer
        default: 10

  responses:
    UnauthorizedError:
      description: Akses ditolak atau token tidak valid/kedaluwarsa.
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
    NotFoundError:
      description: Data tidak ditemukan.
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'

  schemas:
    # --- UTILITY SCHEMAS ---
    ErrorResponse:
      type: object
      properties:
        detail:
          type: string
          example: "Resource not found"

    TokenResponse:
      type: object
      properties:
        access_token:
          type: string
        token_type:
          type: string
          example: bearer
        expires_in:
          type: integer

    # --- ENTITY SCHEMAS (Mewakili ERD) ---
    UserResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        full_name:
          type: string
        is_active:
          type: boolean
        roles:
          type: array
          items:
            type: string
        created_at:
          type: string
          format: date-time

    PaginatedUsers:
      type: object
      properties:
        total:
          type: integer
        page:
          type: integer
        limit:
          type: integer
        data:
          type: array
          items:
            $ref: '#/components/schemas/UserResponse'

    CategoryResponse:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        slug:
          type: string
        description:
          type: string

    TagResponse:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        slug:
          type: string

    PostCreate:
      type: object
      required: [title, content, category_id]
      properties:
        title:
          type: string
        content:
          type: string
        excerpt:
          type: string
        status:
          type: string
          enum: [DRAFT, PUBLISHED, ARCHIVED]
        category_id:
          type: integer
        tag_ids:
          type: array
          items:
            type: integer

    PostResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        title:
          type: string
        slug:
          type: string
        excerpt:
          type: string
        status:
          type: string
        created_at:
          type: string
          format: date-time

    PostDetailResponse:
      allOf:
        - $ref: '#/components/schemas/PostResponse'
        - type: object
          properties:
            content:
              type: string
            author:
              $ref: '#/components/schemas/UserResponse'
            category:
              $ref: '#/components/schemas/CategoryResponse'
            tags:
              type: array
              items:
                $ref: '#/components/schemas/TagResponse'

    PaginatedPosts:
      type: object
      properties:
        total:
          type: integer
        page:
          type: integer
        limit:
          type: integer
        data:
          type: array
          items:
            $ref: '#/components/schemas/PostResponse'

```
