# 📘 Dokumentasi Teknis & Arsitektur Aturduit

Dokumen ini disusun sebagai referensi mendalam bagi pengembang yang ingin memahami cara kerja "mesin" di balik antarmuka cantik Aturduit. Kami akan membedah setiap modul, alur data, dan keputusan teknis yang diambil.

---

## 🏗️ 1. Arsitektur Software

Aplikasi ini tidak dibangun secara monolitik (satu file besar), melainkan menggunakan **Arsitektur Modular** berbasis fitur standar Web (ES6 Modules).

Bayangkan aplikasi ini seperti sebuah restoran:

- **`store.js` (Gudang Bahan Makanan)**: Tempat semua bahan (data) disimpan dan dikelola stoknya. Tidak boleh ada yang mengambil bahan sembarangan tanpa lapor kepala gudang.
- **`ui.js` (Penyajian / Plating)**: Koki yang tugasnya hanya menata makanan di piring secantik mungkin. Dia tidak memasak, hanya menyajikan apa yang diberikan.
- **`app.js` (Manajer Restoran)**: Orang yang mengatur alur kerja. Dia menerima pesanan dari pelanggan (klik tombol), menyuruh gudang menyiapkan bahan (`store`), lalu menyuruh koki menyajikannya (`ui`).
- **`utils.js` (Alat Dapur)**: Pisau, parutan, sendok takar. Alat-alat kecil yang dipakai berulang kali oleh semua orang.

Pemisahan ini membuat kode:

1.  **Mudah Dibaca**: Kita tahu harus mencari kemana jika ada _bug_ (masalah tampilan? pasti di `ui.js`. Masalah saldo salah? pasti di `store.js`).
2.  **Aman**: Data tidak bisa diubah langsung oleh `ui.js`, harus melalui metode resmi di `store.js`.

---

## 💾 2. Struktur Data & Schema

Karena tidak menggunakan database server (MySQL/PostgreSQL), kita menggunakan **LocalStorage** browser sebagai database NoSQL sederhana. Data disimpan dalam bentuk teks JSON panjang dengan kunci `aturduit_data_v1`.

Berikut adalah bedahan anatominya:

### A. Objek Utama (Root State)

Ini adalah objek besar yang memuat seluruh nyawa aplikasi.

- **`mainBalance`** (Angka): Saldo utama yang "menganggur" dan belum dimasukkan ke kantong manapun. Sering disebut "Cash on Hand".
- **`pockets`** (List): Daftar kantong-kantong yang dibuat pengguna.
- **`transactions`** (List): Catatan riwayat keluar masuk uang.
- **`settings`** (Objek): Preferensi pengguna (tema, bahasa).

### B. Objek Kantong (Pocket)

Setiap kantong memiliki properti:

- **`id`**: Kode unik acak (misal: `pocket-1a2b3c`) agar sistem tidak bingung membedakan kantong yang namanya sama.
- **`name`**: Nama kantong (misal: "Liburan").
- **`balance`**: Jumlah uang di dalam kantong tersebut.
- **`color`**: Warna visual untuk membedakan tampilan kantong.

### C. Objek Transaksi (Transaction)

Jantung dari aplikasi. Setiap pergerakan uang direkam di sini.

- **`id`**: Kode unik transaksi.
- **`date`**: Waktu kejadian. Disimpan dalam format ISO internasional (`2026-01-22T10:30:00Z`).
- **`type`**: Jenis transaksi. Hanya ada 4 kemungkinan:
  - `income`: Pemasukan murni (misal: Gaji). Menambah Saldo Utama.
  - `expense`: Pengeluaran. **Wajib** mengambil dari salah satu Kantong. Mengurangi Saldo Kantong.
  - `transfer_out`: Uang keluar dari Saldo Utama masuk ke Kantong (saat "Isi Saldo").
  - `transfer_in`: Uang kembali dari Kantong ke Saldo Utama (saat "Hapus Kantong").
- **`amount`**: Jumlah uang.
- **`pocketId`**: (Opsional) Menunjuk ID kantong mana yang terlibat jika ini adalah pengeluaran.
- **`description`**: Catatan pengguna (misal: "Beli Bakso").

---

## 🧠 3. Bedah Logika (Deep Dive Code)

Mari kita lihat apa yang sebenarnya terjadi di balik layar pada fitur-fitur utama.

### Flow 1: Menambah Pemasukan

1.  Pengguna klik "Simpan" di modal Pemasukan.
2.  `app.js` menangkap data input dan mengirimnya ke `store.addIncome()`.
3.  `store.js` membuat objek transaksi baru dengan tipe `income`.
4.  `store.js` menambahkan `amount` ke `mainBalance`.
5.  `store.js` menyimpan data baru ke LocalStorage.
6.  `store.js` berteriak "DATA BERUBAH!" (publish event).
7.  `app.js` mendengar teriakan itu dan menyuruh `ui.updateView()`.
8.  `ui.js` menggambar ulang angka saldo di layar.

### Flow 2: Mengalokasikan Dana ke Kantong

Ini adalah logika yang paling sering membuat bingung, jadi perhatikan alurnya:

1.  Pengguna klik "Isi Saldo" di kantong X dan memasukkan Rp 100.000.
2.  `store.allocateToPocket()` dipanggil.
3.  **Validasi**: Cek apakah `mainBalance` cukup? Jika tidak, tolak (Throw Error).
4.  **Eksekusi**:
    - Kurangi `mainBalance` sebanyak 100.000.
    - Tambah `balance` milik Kantong X sebanyak 100.000.
5.  **Pencatatan**: Buat transaksi baru dengan tipe `transfer_out` agar ada jejak sejarahnya.
6.  Simpan & Update UI.

### Flow 3: Menghapus Kantong (Refund System)

Kita tidak bisa sembarang menghapus kantong yang ada uangnya. Uang itu harus kembali.

1.  `store.deletePocket()` dipanggil.
2.  Cek saldo kantong. Misal ada Rp 50.000.
3.  **Refund**: Tambahkan Rp 50.000 kembali ke `mainBalance`.
4.  **Pencatatan**: Buat transaksi tipe `transfer_in` dengan keterangan "Refund dari [Nama Kantong]".
5.  Baru setelah itu, hapus objek kantong dari array `pockets`.

---

## 🎨 4. Kustomisasi & Modifikasi

Panduan bagi Anda yang ingin mengotak-atik kode.

### A. Mengubah Warna Tema (Tailwind)

Warna utama didefinisikan di `index.html` pada bagian konfigurasi Tailwind script.
Cari bagian `tailwind.config`.

- Ubah kode warna hex di sana untuk mengganti nuansa aplikasi secara global.
- Gunakan [Tailwind Color Palette](https://tailwindcss.com/docs/customizing-colors) sebagai referensi.

### B. Mengubah Animasi Latar (Vanta.js)

Buka file `js/app.js` dan cari fungsi `initVantaBackground`.
Di sana ada konfigurasi:

- `highlightColor`: Warna awan yang paling terang.
- `midtoneColor`: Warna awan tengah.
- `baseColor`: Warna dasar langit.
  Ubah nilai hex-nya (format `0xRRGGBB`) untuk menciptakan suasana baru.

### C. Menambah Bahasa Baru

Buka `js/utils.js`. Di bagian paling bawah, ada objek raksasa bernama `TRANSLATIONS`.

1.  Copy salah satu blok bahasa (misal `id`).
2.  Paste dan ganti kuncinya menjadi kode negara baru (misal `jp` untuk Jepang).
3.  Terjemahkan semua teks di sebelah kanan titik dua.
4.  Buka `js/app.js` dan `store.js` untuk menambahkan logika toggle bahasa baru tersebut.

---

## ⚠️ 5. Kendala & Limitasi (Known Issues)

Sebagai developer yang jujur, kami mencantumkan batasan sistem ini:

1.  **Browser Cache**: Jika pengguna melakukan "Clear Cache & Site Data" di browsernya, **DATA AKAN HILANG**. Ini adalah sifat alami LocalStorage.
    - _Solusi_: Selalu edukasi pengguna untuk menggunakan fitur "Backup JSON".
2.  **Performa Data Besar**: Jika transaksi mencapai ribuan baris, aplikasi mungkin akan sedikit melambat saat memuat awal karena harus memparsing JSON raksasa sekaligus.
    - _Solusi Masa Depan_: Implementasi IndexedDB atau pagination (namun ini akan menambah kompleksitas kode drastis).
3.  **Mata Uang**: Saat ini _hardcoded_ untuk format Rupiah (IDR).

---

_Dokumentasi ini ditulis dengan tujuan transparansi penuh agar siapa saja dapat melanjutkan atau memelihara kode ini di masa depan._
