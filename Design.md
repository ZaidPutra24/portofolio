# UI/UX Design Specification (Design.md)

**Versi:** 1.0  
**Proyek:** Personal Portfolio & CMS  
**Fokus Desain:** Modern, Minimalist, Professional, Technology-Oriented  

---

## 1. Design Principles & Guidelines

* **Content is King:** Mengutamakan konten, keterbacaan, dan navigasi di atas efek visual yang rumit.
* **Minimalist & Clean:** Hindari animasi berlebihan, warna terlalu mencolok (seperti neon), dan elemen dekoratif yang tidak memiliki fungsi.
* **Performance First:** Desain harus mendukung pencapaian skor Lighthouse 90+ untuk performa, aksesibilitas, dan SEO.
* **Responsive:** Komponen UI harus beradaptasi secara mulus di perangkat *Desktop*, *Tablet*, dan *Smartphone*.
* **UI Components:** Menggunakan pendekatan *Headless UI* dengan Tailwind CSS dan Lucide Icons untuk menjaga tampilan tetap ringan dan bersih.

---

## 2. Color Palette & Typography

* **Typography:** Gunakan *font* sans-serif yang modern dan bersih (seperti Inter atau Roboto) untuk memastikan teks, dokumentasi teknis, dan jurnal mudah dibaca.
* **Background (Light Theme):** Putih bersih (`#FFFFFF`) atau abu-abu sangat muda (`#F8FAFC`) untuk menonjolkan ruang kosong (*whitespace*).
* **Accent Color:** Gunakan satu warna aksen profesional (misalnya *Sky Blue* `#0284C7` atau *Slate* `#0F172A`) untuk menonjolkan elemen interaktif seperti tautan dan tombol.
* **Borders & Dividers:** Gunakan garis tipis berwarna abu-abu terang (`#E2E8F0`) untuk memisahkan antar sesi tanpa terlihat penuh sesak.

---

## 3. Public Website Layout (Frontend)

Bagian ini dapat diakses oleh publik (*Guest*), seperti perekrut, klien, dan akademisi.

* **Hero Section:** Area utama yang menampilkan Nama, Foto Profil (*Avatar*), *Professional Headline*, ringkasan singkat, dan tiga tombol aksi utama (*View Projects*, *Download CV*, *Contact Me*).
* **About Section:** Tampilan narasi biografi yang bersih, dilengkapi blok terpisah untuk Riwayat Pendidikan, Fokus Karier, dan Minat Penelitian/Profesional.
* **Skills Grid:** Keahlian ditampilkan menggunakan tata letak *grid*, dikelompokkan berdasarkan kategori (seperti *Programming Languages*, *Web Stack*, *AI/ML & Cloud*) dan disandingkan dengan ikon UI yang relevan.
* **Experience Timeline:** Menggunakan antarmuka garis waktu (*timeline*) interaktif dengan urutan kronologis terbalik untuk memisahkan pengalaman kerja, magang, riset, dan organisasi.
* **Projects Showcase:** Tampilan kartu (*cards*) dalam bentuk *grid* yang memuat *Thumbnail* Proyek, Judul, Ringkasan, serta label kategori penyaring.
* **Project Detail Page (`/projects/[slug]`):** Halaman studi kasus memanjang ke bawah yang memuat *Banner* Besar, Latar Belakang Masalah, Solusi yang Diusulkan, *Badge* Teknologi, Detail Implementasi, Galeri Gambar, dan tombol tautan ke GitHub serta *Live Demo*.
* **Academic & Certifications List:** Desain daftar (*list view*) yang minimalis untuk menampilkan Publikasi Ilmiah, Penghargaan, dan Sertifikasi, dilengkapi tombol unduh PDF atau verifikasi kredensial.
* **Contact Form:** Formulir sederhana dengan kotak input untuk Nama, Email, Subjek, dan Pesan, disertai validasi kesalahan/keberhasilan yang jelas.
* **Footer & Social Links:** Baris rapi di bagian bawah halaman untuk menempatkan ikon media sosial dinamis (GitHub, LinkedIn, Google Scholar, dll).

---

## 4. Admin Dashboard Layout (CMS)

Bagian ini difokuskan pada efisiensi kerja administrator dalam mengelola konten (*Create, Read, Update, Delete*).

* **Authentication Page:** Halaman *login* sederhana yang terpusat di tengah layar, berisi input Email dan Password dengan nuansa korporat dan aman.
* **Layout Structure:** Menggunakan model navigasi *Sidebar* di sebelah kiri untuk menu hierarki modul (Dasbor, Profil, Proyek, Publikasi, Pesan Masuk, dll), dan area *Canvas* luas di sebelah kanan untuk konten utama.
* **Dashboard Canvas:** Menampilkan kartu metrik statistik cepat (seperti jumlah proyek, pesan masuk yang belum dibaca) di area utama.
* **Data Tables:** Tabel minimalis untuk menampilkan daftar data (pesan, daftar proyek, *skills*) dengan indikator status visual (misal: *Draft*, *Published*) dan tombol aksi ringkas.
* **Content Editors:** Formulir rapi yang mengelompokkan metadata di sisi kanan/bawah, serta mengintegrasikan *WYSIWYG editor* yang luas untuk menulis deskripsi proyek dan artikel.