# Panduan Studio Render Video

Folder ini adalah proyek Remotion untuk membuat video di laptop Windows.
Setelah kode video dan semua kebutuhannya tersedia, render dilakukan di laptop,
tidak memakai Claude atau layanan AI.

## 1. Yang perlu tersedia

- Windows dan Node.js LTS, termasuk npm. Proyek ini mendukung Node.js seri 20
  mulai 20.19, seri 22 mulai 22.13, atau versi 24 ke atas. Unduh di
  https://nodejs.org/en/download jika belum ada.
- VS Code untuk membuka dan mengedit kode.
- Ruang penyimpanan untuk paket proyek, browser render, media, dan hasil MP4.
  Ukuran dan lama render bergantung pada proyek dan laptop.
- Internet untuk memasang paket, serta jika browser render atau aset belum tersedia.
  Remotion mungkin mengunduh komponen browser pada render pertama.

Saat disiapkan, folder proyek berukuran sekitar 662 MB, termasuk paket dan
browser khusus render yang sudah diunduh. Ukuran ini dapat berubah; Node.js,
media tambahan, dan video hasil render juga membutuhkan ruang penyimpanan.

Jika proyek baru dipindahkan dan belum memiliki folder `node_modules`, klik dua
kali **PASANG_PAKET.bat** dan tunggu sampai selesai. Gunakan juga setelah
Claude menyuruh menambahkan atau mengubah paket di `package.json`.

## 2. Coba contoh bawaan

Contoh bawaan berdurasi 3 detik, vertikal 1080 x 1920, dan 60 fps. Contoh ini
tidak menggunakan suara atau gambar tambahan.

1. Klik dua kali **BUKA_PREVIEW.bat**. Preview akan terbuka di browser.
2. Lihat videonya. Setelah selesai, tutup jendela terminal preview agar laptop
   lebih ringan saat render.
3. Klik dua kali **RENDER_VIDEO.bat** dan tunggu sampai muncul tulisan SELESAI.
4. Buka folder **hasil** untuk melihat file MP4. Nama file menyertakan tanggal
   dan waktu, dan render tidak akan menimpa file yang sudah ada.

Jika proyek memiliki beberapa komposisi/video, pilih salah satunya dengan
tombol panah di terminal lalu tekan Enter. Jika hanya ada satu, komposisinya
dipilih otomatis. Jangan tutup jendela render sebelum selesai.

## 3. Memasukkan kode dari Claude

Minta Claude membuat kode yang cocok dengan proyek ini. Contoh pesan:

> Gunakan skill Local Video Studio. Buat video tentang [isi cerita] memakai
> proyek Remotion yang sudah saya siapkan. Jangan buat ulang proyek atau mengganti
> package.json. Ikuti format dan nama file proyek ini. Voice-over saya akan
> berikan sebagai `public\voice.wav`.

Skill mengarahkan Claude untuk menyesuaikan kode dengan proyek ini. Jika belum
mengunggah skill, minta Claude memberikan kode lengkap untuk
`src\Root.tsx` dan `src\VideoSaya.tsx`, bukan membuat proyek baru.

1. Buka folder proyek ini dengan VS Code.
2. Simpan isi kode ke file yang namanya sesuai jawaban Claude. Misalnya, ganti
   isi `src\Root.tsx` dan `src\VideoSaya.tsx`; buat file tambahan jika diminta.
   Jangan menempelkan semua kode ke satu file.
3. Jika ada voice-over atau media lain, taruh di `public`. Nama file harus sama
   persis dengan yang dipakai kode, misalnya `voice.wav`. Menaruh file di folder
   saja tidak otomatis menambahkan suara; kode video juga harus memakai file itu.
4. Jika Claude mengubah dependensi `package.json`, jalankan **PASANG_PAKET.bat**.
5. Jalankan preview dan render seperti di atas.

Di `src\Root.tsx`, `durationInFrames` adalah durasi dalam frame. Sebagai contoh,
30 detik pada 60 fps memerlukan 1800 frame. Untuk audio berdurasi 25,16 detik,
gunakan paling sedikit 1510 frame pada 60 fps. Pastikan kode, nama file suara,
dan durasi sesuai dengan video yang sebenarnya.

## 4. File dan folder penting

- `src\Root.tsx`: daftar video, ukuran, fps, dan durasi.
- `src\VideoSaya.tsx`: contoh isi video; dapat diganti kode video baru.
- `src\index.ts`: titik masuk proyek; jangan dihapus.
- `public`: tempat file suara, gambar, dan video yang dipakai kode.
- `hasil`: tempat MP4 hasil render.
- `package.json` dan `package-lock.json`: daftar paket untuk proyek.
- `node_modules`: paket yang terpasang, ukurannya bisa cukup besar.

## 5. Google Drive dan internet

Google Drive bisa dipakai untuk mencadangkan proyek. Simpan setidaknya kode,
file panduan/tombol, `package.json`, `package-lock.json`, konfigurasi, serta
media dalam `public`. File yang akan dipakai render harus dapat dibaca di laptop.

Folder `node_modules` boleh tidak disertakan dalam cadangan untuk menghemat
ruang Drive. Ketika proyek dipindahkan, install Node.js di laptop tujuan dan
jalankan **PASANG_PAKET.bat** dengan internet untuk memasangnya kembali. Browser
render juga mungkin perlu diunduh lagi.

Setelah Node.js, paket, browser render, serta semua media dan font yang digunakan
tersedia di laptop, proyek yang tidak bergantung pada URL atau layanan online
dapat dirender tanpa internet dan tanpa AI.

## 6. Jika ada masalah

- **Node.js/npm tidak ditemukan:** install Node.js LTS lalu buka ulang terminal
  atau VS Code. Periksa kembali bahwa Node.js sudah masuk ke PATH Windows.
- **Paket belum tersedia:** jalankan **PASANG_PAKET.bat** dengan internet aktif.
- **Suara atau gambar hilang:** cek nama file di `public` dan nama dalam kode.
- **Video terpotong:** cek `durationInFrames` dan `fps` di `src\Root.tsx`.
- **Render lambat atau laptop terasa berat:** tutup preview dan aplikasi lain,
  lalu coba lagi. Tombol render menggunakan satu proses render untuk mengurangi
  beban; video beresolusi tinggi dan 60 fps tetap dapat memakan waktu.
- **Render gagal:** baca pesan di jendela terminal. Jika membutuhkan bantuan,
  kirim teks atau tangkapan layar kesalahannya; jangan menutupinya.

Pemasangan pertama dan kode yang meminta aset dari internet memerlukan koneksi.
Ukuran file MP4 dan lamanya render tidak bisa dijamin sama untuk setiap video.
