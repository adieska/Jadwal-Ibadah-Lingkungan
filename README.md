# Jadwal Ibadah Lingkungan 📅

Aplikasi modern berbasis web untuk mengelola dan merancang jadwal ibadah lingkungan secara otomatis, efisien, dan profesional.

## ✨ Fitur Utama

- **Otomatisasi Jadwal**: Menghasilkan deretan tanggal ibadah berdasarkan hari yang dipilih dalam rentang waktu tertentu.
- **Manajemen Pelayan**: 
  - **Pengkhotbah**: Kelola daftar pengkhotbah dengan fitur pengisian otomatis.
  - **Paragenda**: Kelola daftar paragenda dengan logika pencegahan duplikasi tugas (satu orang tidak akan bertugas ganda di kategori yang sama pada hari tersebut).
  - **Pembawa Acara**: Kelola daftar pembawa acara dengan verifikasi lintas tugas.
- **Manajemen Tuan Rumah**: Fitur *Bulk Import* (copy-paste) dari Excel atau teks untuk memasukkan nama tuan rumah dan alamat secara massal.
- **Ekspor Data**: 
  - **Excel**: Unduh jadwal lengkap dalam format `.xlsx`.
  - **PDF/Print**: Tata letak yang dioptimalkan untuk pencetakan dokumen fisik.
- **Penyimpanan Lokal**: Data tetap tersimpan di browser Anda menggunakan `localStorage`.

## 🚀 Teknologi

- **Frontend**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animasi**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Library Excel**: [XLSX (SheetJS)](https://sheetjs.com/)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)

## 🛠️ Cara Penggunaan

1. **Atur Hari & Tanggal**: Pilih hari ibadah (misalnya Minggu) dan tentukan rentang waktu. Klik **Generate Baris Baru**.
2. **Kelola Daftar Pelayan**: Tambahkan nama-nama Pengkhotbah, Paragenda, dan Pembawa Acara.
3. **Impor Tuan Rumah**: Gunakan tombol **Paste/Impor Data** untuk memasukkan daftar tuan rumah dan alamat secara sekaligus.
4. **Otomatisasi**: Klik tombol **Zap ⚡** pada masing-masing kategori untuk mengisi jadwal secara otomatis tanpa bentrok tugas.
5. **Simpan/Cetak**: Klik **Ekspor Excel** untuk pengolahan data lanjut atau **Cetak PDF** untuk dibagikan.

## 📄 Lisensi

Proyek ini dibuat untuk keperluan pelayanan lingkungan dan dapat digunakan serta dikembangkan lebih lanjut secara bebas.
