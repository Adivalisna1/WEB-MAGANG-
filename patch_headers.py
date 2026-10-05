import os
import re

files = [
    "frontend/src/components/pimpinan/PimpinanSidebar.tsx",
    "frontend/src/components/Staff/StaffSidebar.tsx",
    "frontend/src/components/eselon-1/Eselon1Sidebar.tsx",
    "frontend/src/components/admin-it/AdminITSidebar.tsx"
]

header_replacement = """        <div className="h-20 flex items-center justify-between px-4 md:px-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 bg-[#1E90FF] rounded-lg flex items-center justify-center font-bold text-white shrink-0 ${isCollapsed ? 'mx-auto' : ''}`}>
              <span className="text-sm">FS</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <h1 className="font-bold text-slate-900 tracking-tight leading-none text-[15px] m-0">FinSight</h1>
                <p className="text-[10px] text-[#1E90FF] font-bold tracking-wider mt-0.5 m-0">REPORTING SUITE</p>
              </div>
            )}
          </div>
          {/* Close button (Mobile only) */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>"""

def patch_file(fpath):
    if not os.path.exists(fpath):
        return
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the header section. It usually starts with something like `<div className="h-20` or `<div className="px-4` 
    # and ends right before `<nav` or `<div className="p-4 border-b`
    
    # We can use regex to replace from the first `<div className="... border-b` up to the `<nav` or next main div
    
    # 1. Match the opening tag of the aside
    # `      <aside className={` ... `}>`
    # We want to replace everything between `}>` and `<nav` (or `<div className="p-4 border-b` for AdminIT)
    
    # AdminIT uses `<div className="p-4 border-b border-gray-100 bg-white...` for Profile section after header
    # Others go straight to `<nav`
    
    if "AdminITSidebar.tsx" in fpath:
        pattern = r"(<div className=\{`\n\s*fixed left-0 top-0.*?`\}>\n)\s*<div className=\"h-16.*?</div>\n\n\s*<div className=\{`p-4 border-b"
        content = re.sub(pattern, r"\1" + header_replacement + "\n\n        <div className={`p-4 border-b", content, flags=re.DOTALL)
    elif "PimpinanSidebar.tsx" in fpath:
        pattern = r"(<aside className=\{`\n\s*fixed left-0 top-0.*?`\}>\n)\s*(?:\{\/\*.*?\*\/\}\n)?\s*<div className=\"h-20.*?</button>\n\s*</div>"
        content = re.sub(pattern, r"\1" + header_replacement, content, flags=re.DOTALL)
    elif "StaffSidebar.tsx" in fpath:
        pattern = r"(<aside className=\{`\n\s*fixed left-0 top-0.*?`\}>\n)\s*(?:\{\/\*.*?\*\/\}\n)?\s*<div className=\"h-20.*?</button>\n\s*</div>"
        content = re.sub(pattern, r"\1" + header_replacement, content, flags=re.DOTALL)
    elif "Eselon1Sidebar.tsx" in fpath:
        pattern = r"(<aside className=\{`\n\s*fixed left-0 top-0.*?`\}>\n)\s*(?:\{\/\*.*?\*\/\}\n)?\s*<div className=\"px-4.*?</button>\n\s*</div>"
        content = re.sub(pattern, r"\1" + header_replacement, content, flags=re.DOTALL)

    # Some extra cleanup for text-white on labels
    content = re.sub(r'text-white truncate', 'text-slate-900 truncate', content)
    content = re.sub(r'text-white font-bold', 'text-slate-900 font-bold', content)
    
    # Fix the active icon hover class issue
    content = re.sub(r'text-slate-400 hover:text-white hover:bg-slate-50', 'text-slate-500 hover:text-slate-900 hover:bg-slate-50', content)

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

for f in files:
    patch_file(f)
print("Header patching done!")
