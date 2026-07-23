# Sisaku: PRD Lengkap

### TL;DR

Sisaku adalah aplikasi pengelola keuangan pribadi berbasis web responsive yang membantu pengguna mengetahui “sisa uang yang beneran milikmu” melalui pencatatan manual pemasukan, pengeluaran, transfer, tabungan, anggaran, dan akun keuangan. Produk ini ditujukan untuk milenial dan Gen Z Indonesia yang ingin mengelola uang tanpa menghubungkan rekening bank atau e-wallet, sehingga mereka tetap memiliki kendali penuh atas data finansialnya.

MVP berfokus pada pencatatan manual yang cepat, manajemen multi-akun, kategori, anggaran bulanan, target tabungan dasar, laporan keuangan sederhana, dan kalkulasi Safe Spending yang explainable. Fase setelah MVP menghadirkan Sisaku Premium dengan AI Financial Assistant untuk insight, prediksi, rekomendasi penghematan, dan tanya jawab finansial berbasis data yang dicatat pengguna.

Tagline: Sisa yang beneran milikmu.

Status dokumen: Final untuk eksekusi MVP dan perencanaan fase Premium AI.

---

## Goals

### Business Goals

* Membangun Sisaku sebagai aplikasi pengelola keuangan pribadi yang ringan, aman, dan mudah digunakan tanpa integrasi bank.
* Meningkatkan literasi keuangan milenial dan Gen Z Indonesia melalui fitur Safe Spending, laporan sederhana, dan insight finansial yang mudah dipahami.
* Mencapai minimal 10.000 pengguna terdaftar dan 3.000 monthly active users dalam 6 bulan pertama setelah rilis beta publik.
* Mencapai completion rate onboarding minimal 70% agar mayoritas pengguna berhasil membuat akun keuangan pertama dan melihat hasil Safe Spending awal.
* Membangun fondasi monetisasi melalui Sisaku Premium berbasis AI Financial Assistant, dengan target awal 3-5% konversi dari pengguna aktif ke premium setelah fitur AI dirilis.

### User Goals

* Mengetahui jumlah uang yang masih aman dibelanjakan setelah memperhitungkan saldo, pengeluaran rutin, tagihan, anggaran, kewajiban, dan target tabungan.
* Mencatat pemasukan, pengeluaran, transfer, dan tabungan secara manual dengan cepat tanpa harus menghubungkan rekening bank atau e-wallet.
* Mengelola beberapa akun keuangan seperti kas, rekening bank, e-wallet, kartu kredit, dan sumber dana lain dalam satu tempat.
* Memahami pola pengeluaran melalui kategori transaksi, riwayat lengkap, grafik, statistik, dan ringkasan finansial.
* Membangun kebiasaan finansial yang lebih disiplin melalui anggaran bulanan, target tabungan, pengingat, dan insight yang mudah dipahami.

### Non-Goals

* Integrasi otomatis dengan rekening bank, e-wallet, kartu kredit, atau layanan finansial pihak ketiga pada versi awal.
* Fitur investasi, trading, pembelian reksa dana, kripto, saham, atau produk finansial kompleks lainnya.
* Fitur pinjaman, paylater, credit scoring, atau rekomendasi produk kredit.
* Memberikan nasihat keuangan yang bersifat legal, pajak, atau investasi profesional.
* Menggantikan perencana keuangan profesional untuk kebutuhan finansial kompleks.

---

## MVP Scope Decisions

Keputusan berikut menutup seluruh pertanyaan terbuka agar dokumen siap dieksekusi.

* Platform MVP: web responsive terlebih dahulu. PWA ditunda ke fase lanjutan setelah beta karena MVP harus memvalidasi value Safe Spending dan kebiasaan pencatatan manual sebelum investasi pada offline/install experience.
* Kartu kredit: masuk MVP sebagai akun kewajiban dasar. Scope dibatasi pada pencatatan manual transaksi kartu kredit, saldo kewajiban, dan pembayaran tagihan tanpa double-counting. Fitur statement reconciliation lanjutan ditunda.
* Model Premium: subscription bulanan dan tahunan setelah MVP stabil. Untuk eksperimen akuisisi, pengguna gratis dapat diberi kuota AI terbatas atau trial singkat, tetapi monetisasi utama tetap subscription.
* Export: CSV ditunda ke P2 setelah MVP core stabil. PDF report tidak masuk MVP dan menjadi future enhancement.
* Transaksi berulang: MVP hanya menyimpan recurring expense sebagai rencana/pengingat. Auto-create transaksi berulang ditunda ke fase lanjutan agar tidak memperbesar kompleksitas saldo dan audit trail.

---

## User Stories

### Persona 1: Lisa, 25 Tahun, Karyawan Swasta

Lisa memiliki gaji tetap setiap bulan, memakai beberapa e-wallet, dan sering merasa tidak yakin apakah uangnya masih cukup untuk belanja tambahan.

* Sebagai karyawan muda, saya ingin menambahkan rekening bank, e-wallet, dan uang tunai saya, sehingga saya bisa melihat seluruh posisi uang saya dalam satu aplikasi.
* Sebagai pengguna dengan gaji bulanan, saya ingin mencatat pemasukan saya secara manual, sehingga saldo saya sesuai dengan kondisi nyata.
* Sebagai pengguna yang sering belanja kecil-kecil, saya ingin mencatat pengeluaran dalam beberapa detik, sehingga saya tidak kehilangan jejak pengeluaran harian.
* Sebagai pengguna yang ingin lebih tenang, saya ingin melihat angka Safe Spending, sehingga saya tahu berapa uang yang benar-benar aman untuk dibelanjakan.
* Sebagai pengguna yang ingin disiplin, saya ingin membuat anggaran bulanan per kategori, sehingga saya bisa mengontrol pengeluaran makan, transportasi, hiburan, dan belanja.

### Persona 2: Dimas, 23 Tahun, Freelancer dengan Penghasilan Tidak Tetap

Dimas memiliki pemasukan dari beberapa klien dan sering kesulitan memperkirakan kemampuan belanja karena pendapatannya berubah setiap bulan.

* Sebagai freelancer, saya ingin mencatat pemasukan dari berbagai sumber, sehingga saya bisa memahami total pendapatan aktual setiap bulan.
* Sebagai pengguna dengan penghasilan fluktuatif, saya ingin melihat ringkasan arus kas, sehingga saya tahu kapan harus menahan belanja.
* Sebagai pengguna yang ingin menabung, saya ingin membuat target tabungan dengan nominal dan tanggal target, sehingga saya bisa memantau progres secara jelas.
* Sebagai pengguna premium, saya ingin AI menganalisis pola pengeluaran saya, sehingga saya mendapatkan rekomendasi penghematan yang relevan.
* Sebagai pengguna yang tidak ingin menghubungkan akun bank, saya ingin seluruh pencatatan dilakukan manual, sehingga saya merasa aman dan tetap mengontrol data saya sendiri.

### Persona 3: Rani, 28 Tahun, Pengguna Kartu Kredit dan E-Wallet Aktif

Rani menggunakan rekening bank, kartu kredit, dan beberapa dompet digital. Ia butuh aplikasi yang bisa memisahkan saldo, utang kartu kredit, dan transfer antar akun.

* Sebagai pengguna multi-akun, saya ingin menambahkan akun kas, bank, e-wallet, dan kartu kredit, sehingga saya bisa memisahkan sumber uang dan kewajiban.
* Sebagai pengguna kartu kredit, saya ingin mencatat transaksi kartu kredit sebagai kewajiban, sehingga Safe Spending saya tetap realistis.
* Sebagai pengguna yang sering memindahkan uang antar akun, saya ingin mencatat transfer tanpa dihitung sebagai pengeluaran, sehingga laporan saya tidak salah.
* Sebagai pengguna yang butuh laporan, saya ingin melihat statistik pengeluaran per kategori, sehingga saya tahu kategori mana yang paling banyak menghabiskan uang.

### Persona 4: Tim Internal Produk dan Customer Support

Tim internal perlu memahami penggunaan fitur secara agregat tanpa melanggar privasi data finansial pengguna.

* Sebagai product manager, saya ingin melihat data agregat penggunaan fitur, sehingga saya bisa menentukan prioritas pengembangan berikutnya.
* Sebagai customer support, saya ingin membantu pengguna menyelesaikan masalah tanpa melihat detail transaksi sensitif kecuali ada izin eksplisit, sehingga privasi tetap terjaga.
* Sebagai tim produk, saya ingin mengetahui funnel onboarding, pencatatan transaksi pertama, dan pembuatan anggaran pertama, sehingga saya bisa mengurangi friction produk.

---

## Functional Requirements

### 1\. Autentikasi dan Profil Pengguna (Priority: P0)

* Registrasi Akun
  * Pengguna dapat membuat akun menggunakan email dan password.
  * Pengguna dapat masuk menggunakan Google Sign-In bila tersedia.
  * Sistem melakukan validasi format email dan kekuatan password dasar.
* Login dan Manajemen Sesi
  * Pengguna dapat login, logout, dan melakukan reset password.
  * Sistem menjaga sesi pengguna tetap aman dan menutup sesi setelah periode tidak aktif tertentu.
  * Jika sesi habis saat pengguna sedang mengisi form, sistem menyimpan draft lokal sementara agar input tidak hilang.
* Profil dan Preferensi
  * Pengguna dapat mengatur nama, mata uang utama, dan preferensi notifikasi.
  * Mata uang default untuk versi awal adalah Rupiah Indonesia.
  * Pengguna dapat menghapus akun dan meminta penghapusan seluruh data.

### 2\. Manajemen Akun Keuangan Manual (Priority: P0)

* Tambah Akun Keuangan
  * Pengguna dapat menambahkan akun keuangan secara manual.
  * Jenis akun awal mencakup kas, rekening bank, e-wallet, kartu kredit, dan lainnya.
  * Setiap akun memiliki nama, jenis akun, saldo awal, mata uang, dan status aktif/nonaktif.
* Edit dan Arsip Akun
  * Pengguna dapat mengubah nama, jenis, dan saldo awal akun bila diperlukan.
  * Pengguna dapat mengarsipkan akun yang tidak digunakan tanpa menghapus riwayat transaksi.
  * Sistem tidak boleh menghapus transaksi historis ketika akun diarsipkan.
* Ringkasan Saldo
  * Dashboard menampilkan total saldo dari akun aktif.
  * Kartu kredit atau akun utang ditampilkan sebagai kewajiban agar tidak dianggap sebagai uang bebas.
  * Sistem membedakan saldo aset dan saldo kewajiban.

### 3\. Pencatatan Transaksi Manual (Priority: P0)

* Pemasukan
  * Pengguna dapat mencatat pemasukan dengan nominal, tanggal, akun tujuan, kategori, sumber, dan catatan opsional.
  * Contoh kategori pemasukan: gaji, freelance, bonus, hadiah, refund, lainnya.
* Pengeluaran
  * Pengguna dapat mencatat pengeluaran dengan nominal, tanggal, akun sumber, kategori, dan catatan opsional.
  * Contoh kategori pengeluaran: makan, transportasi, belanja, hiburan, tagihan, kesehatan, pendidikan, keluarga, lainnya.
  * Sistem memperbarui saldo akun dan Safe Spending setelah transaksi disimpan.
* Transfer Antar Akun
  * Pengguna dapat mencatat transfer dari satu akun ke akun lain.
  * Transfer tidak dihitung sebagai pemasukan atau pengeluaran dalam laporan arus kas.
  * Sistem mengurangi saldo akun sumber dan menambah saldo akun tujuan.
* Transaksi Tabungan
  * Pengguna dapat mencatat alokasi ke target tabungan.
  * Sistem menghubungkan transaksi tabungan dengan target tabungan tertentu bila dipilih.
  * Tabungan dapat diperlakukan sebagai alokasi yang mengurangi Safe Spending.
* Edit dan Hapus Transaksi
  * Pengguna dapat mengedit transaksi yang sudah dibuat.
  * Sistem memperbarui saldo, anggaran, laporan, dan Safe Spending setelah transaksi diedit atau dihapus.
  * Penghapusan transaksi harus meminta konfirmasi untuk mencegah kesalahan.

### 4\. Kategori Transaksi yang Dapat Disesuaikan (Priority: P0)

* Kategori Default
  * Sistem menyediakan kategori awal untuk pemasukan dan pengeluaran.
  * Kategori memiliki nama, ikon, warna, dan tipe transaksi.
* Custom Category
  * Pengguna dapat membuat, mengedit, menonaktifkan, dan menghapus kategori kustom.
  * Jika kategori yang pernah dipakai dihapus, sistem meminta pengguna memilih kategori pengganti atau mengarsipkan kategori.
* Pengelompokan Kategori
  * Kategori dapat dikelompokkan untuk laporan tingkat tinggi, misalnya kebutuhan, gaya hidup, tagihan, tabungan, dan lainnya.

### 5\. Anggaran Bulanan (Priority: P0)

* Pembuatan Anggaran
  * Pengguna dapat membuat anggaran bulanan berdasarkan kategori pengeluaran.
  * Setiap anggaran memiliki kategori, periode bulan, batas nominal, dan status aktif.
* Monitoring Anggaran
  * Sistem menampilkan progres penggunaan anggaran dalam persentase dan nominal.
  * Warna indikator: hijau untuk aman, kuning untuk mendekati batas, merah untuk melewati batas.
  * Sistem menampilkan sisa anggaran per kategori.
* Peringatan Anggaran
  * Pengguna menerima peringatan saat pengeluaran mencapai 80%, 100%, dan lebih dari 100% dari batas anggaran.
  * Peringatan dapat muncul di aplikasi dan melalui email/push notification bila tersedia.

### 6\. Target Tabungan (Priority: P1)

* Buat Target Tabungan
  * Pengguna dapat membuat target tabungan dengan nama, nominal target, tanggal target, akun sumber, dan nominal yang sudah terkumpul.
  * Contoh target: dana darurat, liburan, laptop, pendidikan, DP rumah.
* Progress Tracking
  * Sistem menampilkan progress tabungan dalam persentase, nominal terkumpul, dan nominal tersisa.
  * Sistem menghitung estimasi alokasi bulanan yang dibutuhkan agar target tercapai tepat waktu.
* Rekomendasi Alokasi
  * Sistem menyarankan alokasi tabungan berdasarkan Safe Spending dan pola pemasukan.
  * Jika alokasi target terlalu tinggi, sistem memberi peringatan bahwa target berpotensi mengganggu kebutuhan rutin.

### 7\. Safe Spending (Priority: P0)

* Definisi
  * Safe Spending adalah jumlah uang yang masih aman untuk dibelanjakan setelah memperhitungkan saldo tersedia, pengeluaran rutin, tagihan, anggaran, kewajiban, dan target tabungan.
* Komponen Perhitungan
  * Total saldo aset aktif.
  * Dikurangi kewajiban atau saldo utang aktif seperti kartu kredit.
  * Dikurangi pengeluaran rutin dan tagihan yang belum terjadi tetapi sudah direncanakan.
  * Dikurangi alokasi target tabungan.
  * Dikurangi anggaran yang sudah dialokasikan untuk kebutuhan penting.
  * Disesuaikan dengan transaksi aktual bulan berjalan.
* Tampilan Dashboard
  * Angka Safe Spending menjadi elemen paling dominan di dashboard.
  * Sistem menampilkan penjelasan sederhana: “Ini estimasi uang yang masih aman kamu pakai sampai akhir periode.”
  * Pengguna dapat membuka breakdown untuk melihat faktor apa saja yang memengaruhi angka tersebut.
* Status Finansial
  * Aman: Safe Spending positif dan anggaran utama masih terkendali.
  * Waspada: Safe Spending rendah atau beberapa kategori mendekati batas.
  * Bahaya: Safe Spending negatif atau kewajiban melebihi saldo bebas.

### 8\. Riwayat Transaksi Lengkap (Priority: P0)

* Daftar Transaksi
  * Pengguna dapat melihat seluruh transaksi berdasarkan tanggal terbaru.
  * Setiap item menampilkan tipe, kategori, akun, nominal, tanggal, dan catatan singkat.
* Filter dan Pencarian
  * Pengguna dapat memfilter berdasarkan tanggal, akun, kategori, tipe transaksi, dan nominal.
  * Pengguna dapat mencari transaksi berdasarkan catatan atau nama kategori.
* Detail Transaksi
  * Pengguna dapat membuka detail transaksi untuk melihat informasi lengkap.
  * Pengguna dapat mengedit atau menghapus transaksi dari halaman detail.

### 9\. Laporan Keuangan, Grafik, dan Statistik (Priority: P1)

* Ringkasan Bulanan
  * Sistem menampilkan total pemasukan, total pengeluaran, total tabungan, dan perubahan saldo bersih.
  * Sistem membandingkan bulan berjalan dengan bulan sebelumnya.
* Grafik Pengeluaran
  * Sistem menampilkan grafik pengeluaran berdasarkan kategori.
  * Sistem menampilkan tren pengeluaran harian, mingguan, dan bulanan.
* Statistik Akun
  * Sistem menampilkan distribusi saldo berdasarkan akun.
  * Sistem membantu pengguna memahami akun mana yang paling sering digunakan.
* Laporan yang Mudah Dipahami
  * Ringkasan menggunakan bahasa sederhana, bukan istilah finansial yang rumit.
  * Contoh: “Pengeluaran makan kamu paling besar bulan ini, yaitu Rp1.250.000 atau 32% dari total pengeluaran.”

### 10\. Sisaku Premium: AI Financial Assistant (Priority: P2 untuk MVP+, bukan MVP awal)

* Prinsip AI
  * AI hanya menganalisis data yang dimasukkan pengguna di dalam aplikasi.
  * AI tidak memiliki akses langsung ke rekening bank, e-wallet, kartu kredit, atau layanan finansial eksternal.
  * AI harus menjelaskan keterbatasan insight berdasarkan kelengkapan data manual.
* Analisis Pola Pengeluaran
  * AI mengidentifikasi kategori yang naik signifikan dibanding periode sebelumnya.
  * AI menandai kebiasaan belanja berulang yang berpotensi mengganggu target tabungan.
* Ringkasan Finansial
  * AI menghasilkan ringkasan harian, mingguan, dan bulanan dalam bahasa sederhana.
  * Ringkasan mencakup kondisi saldo, pengeluaran terbesar, sisa anggaran, dan Safe Spending.
* Prediksi Pengeluaran
  * AI memperkirakan pengeluaran sampai akhir bulan berdasarkan kebiasaan transaksi.
  * AI memberi peringatan bila prediksi pengeluaran berpotensi melebihi anggaran.
* Rekomendasi Penghematan
  * AI memberi rekomendasi yang dipersonalisasi berdasarkan kategori pengeluaran terbesar dan pola historis.
  * Rekomendasi harus actionable, realistis, dan tidak menghakimi pengguna.
* Saran Target Tabungan
  * AI memberi saran nominal tabungan yang lebih realistis bila target terlalu agresif.
  * AI dapat menyarankan cara mempercepat target tabungan berdasarkan pengurangan kategori tertentu.
* Tanya Jawab Keuangan
  * Pengguna premium dapat bertanya kepada AI, misalnya “Apakah aku aman beli sepatu Rp800.000 bulan ini?”
  * AI menjawab berdasarkan Safe Spending, anggaran, tagihan, dan target tabungan pengguna.
  * AI harus menghindari klaim kepastian dan menyatakan bahwa jawaban adalah estimasi berdasarkan data yang tersedia.

### 11\. Ekspor Data dan Backup (Priority: P2)

* Ekspor CSV
  * Pengguna dapat mengekspor transaksi ke format CSV.
  * Ekspor dapat difilter berdasarkan periode, akun, dan kategori.
* Ekspor Ringkasan
  * Pengguna dapat mengunduh ringkasan bulanan dalam format PDF pada fase lanjutan.
* Backup Data
  * Sistem menyimpan data pengguna secara aman di cloud.
  * Pengguna dapat menghapus data sesuai ketentuan privasi.

---

## User Experience

### Entry Point & First-Time User Experience

* Pengguna menemukan Sisaku melalui landing page, media sosial, konten edukasi finansial, komunitas produktivitas, atau rekomendasi teman.
* Landing page harus menjelaskan positioning utama: Sisaku membantu mengetahui uang yang aman dibelanjakan tanpa perlu menghubungkan rekening bank.
* CTA utama: “Mulai Catat Keuanganmu” atau “Cek Sisa Amanmu”.
* Setelah registrasi, pengguna diarahkan ke onboarding singkat yang berfokus pada value cepat, bukan konfigurasi panjang.

### Onboarding Awal

* Step 1: Buat akun keuangan pertama
  * Pengguna memilih jenis akun: kas, bank, e-wallet, kartu kredit, atau lainnya.
  * Pengguna mengisi nama akun dan saldo awal.
  * Sistem menjelaskan bahwa semua data dimasukkan manual dan tidak ada koneksi bank.
* Step 2: Masukkan pemasukan utama
  * Pengguna memasukkan estimasi pemasukan bulanan atau memilih “penghasilan tidak tetap”.
  * Untuk penghasilan tidak tetap, sistem meminta estimasi konservatif atau rata-rata pemasukan.
* Step 3: Masukkan pengeluaran rutin
  * Pengguna memasukkan tagihan atau kebutuhan rutin seperti kos/sewa, listrik, internet, cicilan, transportasi, dan langganan.
  * Sistem menyediakan kategori default agar pengguna tidak perlu membuat dari nol.
* Step 4: Buat target tabungan opsional
  * Pengguna dapat membuat satu target awal, misalnya dana darurat.
  * Jika pengguna melewati langkah ini, sistem tetap mengizinkan masuk dashboard.
* Step 5: Lihat Safe Spending pertama
  * Sistem menampilkan estimasi Safe Spending awal.
  * Sistem memberikan penjelasan sederhana tentang bagaimana angka dihitung.

### Core Experience

* Step 1: Melihat Dashboard
  * Dashboard menampilkan Safe Spending sebagai angka utama.
  * Pengguna melihat total saldo, pengeluaran bulan ini, sisa anggaran, dan progress tabungan.
  * Pengguna dapat membuka breakdown Safe Spending untuk memahami perhitungan.
* Step 2: Mencatat Transaksi
  * Pengguna menekan tombol “Tambah Transaksi”.
  * Pengguna memilih tipe transaksi: pemasukan, pengeluaran, transfer, tabungan, atau adjustment.
  * Pengguna mengisi nominal, akun, kategori, tanggal, dan catatan opsional.
  * Setelah disimpan, saldo akun, riwayat, anggaran, laporan, dan Safe Spending langsung diperbarui.
* Step 3: Mengelola Akun Keuangan
  * Pengguna membuka halaman Akun.
  * Pengguna dapat melihat daftar akun beserta saldo masing-masing.
  * Pengguna dapat menambah akun baru, mengedit akun, atau mengarsipkan akun lama.
* Step 4: Membuat Anggaran
  * Pengguna membuka halaman Anggaran.
  * Pengguna memilih kategori dan memasukkan batas bulanan.
  * Sistem menampilkan progres dan sisa anggaran secara visual.
* Step 5: Membuat Target Tabungan
  * Pengguna membuka halaman Tabungan.
  * Pengguna membuat target dengan nominal dan tanggal target.
  * Sistem menampilkan estimasi nominal yang perlu ditabung per bulan.
* Step 6: Membaca Laporan
  * Pengguna membuka halaman Laporan.
  * Sistem menampilkan grafik pengeluaran per kategori, tren bulanan, dan ringkasan sederhana.
  * Pengguna dapat melihat kategori pengeluaran terbesar dan perubahan dibanding bulan sebelumnya.
* Step 7: Menggunakan AI Premium
  * Pengguna premium membuka AI Financial Assistant.
  * Pengguna melihat ringkasan finansial otomatis atau mengetik pertanyaan.
  * AI menjawab berdasarkan data yang dicatat pengguna dan menjelaskan alasan rekomendasinya.

### Advanced Features & Edge Cases

* Data manual tidak lengkap
  * Jika pengguna jarang mencatat transaksi, sistem memberi label bahwa insight dan prediksi mungkin kurang akurat.
  * Sistem menyarankan pengguna melengkapi transaksi penting terlebih dahulu.
* Saldo tidak cocok
  * Pengguna dapat melakukan penyesuaian saldo manual.
  * Sistem mencatat penyesuaian sebagai adjustment agar audit trail tetap jelas.
* Transfer salah dihitung
  * Sistem harus membedakan transfer dari pemasukan/pengeluaran agar laporan tidak terdistorsi.
* Kartu kredit dan kewajiban
  * Transaksi kartu kredit dicatat sebagai kewajiban.
  * Pembayaran tagihan kartu kredit dari rekening bank tidak boleh dihitung dua kali sebagai pengeluaran.
* Safe Spending negatif
  * Sistem menampilkan status bahaya dengan penjelasan yang tidak menyalahkan pengguna.
  * Sistem memberikan saran praktis seperti menunda belanja non-prioritas atau meninjau target tabungan.
* Penghasilan tidak tetap
  * Pengguna dapat memilih mode penghasilan fluktuatif.
  * Sistem menggunakan pendekatan konservatif agar Safe Spending tidak terlalu optimistis.
* Privasi AI
  * AI tidak boleh mengklaim memiliki akses bank.
  * AI harus selalu berbasis pada data yang dicatat pengguna di Sisaku.

### UI/UX Highlights

* Bahasa sederhana, ramah, dan tidak menghakimi.
* Safe Spending harus menjadi pusat pengalaman produk.
* Input transaksi harus cepat dan nyaman, idealnya selesai dalam kurang dari 10 detik untuk transaksi sederhana.
* Desain responsif untuk desktop dan mobile browser.
* Warna indikator finansial harus konsisten: hijau aman, kuning waspada, merah bahaya.
* Grafik harus mudah dipahami oleh pengguna non-finansial.
* Aplikasi harus menghindari istilah rumit seperti cash flow projection tanpa penjelasan sederhana.
* Aksesibilitas minimum: kontras warna memadai, navigasi keyboard, label input jelas, dan ukuran teks nyaman dibaca.

---

## Narrative

Lisa adalah karyawan swasta berusia 25 tahun yang setiap bulan menerima gaji tetap. Di atas kertas, ia merasa penghasilannya cukup. Namun dalam praktiknya, ia sering bingung kenapa uangnya cepat habis. Sebagian uang ada di rekening bank, sebagian di e-wallet, sebagian tunai, dan beberapa transaksi terjadi lewat kartu kredit. Lisa tidak ingin menghubungkan rekening banknya ke aplikasi finansial karena khawatir soal privasi, tetapi ia juga lelah mencatat semuanya di spreadsheet.

Saat mencoba Sisaku, Lisa mulai dengan menambahkan akun keuangannya secara manual: rekening utama, e-wallet, uang tunai, dan kartu kredit. Ia memasukkan saldo awal, pemasukan bulanan, pengeluaran rutin, dan satu target tabungan untuk dana darurat. Dalam beberapa menit, Sisaku menampilkan angka Safe Spending yang menjawab pertanyaan yang selama ini membuatnya cemas: berapa uang yang benar-benar aman untuk dibelanjakan bulan ini?

Setiap kali Lisa membeli makan siang, membayar transportasi, atau belanja kecil, ia mencatat transaksi dengan cepat. Dashboard langsung berubah, anggaran kategori ikut terbarui, dan Safe Spending menyesuaikan. Ketika pengeluaran makan mulai mendekati batas, Sisaku memberi peringatan yang jelas tanpa membuatnya merasa disalahkan.

Beberapa bulan kemudian, Lisa berlangganan Sisaku Premium. AI Financial Assistant merangkum pola pengeluarannya dan menunjukkan bahwa biaya pesan makanan meningkat tajam pada minggu-minggu sibuk. AI menyarankan penghematan kecil yang realistis agar target dana daruratnya tercapai lebih cepat. Lisa kini merasa lebih tenang, lebih sadar, dan lebih percaya diri dalam mengambil keputusan belanja. Bagi Sisaku, keberhasilan Lisa menunjukkan nilai utama produk: membantu pengguna memahami uangnya sendiri tanpa mengorbankan kontrol dan privasi.

---

## Success Metrics

### User-Centric Metrics

* Onboarding completion rate minimal 70% dari pengguna yang mendaftar.
* Minimal 60% pengguna baru menambahkan setidaknya satu akun keuangan dalam sesi pertama.
* Minimal 50% pengguna baru mencatat transaksi pertama dalam 24 jam pertama.
* Rata-rata pengguna aktif mencatat minimal 5 transaksi per minggu.
* Minimal 40% pengguna aktif membuat setidaknya satu anggaran bulanan dalam 30 hari pertama.
* Minimal 25% pengguna aktif membuat setidaknya satu target tabungan dalam 60 hari pertama.
* D30 retention minimal 30% untuk pengguna yang telah mencatat minimal 3 transaksi.

### Business Metrics

* 10.000 pengguna terdaftar dalam 6 bulan pertama setelah beta publik.
* 3.000 monthly active users dalam 6 bulan pertama.
* CSAT minimal 80% untuk fitur pencatatan transaksi dan dashboard Safe Spending.
* Conversion rate ke Premium AI sebesar 3-5% dari pengguna aktif setelah fitur premium dirilis.
* Minimal 20% pengguna premium menggunakan AI Financial Assistant setidaknya 1 kali per minggu.

### Technical Metrics

* Dashboard Safe Spending memuat dalam waktu kurang dari 2 detik pada P95.
* Error rate penyimpanan transaksi di bawah 0,5%.
* Uptime aplikasi minimal 99,5% per bulan.
* Tidak ada insiden keamanan data kritis pada 12 bulan pertama.
* Waktu pemrosesan ringkasan AI di bawah 10 detik untuk 90% permintaan pada fase awal.

### Tracking Plan

* user_registered
  * Properti: signup_method, acquisition_source, timestamp.
* onboarding_started
  * Properti: device_type, timestamp.
* onboarding_completed
  * Properti: completion_time, accounts_created, recurring_expenses_added.
* financial_account_created
  * Properti: account_type, initial_balance_range, currency.
* transaction_added
  * Properti: transaction_type, category_id, account_type, amount_range, timestamp.
* transaction_edited
  * Properti: transaction_type, edited_field_type.
* transfer_created
  * Properti: source_account_type, destination_account_type, amount_range.
* budget_created
  * Properti: category_id, budget_amount_range, period.
* budget_threshold_reached
  * Properti: category_id, threshold_percentage, period.
* savings_goal_created
  * Properti: target_amount_range, deadline_range, goal_type.
* safe_spending_viewed
  * Properti: status, period, has_breakdown_opened.
* safe_spending_breakdown_opened
  * Properti: status, number_of_components.
* report_viewed
  * Properti: report_type, period.
* premium_paywall_viewed
  * Properti: entry_point, feature_context.
* premium_subscribed
  * Properti: plan_type, price_point, acquisition_context.
* ai_summary_generated
  * Properti: summary_period, data_completeness_score.
* ai_question_asked
  * Properti: question_category, response_time, data_completeness_score.

---

## Technical Considerations

### Technical Needs

* Frontend
  * Aplikasi web responsif yang nyaman digunakan di desktop dan mobile browser.
  * Struktur navigasi utama: Dashboard, Transaksi, Akun, Anggaran, Tabungan, Laporan, AI Premium, Pengaturan.
  * Komponen penting: form transaksi cepat, kartu Safe Spending, daftar transaksi, grafik kategori, progress bar anggaran, progress target tabungan.
* Backend
  * API untuk autentikasi, akun keuangan, transaksi, kategori, anggaran, target tabungan, laporan, dan AI Premium.
  * Validasi server-side untuk nominal, tanggal, ownership data, dan konsistensi saldo.
  * Audit log untuk perubahan penting seperti edit transaksi, hapus transaksi, dan adjustment saldo.
* Data Model Utama
  * User
  * FinancialAccount
  * Transaction
  * Category
  * Budget
  * SavingsGoal
  * RecurringExpense
  * SafeSpendingSnapshot
  * ReportSnapshot
  * AIInsight
  * Subscription
  * AuditLog
* Safe Spending Engine
  * Modul perhitungan terpisah agar logika mudah diuji.
  * Perhitungan harus deterministic dan dapat dijelaskan kepada pengguna.
  * Sistem perlu menyimpan snapshot berkala untuk kebutuhan laporan dan debugging.
* AI Financial Assistant
  * AI hanya boleh menerima data yang relevan dan sudah diotorisasi oleh pengguna.
  * Sistem perlu melakukan redaksi atau minimisasi data sebelum dikirim ke model AI.
  * Jawaban AI harus disertai disclaimer ringan bahwa rekomendasi adalah estimasi berdasarkan data yang dicatat.

### Integration Points

* Email service untuk verifikasi akun, reset password, ringkasan berkala, dan notifikasi penting.
* Push notification atau web notification untuk pengingat pencatatan dan peringatan anggaran.
* Analytics platform untuk tracking funnel dan penggunaan fitur.
* Payment gateway untuk Sisaku Premium pada fase monetisasi.
* AI model provider atau model internal untuk fitur AI Financial Assistant.
* Tidak ada integrasi bank, e-wallet, atau open banking pada versi awal.

### Data Storage & Privacy

* Data transaksi adalah data sensitif dan harus dienkripsi saat transit menggunakan TLS.
* Data sensitif harus dilindungi dengan kontrol akses yang ketat di sisi backend.
* Password harus di-hash menggunakan standar industri.
* Sisaku harus mematuhi prinsip UU Perlindungan Data Pribadi Indonesia, termasuk persetujuan pengguna, transparansi penggunaan data, dan hak penghapusan data.
* Pengguna harus diberi tahu dengan jelas bahwa Sisaku tidak menghubungkan akun bank atau e-wallet.
* Untuk AI Premium, pengguna harus diberi penjelasan bahwa AI hanya menganalisis data yang dicatat di aplikasi.
* Data analitik produk harus dianonimkan atau diagregasi agar tidak mengekspos detail finansial individu.
* Akses internal terhadap data pengguna harus dibatasi dengan role-based access control dan audit log.

### Scalability & Performance

* Target awal: mendukung 10.000-50.000 pengguna terdaftar dengan performa dashboard stabil.
* Query dashboard dan laporan perlu dioptimalkan karena akan sering diakses.
* Perhitungan Safe Spending harus cepat meskipun pengguna memiliki ribuan transaksi.
* Gunakan pagination dan filtering untuk riwayat transaksi.
* Untuk laporan bulanan, pertimbangkan pre-computed summary atau caching agar grafik tidak lambat.
* Untuk AI Premium, gunakan queue atau async processing bila ringkasan memerlukan waktu lebih lama.

### Potential Challenges

* Konsistensi pencatatan manual
  * Tantangan terbesar adalah membuat pengguna rajin mencatat transaksi.
  * Solusi: form cepat, kategori favorit, pengingat ringan, dan value instan lewat Safe Spending.
* Akurasi Safe Spending
  * Perhitungan harus fleksibel untuk pengguna dengan pola keuangan berbeda.
  * Sistem harus transparan agar pengguna percaya pada angka yang ditampilkan.
* Multi-akun dan transfer
  * Risiko laporan salah jika transfer dihitung sebagai pengeluaran.
  * Perlu desain data yang jelas untuk membedakan pemasukan, pengeluaran, transfer, dan adjustment.
* Kartu kredit
  * Perlu logika khusus agar transaksi kartu kredit dan pembayaran tagihan tidak dihitung ganda.
* Privasi dan kepercayaan
  * Karena data finansial sensitif, messaging produk harus konsisten: manual, tidak terhubung ke bank, pengguna memegang kendali.
* AI hallucination dan rekomendasi tidak akurat
  * AI harus dibatasi pada data pengguna dan memiliki guardrails.
  * Jawaban harus berbasis angka yang dapat dijelaskan, bukan klaim finansial berlebihan.

---

## Milestones & Sequencing

### Project Estimate

Medium: 8-10 minggu untuk MVP web responsive yang mencakup fitur inti manual finance tracking, multi-akun, transaksi, kategori, anggaran, target tabungan dasar, Safe Spending, dan laporan sederhana. Fitur AI Premium masuk fase setelah MVP stabil, sekitar 3-5 minggu tambahan tergantung kompleksitas AI dan payment.

### Team Size & Composition

Small Team: 3 orang inti

* 1 Product Manager merangkap Product Designer
  * Menentukan requirement, UX flow, copywriting produk, acceptance criteria, dan prioritas backlog.
* 1 Full-Stack Engineer fokus Frontend
  * Membangun UI web responsif, dashboard, form transaksi, laporan, dan interaksi pengguna.
* 1 Full-Stack Engineer fokus Backend
  * Membangun API, database, autentikasi, kalkulasi Safe Spending, dan keamanan data.

Opsional part-time:

* 1 QA/Tester part-time untuk regression testing menjelang beta.
* 1 AI Engineer part-time untuk fase AI Premium.

### Suggested Phases

Phase 1: Fondasi Produk dan Autentikasi (1-2 minggu)

* Key Deliverables
  * Finalisasi user flow utama.
  * Setup project, database, dan API dasar.
  * Registrasi, login, logout, reset password.
  * Struktur navigasi utama aplikasi.
  * Model data awal: User, FinancialAccount, Category.
* Dependencies
  * Keputusan stack teknis.
  * Wireframe dasar dashboard, transaksi, akun, dan onboarding.

Phase 2: Multi-Akun dan Pencatatan Transaksi Manual (2 minggu)

* Key Deliverables
  * Tambah, edit, arsip akun keuangan.
  * Tambah pemasukan, pengeluaran, transfer, dan adjustment saldo.
  * Pencatatan kartu kredit sebagai akun kewajiban dasar.
  * Riwayat transaksi lengkap.
  * Filter dasar transaksi.
  * Update saldo akun otomatis setelah transaksi.
* Dependencies
  * Model data akun dan transaksi selesai.
  * Definisi tipe transaksi sudah final.

Phase 3: Safe Spending dan Dashboard Inti (2 minggu)

* Key Deliverables
  * Safe Spending Engine versi pertama.
  * Dashboard dengan Safe Spending, total saldo, pengeluaran bulan ini, dan status finansial.
  * Breakdown perhitungan Safe Spending.
  * Penanganan status aman, waspada, dan bahaya.
* Dependencies
  * Data transaksi dan akun berjalan stabil.
  * Formula Safe Spending MVP disepakati.

Phase 4: Anggaran, Target Tabungan, dan Onboarding (2 minggu)

* Key Deliverables
  * Onboarding pertama: akun keuangan, pemasukan, pengeluaran rutin, target tabungan opsional.
  * Anggaran bulanan per kategori.
  * Progress anggaran dan peringatan threshold.
  * Target tabungan dasar dengan progress tracking.
  * Recurring expense sebagai rencana/pengingat, bukan auto-created transaction.
* Dependencies
  * Dashboard dan transaksi sudah stabil.
  * Kategori default sudah tersedia.

Phase 5: Laporan, Statistik, dan Beta Readiness (1-2 minggu)

* Key Deliverables
  * Laporan bulanan sederhana.
  * Grafik pengeluaran per kategori.
  * Statistik pemasukan, pengeluaran, tabungan, dan saldo.
  * Analytics event utama.
  * QA, bug fixing, dan beta release terbatas.
* Dependencies
  * Data transaksi cukup untuk laporan.
  * Tracking plan disepakati.

Phase 6: Sisaku Premium AI (3-5 minggu setelah MVP)

* Key Deliverables
  * Paywall dan subscription flow bulanan/tahunan.
  * AI Financial Assistant untuk ringkasan finansial.
  * Analisis pola pengeluaran.
  * Prediksi pengeluaran sederhana.
  * Rekomendasi penghematan.
  * Tanya jawab finansial berbasis data pengguna.
  * Guardrails AI, privasi data, dan disclaimer.
* Dependencies
  * MVP memiliki pengguna aktif dan data transaksi yang cukup.
  * Payment gateway tersedia.
  * Kebijakan privasi AI sudah disiapkan.

---

## Appendix: Prinsip Produk

* Manual-first: semua data finansial dimasukkan pengguna secara sadar dan manual.
  * Penjelasan: Pendekatan ini memastikan kontrol penuh pengguna atas data dan mengurangi risiko keamanan pihak ketiga. Untuk MVP, semua alur input harus mengutamakan form cepat, auto-suggest kategori, dan penyimpanan draft lokal.
* Privacy-first: tidak ada koneksi otomatis ke rekening bank, e-wallet, atau layanan finansial lain pada versi awal.
  * Penjelasan: Komunikasi produk harus konsisten menjelaskan bahwa Sisaku tidak terhubung ke bank; data sensitif disimpan terenkripsi, dan pengguna dapat meminta penghapusan penuh data mereka.
* Explainable finance: angka Safe Spending dan insight harus bisa dijelaskan dengan bahasa sederhana.
  * Penjelasan: Setiap angka yang ditampilkan, termasuk Safe Spending dan rekomendasi AI, harus disertai breakdown komponen dan asumsi yang digunakan agar pengguna memahami sumber estimasi.
* Non-judgmental guidance: aplikasi membantu tanpa menyalahkan pengguna.
  * Penjelasan: Bahasa UI dan notifikasi harus ramah dan solutif; pesan peringatan mengutamakan opsi tindakan konkret, seperti tunda belanja, kurangi kategori tertentu, atau review target tabungan.
* Fast input: pencatatan transaksi harus cepat agar kebiasaan mencatat bisa terbentuk.
  * Penjelasan: Target waktu input sederhana kurang dari 10 detik; gunakan default akun/kategori terbaru, autocompletion, dan minimal required fields untuk transaksi dasar.
* AI as assistant, not authority: AI membantu membaca data dan memberi saran, bukan menggantikan keputusan pengguna.
  * Penjelasan: Semua output AI harus menyertakan disclaimer bahwa ini estimasi berbasis data yang dicatat pengguna; rekomendasi harus bersifat opsi tindakan dan menjelaskan tingkat keyakinan.

### Glossary

* Safe Spending
  * Definisi: Estimasi jumlah uang yang aman dibelanjakan sampai akhir periode setelah memperhitungkan saldo, kewajiban, pengeluaran rutin, anggaran, dan target tabungan.
* Akun Aset
  * Definisi: Akun yang merepresentasikan uang atau aset likuid, contoh: kas, rekening bank, e-wallet.
* Akun Kewajiban
  * Definisi: Akun yang merepresentasikan utang atau kewajiban, contoh: kartu kredit. Ditampilkan terpisah agar tidak menghitungnya sebagai uang bebas.
* Transfer
  * Definisi: Perpindahan saldo antar akun internal yang tidak dihitung sebagai pemasukan atau pengeluaran pada laporan arus kas.
* Adjustment Saldo
  * Definisi: Koreksi manual saldo untuk menyesuaikan perbedaan rekonsiliasi; harus tercatat dengan alasan sebagai audit trail.
* Anggaran
  * Definisi: Batas pengeluaran per kategori untuk periode tertentu. Untuk MVP, periode utama adalah bulanan.
* Target Tabungan
  * Definisi: Tujuan menabung dengan nominal target, tanggal target, akun sumber, dan progress terkumpul.
* Transaksi Berulang
  * Definisi: Transaksi otomatis yang dijadwalkan pada interval tertentu. Pada MVP hanya dicatat sebagai rencana/pengingat, bukan auto-created transaction.
* Data Completeness Score
  * Definisi: Skor yang mengindikasikan kelengkapan data pengguna untuk keperluan AI, seperti persentase transaksi yang dikategorikan, jumlah akun terdaftar, dan rentang waktu data.
* AI Financial Assistant
  * Definisi: Fitur premium yang menganalisis data yang dicatat pengguna untuk memberikan ringkasan, prediksi, dan rekomendasi dengan batasan privasi.

### Safe Spending Calculation Reference (MVP)

Formula MVP:

Safe Spending = Total Aset Aktif - Total Kewajiban Aktif - Pengeluaran Rutin Tertunda - Alokasi Target Tabungan - Sisa Anggaran Prioritas

Komponen dan definisi:

* Total Aset Aktif: jumlah saldo di semua akun aset yang berstatus aktif.
* Total Kewajiban Aktif: jumlah saldo utang di akun kewajiban, misalnya saldo kartu kredit saat ini.
* Pengeluaran Rutin Tertunda: estimasi pengeluaran yang telah dijadwalkan atau tetap untuk sisa periode, seperti sewa, cicilan, tagihan bulanan, dan langganan.
* Alokasi Target Tabungan: jumlah yang direkomendasikan dialokasikan ke target tabungan pada periode berjalan berdasarkan target dan tanggal target.
* Sisa Anggaran Prioritas: total anggaran aktif untuk kategori penting yang belum terpakai dan perlu disisihkan.

Contoh perhitungan:

| Komponen | Nominal |
| --- | --- |
| Total Aset Aktif | Rp10.000.000 |
| Total Kewajiban Aktif | Rp2.000.000 |
| Pengeluaran Rutin Tertunda | Rp1.500.000 |
| Alokasi Target Tabungan | Rp1.000.000 |
| Sisa Anggaran Prioritas | Rp500.000 |
| Safe Spending | Rp5.000.000 |

Status thresholds MVP:

* Aman: Safe Spending lebih dari atau sama dengan Rp0 dan margin lebih dari atau sama dengan 20% dari total aset likuid.
* Waspada: Safe Spending lebih dari atau sama dengan Rp0 tetapi margin kurang dari 20%.
* Bahaya: Safe Spending kurang dari Rp0.

Handling rules untuk nilai negatif:

* Tampilkan status Bahaya dengan penjelasan penyebab komponen negatif.
* Berikan rekomendasi konkret seperti tunda belanja non-prioritas, kurangi alokasi tabungan sementara, atau review kategori pengeluaran tinggi.
* Jika pengguna memiliki kewajiban tinggi seperti kartu kredit, jelaskan potensi double-counting dan tawarkan panduan rekonsiliasi.

### Default Categories

Income categories:

* Gaji
* Freelance
* Bonus
* Hadiah
* Refund
* Lainnya

Expense categories:

* Makan
* Transportasi
* Belanja
* Hiburan
* Tagihan
* Kesehatan
* Pendidikan
* Keluarga
* Langganan
* Lainnya

Category groups untuk laporan tingkat tinggi:

* Kebutuhan: sewa, tagihan, transportasi.
* Gaya Hidup: makan, hiburan, belanja.
* Tabungan dan Kewajiban: tabungan, cicilan utang, pembayaran kewajiban.
* Lainnya: kategori yang tidak masuk kelompok utama.

Catatan implementasi: setiap kategori punya nama, ikon, warna, dan tipe transaksi. Menghapus kategori yang pernah dipakai harus memicu pemilihan kategori pengganti atau pengarsipan.

### Data Model Detail

* User: id, email, display_name, preferred_currency, created_at, deleted_at, privacy_consent_flags.
* FinancialAccount: id, user_id, name, type, initial_balance, current_balance, currency, status, created_at.
* Transaction: id, user_id, account_id, type, amount, currency, category_id, counterparty_account_id, date, notes, metadata, created_at, edited_at, deleted_at.
* Category: id, user_id, name, icon_id, color, type, group_id, status.
* Budget: id, user_id, category_id, month_period, limit_amount, spent_amount, status.
* SavingsGoal: id, user_id, name, target_amount, saved_amount, target_date, source_account_id, status.
* RecurringExpense: id, user_id, template_transaction_id, interval, next_due_date, active_flag.
* SafeSpendingSnapshot: id, user_id, period_start, period_end, computed_value, components_json, created_at.
* AIInsight: id, user_id, insight_type, content_summary, confidence_score, data_completeness_score, generated_at.
* Subscription: id, user_id, plan_type, started_at, expires_at, status, payment_provider_id.
* AuditLog: id, user_id, actor_id, action_type, target_type, target_id, diff, timestamp.

### Permission & Privacy Matrix

| Role/System | Access Level | Restrictions |
| --- | --- | --- |
| User | Akses penuh ke data sendiri | Dapat mengekspor dan meminta penghapusan data. |
| Support | Akses metadata terbatas | Tidak boleh melihat detail transaksi sensitif tanpa persetujuan eksplisit; seluruh akses diaudit. |
| Product Analytics | Data agregat/anonim | Tidak boleh mengakses raw transaction-level data tanpa redaksi. |
| AI System | Data yang dipilih dan diminimalkan | Payload harus melalui redaksi/pseudonimisasi dan dicatat dalam audit event. |

### AI Guardrails & Response Principles

* Allowed behavior
  * Memberikan ringkasan, prediksi berbasis pola historis, rekomendasi praktis yang dapat diterapkan, dan penjelasan asumsi atau ketidakpastian.
* Disallowed behavior
  * Memberikan saran hukum/keuangan profesional.
  * Membuat klaim kepastian.
  * Mendorong keputusan berisiko tanpa penjelasan.
  * Meminta kredensial atau akses eksternal ke rekening bank.
* Response principles
  * Sertakan confidence level.
  * Jelaskan komponen data yang dipakai.
  * Sarankan 1-3 tindakan konkret.
  * Tambahkan disclaimer ringan bahwa rekomendasi adalah estimasi.

### Notification & Reminder Rules

* Budget thresholds: notifikasi pada 80%, 100%, dan lebih dari 100% per kategori; jenis notifikasi mencakup in-app serta push/email jika diaktifkan.
* Recurring expenses: pengingat 2 hari sebelum jatuh tempo dan pada hari jatuh tempo jika belum dicatat.
* Savings goals: update progres mingguan dan notifikasi saat tercapai atau jika progress melambat signifikan dibanding estimasi.
* Low Safe Spending: peringatan saat Safe Spending kurang dari 0 dan saat masuk zona Waspada; sertakan rekomendasi.
* Incomplete data: notifikasi setelah 7 hari tanpa transaksi untuk mendorong kelengkapan data; sertakan tips input cepat.

### Acceptance Criteria (Core MVP)

* Autentikasi: user dapat registrasi/login/logout; reset password via email; session management aman.
* Manajemen Akun: user dapat menambah/edit/archive akun; saldo awal tersimpan; akun diarsipkan tidak menghapus transaksi historis.
* Pencatatan Transaksi: input transaksi dasar dapat diselesaikan dalam kurang dari 15 detik pada alur cepat; saldo terupdate real-time.
* Kartu Kredit: user dapat membuat akun kewajiban, mencatat transaksi kartu kredit, dan mencatat pembayaran tagihan tanpa double-counting pengeluaran.
* Safe Spending: perhitungan MVP berjalan pada dashboard; breakdown komponen tersedia dan status Aman/Waspada/Bahaya ditampilkan.
* Anggaran dan Tabungan: user dapat membuat anggaran bulanan dan target tabungan; progress tracking terlihat di UI.
* Laporan dan Riwayat: user dapat melihat riwayat transaksi, memfilter, dan melihat ringkasan bulanan sederhana.
* Privasi: user memahami bahwa tidak ada koneksi bank/e-wallet; data pengguna dapat dihapus sesuai permintaan.

### Edge Case Checklist

* Transfers: harus membuat sepasang transaksi debit/credit dan tidak mengubah arus kas total.
* Credit cards: tandai sebagai kewajiban; pembayaran dari akun aset hanya mengurangi kewajiban tanpa double-counting pengeluaran.
* Deleted categories: jika kategori dihapus, minta pengguna memilih pengganti atau arsipkan transaksi terdampak.
* Archived accounts: transaksi historis tetap valid; akun diarsipkan tidak muncul di pilihan default input baru.
* Backdated transactions: perbarui snapshot Safe Spending dan laporan; beri peringatan jika mengubah periode yang telah dilaporkan.
* Duplicate transactions: berikan deteksi berbasis timestamp, amount, dan akun; tawarkan merge atau ignore.
* Timezone dan month boundary: gunakan timezone pengguna untuk perhitungan tanggal; jelaskan bagaimana transaksi di akhir bulan diperlakukan dalam Safe Spending.
* Incomplete onboarding: jika pengguna melewati langkah, tampilkan call-to-action tidak menghalangi masuk dashboard tetapi ingatkan menyelesaikan konfigurasi esensial.

### Launch Checklist

* Product
  * UX review selesai.
  * Copy final untuk onboarding, dashboard, Safe Spending, dan privacy message.
  * Onboarding flow sudah disimulasikan dari registrasi sampai Safe Spending pertama.
* Engineering
  * API endpoints untuk transaksi, akun, budget, target tabungan, dan snapshot stabil.
  * Monitoring dan alerting dasar tersedia.
  * Backup dan migration sudah diuji.
* Privacy & Legal
  * Kebijakan privasi terbit.
  * Proses penghapusan data siap.
  * Enkripsi transit dan kontrol akses terverifikasi.
* Analytics
  * Tracking plan terpasang untuk event kritikal.
  * Dashboard KPI awal tersedia.
* Support
  * Playbook support tersedia.
  * Akses CS terbatas dan proses eskalasi jelas.
* Marketing
  * Landing page copy final.
  * CTA utama tersedia.
  * Materi edukasi Safe Spending tersedia.

### Future Enhancements

* PWA: packaging sebagai Progressive Web App untuk instalasi dan offline capability.
* Recurring transactions automation: auto-create transactions sesuai jadwal dengan user review sebelum posting.
* CSV/PDF export: export transaksi lengkap dan laporan ringkasan dalam format PDF untuk keperluan laporan.
* Shared household budgeting: fitur multi-user untuk berbagi anggaran dan target dalam rumah tangga.
* Optional open banking exploration: kajian risiko dan compliance sebelum menilai integrasi bank sebagai fitur tambahan di fase lanjutan.

---

## Final Execution Notes

Dokumen ini siap digunakan sebagai PRD final untuk MVP Sisaku. Prioritas eksekusi adalah membuktikan value utama: pengguna dapat memahami uang yang aman dibelanjakan melalui pencatatan manual yang cepat, dashboard yang jelas, dan formula Safe Spending yang transparan. Seluruh fitur di luar validasi value inti, termasuk PWA, auto-recurring transactions, PDF export, dan AI Premium penuh, harus tetap berada di fase lanjutan sampai MVP menunjukkan retensi dan frekuensi pencatatan yang sehat.