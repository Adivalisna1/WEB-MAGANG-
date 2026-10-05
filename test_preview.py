import urllib.request
import urllib.error
import json

def fetch(url, method="GET", data=None, headers={}):
    req = urllib.request.Request(url, method=method, headers=headers)
    if data:
        req.data = json.dumps(data).encode('utf-8')
        req.add_header('Content-Type', 'application/json')
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, response.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')
    except urllib.error.URLError as e:
        return 0, str(e.reason)

# Login
status, body = fetch("http://localhost:5000/api/auth/login", method="POST", data={"username":"pimpinan1", "password":"password123"})
if status != 200:
    print("Login failed:", body)
    exit(1)

token = json.loads(body)["data"]["token"]
print("Token:", token)

# Get docs
status, body = fetch("http://localhost:5000/api/dokumen?status=menunggu_verifikasi&limit=5", headers={"Authorization": f"Bearer {token}"})
docs = json.loads(body)["data"]
print("Docs:", [d["id"] for d in docs])

if not docs:
    exit(0)

first_id = docs[0]["id"]
print("Fetching preview for doc", first_id)

status, body = fetch(f"http://localhost:5000/api/dokumen/{first_id}/preview", headers={"Authorization": f"Bearer {token}"})
print("Preview status:", status)
if status != 200:
    print("Preview error:", body)
