import os
import re

files = [
    "frontend/src/components/pimpinan/PimpinanSidebar.tsx",
    "frontend/src/components/Staff/StaffSidebar.tsx",
    "frontend/src/components/eselon-1/Eselon1Sidebar.tsx",
    "frontend/src/components/admin-it/AdminITSidebar.tsx"
]

def patch_file(fpath):
    if not os.path.exists(fpath):
        return
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Main Background and Text
    content = re.sub(r'bg-\[\#0f172a\]', 'bg-white border-r border-slate-200', content)
    content = re.sub(r'bg-slate-950', 'bg-white border-r border-slate-200', content)
    content = re.sub(r'bg-\[\#334155\]', 'bg-white border-r border-slate-200', content)
    content = re.sub(r'bg-white border-r border-gray-200', 'bg-white border-r border-slate-200', content)
    
    # 2. Text colors on main aside
    content = re.sub(r'text-slate-300', 'text-slate-600', content)
    content = re.sub(r'text-slate-100', 'text-slate-600', content)
    
    # 3. Active menu styles
    # Pimpinan & Staff & Eselon1
    content = re.sub(r"active\s*\?\s*['\"]bg-\[#[0-9a-fA-F]+\] text-white.*?['\"]\s*:\s*['\"]text-slate-400 hover:text-white hover:bg-\[#[0-9a-fA-F]+\]['\"]", 
                     "active\n                  ? 'bg-[#1E90FF] text-white shadow-lg shadow-[#1E90FF]/30'\n                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'", content)
    content = re.sub(r"active\s*\?\s*['\"]bg-blue-600 text-white.*?['\"]\s*:\s*['\"]text-slate-400 hover:text-white hover:bg-slate-800['\"]", 
                     "active\n                  ? 'bg-[#1E90FF] text-white shadow-lg shadow-[#1E90FF]/30'\n                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'", content)
    
    # AdminIT active
    content = re.sub(r"isActive\s*\?\s*['\"]bg-blue-50 text-blue-700['\"]\s*:\s*['\"]text-gray-600 hover:bg-gray-50 hover:text-gray-900['\"]",
                     "isActive\n                  ? 'bg-[#1E90FF] text-white shadow-lg shadow-[#1E90FF]/30'\n                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'", content)
    content = re.sub(r"isActive \? 'text-blue-600' : 'text-gray-400'", "isActive ? 'text-white' : 'text-slate-400'", content)
    
    # Icons active check for Pimpinan, Staff, Eselon1
    content = re.sub(r'active \? "text-white" : "group-hover:text-white"', 'active ? "text-white" : "text-slate-400 group-hover:text-slate-900"', content)

    # 4. Top border and Close button
    content = re.sub(r'border-b border-\[\#1e293b\]', 'border-b border-slate-200', content)
    content = re.sub(r'border-b border-slate-800', 'border-b border-slate-200', content)
    content = re.sub(r'border-b border-gray-100', 'border-b border-slate-200', content)
    
    # 5. Profile / Bottom borders
    content = re.sub(r'border-t border-\[\#1e293b\]', 'border-t border-slate-200', content)
    content = re.sub(r'border-t border-slate-800', 'border-t border-slate-200', content)
    content = re.sub(r'border-t border-gray-100', 'border-t border-slate-200', content)
    
    content = re.sub(r'hover:bg-\[\#1e293b\]', 'hover:bg-slate-50', content)
    content = re.sub(r'hover:bg-slate-800', 'hover:bg-slate-50', content)
    content = re.sub(r'text-white truncate', 'text-slate-900 truncate', content)
    
    # 6. Profile Circle
    content = re.sub(r'bg-\[\#10b981\]', 'bg-[#1E90FF]', content)
    content = re.sub(r'bg-indigo-600', 'bg-[#1E90FF]', content)
    content = re.sub(r'bg-blue-600', 'bg-[#1E90FF]', content)
    content = re.sub(r'text-\[\#10b981\]', 'text-slate-500', content)
    content = re.sub(r'text-indigo-400', 'text-slate-500', content)
    
    # Admin Profile
    content = re.sub(r'bg-gray-50/50', 'bg-white', content)
    content = re.sub(r'bg-blue-100', 'bg-[#1E90FF]', content)
    content = re.sub(r'text-blue-700 font-bold', 'text-white font-bold', content)
    content = re.sub(r'text-gray-900', 'text-slate-900', content)
    content = re.sub(r'text-gray-500', 'text-slate-500', content)
    content = re.sub(r'text-gray-600', 'text-slate-600', content)
    content = re.sub(r'text-gray-400', 'text-slate-400', content)
    
    # Top logo
    content = re.sub(r'w-8 h-8 rounded bg-\[\#10b981\]/20', 'w-8 h-8 rounded bg-[#1E90FF]', content)
    content = re.sub(r'w-8 h-8 rounded bg-indigo-500/20', 'w-8 h-8 rounded bg-[#1E90FF]', content)
    content = re.sub(r'w-8 h-8 rounded bg-blue-500/20', 'w-8 h-8 rounded bg-[#1E90FF]', content)
    content = re.sub(r'text-\[\#10b981\] shrink-0', 'text-white shrink-0', content)
    content = re.sub(r'text-indigo-400 shrink-0', 'text-white shrink-0', content)
    content = re.sub(r'text-blue-400 shrink-0', 'text-white shrink-0', content)
    
    # For Admin
    content = re.sub(r'bg-blue-600 rounded-lg', 'bg-[#1E90FF] rounded-lg', content)

    # 7. Action buttons (Logout, Home)
    # Old dark style: border border-[#334155] text-slate-300 hover:bg-[#10b981] hover:text-white hover:border-[#10b981]
    content = re.sub(r"border-\[\#334155\] text-slate-[0-9]{3} hover:bg-\[#[0-9a-fA-F]+\] hover:text-white hover:border-\[#[0-9a-fA-F]+\]",
                     "border-slate-200 text-slate-600 hover:bg-[#1E90FF] hover:text-white hover:border-[#1E90FF]", content)
    content = re.sub(r"border-slate-700 text-slate-[0-9]{3} hover:bg-blue-600 hover:text-white hover:border-blue-600",
                     "border-slate-200 text-slate-600 hover:bg-[#1E90FF] hover:text-white hover:border-[#1E90FF]", content)
    
    # Admin Logout
    content = re.sub(r"text-red-600 hover:bg-red-50", "text-rose-500 hover:bg-rose-50", content)

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

for f in files:
    patch_file(f)
print("Done patching sidebars!")
