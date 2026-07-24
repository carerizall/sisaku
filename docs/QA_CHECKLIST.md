# Sisaku QA Checklist — Core MVP

Checklist ini diturunkan dari PRD `docs/Sisaku_ PRD Lengkap (1).md`, khususnya Acceptance Criteria Core MVP, Edge Case Checklist, Launch Checklist, dan prinsip Privacy-first.

## Autentikasi dan sesi

- [ ] Pengguna dapat registrasi dengan email dan password valid.
- [ ] Password kurang dari 8 karakter ditolak dengan pesan jelas.
- [ ] Pengguna dapat login dan logout.
- [ ] Reset password menampilkan respons aman tanpa membocorkan apakah email terdaftar.
- [ ] Route terlindungi mengarahkan pengguna tanpa sesi ke `/auth/login`.

## Onboarding

- [ ] Pengguna baru diarahkan ke onboarding setelah registrasi.
- [ ] Pengguna dapat membuat akun keuangan pertama dengan saldo awal.
- [ ] Pengguna memahami bahwa Sisaku tidak terkoneksi ke bank/e-wallet.
- [ ] Pengguna dapat mengisi pemasukan utama, pengeluaran rutin, dan target tabungan opsional.
- [ ] Onboarding dapat diselesaikan walau target tabungan dilewati.

## Manajemen akun

- [ ] Pengguna dapat menambah akun aset: kas, bank, e-wallet, dan lainnya.
- [ ] Pengguna dapat menambah akun kewajiban: kartu kredit.
- [ ] Pengguna dapat mengedit akun miliknya sendiri.
- [ ] Pengguna dapat mengarsipkan akun tanpa menghapus transaksi historis.
- [ ] Akun arsip tidak muncul sebagai pilihan default untuk transaksi baru.

## Transaksi dan edge cases

- [ ] Pengguna dapat mencatat pemasukan, pengeluaran, transfer, tabungan, dan adjustment.
- [ ] Input transaksi dasar dapat diselesaikan dalam kurang dari 15 detik pada alur cepat.
- [ ] Saldo akun terupdate setelah transaksi dibuat, diedit, atau dihapus.
- [ ] Transfer antar akun tidak dihitung sebagai pemasukan/pengeluaran laporan arus kas.
- [ ] Pembayaran kartu kredit dari akun aset mengurangi kewajiban tanpa double-counting pengeluaran.
- [ ] Transaksi backdated memperbarui snapshot Safe Spending dan laporan periode terdampak.
- [ ] Penghapusan transaksi meminta konfirmasi dan membuat audit log.

## Kategori

- [ ] Kategori default income dan expense tersedia untuk pengguna baru.
- [ ] Pengguna dapat membuat dan mengedit kategori kustom.
- [ ] Kategori yang dipakai transaksi tidak dihapus fisik tanpa strategi pengganti; minimal dinonaktifkan/diarsipkan.

## Safe Spending

- [ ] Dashboard menampilkan Safe Spending sebagai angka utama.
- [ ] Formula MVP sesuai PRD: aset aktif - kewajiban aktif - pengeluaran rutin tertunda - alokasi target tabungan - sisa anggaran prioritas.
- [ ] Breakdown komponen tersedia dan mudah dipahami.
- [ ] Status Aman/Waspada/Bahaya mengikuti threshold PRD.
- [ ] Safe Spending negatif menampilkan bahasa ramah dan saran praktis.

## Anggaran, tabungan, laporan

- [ ] Pengguna dapat membuat anggaran bulanan per kategori expense.
- [ ] Progress anggaran menampilkan nominal, persentase, dan status lewat warna konsisten.
- [ ] Pengguna dapat membuat target tabungan dengan nominal dan tanggal target.
- [ ] Progress target tabungan terlihat di UI.
- [ ] Riwayat transaksi dapat difilter dan dicari.
- [ ] Laporan bulanan menampilkan ringkasan pemasukan, pengeluaran, tabungan, dan kategori terbesar.

## Privasi, penghapusan data, dan analytics

- [ ] Halaman `/privacy` dapat diakses tanpa login.
- [ ] Copy privacy menjelaskan Sisaku tidak menghubungkan rekening bank/e-wallet.
- [ ] Pengguna dapat menghapus akun dan data dari halaman Pengaturan.
- [ ] Setelah akun dihapus, sesi berakhir dan pengguna diarahkan ke login.
- [ ] Analytics event tidak mengirim PII atau nominal transaksi mentah; gunakan rentang/agregasi.
- [ ] Akses API selalu memvalidasi ownership data berdasarkan `userId` sesi.