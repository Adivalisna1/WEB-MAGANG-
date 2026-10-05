import re

diff = open('patch.diff', encoding='utf-8').read()
orig = open('frontend/src/app/pimpinan/dokumen/page.tsx', encoding='utf-8').read().splitlines()

lines = diff.splitlines()
hunks = []
cur = None

for l in lines:
    if l.startswith('@@'):
        m = re.match(r'@@ -(\d+),(\d+) \+(\d+),(\d+) @@', l)
        cur = {
            'old_start': int(m.group(1)),
            'old_len': int(m.group(2)),
            'new_start': int(m.group(3)),
            'new_len': int(m.group(4)),
            'lines': []
        }
        hunks.append(cur)
    elif cur is not None:
        cur['lines'].append(l)

offset = 0
for h in hunks:
    start = h['old_start'] - 1 + offset
    end = start + h['old_len']
    new_lines = []
    
    for l in h['lines']:
        if l.startswith('+'):
            new_lines.append(l[1:])
        elif l.startswith(' '):
            new_lines.append(l[1:])
        elif not l.startswith('-') and l != '\\ No newline at end of file':
            new_lines.append(l)
    
    # If this is the last truncated hunk, it might miss some context lines at the end.
    # We will just append the missing `  );` and `}` manually!
    
    orig[start:end] = new_lines
    offset += len(new_lines) - h['old_len']

open('frontend/src/app/pimpinan/dokumen/page.tsx', 'w', encoding='utf-8').write('\n'.join(orig))
print("Patched!")
