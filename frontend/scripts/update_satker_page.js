const fs = require('fs');

const filepath = 'C:/Users/adiva/OneDrive/Dokumen/web magang munculin data lokal/frontend/src/app/admin-it/satker/page.tsx';

let content = fs.readFileSync(filepath, 'utf8');

// 1. Imports
content = content.replace(
  "import { Plus, Trash2, Edit, Building2 } from 'lucide-react';",
  "import { Plus, Trash2, Edit, Building2, Download, Upload } from 'lucide-react';\nimport { useRef } from 'react';\nimport * as XLSX from 'xlsx';"
);

// 2. State and Ref
const state_block = `  const [loading, setLoading] = useState(true);

  // Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);`;
content = content.replace("  const [loading, setLoading] = useState(true);", state_block);

// 3. File upload handler
const upload_handler = `  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const data = evt.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);
          
          const satkerNames = jsonData.map(row => row.Satker || row['Nama Satker']).filter(Boolean);
          
          if (satkerNames.length === 0) {
            toast.error('Tidak ada data Satker yang ditemukan dalam file. Pastikan header kolom bernama "Satker".');
            setImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
          }

          const res = await fetch(\`\${API}/satker/bulk\`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: \`Bearer \${token}\`
            },
            body: JSON.stringify({ satkers: satkerNames })
          });
          const result = await res.json();
          if (result.success) {
            toast.success(result.message || 'Import berhasil');
            fetchSatkers();
          } else {
            toast.error(result.message || 'Import gagal');
          }
        } catch (err) {
          console.error(err);
          toast.error('Gagal membaca file Excel');
        } finally {
          setImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.onerror = () => {
        toast.error('Gagal membaca file');
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      toast.error('Terjadi kesalahan saat import');
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (`;
content = content.replace("  return (", upload_handler);

// 4. UI changes
const ui_old = `        <button
          onClick={() => { setShowForm(!showForm); setIsEdit(false); setFormData({ nama: '' }); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Satker
        </button>`;

const ui_new = `        <div className="flex flex-wrap gap-2">
          <a
            href="/template_import_satker.xlsx"
            download
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Template
          </a>
          
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {importing ? 'Importing...' : 'Import'}
          </button>

          <button
            onClick={() => { setShowForm(!showForm); setIsEdit(false); setFormData({ nama: '' }); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Satker
          </button>
        </div>`;
content = content.replace(ui_old, ui_new);

fs.writeFileSync(filepath, content, 'utf8');
console.log("Done");
