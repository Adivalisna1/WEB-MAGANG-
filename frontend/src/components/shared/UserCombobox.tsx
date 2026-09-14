'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

interface UserOption {
  id: number;
  nama: string;
  username: string;
  role: string;
}

interface UserComboboxProps {
  users: UserOption[];
  value: string;
  onChange: (value: string) => void;
}

export default function UserCombobox({ users, value, onChange }: UserComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    return (
      u.nama.toLowerCase().includes(term) ||
      u.username.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term)
    );
  });

  const getDisplayValue = () => {
    if (!value) return '— Pilih Tujuan Notifikasi —';
    if (value === 'all') return 'Kirim ke: Semua User';
    if (value === 'satker') return 'Kirim ke: Satker';
    
    const selectedUser = users.find(u => String(u.id) === value);
    if (selectedUser) return `${selectedUser.nama} (@${selectedUser.username})`;
    return '— Pilih Tujuan Notifikasi —';
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div 
        className="flex items-center justify-between w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`truncate ${!value ? 'text-gray-500' : 'text-gray-900'}`}>
          {getDisplayValue()}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 flex flex-col overflow-hidden">
          <div className="p-2 border-b border-gray-100 sticky top-0 bg-white flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama, username, atau role..."
              className="w-full text-sm outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          <div className="overflow-y-auto p-1">
            {/* Global Options */}
            {!search && (
              <>
                <div 
                  className={`px-3 py-2 text-sm rounded-md cursor-pointer flex items-center justify-between ${value === 'all' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-gray-50'}`}
                  onClick={() => { onChange('all'); setIsOpen(false); }}
                >
                  <span>Kirim ke: Semua User</span>
                  {value === 'all' && <Check className="w-4 h-4" />}
                </div>
                <div 
                  className={`px-3 py-2 text-sm rounded-md cursor-pointer flex items-center justify-between ${value === 'satker' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-gray-50'}`}
                  onClick={() => { onChange('satker'); setIsOpen(false); }}
                >
                  <span>Kirim ke: Satker</span>
                  {value === 'satker' && <Check className="w-4 h-4" />}
                </div>
                <div className="px-3 py-1 mt-2 mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Kirim ke User Individu
                </div>
              </>
            )}

            {filteredUsers.length === 0 ? (
              <div className="px-3 py-4 text-sm text-center text-gray-500">
                User tidak ditemukan
              </div>
            ) : (
              filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className={`px-3 py-2 text-sm rounded-md cursor-pointer flex flex-col ${String(u.id) === value ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50'}`}
                  onClick={() => { onChange(String(u.id)); setIsOpen(false); }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{u.nama}</span>
                    {String(u.id) === value && <Check className="w-4 h-4" />}
                  </div>
                  <span className="text-xs text-gray-500">
                    @{u.username} — {u.role.replace('_', ' ')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
