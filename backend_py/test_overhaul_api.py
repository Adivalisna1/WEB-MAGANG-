import urllib.request
import urllib.error
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://localhost:5000"

def log(msg, status="INFO"):
    symbol = "ℹ️" if status == "INFO" else "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
    print(f"{symbol} [{status}] {msg}")

def request_json(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    
    encoded_data = None
    if data is not None:
        encoded_data = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            res_body = response.read().decode("utf-8")
            res_json = json.loads(res_body) if res_body else {}
            return response.status, res_json
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        try:
            err_json = json.loads(err_body)
        except Exception:
            err_json = {"raw": err_body}
        return e.code, err_json
    except Exception as e:
        return 0, {"error": str(e)}

def run_tests():
    print("=" * 65)
    print("🧪 AUTOMATED OVERHAUL TEST: 3 ROLE x 3 TINGKAT + ENDPOINTS")
    print("=" * 65)
    
    test_accounts = [
        {"username": "staff_satker", "expected_role": "operator", "expected_tingkat": "satker"},
        {"username": "pimpinan_satker", "expected_role": "manajemen", "expected_tingkat": "satker"},
        {"username": "staff_eselon1", "expected_role": "operator", "expected_tingkat": "eselon_1"},
        {"username": "pimpinan_eselon1", "expected_role": "manajemen", "expected_tingkat": "eselon_1"},
        {"username": "operator_kl", "expected_role": "operator", "expected_tingkat": "kl"},
        {"username": "admin_kl", "expected_role": "manajemen", "expected_tingkat": "kl"},
        {"username": "it_admin", "expected_role": "operator", "expected_tingkat": "kl"},
        {"username": "naufal", "expected_role": "operator", "expected_tingkat": "kl"},
    ]
    
    tokens = {}
    passed = 0
    failed = 0

    # 1. TEST LOGIN FOR ALL ACCOUNTS
    log("MEMULAI PENGUJIAN LOGIN AKUN PENGUJIAN...", "INFO")
    for acc in test_accounts:
        username = acc["username"]
        payload = {
            "username": username,
            "password": "Password@123"
        }
        status, data = request_json(f"{BASE_URL}/api/auth/login", method="POST", data=payload)
        if status == 200:
            token = data.get("token") or data.get("data", {}).get("token")
            user = data.get("user") or data.get("data", {}).get("user", {})
            
            actual_role = user.get("role")
            actual_tingkat = user.get("tingkat")
            
            if actual_role == acc["expected_role"] and actual_tingkat == acc["expected_tingkat"]:
                log(f"Login '{username}': Berhasil! Role={actual_role}, Tingkat={actual_tingkat}", "PASS")
                tokens[username] = token
                passed += 1
            else:
                log(f"Login '{username}': Mismatch! Expected Role={acc['expected_role']}/Tingkat={acc['expected_tingkat']}, Got Role={actual_role}/Tingkat={actual_tingkat}", "FAIL")
                failed += 1
        else:
            log(f"Login '{username}': Gagal HTTP {status} - {data}", "FAIL")
            failed += 1

    # 2. TEST /api/auth/me ENDPOINT FOR ALL LOGGED IN USERS
    log("\nMEMULAI PENGUJIAN /api/auth/me...", "INFO")
    for username, token in tokens.items():
        headers = {"Authorization": f"Bearer {token}"}
        status, data = request_json(f"{BASE_URL}/api/auth/me", method="GET", headers=headers)
        if status == 200:
            passed += 1
        else:
            log(f"/api/auth/me untuk '{username}': Gagal HTTP {status}", "FAIL")
            failed += 1
    log(f"Semua ({len(tokens)}) token pengguna berhasil divalidasi via /api/auth/me", "PASS")

    # 3. TEST ROLE GUARDS (AUTHORIZATION BOUNDARIES)
    log("\nMEMULAI PENGUJIAN ROLE GUARDS...", "INFO")
    
    # 3a. Admin IT Stats by it_admin -> should be 200 OK
    it_token = tokens.get("it_admin")
    if it_token:
        headers = {"Authorization": f"Bearer {it_token}"}
        status, data = request_json(f"{BASE_URL}/api/admin-it/stats", method="GET", headers=headers)
        if status == 200:
            log("Akses /api/admin-it/stats oleh it_admin: 200 OK", "PASS")
            passed += 1
        else:
            log(f"Akses /api/admin-it/stats oleh it_admin gagal: HTTP {status} {data}", "FAIL")
            failed += 1
            
        status, data = request_json(f"{BASE_URL}/api/admin-it/roles", method="GET", headers=headers)
        roles = data.get("data", [])
        if status == 200 and len(roles) == 2:
            log(f"Akses /api/admin-it/roles: 200 OK (Ditemukan {len(roles)} roles: {[r['nama'] for r in roles]})", "PASS")
            passed += 1
        else:
            log(f"Akses /api/admin-it/roles gagal: HTTP {status} (roles: {len(roles)})", "FAIL")
            failed += 1

        # 3c. Admin IT Tingkats endpoint -> should be 200 OK
        status, data = request_json(f"{BASE_URL}/api/admin-it/tingkats", method="GET", headers=headers)
        tingkats = data.get("data", [])
        if status == 200 and len(tingkats) >= 3:
            log(f"Akses /api/admin-it/tingkats: 200 OK (Ditemukan {len(tingkats)} tingkats)", "PASS")
            passed += 1
        else:
            log(f"Akses /api/admin-it/tingkats gagal: HTTP {status}", "FAIL")
            failed += 1

    # 3d. Staff Satker mencoba akses /api/admin-it/stats -> should be 403 Forbidden
    op_token = tokens.get("staff_satker")
    if op_token:
        headers = {"Authorization": f"Bearer {op_token}"}
        status, data = request_json(f"{BASE_URL}/api/admin-it/stats", method="GET", headers=headers)
        if status == 403:
            log("Security Guard: Operator Satker diblokir dari /api/admin-it/stats (403 Forbidden)", "PASS")
            passed += 1
        else:
            log(f"Security Breach! Operator Satker mendapat HTTP {status} saat akses /api/admin-it/stats", "FAIL")
            failed += 1

    # 3e. Eselon 1 Units access by pimpinan_eselon1 -> should be 200 OK
    eselon1_token = tokens.get("pimpinan_eselon1")
    if eselon1_token:
        headers = {"Authorization": f"Bearer {eselon1_token}"}
        status, data = request_json(f"{BASE_URL}/api/eselon-1/units", method="GET", headers=headers)
        if status == 200:
            units = data.get("data", [])
            log(f"Akses /api/eselon-1/units oleh pimpinan_eselon1: 200 OK ({len(units)} unit)", "PASS")
            passed += 1
        else:
            log(f"Akses /api/eselon-1/units oleh pimpinan_eselon1 gagal: HTTP {status}", "FAIL")
            failed += 1

        # 3f. Eselon 1 Stats by pimpinan_eselon1 -> 200 OK
        status, data = request_json(f"{BASE_URL}/api/eselon-1/stats", method="GET", headers=headers)
        if status == 200:
            log("Akses /api/eselon-1/stats oleh pimpinan_eselon1: 200 OK", "PASS")
            passed += 1
        else:
            log(f"Akses /api/eselon-1/stats gagal: HTTP {status}", "FAIL")
            failed += 1

        # 3g. Eselon 1 Dokumen by pimpinan_eselon1 -> 200 OK
        status, data = request_json(f"{BASE_URL}/api/eselon-1/dokumen", method="GET", headers=headers)
        if status == 200:
            log("Akses /api/eselon-1/dokumen oleh pimpinan_eselon1: 200 OK", "PASS")
            passed += 1
        else:
            log(f"Akses /api/eselon-1/dokumen gagal: HTTP {status}", "FAIL")
            failed += 1

        # 3h. Eselon 1 block from admin-it
        status, data = request_json(f"{BASE_URL}/api/admin-it/stats", method="GET", headers=headers)
        if status == 403:
            log("Security Guard: pimpinan_eselon1 diblokir dari /api/admin-it/stats (403 Forbidden)", "PASS")
            passed += 1
        else:
            log(f"Security Breach! pimpinan_eselon1 mendapat HTTP {status} saat akses /api/admin-it/stats", "FAIL")
            failed += 1

    # 3i. Staff Satker access /api/dokumen/all -> 200 OK
    if op_token:
        headers = {"Authorization": f"Bearer {op_token}"}
        status, data = request_json(f"{BASE_URL}/api/dokumen/all", method="GET", headers=headers)
        if status == 200:
            log("Akses /api/dokumen/all oleh staff_satker: 200 OK", "PASS")
            passed += 1
        else:
            log(f"Akses /api/dokumen/all oleh staff_satker gagal: HTTP {status}", "FAIL")
            failed += 1

        # 3j. Staff Satker blocked from /api/eselon-1/stats -> 403 Forbidden
        status, data = request_json(f"{BASE_URL}/api/eselon-1/stats", method="GET", headers=headers)
        if status == 403:
            log("Security Guard: staff_satker diblokir dari /api/eselon-1/stats (403 Forbidden)", "PASS")
            passed += 1
        else:
            log(f"Security Breach! staff_satker mendapat HTTP {status} saat akses /api/eselon-1/stats", "FAIL")
            failed += 1

    # 3k. Pimpinan Satker tests
    admin_satker_token = tokens.get("pimpinan_satker")
    if admin_satker_token:
        headers = {"Authorization": f"Bearer {admin_satker_token}"}
        # /api/pimpinan/stats -> 200 OK
        status, data = request_json(f"{BASE_URL}/api/pimpinan/stats", method="GET", headers=headers)
        if status == 200:
            log("Akses /api/pimpinan/stats oleh pimpinan_satker: 200 OK", "PASS")
            passed += 1
        else:
            log(f"Akses /api/pimpinan/stats oleh pimpinan_satker gagal: HTTP {status}", "FAIL")
            failed += 1

        # /api/pimpinan/dokumen -> 200 OK
        status, data = request_json(f"{BASE_URL}/api/pimpinan/dokumen", method="GET", headers=headers)
        if status == 200:
            log("Akses /api/pimpinan/dokumen oleh pimpinan_satker: 200 OK", "PASS")
            passed += 1
        else:
            log(f"Akses /api/pimpinan/dokumen oleh pimpinan_satker gagal: HTTP {status}", "FAIL")
            failed += 1

        # Blocked from /api/admin-it/stats -> 403 Forbidden
        status, data = request_json(f"{BASE_URL}/api/admin-it/stats", method="GET", headers=headers)
        if status == 403:
            log("Security Guard: pimpinan_satker diblokir dari /api/admin-it/stats (403 Forbidden)", "PASS")
            passed += 1
        else:
            log(f"Security Breach! pimpinan_satker mendapat HTTP {status} saat akses /api/admin-it/stats", "FAIL")
            failed += 1

    # 3l. Admin KL tests
    kl_token = tokens.get("admin_kl")
    if kl_token:
        headers = {"Authorization": f"Bearer {kl_token}"}
        # KL should be allowed to view eselon-1 stats (KL oversight) -> 200 OK
        status, data = request_json(f"{BASE_URL}/api/eselon-1/stats", method="GET", headers=headers)
        if status == 200:
            log("Akses /api/eselon-1/stats oleh admin_kl: 200 OK (KL Oversight)", "PASS")
            passed += 1
        else:
            log(f"Akses /api/eselon-1/stats oleh admin_kl gagal: HTTP {status}", "FAIL")
            failed += 1

    print("=" * 65)
    print(f"HASIL PENGUJIAN: {passed} PASSED, {failed} FAILED")
    print("=" * 65)
    
    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_tests()

