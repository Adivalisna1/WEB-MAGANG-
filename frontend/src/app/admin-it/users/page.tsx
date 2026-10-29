'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Plus, Trash2, Key, Edit, X, Upload, Download, Eye, EyeOff, Search, Shield, Building2, Layers } from 'lucide-react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

const API = typeof window !== "undefined" && window.location.hostname ? `${window.location.protocol}//${window.location.hostname}:5000/api` : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");

const PERMISSION_LIST = [
  { key: 'can_upload', label: 'Upload Dokumen' },
  { key: 'can_verify', label: 'Verifikasi Dokumen' },
  { key: 'can_delete', label: 'Hapus Dokumen' },
  { key: 'can_manage_users', label: 'Manajemen User' },
  { key: 'can_access_sql', label: 'Akses SQL Table Data' }
];

export default function UserManagementPage() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [satkers, setSatkers] = useState<any[]>([]);
  const [unitEselon1, setUnitEselon1] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetUserId, setResetUserId] = useState<number | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [showResetPasswordToggle, setShowResetPasswordToggle] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    role_id: 1, // 1: Operator, 2: Administrasi, 3: IT
    tingkat_id: 1, // 1: Satker, 2: Eselon 1, 3: K/L
    nama: '',
    username: '',
    email: '',
    password: '',
    satker_id: '',
    eselon_1_id: '',
    permissions: { can_upload: true } as Record<string, boolean>
  });

  const fetchUsers = async () => {
    try {
      const [resUsers, resSatkers, resE1] = await Promise.all([
        fetch(`${API}/admin-it/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/admin-it/satkers`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/admin-it/unit-eselon-1`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const [jUsers, jSatkers, jE1] = await Promise.all([
        resUsers.json(),
        resSatkers.json(),
        resE1.json()
      ]);

      if (jUsers.success) setUsers(jUsers.data);
      if (jSatkers.success) setSatkers(jSatkers.data);
      if (jE1.success) setUnitEselon1(jE1.data);
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  // Otomatis atur default permissions saat role berubah (hanya pada form tambah)
  const handleRoleChange = (newRoleId: number) => {
    let defaultPerms: Record<string, boolean> = {};
    if (newRoleId === 1) {
      if (formData.tingkat_id === 3) {
        defaultPerms = { can_delete: true, can_manage_users: true, can_access_sql: true, can_upload: true };
      } else {
        defaultPerms = { can_upload: true };
      }
    } else if (newRoleId === 2) {
      defaultPerms = { can_verify: true };
    }
    setFormData(prev => ({
      ...prev,
      role_id: newRoleId,
      permissions: defaultPerms
    }));
  };

  const handleTingkatChange = (newTingkatId: number) => {
    setFormData(prev => ({
      ...prev,
      tingkat_id: newTingkatId,
      satker_id: newTingkatId === 1 ? prev.satker_id : '',
      eselon_1_id: newTingkatId === 2 ? prev.eselon_1_id : ''
    }));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.tingkat_id === 1 && !formData.satker_id) {
      toast.error('Silakan pilih Satuan Kerja (Satker)');
      return;
    }
    if (formData.tingkat_id === 2 && !formData.eselon_1_id) {
      toast.error('Silakan pilih Unit Eselon 1');
      return;
    }

    const payload = {
      nama: formData.nama,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role_id: Number(formData.role_id),
      tingkat_id: Number(formData.tingkat_id),
      satker_id: formData.tingkat_id === 1 && formData.satker_id ? Number(formData.satker_id) : null,
      eselon_1_id: formData.tingkat_id === 2 && formData.eselon_1_id ? Number(formData.eselon_1_id) : null,
      permissions: formData.permissions
    };

    try {
      const res = await fetch(`${API}/admin-it/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const j = await res.json();
      if (j.success) {
        toast.success('Pengguna berhasil dibuat');
        setShowAddForm(false);
        setFormData({
          role_id: 1,
          tingkat_id: 1,
          nama: '',
          username: '',
          email: '',
          password: '',
          satker_id: '',
          eselon_1_id: '',
          permissions: { can_upload: true }
        });
        fetchUsers();
      } else {
        toast.error(j.message || j.detail || 'Gagal membuat pengguna');
      }
    } catch (err: any) {
      toast.error('Gagal membuat pengguna');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserId) return;

    if (formData.tingkat_id === 1 && !formData.satker_id) {
      toast.error('Silakan pilih Satuan Kerja (Satker)');
      return;
    }
    if (formData.tingkat_id === 2 && !formData.eselon_1_id) {
      toast.error('Silakan pilih Unit Eselon 1');
      return;
    }

    const payload = {
      nama: formData.nama,
      username: formData.username,
      email: formData.email,
      role_id: Number(formData.role_id),
      tingkat_id: Number(formData.tingkat_id),
      satker_id: formData.tingkat_id === 1 && formData.satker_id ? Number(formData.satker_id) : null,
      eselon_1_id: formData.tingkat_id === 2 && formData.eselon_1_id ? Number(formData.eselon_1_id) : null,
      permissions: formData.permissions
    };

    try {
      const res = await fetch(`${API}/admin-it/users/${editUserId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const j = await res.json();
      if (j.success) {
        toast.success('Pengguna berhasil diperbarui');
        setShowEditForm(false);
        fetchUsers();
      } else {
        toast.error(j.message || j.detail || 'Gagal memperbarui pengguna');
      }
    } catch (err: any) {
      toast.error('Gagal memperbarui pengguna');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (id === currentUser?.id) {
      toast.error('Tidak dapat menghapus akun Anda sendiri');
      return;
    }
    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return;

    try {
      const res = await fetch(`${API}/admin-it/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const j = await res.json();
      if (j.success) {
        toast.success('Pengguna berhasil dihapus');
        fetchUsers();
      } else {
        toast.error(j.message || 'Gagal menghapus pengguna');
      }
    } catch (err: any) {
      toast.error('Gagal menghapus pengguna');
    }
  };

  const openResetPasswordModal = (id: number) => {
    setResetUserId(id);
    setResetPasswordValue('');
    setShowResetPasswordToggle(false);
    setShowResetModal(true);
  };

  const submitResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUserId || !resetPasswordValue) return;

    try {
      const res = await fetch(`${API}/admin-it/users/${resetUserId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ new_password: resetPasswordValue })
      });
      const j = await res.json();
      if (j.success) {
        toast.success('Password berhasil diperbarui');
        setShowResetModal(false);
      } else {
        toast.error(j.message || 'Gagal reset password');
      }
    } catch (err: any) {
      toast.error('Gagal reset password');
    }
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { role_id: 1, tingkat_id: 1, nama: 'Operator Satker UGM', username: '693439_opr', email: 'opr@ugm.ac.id', password: 'Password@123', kode_satker: '693439' },
      { role_id: 2, tingkat_id: 1, nama: 'Pimpinan Satker UGM', username: '693439_pimp', email: 'pimp@ugm.ac.id', password: 'Password@123', kode_satker: '693439' },
      { role_id: 1, tingkat_id: 2, nama: 'Operator Ditjen Dikti', username: 'dikti_operator', email: 'opr_dikti@kemdikbud.go.id', password: 'Password@123', eselon_1_id: 1 },
      { role_id: 2, tingkat_id: 2, nama: 'Pimpinan Ditjen Dikti', username: 'dikti_pimpinan', email: 'pimp_dikti@kemdikbud.go.id', password: 'Password@123', eselon_1_id: 1 },
      { role_id: 1, tingkat_id: 3, nama: 'IT Administrator K/L', username: 'it_pusat', email: 'admin@kemdikbud.go.id', password: 'Password@123' },
      { role_id: 2, tingkat_id: 3, nama: 'Pimpinan Kementerian (K/L)', username: 'kl_pimpinan', email: 'men_dikbud@kemdikbud.go.id', password: 'Password@123' }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_Users");
    XLSX.writeFile(wb, "template_bulk_user.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          toast.error("File Excel kosong!");
          return;
        }

        if (!confirm(`Terdapat ${data.length} data user. Lanjutkan upload?`)) {
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }

        const res = await fetch(`${API}/admin-it/users/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ users: data })
        });
        const j = await res.json();

        if (j.success) {
          toast.success(j.message);
          setShowBulkUpload(false);
          fetchUsers();
        } else {
          toast.error(j.message || 'Gagal bulk upload');
        }
      } catch (err) {
        console.error(err);
        toast.error('Error saat memproses Excel atau upload data');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const openEditModal = (u: any) => {
    setEditUserId(u.id);
    let parsedPerms = {};
    if (u.permissions) {
      try {
        parsedPerms = typeof u.permissions === 'string' ? JSON.parse(u.permissions) : u.permissions;
      } catch (e) { }
    }
    setFormData({
      role_id: u.role_id || (u.role === 'operator' ? 1 : u.role === 'administrasi' ? 2 : u.role === 'it' ? 3 : 1),
      tingkat_id: u.tingkat_id || (u.tingkat === 'satker' ? 1 : u.tingkat === 'eselon_1' ? 2 : u.tingkat === 'kl' ? 3 : 1),
      nama: u.nama || '',
      username: u.username || '',
      email: u.email || '',
      password: '',
      satker_id: u.satker_id ? String(u.satker_id) : '',
      eselon_1_id: u.eselon_1_id ? String(u.eselon_1_id) : '',
      permissions: parsedPerms
    });
    setShowEditForm(true);
  };

  const togglePermission = (key: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key]
      }
    }));
  };

  const renderForm = (isEdit: boolean) => (
    <form onSubmit={isEdit ? handleUpdateUser : handleCreateUser} className="space-y-4 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap</label>
          <input
            type="text"
            required
            value={formData.nama}
            onChange={e => setFormData({ ...formData, nama: e.target.value })}
            placeholder="Contoh: Budi Santoso"
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Username (NIP / Kode Unik)</label>
          <input
            type="text"
            required
            value={formData.username}
            onChange={e => setFormData({ ...formData, username: e.target.value })}
            placeholder="Contoh: 198501012010011001"
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            placeholder="contoh@kemdikbud.go.id"
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        {!isEdit && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimal 6 karakter"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm pr-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Pilihan Role (Peran) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Peran (Role)
          </label>
          <select
            value={formData.role_id}
            onChange={e => handleRoleChange(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
          >
            <option value={1}>Operator (Pelaksana Teknis / Upload Dokumen / Admin IT pada K/L)</option>
            <option value={2}>Manajemen (Pimpinan / Verifikator / Pengawas / Kebijakan)</option>
          </select>
        </div>

        {/* Pilihan Tingkat (Level Hierarki) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Tingkat Hierarki
          </label>
          <select
            value={formData.tingkat_id}
            onChange={e => handleTingkatChange(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
          >
            <option value={1}>Satker (Satuan Kerja Pelaksana)</option>
            <option value={2}>Unit Eselon 1 (Direktorat / Badan Pusat)</option>
            <option value={3}>K/L (Kementerian / Lembaga Pusat)</option>
          </select>
        </div>

        {/* Conditional Selector: Satker atau Unit Eselon 1 */}
        {formData.tingkat_id === 1 && (
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Satuan Kerja (Satker)
            </label>
            <select
              value={formData.satker_id}
              onChange={e => setFormData({ ...formData, satker_id: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">-- Pilih Satuan Kerja --</option>
              {satkers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.NO_Satker ? `[${s.NO_Satker}] ${s.nama}` : s.nama}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              * Unit Eselon 1 akan otomatis terhubung berdasarkan satker yang dipilih.
            </p>
          </div>
        )}

        {formData.tingkat_id === 2 && (
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Unit Eselon 1
            </label>
            <select
              value={formData.eselon_1_id}
              onChange={e => setFormData({ ...formData, eselon_1_id: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
            >
              <option value="">-- Pilih Unit Eselon 1 --</option>
              {unitEselon1.map(u => (
                <option key={u.id} value={u.id}>
                  {u.singkatan ? `[${u.singkatan}] ${u.nama}` : u.nama}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              * Pengguna pada level ini memiliki wewenang memantau seluruh satker di bawah unit Eselon 1 ini.
            </p>
          </div>
        )}

        {formData.tingkat_id === 3 && (
          <div className="md:col-span-2 bg-blue-50/70 border border-blue-200/60 rounded-xl p-3 text-xs text-blue-800 flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Pengguna ini memiliki cakupan tingkat Kementerian / Lembaga Pusat (Akses memantau seluruh unit dan satker).</span>
          </div>
        )}
      </div>

      {/* Hak Akses Spesifik (JSON Permissions) */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Hak Akses Spesifik (Permissions)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          {PERMISSION_LIST.map(p => (
            <label key={p.key} className="flex items-center gap-2.5 cursor-pointer p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <input
                type="checkbox"
                checked={!!formData.permissions[p.key]}
                onChange={() => togglePermission(p.key)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-xs font-medium text-slate-700">{p.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => { setShowAddForm(false); setShowEditForm(false); }}
          className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-colors shadow-sm"
        >
          {isEdit ? 'Simpan Perubahan' : 'Buat Pengguna'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Manajemen Pengguna</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola akun, peran (Role), dan hierarki (Tingkat) seluruh pengguna sistem
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowBulkUpload(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Upload Massal
          </button>
          <button
            onClick={() => {
              setFormData({
                role_id: 1,
                tingkat_id: 1,
                nama: '',
                username: '',
                email: '',
                password: '',
                satker_id: '',
                eselon_1_id: '',
                permissions: { can_upload: true }
              });
              setShowAddForm(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Pengguna
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 shadow-xs max-w-md focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
        <Search className="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
        <input
          type="text"
          placeholder="Cari nama, NIP / username, atau email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 outline-none text-sm text-gray-800 bg-transparent placeholder:text-gray-400"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Pengguna</th>
                <th className="px-5 py-3.5">Peran (Role)</th>
                <th className="px-5 py-3.5">Tingkat & Unit</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 font-medium">
                    Memuat daftar pengguna...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 font-medium">
                    Belum ada data pengguna.
                  </td>
                </tr>
              ) : (
                users.filter(u =>
                  (u.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (u.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (u.satker || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (u.eselon_1_nama || '').toLowerCase().includes(searchQuery.toLowerCase())
                ).map(u => {
                  const roleName = u.role?.toLowerCase();
                  const tingkatCode = u.tingkat?.toLowerCase();

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/75 transition-colors">
                      {/* Pengguna Column */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
                            roleName === 'it' ? 'bg-purple-100 text-purple-700' :
                            roleName === 'administrasi' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {(u.nama || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 leading-tight truncate max-w-[200px] sm:max-w-xs">{u.nama}</p>
                            <p className="text-xs text-gray-400 mt-0.5 font-mono">@{u.username} · {u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role Column */}
                      <td className="px-5 py-3.5">
                        {(() => {
                          const isUserIt = Boolean(
                            roleName === 'it' ||
                            (tingkatCode === 'kl' && (u.permissions?.can_manage_users || ['it_admin', 'naufal'].includes(u.username)))
                          );
                          if (isUserIt) {
                            return (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                IT Administrator
                              </span>
                            );
                          }
                          if (roleName === 'manajemen' || roleName === 'administrasi') {
                            return (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                Manajemen
                              </span>
                            );
                          }
                          return (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              Operator
                            </span>
                          );
                        })()}
                      </td>

                      {/* Tingkat & Unit Column */}
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            {tingkatCode === 'satker' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Building2 className="w-3 h-3" /> Satker
                              </span>
                            ) : tingkatCode === 'eselon_1' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                <Layers className="w-3 h-3" /> Eselon 1
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                                <Shield className="w-3 h-3" /> K/L Pusat
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-600 truncate max-w-xs font-medium" title={u.satker || u.eselon_1_nama || ''}>
                            {tingkatCode === 'satker' && u.satker ? (u.NO_Satker ? `[${u.NO_Satker}] ${u.satker}` : u.satker) :
                             tingkatCode === 'eselon_1' && (u.eselon_1_singkatan || u.eselon_1_nama) ? (u.eselon_1_singkatan ? `${u.eselon_1_singkatan} - ${u.eselon_1_nama}` : u.eselon_1_nama) :
                             tingkatCode === 'kl' ? 'Kementerian / Lembaga Pusat' : '-'}
                          </span>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="px-5 py-3.5">
                        {u.is_online ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-lg">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Offline
                          </span>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Pengguna & Hak Akses"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openResetPasswordModal(u.id)}
                            className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Reset Password"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={u.id === currentUser?.id}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              u.id === currentUser?.id
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                            }`}
                            title={u.id === currentUser?.id ? "Tidak dapat menghapus akun Anda sendiri" : "Hapus Pengguna"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: TAMBAH USER */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100 my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Tambah Pengguna Baru</h3>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderForm(false)}
          </div>
        </div>
      )}

      {/* MODAL: EDIT USER */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100 my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Edit Pengguna & Hak Akses</h3>
              <button onClick={() => setShowEditForm(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderForm(true)}
          </div>
        </div>
      )}

      {/* MODAL: BULK UPLOAD */}
      {showBulkUpload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
              <h3 className="font-bold text-gray-900 text-lg">Upload Pengguna Massal</h3>
              <button onClick={() => setShowBulkUpload(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Upload file Excel (.xlsx) untuk menambahkan banyak akun pengguna sekaligus.
                Gunakan template yang disediakan untuk menghindari kesalahan format data.
              </p>
              <div className="bg-blue-50/80 border border-blue-200/60 p-4 rounded-xl flex items-start gap-3.5">
                <Download className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Unduh Template Excel</h4>
                  <p className="text-xs text-blue-700 mb-2.5">
                    Kolom template: role_id (1: Operator, 2: Administrasi, 3: IT), tingkat_id (1: Satker, 2: Eselon 1, 3: K/L), kode_satker, eselon_1_id, dll.
                  </p>
                  <button
                    onClick={handleDownloadTemplate}
                    className="text-xs font-semibold text-white bg-blue-600 px-3.5 py-1.5 rounded-lg hover:bg-blue-700 transition cursor-pointer"
                  >
                    Unduh Template (.xlsx)
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pilih File Excel</label>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2.5 file:px-4
                    file:rounded-xl file:border-0
                    file:text-xs file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100 transition-all cursor-pointer border border-gray-200 rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESET PASSWORD */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
              <h3 className="font-bold text-gray-900 text-lg">Reset Password Pengguna</h3>
              <button onClick={() => setShowResetModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submitResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password Baru</label>
                <div className="relative">
                  <input
                    type={showResetPasswordToggle ? "text" : "password"}
                    required
                    value={resetPasswordValue}
                    onChange={e => setResetPasswordValue(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm pr-10 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="Masukkan password baru"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPasswordToggle(!showResetPasswordToggle)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showResetPasswordToggle ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
