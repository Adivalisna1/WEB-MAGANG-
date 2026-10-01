import os
import re
import shutil

directory = r'c:\Users\adiva\OneDrive\Dokumen\web magang munculin data lokal\backend_py'

# First, let's rename the file
old_file = os.path.join(directory, 'routers', 'rekening_koran.py')
new_file = os.path.join(directory, 'routers', 'rekening_koran.py')
if os.path.exists(old_file):
    shutil.move(old_file, new_file)
    print(f'Moved {old_file} to {new_file}')

# Then let's replace "rekening_koran" with "rekening_koran" in all .py files
def replace_rekening_koran(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    content = content.replace("rekening_koran", "rekening_koran")

    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {file_path}')

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.py'):
            replace_rekening_koran(os.path.join(root, file))
