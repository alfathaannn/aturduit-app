# Aturduit - Aplikasi Manajemen Keuangan by alfathaannn

![Version](https://img.shields.io/badge/version-2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

Aplikasi manajemen keuangan pribadi dengan tampilan modern, elegan, dan fitur lengkap untuk mengatur pemasukan, pengeluaran, dan alokasi dana.

## 🌟 Fitur Utama

### 💰 Manajemen Saldo
- **Saldo Utama**: Saldo utama otomatis dihitung dari total pemasukan dikurangi alokasi ke kantong dan pengeluaran dari saldo utama
- **Multi Kantong**: Pisahkan dana untuk berbagai kebutuhan (makan, kosan, tabungan, dll)
- **Tracking Real-time**: Semua perubahan langsung tersimpan dan terupdate

### 📊 Transaksi
- **Pemasukan**: Catat semua pendapatan yang otomatis masuk ke saldo utama
- **Pengeluaran**: Pilih sumber dana (saldo utama atau kantong tertentu) saat mencatat pengeluaran
- **Filter Canggih**: Filter berdasarkan tipe dan periode waktu
- **History Lengkap**: Lihat semua transaksi dengan detail tanggal dan sumber dana

### 🎯 Kantong Dana (Pockets)
- **Alokasi Fleksibel**: Pindahkan dana dari saldo utama ke kantong
- **Target Tabungan**: Tetapkan target untuk setiap kantong
- **Progress Tracking**: Visual progress bar untuk melihat pencapaian
- **Custom Icon**: Personalisasi dengan emoji atau icon favorit

### 📈 Statistik & Analisis
- **Dashboard Real-time**: Ringkasan keuangan dalam satu layar
- **Grafik 7 Hari**: Visualisasi pemasukan vs pengeluaran
- **Distribusi Kantong**: Lihat alokasi dana di semua kantong
- **Summary Cards**: Total pemasukan, pengeluaran, dan saldo

## 🎨 Desain & Teknologi

### Visual Design
- **Classic Elegance Color Palette**:
  - `#D4D8DD` - Silver Light
  - `#AAB7B7` - Silver Medium
  - `#C0C8CA` - Silver Dark
  - `#2E4156` - Navy Medium
  - `#1A2D42` - Navy Dark

### UI/UX Features
- ✨ **Glassmorphism Effect**: Kartu transparan dengan blur effect
- 🌓 **Dark/Light Mode**: Tema yang dapat disesuaikan dengan preferensi
- 🎬 **Smooth Transitions**: Animasi halus seperti aplikasi Apple
- 🌊 **Vanta.js Background**: Background animasi 3D yang interaktif
- 📱 **Responsive Design**: Optimal di semua ukuran layar

### Technology Stack
- **Frontend**: Vanilla JavaScript (No Framework)
- **Styling**: Pure CSS dengan CSS Variables
- **Icons**: Material Icons Round (Google)
- **Fonts**: Google Sans (CDN)
- **Modals**: SweetAlert2
- **Background**: Vanta.js with Three.js
- **Storage**: LocalStorage (Browser)

## 🚀 Cara Penggunaan

### Instalasi
1. Download semua file (`index.html`, `styles.css`, `app.js`)
2. Buka `index.html` di browser modern (Chrome, Firefox, Safari, Edge)
3. Aplikasi siap digunakan!

### Navigasi
Aplikasi memiliki 4 halaman utama:
- 🏠 **Dashboard**: Ringkasan dan quick actions
- 📝 **Transaksi**: Daftar lengkap semua transaksi
- 💼 **Kantong**: Kelola kantong dana
- 📊 **Statistik**: Analisis dan visualisasi data

### Workflow Pemasukan
1. Klik "Tambah Pemasukan" di Dashboard atau halaman Transaksi
2. Isi deskripsi (contoh: "Gaji Bulanan")
3. Masukkan jumlah
4. Pilih tanggal
5. Klik "Simpan"
6. ✅ Uang otomatis masuk ke **Saldo Utama**

### Workflow Pengeluaran
1. Klik "Tambah Pengeluaran"
2. Isi deskripsi (contoh: "Makan Siang")
3. Masukkan jumlah
4. **Pilih Sumber Dana**:
   - Saldo Utama
   - Atau salah satu Kantong yang tersedia
5. Pilih tanggal
6. Klik "Simpan"
7. ✅ Uang otomatis dikurangi dari sumber yang dipilih

### Workflow Kantong
1. Buka halaman "Kantong" atau klik "Kelola Kantong" di Dashboard
2. Klik "Tambah Kantong"
3. Isi informasi:
   - **Nama**: Misalnya "Uang Makan"
   - **Icon**: Emoji seperti 🍔
   - **Alokasi Dana**: Jumlah yang ingin dipindahkan dari Saldo Utama
   - **Target** (opsional): Target tabungan
4. Klik "Simpan"
5. ✅ Dana dipindahkan dari Saldo Utama ke Kantong

### Logika Aplikasi

```
PEMASUKAN
├── Input: Deskripsi, Jumlah, Tanggal
└── Output: Masuk ke SALDO UTAMA

PENGELUARAN
├── Input: Deskripsi, Jumlah, Sumber Dana, Tanggal
├── Jika Sumber = Saldo Utama
│   └── Output: Dikurangi dari SALDO UTAMA
└── Jika Sumber = Kantong
    └── Output: Dikurangi dari KANTONG tersebut

KANTONG
├── Input: Nama, Icon, Alokasi, Target
└── Output: Dana dipindahkan dari SALDO UTAMA ke KANTONG

SALDO UTAMA = Total Pemasukan - Total di Kantong - Pengeluaran dari Saldo Utama
```

## 💾 Backup & Restore

### Ekspor Data
1. Klik icon "Pengaturan" (⚙️) di Dashboard
2. Pilih "Ekspor Data"
3. File JSON akan terdownload

### Impor Data
1. Buka "Pengaturan"
2. Pilih "Impor Data"
3. Pilih file backup (format JSON)
4. Konfirmasi impor

### Reset Data
1. Buka "Pengaturan"
2. Pilih "Reset Data"
3. Konfirmasi (⚠️ Tidak dapat dibatalkan)

## 🎯 Fitur Advanced

### Filter Transaksi
- Filter berdasarkan **Tipe**: Semua, Pemasukan, Pengeluaran
- Filter berdasarkan **Periode**: Semua, Hari Ini, Minggu Ini, Bulan Ini

### Edit & Hapus
- **Kantong**: Edit nama, icon, saldo, dan target
- **Transaksi**: Hapus transaksi (saldo akan disesuaikan otomatis)

### Theme Toggle
- Klik icon 🌓 di pojok kanan atas navbar
- Toggle antara Light Mode dan Dark Mode
- Preferensi tersimpan otomatis

## 📱 Responsive Breakpoints

```css
Desktop:  > 1024px  (Full features)
Tablet:   768-1024px (Compact navigation)
Mobile:   < 768px    (Mobile optimized)
```

## 🔧 Kustomisasi

### Mengubah Warna
Edit variabel CSS di `styles.css`:
```css
:root {
    --primary: #2E4156;      /* Warna utama */
    --success: #10B981;      /* Warna sukses */
    --danger: #EF4444;       /* Warna bahaya */
    --accent: #AAB7B7;       /* Warna aksen */
}
```

### Mengubah Font
Ganti link Google Fonts di `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Your+Font&display=swap">
```

## 🐛 Troubleshooting

### Data Hilang
- Data tersimpan di LocalStorage browser
- Jangan clear cache/cookies tanpa backup
- Gunakan fitur Ekspor untuk backup berkala

### Background Tidak Muncul
- Pastikan koneksi internet aktif (CDN)
- Browser harus support WebGL
- Coba refresh halaman

### Modal Tidak Muncul
- Pastikan SweetAlert2 CDN terload
- Check browser console untuk error
- Pastikan JavaScript enabled

## 📄 File Structure

```
aturduit/
├── index.html          # Struktur HTML utama
├── styles.css          # Styling dan tema
├── app.js             # Logika aplikasi
└── README.md          # Dokumentasi
```

## 🔐 Privacy & Security

- ✅ **100% Offline**: Semua data tersimpan lokal di browser
- ✅ **No Server**: Tidak ada data yang dikirim ke server
- ✅ **No Account**: Tidak perlu registrasi atau login
- ⚠️ **Browser Only**: Data terikat ke browser dan device
- 💡 **Tip**: Gunakan fitur Ekspor untuk backup ke cloud pribadi

## 🎓 Tips Penggunaan

1. **Buat Kantong Sesuai Kebutuhan**
   - Uang Makan Harian
   - Biaya Kosan
   - Dana Darurat
   - Tabungan Goals

2. **Catat Transaksi Rutin**
   - Setiap kali dapat uang → Tambah Pemasukan
   - Setiap kali belanja → Tambah Pengeluaran
   - Pilih sumber dana yang tepat

3. **Review Berkala**
   - Cek halaman Statistik setiap minggu
   - Lihat trend pemasukan vs pengeluaran
   - Evaluasi alokasi kantong

4. **Backup Rutin**
   - Ekspor data setiap bulan
   - Simpan file backup di Google Drive/Cloud
   - Hindari kehilangan data

## 🚀 Future Features (Roadmap)

- [ ] Export ke Excel/CSV
- [ ] Kategori transaksi
- [ ] Recurring transactions
- [ ] Multi-currency support
- [ ] Budget planning
- [ ] Financial goals
- [ ] Mobile app (PWA)
- [ ] Cloud sync (optional)

## 📞 Support

Jika menemui masalah atau punya saran:
1. Check troubleshooting section
2. Review dokumentasi
3. Export data sebagai backup
4. Clear cache dan coba lagi

Jika Anda menyukai project ini, berikan ⭐ di GitHub!

Untuk pertanyaan atau support, hubungi:
- Email: muhammadalfathan0433@gmail.com
- Instagram DM: [@alfathaannn](https://www.instagram.com/alfathaannn)

## 📜 License

MIT License - Feel free to use and modify!

---


<div align="center">
  
  **Made with ❤️ by alfathaannn**
  
  ⭐ Jangan lupa star repository ini jika bermanfaat! ⭐
  
</div>
