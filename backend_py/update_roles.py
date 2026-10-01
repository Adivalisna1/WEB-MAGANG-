import os
import re

directories = [
    r'c:\Users\adiva\OneDrive\Dokumen\web magang munculin data lokal\frontend\src',
    r'c:\Users\adiva\OneDrive\Dokumen\web magang munculin data lokal\backend_py\routers'
]

def replace_roles(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    
    # Precise replacements to avoid messing up URLs like /pimpinan
    # Replace single quotes
    content = content.replace("'pimpinan'", "'pimpinan_satker'")
    content = content.replace("'staff'", "'staff_satker'")
    
    # Replace double quotes
    content = content.replace('"pimpinan"', '"pimpinan_satker"')
    content = content.replace('"staff"', '"staff_satker"')

    # Fix specific instances that might be in components or types
    content = content.replace("Pimpinan: 'pimpinan_satker'", "Pimpinan: 'pimpinan_satker'") # if it was replaced
    
    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {file_path}')

for d in directories:
    for root, dirs, files in os.walk(d):
        for file in files:
            if file.endswith('.ts') or file.endswith('.tsx') or file.endswith('.py'):
                replace_roles(os.path.join(root, file))
