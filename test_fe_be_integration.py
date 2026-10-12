import urllib.request
import json

API = 'http://localhost:5000/api'

def req(url, method='GET', data=None, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req_obj = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8') if data else None,
        headers=headers,
        method=method
    )
    with urllib.request.urlopen(req_obj) as resp:
        return json.loads(resp.read().decode('utf-8'))

# Test 1: it_admin
res = req(f'{API}/auth/login', 'POST', {'username': 'it_admin', 'password': 'Password@123'})
assert res['success'] and res['data']['user']['role'] == 'it'
token_it = res['data']['token']
print('1. it_admin login: OK, role =', res['data']['user']['role'], 'tingkat =', res['data']['user']['tingkat'])

# Test 2: operator_satker
res = req(f'{API}/auth/login', 'POST', {'username': 'operator_satker', 'password': 'Password@123'})
assert res['success'] and res['data']['user']['role'] == 'operator' and res['data']['user']['tingkat'] == 'satker'
print('2. operator_satker login: OK, role =', res['data']['user']['role'], 'satker =', res['data']['user']['satker_nama'])

# Test 3: admin_satker
res = req(f'{API}/auth/login', 'POST', {'username': 'admin_satker', 'password': 'Password@123'})
assert res['success'] and res['data']['user']['role'] == 'administrasi' and res['data']['user']['tingkat'] == 'satker'
print('3. admin_satker login: OK, role =', res['data']['user']['role'], 'tingkat =', res['data']['user']['tingkat'])

# Test 4: pimpinan_eselon1
res = req(f'{API}/auth/login', 'POST', {'username': 'pimpinan_eselon1', 'password': 'Password@123'})
assert res['success'] and res['data']['user']['role'] in ('manajemen', 'administrasi') and res['data']['user']['tingkat'] == 'eselon_1'
print('4. pimpinan_eselon1 login: OK, role =', res['data']['user']['role'], 'eselon_1 =', res['data']['user']['eselon_1_singkatan'])

# Test 5: /admin-it/users
res = req(f'{API}/admin-it/users', 'GET', token=token_it)
assert res['success'] and len(res['data']) > 0
print('5. /admin-it/users: OK (', len(res['data']), 'users loaded)')

# Test 6: /admin-it/unit-eselon-1
res = req(f'{API}/admin-it/unit-eselon-1', 'GET', token=token_it)
assert res['success'] and len(res['data']) == 5
print('6. /admin-it/unit-eselon-1: OK (', len(res['data']), 'units loaded)')

print('\n>>> ALL 6 INTEGRATION CHECKS PASSED!')
