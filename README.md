# Aturduit App (v2.0 - React + TypeScript)

Aplikasi manajemen keuangan pribadi yang modern, cepat, dan intuitif dengan **Tema Neomorphism (Soft UI)** untuk membantu Anda mengelola pengeluaran, pemasukan, pos alokasi (kantong), target tabungan, dan rencana finansial dengan rapi.

## ✨ Fitur Utama

- **Tema Neomorphism (Soft UI) Elegan**:
  - Tampilan permukaan timbul (*extruded/flat*) dan cekung (*inset/sunken*) dengan pencahayaan bayangan lembut ganda.
  - Dukungan penuh Mode Gelap (*Dark Neomorphism*) dan Mode Terang (*Light Neomorphism*).
- **Bottom Sheet untuk Input Transaksi**:
  - Modal transaksi tampil sebagai **Bottom Sheet** modern dengan animasi meluncur dari bawah (*slide-up sheet*).
- **Input Numpad Otomatis di HP**:
  - Seluruh kolom input angka (nominal transaksi, target tabungan, alokasi dana) otomatis memicu keyboard **Numpad numerik** di perangkat mobile (`inputMode="numeric" pattern="[0-9]*"`).
- **Kartu Interaktif Dashboard & Navigasi Lebih Simpel**:
  - Klik langsung pada **Kartu Pemasukan** untuk mencatat pemasukan.
  - Klik langsung pada **Kartu Pengeluaran** untuk mencatat pengeluaran.
  - Teks "Aksi Cepat" dan tombol ganda telah diringkas untuk tampilan yang lebih bersih dan minimalis.
- **Tipografi Google Sans 100%**:
  - Seluruh teks, judul, input form, tombol, hingga grafik Chart.js menggunakan font **Google Sans** secara konsisten.
- **Icon Set Hugeicons 100%**:
  - Menggunakan library resmi **Hugeicons** (`hugeicons-react`) untuk visual UI yang elegan, modern, dan presisi.
- **Fitur Terjemahan (i18n) 100% Berfungsi Penuh**:
  - Sakelar bahasa satu klik (**ID** untuk Bahasa Indonesia & **EN** untuk English).
- **Animasi Bottom Tab Bar**:
  - Kapsul aktif meluncur mulus dengan spring motion ala iOS/macOS.
- **Hover 2s Fullscreen**:
  - Arahkan kursor ke icon tema selama 2 detik untuk mode layar penuh.

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite](https://vitejs.dev/)
- **Theme**: Neomorphism / Soft UI Custom Engine
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Typography**: [Google Sans](https://fonts.google.com/)
- **Icons**: [Hugeicons React](https://hugeicons.com/)
- **Charts**: [Chart.js](https://www.chartjs.org/) & [react-chartjs-2](https://react-chartjs-2.js.org/)
- **PDF Export**: [jsPDF](https://github.com/parallax/jsPDF) & [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable)

## 🚀 Menjalankan Project

```bash
# Jalankan server pengembangan
npm run dev

# Kompilasi untuk produksi
npm run build
```

---

© 2026 by alfathaannn &bull; Manajemen Keuangan Pribadi
