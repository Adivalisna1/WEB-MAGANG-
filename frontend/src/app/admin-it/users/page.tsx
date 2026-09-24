'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Plus, Trash2, Key, Edit, X, Upload, Download, Eye, EyeOff } from 'lucide-react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
  const [loading, setLoading] = useState(true);

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
    role_id: 2,
    nama: '',
    username: '',
    email: '',
    password: '',
    satker_id: '',
    permissions: {} as Record<string, boolean>
  });

  const fetchUsers = async () => {
    try {
      const [resUsers, resSatkers] = await Promise.all([
        fetch(`${API}/admin-it/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/satker`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const [jUsers, jSatkers] = await Promise.all([resUsers.json(), resSatkers.json()]);

      if (jUsers.success) setUsers(jUsers.data);
      if (jSatkers.success) setSatkers(jSatkers.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/admin-it/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const j = await res.json();
      if (j.success) {
        toast.success('User created successfully');
        setShowAddForm(false);
        setFormData({ role_id: 2, nama: '', username: '', email: '', password: '', satker_id: '', permissions: {} });
        fetchUsers();
      } else {
        toast.error(j.message || 'Failed to create user');
      }
    } catch (err: any) {
      toast.error('Failed to create user');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserId) return;
    try {
      const res = await fetch(`${API}/admin-it/users/${editUserId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const j = await res.json();
      if (j.success) {
        toast.success('User updated successfully');
        setShowEditForm(false);
        fetchUsers();
      } else {
        toast.error(j.message || 'Failed to update user');
      }
    } catch (err: any) {
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (id === currentUser?.id) {
      toast.error('Cannot delete your own account');
      return;
    }
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const res = await fetch(`${API}/admin-it/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const j = await res.json();
      if (j.success) {
        toast.success('User deleted successfully');
        fetchUsers();
      } else {
        toast.error(j.message || 'Failed to delete user');
      }
    } catch (err: any) {
      toast.error('Failed to delete user');
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
        toast.success('Password updated successfully');
        setShowResetModal(false);
      } else {
        toast.error(j.message || 'Failed to reset password');
      }
    } catch (err: any) {
      toast.error('Failed to reset password');
    }
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { role_id: 2, nama: 'Budi Santoso', username: '693439', email: 'budi@example.com', password: 'password123' }
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
        toast.error('Error parsing Excel or uploading data');
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
      role_id: u.role === 'pimpinan' ? 1 : u.role === 'staff' ? 2 : u.role === 'satker' ? 2 : u.role === 'eselon_1' ? 3 : u.role === 'admin_it' ? 4 : u.role === 'administrasi' ? 5 : 2,
      nama: u.nama,
      username: u.username,
      email: u.email,
      password: '',
      satker_id: u.satker_id || '',
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input type="text" required value={formData.nama} onChange={e => setFormData({ ...formData, nama: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input type="text" required value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        {!isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm pr-10"
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
        <div className={isEdit ? "md:col-span-2" : ""}>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            value={formData.role_id}
            onChange={e => setFormData({ ...formData, role_id: Number(e.target.value) })}
            disabled={isEdit}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm ${isEdit ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
          >
            <option value={1}>Pimpinan</option>
            <option value={2}>Staff</option>
            <option value={3}>Eselon 1</option>
            <option value={4}>IT Admin</option>
            <option value={5}>Administrasi</option>
          </select>
        </div>
        {(formData.role_id === 1 || formData.role_id === 2) && (
          <div className={isEdit ? "md:col-span-2" : ""}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Satker (Grup Divisi)</label>
            <select value={formData.satker_id} onChange={e => setFormData({ ...formData, satker_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">-- Pilih Satker --</option>
              {satkers.map(s => (
                <option key={s.id} value={s.id}>{s.nama}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <label className="block text-sm font-bold text-gray-900 mb-3">Hak Akses Spesifik (JSON Permissions)</label>

        {!isEdit ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              {PERMISSION_LIST.filter(p => {
                if (formData.role_id === 4) {
                  return ['can_delete', 'can_manage_users', 'can_access_sql'].includes(p.key);
                }
                return p.key !== 'can_access_sql';
              }).map(p => (
                <label key={p.key} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    checked={!!formData.permissions[p.key]}
                    onChange={() => togglePermission(p.key)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700">{p.label}</span>
                </label>
              ))}
            </div>
            <div className="mt-3">
              <p className="text-xs text-gray-500 font-mono bg-gray-100 p-2 rounded">
                Preview JSON: {JSON.stringify(formData.permissions)}
              </p>
            </div>
          </>
        ) : (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-500 italic">
              Hak akses tidak dapat diubah saat mengedit user.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200">
        <button type="button" onClick={() => { setShowAddForm(false); setShowEditForm(false); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">
          {isEdit ? 'Save Changes' : 'Create User'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">User Management</h1>kok
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBulkUpload(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            Bulk Upload
          </button>
          <button
            onClick={() => {
              setFormData({ role_id: 2, nama: '', username: '', email: '', password: '', satker_id: '', permissions: {} });
              setShowAddForm(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New User
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Satker</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {loading ? (
                <tr><td colSpan={5} className="p-4 text-center text-gray-500">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-gray-500">Belum ada data user.</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                          {u.nama.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{u.nama}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {u.role?.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {u.satker || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.is_online ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Offline
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit User & Permissions"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openResetPasswordModal(u.id)}
                          className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                          title="Reset Password"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={u.id === currentUser?.id}
                          className={`p-1.5 rounded-md transition-colors ${u.id === currentUser?.id
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                            }`}
                          title={u.id === currentUser?.id ? "Cannot delete yourself" : "Delete User"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-gray-100 mt-10 mb-10">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Tambah User Baru</h3>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderForm(false)}
          </div>
        </div>
      )}

      {showEditForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-gray-100 mt-10 mb-10">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Edit User & Permissions</h3>
              <button onClick={() => setShowEditForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderForm(true)}
          </div>
        </div>
      )}

      {showBulkUpload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4 border-b pb-4">
              <h3 className="font-bold text-gray-900 text-lg">Bulk Upload Users</h3>
              <button onClick={() => setShowBulkUpload(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Upload file Excel (.xlsx) untuk menambahkan banyak user sekaligus.
                Pastikan format kolom sesuai dengan template.
              </p>
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                <Download className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Download Template</h4>
                  <p className="text-xs text-blue-700 mb-2">Gunakan template ini untuk memastikan format data benar.</p>
                  <button onClick={handleDownloadTemplate} className="text-xs font-medium text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 transition">
                    Download Template
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload File Excel</label>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100 transition-all cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4 border-b pb-4">
              <h3 className="font-bold text-gray-900 text-lg">Reset Password User</h3>
              <button onClick={() => setShowResetModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submitResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showResetPasswordToggle ? "text" : "password"}
                    required
                    value={resetPasswordValue}
                    onChange={e => setResetPasswordValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm pr-10"
                    placeholder="Enter new password"
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
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowResetModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-sm">
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
