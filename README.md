# 💰 Aturduit - Aplikasi Manajemen Keuangan Modern

(_banner_aturduit_v2.png)
![Version](https://img.shields.io/badge/Version-2.0-green?style=for-the-badge)

Selamat datang di **Aturduit**, sebuah solusi manajemen keuangan pribadi yang dibangun dengan semangat kesederhanaan, keindahan, dan privasi. Dokumen ini disusun untuk memberikan pemahaman menyeluruh tentang setiap aspek proyek, mulai dari filosofi desain hingga baris kode yang menjalankannya.

---

## 🌟 Filosofi Desain & Latar Belakang

### Mengapa Aturduit Dibuat?

Banyak aplikasi keuangan di luar sana yang terlalu rumit, penuh iklan, atau mengharuskan pengguna mendaftar akun di server yang tidak kita ketahui keamanannya. **Aturduit** lahir dari keinginan untuk memiliki alat pendataan keuangan yang:

1.  **Lokal & Privat**: Data Anda adalah milik Anda. Sepenuhnya tersimpan di dalam browser perangkat Anda. Tidak ada data yang dikirim ke _cloud_.
2.  **Menyenangkan Dilihat**: Kami percaya bahwa mengelola uang adalah kegiatan yang seringkali membuat stres. Oleh karena itu, antarmuka Aturduit dirancang dengan pendekatan _Psychological Design_ yang menggunakan warna-warna lembut, animasi yang halus (fluid motion), dan elemen _glassmorphism_ untuk memberikan efek menenangkan dan kesan premium.
3.  **Metode Budgeting "Amplop Digital"**: Terinspirasi dari metode amplop tradisional, fitur "Kantong" (Pockets) memungkinkan Anda memisahkan uang secara virtual (misal: "Uang Makan", "Tabungan Nikah", "Tagihan Bulanan") sehingga alokasi dana menjadi disiplin.

---

## 🛠️ Stack Teknologi & Alasan Pemilihannya

Kami memilih teknologi dengan sangat hati-hati untuk memastikan performa maksimal, kemudahan pengembangan, dan estetika tanpa batas. Berikut adalah rincian lengkapnya:

### 1. Bahasa Pemrograman: Vanilla JavaScript (ES6 Modules)

- **Apa itu?**: JavaScript murni tanpa bantuan framework besar seperti React atau Vue di sisi build.
- **Alasan Memilih**:
  - **Kecepatan**: Aplikasi berjalan instan tanpa perlu proses _transpiling_ yang berat.
  - **Modularitas Asli**: Kami menggunakan fitur `import` dan `export` bawaan browser modern, sehingga kode tetap rapi dan terorganisir dalam file-file terpisah (`store.js`, `ui.js`, dll) layaknya menggunakan React, tapi tanpa kerumitannya.
  - **Pembelajaran**: Kode ini sangat mudah dipelajari oleh pemula maupun expert karena langsung berjalan di atas standar web.

### 2. Styling: Tailwind CSS (via CDN)

- **Apa itu?**: Framework CSS _utility-first_ yang memungkinkan pembuatan desain kustom langsung di HTML.
- **Alasan Memilih**:
  - **Kecepatan Desain**: Tidak perlu bolak-balik antara file CSS dan HTML.
  - **Konsistensi**: Menggunakan sistem _grid_, _spacing_, dan _color palette_ standar yang membuat desain terlihat profesional secara otomatis.
  - **Responsif**: Fitur _mobile-first_ bawaan Tailwind memudahkan pembuatan tampilan yang bagus di HP maupun Laptop.

### 3. Animasi: Anime.js

- **Apa itu?**: Library animasi JavaScript yang ringan namun sangat powerful.
- **Alasan Memilih**:
  - **Smoothness**: Mampu menghasilkan animasi 60 FPS yang jauh lebih luwes daripada transisi CSS biasa.
  - **Kontrol Detail**: Kami menggunakannya untuk efek "pegas" (spring) pada navigasi dan interaksi tombol, memberikan rasa "hidup" pada aplikasi.

### 4. Visual Efek: Vanta.js & Three.js

- **Apa itu?**: Library untuk membuat latar belakang 3D animasi berbasis WebGL.
- **Alasan Memilih**:
  - **Wow Factor**: Memberikan kesan futuristik dan mahal pada aplikasi.
  - **Efek Kabut (Fog)**: Animasi awan/kabut yang bergerak perlahan memberikan efek relaksasi bagi pengguna.

### 5. Penyimpanan: LocalStorage API

- **Apa itu?**: Database mini yang tertanam di dalam setiap browser modern (Chrome, Firefox, Safari).
- **Alasan Memilih**:
  - **Privasi Total**: Data tidak pernah meninggalkan perangkat Anda.
  - **Persistensi**: Data tetap ada meskipun Anda menutup browser atau mematikan komputer.
  - **Tanpa Login**: Pengguna bisa langsung pakai tanpa perlu registrasi email.

### 6. Library Pendukung Lainnya

- **Chart.js**: Untuk membuat grafik keuangan yang interaktif dan mudah dibaca.
- **SweetAlert2**: Menggantikan _alert_ bawaan browser yang kaku dengan popup yang cantik dan bisa dikustomisasi.
- **Lucide Icons**: Koleksi ikon yang konsisten, tajam, dan modern.
- **jsPDF & AutoTable**: Memungkinkan fitur ekspor laporan keuangan ke format PDF langsung dari browser.
- **Vanilla Calendar Pro**: Untuk widget pemilihan tanggal yang estetik dan fungsional.

---

## 💻 Panduan Instalasi & Menjalankan (Lengkap)

Karena proyek ini menggunakan teknologi **ES6 Modules** modern (menggunakan perintah `import`), Anda **TIDAK BISA** sekadar klik ganda file `index.html`. Browser akan memblokirnya demi keamanan (kebijakan CORS).

Ikuti salah satu cara di bawah ini untuk menjalankannya dengan benar:

### Opsi 1: Menggunakan Visual Studio Code (Paling Mudah)

Ini adalah cara yang kami rekomendasikan untuk pengalaman pengembangan terbaik.

1.  **Unduh & Install**: Pastikan Anda sudah menginstall [Visual Studio Code](https://code.visualstudio.com/).
2.  **Buka Folder Proyek**: Klik menu `File` > `Open Folder...` dan pilih folder `aturduit-app` ini.
3.  **Install Ekstensi "Live Server"**:
    - Klik ikon kotak-kotak (Extensions) di sidebar kiri VS Code.
    - Ketik "Live Server" di kolom pencarian.
    - Install ekstensi dari _Ritwick Dey_.
4.  **Jalankan**:
    - Buka file `index.html` di editor.
    - Klik kanan di area kode, lalu pilih menu **"Open with Live Server"**.
    - Browser default Anda akan otomatis terbuka (biasanya di alamat `http://127.0.0.1:5500`) dan aplikasi siap digunakan.

### Opsi 2: Menggunakan Python (Jika sudah terinstall)

Jika Anda adalah pengguna Linux/Mac atau developer yang sudah memiliki Python.

1.  Buka terminal atau Command Prompt.
2.  Arahkan ke folder proyek ini.
    - Contoh: `cd C:\Users\NamaAnda\Documents\aturduit-app`
3.  Ketik perintah berikut lalu tekan Enter:
    - Untuk Python 3.x: `python -m http.server`
    - Untuk Python 2.x: `python -m SimpleHTTPServer`
4.  Buka browser Anda dan kunjungi alamat: `http://localhost:8000`

### Opsi 3: Menggunakan Node.js

Jika Anda sudah terbiasa dengan ekosistem Node.js.

1.  Buka terminal di folder proyek.
2.  Install package `http-server` secara global (sekali saja):
    - `npm install -g http-server`
3.  Jalankan perintah:
    - `http-server`
4.  Aplikasi akan berjalan di alamat yang tertera di terminal.

---

## 📚 Panduan Fitur Lengkap

### 1. Dashboard Utama

Halaman pertama yang Anda lihat.

- **Total Saldo**: Menampilkan gabungan antara saldo di dompet utama (cash) dan saldo yang tersimpan di semua kantong.
- **Statistik Masuk/Keluar**: Ringkasan cepat arus kas Anda.
- **Cash Flow Chart**: Grafik visual untuk melihat tren keuangan Anda.

### 2. Manajemen Kantong (Pockets)

Ini adalah inti dari metode penganggaran kami.

- **Membuat Kantong**: Klik tombol "+" di bagian kantong, beri nama (misal: "Belanja Bulanan"), dan kantong siap.
- **Mengisi Saldo (Alokasi)**: Klik tombol "Isi Saldo" pada detail kantong. Uang akan dipindahkan dari Saldo Utama ke Kantong tersebut. Ini mirip seperti memindahkan uang cash ke amplop amplop terpisah.
- **Menggunakan Uang dari Kantong**: Saat mencatat Pengeluaran, Anda WAJIB memilih dari kantong mana uang itu diambil.
- **Menghapus Kantong**: Jika kantong dihapus dan masih ada saldonya, sistem otomatis akan melakukan "Refund" (Pengembalian Dana) ke Saldo Utama agar uang tidak hilang.

### 3. Pencatatan Transaksi

- **Pemasukan**: Menambah Saldo Utama. (Contoh: Gaji, Bonus).
- **Pengeluaran**: Mengurangi saldo dari Kantong spesifik. (Contoh: Beli Kopi dari kantong "Jajan").
- **Transfer**: Perpindahan uang antar pos (otomatis tercatat saat Anda mengisi kantong atau menghapusnya).
- **Fitur Tanggal**: Anda bisa mencatat transaksi untuk tanggal yang lalu (backdated) menggunakan datepicker yang tersedia.

### 4. Riwayat & Pelaporan

- **Filter Cerdas**: Gunakan tombol "Pemasukan", "Pengeluaran", atau "Transfer" di halaman Riwayat untuk menyaring data.
- **Filter Tanggal**: Gunakan ikon kalender untuk melihat transaksi pada tanggal tertentu saja.
- **Export PDF**: Ingin laporan fisik? Masuk ke menu Riwayat, klik tombol Export, pilih rentang tanggal, dan unduh laporan PDF yang rapi lengkap dengan tabel total.

### 5. Pengaturan & Keamanan Data

- **Dark Mode**: Beralih antara mode terang dan gelap untuk kenyamanan mata.
- **Bahasa**: Mendukung Bahasa Indonesia dan Inggris.
- **Backup Data (JSON)**: Sangat PENTING! Karena data tersimpan di browser, disarankan untuk rutin melakukan backup. Klik "Backup Data", simpan file JSON-nya di tempat aman (Google Drive/USB). Jika Anda ganti laptop/HP, cukup gunakan fitur "Pulihkan Data" dan upload file tersebut.
- **Reset Aplikasi**: Tombol merah untuk menghapus bersih semua data dan memulai dari nol.

---

## 📂 Penjelasan Struktur Folder Proyek

Agar Anda tidak bingung menelusuri kodenya, berikut adalah peta strukturnya:

### Root Directory

- `index.html`: Jantung aplikasi. File ini memuat struktur kerangka web, memanggil semua library CDN, dan menghubungkan file-file JavaScript. Jangan mengubah urutan script loading di sini kecuali Anda tahu apa yang Anda lakukan.
- `README.md`: Dokumen panduan yang sedang Anda baca ini.
- `DOCUMENTATION.md`: Dokumen teknis mendalam untuk developer (penjelasan fungsi, variabel, dan logika kode).

### Folder `js/` (Logika Aplikasi)

Ini adalah "otak" dari Aturduit.

- `app.js`: **Controller Utama**. File ini mengatur inisialisasi aplikasi, menangani event klik, menghubungkan UI dengan Data, dan mengatur konfigurasi library pihak ketiga.
- `store.js`: **Manajemen Data (Database)**. File ini yang bertanggung jawab menyimpan, mengambil, dan memanipulasi data di LocalStorage. Semua logika "tambah uang", "kurang uang", "pindahkan uang" ada di sini.
- `ui.js`: **Tampilan (View)**. File ini berisi kode untuk memanipulasi elemen HTML. Misal: "Tampilkan daftar transaksi", "Ubah warna teks jadi merah", "Render grafik". File ini tidak boleh mengubah data, hanya menampilkan.
- `utils.js`: **Alat Bantu**. Berisi fungsi-fungsi kecil yang dipakai berulang kali, seperti fungsi mengubah angka `10000` menjadi `Rp 10.000` atau format tanggal.
- `pdf-generator.js`: Modul khusus untuk menangani proses pembuatan file PDF.

### Folder `css/`

- `styles.css`: CSS tambahan khusus. Walaupun kita pakai Tailwind, ada beberapa animasi kustom atau penyesuaian scrollbar yang lebih mudah ditulis di CSS murni di sini.

---

## ❤️ Penutup

Aturduit dibuat dengan dedikasi tinggi untuk menghasilkan software yang tidak hanya berfungsi, tapi juga memiliki "jiwa". Kami harap aplikasi ini membantu Anda mencapai kebebasan finansial dengan cara yang menyenangkan.

**Selamat Mengatur Duit!**
dibuat oleh **alfathaannn**
