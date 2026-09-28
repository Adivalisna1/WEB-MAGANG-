'use client';

import { useEffect, useState, useRef } from 'react';
import { getSession } from '@/lib/auth';
import { Upload, Plus, X, Search, FileSpreadsheet, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function RekeningKoranPage() {
  const [dataList, setDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    jenis: '',
    kategori: 'Rekening Koran',
    periode: '1',
    tahun: '2026',
    keterangan: '',
    nama_bank: '',
    nomor_rekening_bank: '',
    saldo_akhir_periode: 0
  });
  const [file, setFile] = useState<File | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const session = getSession();
      const res = await fetch(`${API}/rekening-koran`, {
        headers: session ? { Authorization: `Bearer ${session.token}` } : {},
      });
      if (res.ok) {
        const d = await res.json();
        setDataList(d.data ?? []);
      }
    } catch (err) {
      toast.error('Gagal mengambil data rekening koran');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Bukti file Rekening Koran wajib diupload');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const session = getSession();
      const payload = new FormData();
      Object.entries(formData).forEach(([key, val]) => payload.append(key, String(val)));
      payload.append('file', file);

      const res = await fetch(`${API}/rekening-koran`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.token}`
        },
        body: payload
      });

      const d = await res.json();
      if (res.ok && d.success) {
        toast.success(d.message || 'Rekening koran berhasil disimpan');
        setIsModalOpen(false);
        setFile(null);
        setFormData({ ...formData, saldo_akhir_periode: 0, keterangan: '' });
        fetchData();
      } else {
        toast.error(d.message || 'Gagal menyimpan');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka || 0);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-indigo-500" />
            Rekening Koran & Rekonsiliasi
          </h1>
          <p className="text-slate-500 text-sm mt-1">Input data saldo fisik bank dan bandingkan dengan catatan sistem (Excel)</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Tambah Rekening Koran
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                  <th className="p-4 font-semibold">Tahun/Periode</th>
                  <th className="p-4 font-semibold">Bank / Norek</th>
                  <th className="p-4 font-semibold text-right">Saldo Rekening Koran</th>
                  <th className="p-4 font-semibold text-right">Saldo Catatan (Excel)</th>
                  <th className="p-4 font-semibold text-right">Selisih</th>
                  <th className="p-4 font-semibold text-center">Bukti File</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dataList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      Belum ada data rekening koran.
                    </td>
                  </tr>
                ) : (
                  dataList.map((item) => {
                    const selisih = Number(item.saldo_akhir_periode || 0) - Number(item.saldo_excel || 0);
                    const isSelisih = selisih !== 0;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-slate-800">{item.tahun}</div>
                          <div className="text-xs text-slate-500">Periode {item.periode}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-slate-800">{item.nama_bank || '-'}</div>
                          <div className="text-xs text-slate-500 font-mono">{item.nomor_rekening_bank || '-'}</div>
                        </td>
                        <td className="p-4 text-right font-semibold text-slate-800">
                          {formatRupiah(item.saldo_akhir_periode)}
                        </td>
                        <td className="p-4 text-right font-medium text-slate-600">
                          {formatRupiah(item.saldo_excel)}
                        </td>
                        <td className="p-4 text-right">
                          <span className={`inline-flex px-2.5 py-1 rounded-lg text-sm font-semibold ${isSelisih ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {formatRupiah(selisih)}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {item.file_bank ? (
                            <a href={`${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${item.file_bank}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                              <FileSpreadsheet className="w-4 h-4" /> Buka
                            </a>
                          ) : '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Tambah */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Tambah Rekening Koran</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tahun</label>
                  <input type="number" required value={formData.tahun} onChange={e => setFormData({...formData, tahun: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Periode (Bulan)</label>
                  <input type="number" required value={formData.periode} onChange={e => setFormData({...formData, periode: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Bank</label>
                  <input type="text" required placeholder="BCA / Mandiri / dll" value={formData.nama_bank} onChange={e => setFormData({...formData, nama_bank: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Rekening</label>
                  <input type="text" required placeholder="1234567890" value={formData.nomor_rekening_bank} onChange={e => setFormData({...formData, nomor_rekening_bank: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Saldo Akhir Periode (Rp)</label>
                <input type="number" required value={formData.saldo_akhir_periode || ''} onChange={e => setFormData({...formData, saldo_akhir_periode: Number(e.target.value)})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-semibold text-indigo-700 bg-indigo-50/50" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan</label>
                <textarea rows={2} value={formData.keterangan} onChange={e => setFormData({...formData, keterangan: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Upload Bukti Rekening Koran (PDF/Foto)</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors">
                  <input type="file" required onChange={e => setFile(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" />
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 font-medium rounded-xl transition-colors">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 font-medium rounded-xl transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Rekening Koran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
