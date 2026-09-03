# Product Requirements Document (PRD) — Personal Portfolio & CMS

**Versi:** 1.0  
**Status:** Draft Final  
**Tipe Produk:** Personal Portfolio Website + Admin CMS  
**Tanggal:** 6 Agustus 2026  

---

## 1. Product Overview
Website ini merupakan platform portofolio pribadi *full-stack* yang berfungsi sebagai pusat *personal branding*, digital CV, *showcase* proyek, publikasi ilmiah, pengalaman kerja/organisasi, pencapaian, dan sertifikasi.

Website ini bersifat dinamis dengan dukungan **Admin Dashboard/CMS** internal. Seluruh konten dapat ditambahkan, diperbarui, diterbitkan, dan dihapus tanpa perlu merubah *source code* secara langsung.

### Komponen Utama Sistem:
* **Public Portfolio Website:** Halaman publik yang dapat diakses oleh umum/pengunjung.
* **Admin Dashboard:** Panel CMS tertutup khusus pemilik website.
* **Backend REST API:** Layanan API yang menghubungkan frontend dan basis data.
* **MySQL Database:** Penyimpanan data relasional terstruktur.
* **Media/File Storage:** Penyimpanan berkas seperti gambar proyek, sertifikat, dan berkas CV.

---

## 2. Product Vision
Membangun sebuah website personal profesional yang:
1. Menjadi pusat identitas digital yang modern, kredibel, mudah dikelola, dan dapat berkembang mengikuti perjalanan karier, penelitian, proyek, serta pencapaian pemiliknya.
2. Memberikan kesan profesional dalam beberapa detik pertama ketika dikunjungi oleh *recruiter*, calon klien, akademisi, maupun kolaborator.

---

## 3. Product Goals

### 3.1 Primary Goals
* Membangun *personal branding* profesional.
* Menampilkan kemampuan (*skills*) dan keahlian secara terstruktur.
* Menampilkan proyek terbaik beserta detail implementasi teknisnya.
* Mendokumentasikan publikasi ilmiah secara rapi.
* Mendokumentasikan rekam jejak pengalaman (*experience*).
* Mendokumentasikan prestasi/penghargaan (*achievements*).
* Mendokumentasikan sertifikasi profesional (*certifications*).
* Menyediakan CV digital yang mudah diakses dan diunduh.
* Mempermudah *recruiter* atau calon klien menghubungi pemilik via formulir kontak.
* Memungkinkan seluruh konten dikelola mandiri melalui dashboard admin.

### 3.2 Secondary Goals
Website ini dirancang untuk mendukung berbagai kebutuhan lanjutan seperti:
* Lamaran pekerjaan (Job Applications).
* Lamaran *internship* / magang.
* Proyek *freelance* / konsultasi.
* Kolaborasi penelitian (*Research Collaboration*).
* Profil akademis (*Academic Profile*).
* Pengajuan beasiswa (*Scholarship Application*).
* Portofolio kompetisi / perlombaan.

---

## 4. Target Users

| Target User | Kebutuhan Utama |
| :--- | :--- |
| **Recruiter / HR** | Mencari informasi profil, *skills*, pengalaman kerja, proyek utama, prestasi, berkas CV, dan kontak. |
| **Potential Client** | Mencari portofolio proyek, *technology stack*, rekam jejak, serta saluran komunikasi/kontak. |
| **Academic / Researcher** | Mencari minat penelitian (*research interest*), publikasi ilmiah, proyek riset, dan rekam jejak akademis. |
| **General Visitor** | Mahasiswa, *developer*, atau komunitas yang tertarik mempelajari karya yang ditampilkan. |
| **Administrator** | Pemilik website yang mengelola penuh seluruh konten (*Create, Read, Update, Delete*). |

---

## 5. Product Scope

### 5.1 Public Scope
* **Home:** Section Hero, ringkasan profil, *featured projects*, *recent experience*, dan CTA utama.
* **About:** Biografi lengkap, riwayat pendidikan, fokus karier, serta minat riset/profesional.
* **Skills:** Pengelompokan *skills* berdasarkan kategori teknis/non-teknis.
* **Experience:** *Timeline* interaktif untuk pengalaman kerja, magang, *freelance*, riset, dan organisasi.
* **Projects & Project Detail:** Daftar proyek beserta filter/kategori, dan halaman detail mandiri tiap proyek.
* **Publications:** Daftar karya ilmiah/jurnal/konferensi beserta tautan DOI/PDF.
* **Achievements:** Daftar penghargaan dan prestasi akademik/profesional.
* **Certifications:** Daftar sertifikat profesional beserta penerbit dan bukti *credential*.
* **Contact:** Formulir pesan kontak langsung ke backend.
* **CV:** Akses dan unduh dokumen CV (*curriculum vitae*).
* **Social Links:** Tautan ke profil eksternal (GitHub, LinkedIn, Google Scholar, ORCID, dll).

### 5.2 Admin Scope
* **Login & Authentication:** Autentikasi aman untuk admin.
* **Dashboard:** Ringkasan statistik (jumlah proyek, pesan masuk, statistik konten).
* **Profile Management:** Pengelolaan biografi, foto profil, dan informasi diri.
* **Project Management:** CRUD proyek, upload galeri gambar, penentuan *featured project*.
* **Publication Management:** CRUD publikasi ilmiah dan tautan dokumen.
* **Experience Management:** CRUD *timeline* pengalaman.
* **Skill Management:** CRUD kategori dan *item skill*.
* **Achievement Management:** CRUD prestasi dan penghargaan.
* **Certificate Management:** CRUD sertifikat dan dokumen penunjang.
* **Contact Message Management:** Membaca dan menghapus pesan masuk.
* **Social Link Management:** Pengelolaan tautan sosial media dan platform profesional.
* **Website Settings:** Pengelolaan konfigurasi umum SEO, *hero text*, dan *footer*.

---

## 6. Public Website Detailed Features

### 6.1 Hero Section
* **Komponen:** Nama, Foto Profil, *Professional Headline*, *Short Introduction*, dan *Call-to-Action* (CTA).
* **Tombol CTA Utama:**
  1. *View Projects*
  2. *Download CV*
  3. *Contact Me*

### 6.2 About Section
* Biografi naratif yang lugas.
* Riwayat pendidikan formal.
* Fokus karier saat ini (*Career Focus*).
* Minat penelitian (*Research Interests*) dan minat profesional (*Professional Interests*).

### 6.3 Skills Section
Pengelompokan *skill* secara hirarkis berdasarkan kategori:
* **Programming Languages:** Python, TypeScript, JavaScript, Go, dll.
* **Frontend:** React, Next.js, Tailwind CSS, HTML5/CSS3.
* **Backend:** FastAPI, Node.js, Express, REST API design.
* **Database:** MySQL, PostgreSQL, Redis.
* **Artificial Intelligence & Machine Learning:** PyTorch, TensorFlow, OpenCV, Scikit-Learn.
* **Cloud & DevOps:** Docker, AWS, Git, CI/CD pipelines.
* **Tools & Platforms:** VS Code, Postman, Figma, Linux.

### 6.4 Experience Section
Tampilan *timeline* kronologis terbalik dengan kategori:
* *Work / Full-time*
* *Internship*
* *Freelance*
* *Research*
* *Organization*
* *Other Professional Experience*

---

## 7. Projects & Project Detail

### 7.1 Overview Proyek
Setiap proyek memiliki atribut data:
* *Title* & *Slug* (SEO friendly)
* *Thumbnail Image*
* *Summary / Short Description*
* *Category & Tags*
* *Technologies Used* (relasi ke master *skills/technologies*)
* *GitHub Repository Link*
* *Live Demo / Deployment Link*
* *Year of Completion*
* *Status* (Draft / Published / Archived)
* *Featured Flag* (`true` / `false`)

### 7.2 Halaman Detail Proyek (`/projects/[slug]`)
Setiap proyek publikasi dapat diakses secara mandiri (contoh: `/projects/solarvision`) dengan konten:
1. *Project Title & Banner*
2. *Overview & Summary*
3. *Background & Problem Statement*
4. *Proposed Solution*
5. *Technology Stack Badges*
6. *Implementation Details / Architecture*
7. *Image Gallery / Screenshots*
8. *Results & Key Metrics*
9. *External Links* (GitHub, Live Demo, Documentation)

---

## 8. Publications, Achievements & Certifications

### 8.1 Publications
Menampilkan publikasi akademik dengan bidang data:
* Judul Publikasi (*Title*)
* Daftar Penulis (*Authors*)
* Nama Jurnal / Konferensi (*Publisher / Venue*)
* Tahun Publikasi (*Year*)
* Abstrak (*Abstract*)
* DOI (Digital Object Identifier)
* Tautan Luar (*Publication Link* & *PDF Download Link*)

### 8.2 Achievements
Menampilkan rekam jejak prestasi:
* Nama Penghargaan / Kejuaraan
* Kategori (*Competition*, *Scholarship*, *Academic*, *Professional*, *Recognition*)
* Peringkat / Predikat
* Institusi/Penyelenggara
* Tahun / Tanggal

### 8.3 Certifications
Menampilkan lisensi dan sertifikasi profesional:
* Nama Sertifikasi
* Penerbit (*Issuer*)
* Tanggal Terbit & Tanggal Kedaluwarsa (opsional)
* ID Kredensial / *Credential URL*
* Gambar/Berkas Sertifikat

---

## 9. Contact & Social Links

### 9.1 Contact Form
* Form masukan publik (*Name*, *Email*, *Subject*, *Message*).
* Validasi input otomatis dan pencegahan *spam* (rate limiting).
* Simpan langsung ke database untuk diakses di Admin Dashboard.

### 9.2 Social Links
Dukungan ikon dan tautan dinamis ke platform:
* GitHub, LinkedIn, Google Scholar, ORCID, Kaggle, Twitter/X, Email Direct.

---

## 10. Admin Dashboard (CMS)

### Module Hierarchy:
```text
Admin CMS
├── 📊 Dashboard (Overview & Quick Stats)
├── 👤 Profile Management
├── 📁 Projects Management
├── 📚 Publications Management
├── 💼 Experience Management
├── 🛠️ Skills Management
├── 🏆 Achievements Management
├── 📜 Certificates Management
├── ✉️ Messages Inbox
├── 🔗 Social Links Settings
└── ⚙️ Website Settings
```

Setiap modul mendukung fungsi baku **CRUD** (*Create, Read, Update, Delete*) dengan antarmuka yang bersih dan responsif.

---

## 11. Non-Functional Requirements & Design Principles

### 11.1 Design Requirements
* **Pendekatan:** *Modern + Minimal + Professional + Technology-Oriented*.
* **Prinsip:** *Content > Readability > Navigation > Visual Effects*.
* **Larangan:** Hindari animasi berlebihan, tata warna terlalu mencolok/neon, dan elemen dekoratif tanpa fungsi jelas.

### 11.2 Performance & SEO
* Target **Lighthouse 90+** untuk *Performance*, *Accessibility*, *Best Practices*, dan *SEO* pada kondisi produksi normal.
* *Optimized Images* (WebP format, lazy loading).
* Support *Dynamic Metadata*, Open Graph, Canonical URL, `sitemap.xml`, `robots.txt`, dan Structured Data (JSON-LD).

### 11.3 Future Development Roadmap (Post-MVP)
* Integrasi Blog / Articles module.
* Privacy-friendly Analytics Dashboard.
* Dukungan Multilingual (ID/EN).
* AI Assistant Chatbot bawaan.
* *Advanced Search & Filtering*.
* Automatic PDF Resume / CV Generator dari data CMS.

---
