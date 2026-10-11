# Lestari Shop Offline — Installer Windows + SQLite

Versi 1.1.0 membungkus aplikasi HTML menjadi aplikasi desktop Windows menggunakan Electron. Build menghasilkan installer Windows (NSIS) 64-bit. Database SQLite berada di folder data pengguna Windows dan terdiri dari tabel `repairs`, `stock`, dan `cash`.

## Membuat installer melalui GitHub Actions
1. Ekstrak ZIP proyek di komputer.
2. Buat repository GitHub baru, lalu unggah semua isi folder proyek ke root repository, termasuk `.github/workflows`.
3. Buka tab **Actions** dan jalankan workflow **Build Windows EXE** dengan **Run workflow**.
4. Setelah workflow sukses, buka hasil run dan unduh artifact **Lestari-Shop-Offline-Windows**.
5. Ekstrak artifact dan jalankan `Lestari-Shop-Offline-Setup-1.1.0.exe`.

## Build lokal (opsional)
Pasang Node.js 22 atau lebih baru dan build tools yang diperlukan untuk modul native `better-sqlite3`. Jalankan PowerShell pada folder proyek:

```powershell
npm install
npm run dist:win
```

Installer ada di folder `dist`.

## Database dan cadangan
- Database utama: file `lestari-shop.sqlite` pada direktori `userData` Electron (biasanya `%APPDATA%\\lestari-shop-offline`).
- Tabel SQLite: `repairs`, `stock`, `cash`.
- Data lama di `localStorage` akan dicoba dimigrasikan otomatis ketika database SQLite masih kosong dan data lama tersedia.
- Gunakan menu **Data & Cadangan → Ekspor cadangan JSON** secara berkala. Cadangan JSON tetap dapat diimpor dari menu yang sama.
- Jangan menghapus folder data aplikasi atau file SQLite tanpa cadangan.

## Catatan
- Penggunaan aplikasi dan database tidak membutuhkan internet setelah instalasi. Internet diperlukan untuk build via GitHub Actions dan fitur WhatsApp.
- Installer belum ditandatangani sertifikat digital; Windows dapat menampilkan peringatan SmartScreen.
- Uji dulu dengan data contoh, ekspor/impor JSON, nota, stok, dan laporan sebelum dipakai untuk transaksi pelanggan sungguhan.
