# Jadwal Ibadah Lingkungan 📅

Aplikasi manajemen jadwal ibadah lingkungan yang dirancang untuk membantu pengurus lingkungan mengelola rotasi pelayanan secara cerdas, otomatis, dan profesional. Dibangun dengan fokus pada kemudahan penggunaan, estetika modern, dan fungsionalitas yang kuat.

## ✨ Fitur Unggulan

### 1. 🤖 Smart Schedule Generator
*   **Inject Tanggal**: Hasilkan deretan tanggal ibadah mingguan secara instan berdasarkan rentang waktu yang ditentukan.
*   **Deteksi Hari**: Cukup pilih hari (misal: "Selasa"), dan sistem akan mencari semua hari tersebut dalam periode yang Anda pilih.

### 2. 👥 Pool & Rule-Based Assignment
*   **Database Pelayan Mandiri**: Kelola daftar Pengkhotbah, Paragenda, dan Pembawa Acara secara terpisah.
*   **Algoritma Anti-Bentrok**: Fitur pengisian otomatis (**Zap ⚡**) memastikan satu orang tidak mendapatkan tugas ganda dalam satu hari yang sama.
*   **Manajemen Tuan Rumah Massal**: Fitur *Bulk Import* memungkinkan Anda mengimpor puluhan nama tuan rumah dan alamat sekaligus (Copy-Paste dari Excel/WA).

### 3. 📊 Dashboard Statistik Penugasan
*   **Real-time Counter**: Lihat berapa kali setiap orang bertugas secara akumulatif.
*   **Distribusi Adil**: Membantu pengurus memantau beban tugas agar terdistribusi merata di antara semua anggota.
*   **Indikator Aktif**: Statistik diperbarui secara otomatis setiap kali ada perubahan pada tabel.

### 4. 🏘️ Tuan Rumah & Cadangan (Reserve)
*   **Sinkronisasi Otomatis**: Sistem mendeteksi keluarga mana yang sudah masuk jadwal dan mana yang belum.
*   **Bagian Cadangan**: Jika daftar tuan rumah Anda lebih banyak dari jumlah slot jadwal, sisanya akan ditampilkan secara otomatis di bawah tabel sebagai "Tuan Rumah Cadangan".

### 5. 🎨 UI/UX & Formatting
*   **Dark Mode Support**: Nyaman di mata dengan dukungan penuh mode gelap dan terang.
*   **Profesional Layout**: Nama pelayan di dalam tabel otomatis diformat menjadi **Bold Italic** untuk standar dokumen formal.
*   **Responsive Design**: Dapat digunakan dengan baik di PC maupun Smartphone.

### 6. 📤 Ekspor & Cetak
*   **Export Excel**: Unduh data lengkap dalam format `.xlsx` untuk keperluan pengarsipan digital.
*   **Print-Ready PDF**: Tata letak yang dioptimalkan untuk dicetak langsung menjadi dokumen fisik dengan margin yang rapi dan font yang terbaca jelas.

## 🚀 Teknologi yang Digunakan

*   **Core**: React 18 + Vite
*   **Tipe Data**: TypeScript (Type-safe)
*   **Styling**: Tailwind CSS 4.0
*   **Animasi**: Framer Motion
*   **Icons**: Lucide React
*   **Data Handling**: XLSX (SheetJS)
*   **Storage**: Browser LocalStorage (Data aman meski tab ditutup/refresh)

## 🛠️ Panduan Penggunaan

1.  **Generate Jadwal**: Tentukan rentang tanggal, pilih hari ibadah, lalu klik **Selesaikan Draft**.
2.  **Siapkan Daftar**: Masukkan nama-nama pelayan di bagian manajemen (bawah tabel).
3.  **Impor Tuan Rumah**: Copy daftar nama & alamat dari sumber lain, klik **Kelola Daftar Tuan Rumah** > **Bulk Import**, lalu tempel data Anda.
4.  **Inject**: Gunakan tombol **Inject** (ikon Petir) untuk mengisi kolom yang kosong secara cerdas.
5.  **Finalisasi**: Edit secara manual jika diperlukan (input tabel bersifat interaktif).
6.  **Bagikan**: Klik **Cetak Jadwal** atau **Ekspor Excel**.

## ⚠️ Catatan Penting Mengenai Data

Perlu diingat bahwa aplikasi ini saat ini menyimpan data di **LocalStorage Browser**. Artinya:
*   Data Draft Jadwal dan Daftar Tuan Rumah tersimpan di perangkat/browser masing-masing pengguna.
*   Jika Anda membersihkan Cache/Cookie browser atau menggunakan mode Incognito, data akan hilang.
*   **Rekomendasi**: Selalu ekspor ke Excel jika jadwal sudah final untuk cadangan fisik.
*   *Catatan Masa Depan*: Jika Anda membutuhkan data yang tersimpan secara permanen di cloud dan bisa diakses bersama oleh beberapa orang (sinkron), aplikasi ini perlu dikoneksikan ke database seperti **Firebase (Google)**.

## 🚀 Panduan Instalasi & Deployment

Karena ini adalah aplikasi berbasis **React (Vite)**, Anda bisa memasangnya di berbagai layanan hosting statis secara gratis atau berbayar.

### 1. Persiapan Lokal (Jika ingin build sendiri)
1. Pastikan Anda memiliki [Node.js](https://nodejs.org/) terpasang.
2. Clone/Unduh source code aplikasi ini.
3. Buka terminal di folder project dan jalankan:
   ```bash
   npm install
   ```
4. Untuk membangun file produksi, jalankan:
   ```bash
   npm run build
   ```
5. Hasilnya akan ada di folder `/dist`. Folder inilah yang diunggah ke hosting.

### 2. Pilihan Hosting

#### A. Netlify / Vercel (Sangat Direkomendasikan)
1. Hubungkan repository GitHub Anda ke layanan ini.
2. Gunakan pengaturan berikut:
   *   **Build Command**: `npm run build`
   *   **Publish Directory**: `dist`
3. Aplikasi akan otomatis terupdate setiap kali Anda melakukan *push* ke GitHub.

#### B. Hosting Biasa (cPanel/Shared Hosting)
1. Jalankan `npm run build` di komputer Anda.
2. Kompres isi folder `/dist` menjadi file `.zip`.
3. Unggah dan ekstrak file tersebut di folder `public_html` hosting Anda.

#### C. GitHub Pages
1. Pasang paket `gh-pages`: `npm install gh-pages --save-dev`.
2. Tambahkan `"homepage": "https://username.github.io/repo-name"` di `package.json`.
3. Jalankan `npm run deploy`.

## 📄 Lisensi

Dibuat dengan ❤️ untuk kemudahan pelayanan umat. Bebas digunakan dan dikembangkan.
