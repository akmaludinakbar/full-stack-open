# Meninjau latihan tambahan Part 5

Panduan ini membantu pemilik akun memahami dan memeriksa latihan 5.13–5.31 sebelum pengumpulan resmi. Implementasi dan pengujian dibantu AI. Kelulusan tes otomatis tidak menggantikan pemahaman peserta.

## Materi resmi

- [Testing React apps, 5.13–5.16](https://fullstackopen.com/en/part5/testing_react_apps/)
- [End-to-end testing, 5.17–5.23](https://fullstackopen.com/en/part5/end_to_end_testing/)
- [React Router dan UI frameworks, 5.24–5.31](https://fullstackopen.com/en/part5/react_router_ui_frameworks/)

## Yang perlu dipahami

| Latihan | Perilaku yang diperiksa | Pertanyaan untuk meninjau kode |
|---|---|---|
| 5.13–5.14 | Pada tahap awal, judul/penulis tampil; View membuka URL dan jumlah like. | Bagaimana state komponen mengatur tampilan, dan bagaimana tes mencari konten yang terlihat? |
| 5.15 | Dua klik Like memanggil callback dua kali. | Apa perbedaan menguji callback komponen dengan menguji perubahan database? |
| 5.16 | Form mengirim title, author, dan url melalui callback. | Bagaimana controlled input dan penanganan submit bekerja? |
| 5.17–5.18 | Browser sungguhan menguji form serta login berhasil/gagal. | Mengapa database harus direset dan pengguna uji dibuat sebelum setiap tes? |
| 5.19–5.20 | Pengguna login membuat blog dan menambah like. | Bagaimana browser, proxy frontend, API, token, dan database berinteraksi? |
| 5.21–5.22 | Pemilik dapat menghapus setelah konfirmasi; pengguna lain tidak melihat Delete. | Mengapa pemeriksaan UI perlu didukung otorisasi di backend? |
| 5.23 | Blog diurutkan dari like terbanyak. | Bagaimana tes membuktikan urutan, bukan sekadar keberadaan judul? |
| 5.24–5.26 | Daftar/detail publik; login dan form baru memakai route sendiri; mutasi hanya bagi pengguna login. | Apa perbedaan Link, navigasi setelah aksi, dan penjagaan route? |
| 5.27–5.28 | Tes komponen dan browser diperbarui mengikuti aplikasi dengan route. | Ekspektasi mana yang berubah, dan perilaku lama mana yang tetap harus terlindungi? |
| 5.29–5.31 | Material UI menata form, navigasi, notifikasi, dan detail. | Bagaimana komponen UI tetap memiliki label dan tombol yang dapat diakses? |

Tahap tes 5.13–5.16 disimpan dalam riwayat Git sebelum perubahan route. Tes akhir memang mengikuti persyaratan 5.27–5.28, sesuai urutan materi resmi.

## Cara memeriksa sendiri

1. Baca materi dan file implementasi/tes yang dipetakan di README Part 5.
2. Jalankan aplikasi lokal dengan database sementara sesuai README. Jangan memakai database pribadi untuk tes reset.
3. Sebagai tamu, buka daftar dan detail langsung melalui URL; periksa bahwa tombol Like/Delete tidak tersedia.
4. Login, buat blog, tambah like, lalu logout. Coba pengguna lain dan pemilik untuk melihat perbedaan izin penghapusan.
5. Jalankan tes komponen dan Playwright. Baca satu tes sampai bisa menjelaskan aksi, hasil yang diharapkan, dan alasan hasil itu membuktikan perilaku.
6. Perhatikan penanganan respons terlambat saat login/logout, tombol yang sedang menunggu respons, dan URL blog yang tidak ditemukan.

Catat waktu belajar atau peninjauan yang benar-benar kamu lakukan. Waktu kerja AI dan waktu tes berjalan sendiri tidak dihitung sebagai jam belajarmu. Pengumpulan resmi membutuhkan konfirmasi peserta bahwa materi dan kode dipahami serta jumlah jam yang benar.

## Batas pengujian

Playwright memakai browser Chromium khusus pengujian, dua server lokal, dan MongoMemoryServer sementara. Endpoint reset memerlukan NODE_ENV=test serta injeksi router secara eksplisit oleh launcher setelah database sementara siap. Server biasa tidak membukanya hanya karena pengaturan lingkungan. Pengujian ini tidak memakai akun kursus, Chrome pribadi, atau MongoDB Atlas.
