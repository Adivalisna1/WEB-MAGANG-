'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Plus, Trash2, Key, Edit, X, Upload, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const PERMISSION_LIST = [
  { key: 'can_upload', label: 'Bisa Upload Dokumen' },
  { key: 'can_verify', label: 'Bisa Verifikasi Dokumen' },
  { key: 'can_delete', label: 'Bisa Hapus Dokumen' },
  { key: 'can_manage_users', label: 'Bisa Manajemen User' }
];

export default function UserManagementPage() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    role_id: 2,
    nama: '',
    username: '',
    email: '',
    password: '',
    permissions: {} as Record<string, boolean>
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}/admin-it/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const j = await res.json();
      if (j.success) setUsers(j.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load users');
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
        alert('User created successfully');
        setShowAddForm(false);
        setFormData({ role_id: 2, nama: '', username: '', email: '', password: '', permissions: {} });
        fetchUsers();
      } else {
        alert(j.message || 'Failed to create user');
      }
    } catch (err: any) {
      alert('Failed to create user');
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
        alert('User updated successfully');
        setShowEditForm(false);
        fetchUsers();
      } else {
        alert(j.message || 'Failed to update user');
      }
    } catch (err: any) {
      alert('Failed to update user');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (id === currentUser?.id) {
      alert('Cannot delete your own account');
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
        alert('User deleted successfully');
        fetchUsers();
      } else {
        alert(j.message || 'Failed to delete user');
      }
    } catch (err: any) {
      alert('Failed to delete user');
    }
  };

  const handleResetPassword = async (id: number) => {
    const newPassword = prompt('Enter new password for this user:');
    if (!newPassword) return;

    try {
      const res = await fetch(`${API}/admin-it/users/${id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ new_password: newPassword })
      });
      const j = await res.json();
      if (j.success) {
        alert('Password updated successfully');
      } else {
        alert(j.message || 'Failed to reset password');
      }
    } catch (err: any) {
      alert('Failed to reset password');
    }
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { role_id: 2, nama: 'Contoh Satker', username: 'satker01', email: 'satker@example.com', password: 'password123' }
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
          alert("File Excel kosong!");
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
          alert(j.message);
          setShowBulkUpload(false);
          fetchUsers();
        } else {
          alert(j.message || 'Gagal bulk upload');
        }
      } catch (err) {
        console.error(err);
        alert('Error parsing Excel or uploading data');
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
      } catch(e) {}
    }
    setFormData({
      role_id: u.role === 'pimpinan' ? 1 : u.role === 'staff' ? 2 : u.role === 'satker' ? 2 : u.role === 'eselon_1' ? 3 : u.role === 'admin_it' ? 4 : u.role === 'administrasi' ? 5 : 2,
      nama: u.nama,
      username: u.username,
      email: u.email,
      password: '',
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
          <input type="text" required value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input type="text" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        {!isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
        )}
        <div className={isEdit ? "md:col-span-2" : ""}>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select value={formData.role_id} onChange={e => setFormData({...formData, role_id: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value={1}>Pimpinan</option>
            <option value={2}>Staff (Satker)</option>
            <option value={3}>Eselon 1</option>
            <option value={4}>IT Admin</option>
            <option value={5}>Administrasi</option>
          </select>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <label className="block text-sm font-bold text-gray-900 mb-3">Hak Akses Spesifik (JSON Permissions)</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          {PERMISSION_LIST.map(p => (
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
      </div>

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200">
        <button type="button" onClick={() => isEdit ? setShowEditForm(false) : setShowAddForm(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Batal</button>
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">{isEdit ? 'Simpan Perubahan' : 'Buat User'}</button>
      </div>
    </form>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all system accounts, roles, and granular permissions.</p>
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
              setFormData({ role_id: 2, nama: '', username: '', email: '', password: '', permissions: {} });
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
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {loading ? (
                <tr><td colSpan={4} className="p-4 text-center text-gray-500">Loading users...</td></tr>
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
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-md">
                        {u.role === 'satker' ? 'Staff' : u.role}
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
                          onClick={() => handleResetPassword(u.id)}
                          className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                          title="Reset Password"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={u.id === currentUser?.id}
                          className={`p-1.5 rounded-md transition-colors ${
                            u.id === currentUser?.id 
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

    </div>
  );
}
