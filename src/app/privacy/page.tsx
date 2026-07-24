export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div>
        <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
          Privacy-first • Manual-first
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">Kebijakan Privasi Sisaku</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Sisaku membantu kamu mencatat keuangan secara manual. Kami tidak menghubungkan aplikasi ke rekening bank, e-wallet,
          kartu kredit, atau layanan finansial eksternal pada MVP.
        </p>
      </div>

      <section className="space-y-3 text-sm leading-6 text-slate-600">
        <h2 className="text-lg font-semibold text-slate-900">Data yang disimpan</h2>
        <p>
          Data yang kamu masukkan dapat mencakup profil akun, akun keuangan manual, kategori, transaksi, anggaran, target
          tabungan, pengeluaran rutin, snapshot Safe Spending, audit perubahan penting, serta token reset password yang disimpan dalam bentuk hash sementara.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-6 text-slate-600">
        <h2 className="text-lg font-semibold text-slate-900">Cara data digunakan</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Menghitung saldo, laporan, progress anggaran, target tabungan, dan Safe Spending.</li>
          <li>Menjaga keamanan sesi dan memastikan pengguna hanya mengakses data miliknya sendiri.</li>
          <li>Mengukur penggunaan produk secara agregat dengan event yang tidak menyimpan detail finansial mentah.</li>
          <li>Tanggal laporan dan input harian memakai zona waktu aplikasi <strong>Asia/Jakarta</strong> agar batas bulan konsisten.</li>
          <li>Token reset password berlaku singkat, disimpan sebagai hash, dan sesi aktif dicabut setelah password berhasil diubah.</li>
        </ul>
      </section>

      <section className="space-y-3 text-sm leading-6 text-slate-600">
        <h2 className="text-lg font-semibold text-slate-900">Kontrol dan penghapusan data</h2>
        <p>
          Kamu dapat meminta penghapusan data dari halaman Pengaturan. Saat akun dihapus, data finansial terkait akun tersebut
          ikut dihapus dari sistem sesuai relasi data aplikasi.
        </p>
      </section>

      <section className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600 ring-1 ring-slate-100">
        <h2 className="font-semibold text-slate-900">Catatan AI Premium</h2>
        <p className="mt-2">
          Jika fitur AI Premium tersedia, AI hanya boleh menganalisis data yang kamu catat di Sisaku dan harus menjelaskan
          keterbatasan insight berdasarkan kelengkapan data manual.
        </p>
      </section>
    </main>
  );
}