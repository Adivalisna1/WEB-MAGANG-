import os
import jwt
from typing import Optional
from fastapi import Request, HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pathlib import Path
from dotenv import load_dotenv
from db import get_db

env_path = Path(__file__).resolve().parent.parent / ".env"
if not env_path.exists():
    env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)
JWT_SECRET = os.getenv("JWT_SECRET")

security = HTTPBearer()
security_optional = HTTPBearer(auto_error=False)

def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Security(security_optional), db = Depends(get_db)):
    if not credentials:
        return None
    try:
        return get_current_user(credentials, db)
    except:
        return None

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security), db = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        # Fetch the latest user data with full role, tingkat, satker, and eselon 1 info
        with db.cursor(dictionary=True) as cursor:
            cursor.execute("""
                SELECT u.id, u.role_id, u.tingkat_id, u.satker_id, u.eselon_1_id, u.nama, u.username, u.email, u.is_active, u.permissions,
                       COALESCE(r.nama, 'operator') AS role,
                       COALESCE(t.kode, 'satker') AS tingkat, COALESCE(t.nama, 'Tingkat Satker') AS tingkat_nama,
                       s.nama AS satker_nama, s.NO_Satker AS satker_kode,
                       ue.id AS unit_eselon_id, ue.kode AS eselon_1_kode, ue.nama AS eselon_1_nama, ue.singkatan AS eselon_1_singkatan
                FROM users u
                LEFT JOIN roles r ON r.id = u.role_id
                LEFT JOIN tingkats t ON t.id = u.tingkat_id
                LEFT JOIN satkers s ON s.id = u.satker_id
                LEFT JOIN unit_eselon_1 ue ON ue.id = COALESCE(u.eselon_1_id, s.eselon_1_id)
                WHERE u.id = %s
            """, (payload['id'],))
            user = cursor.fetchone()
            if not user:
                raise HTTPException(status_code=401, detail="Sesi tidak valid: Akun tidak ditemukan di sistem")
            if not user.get('is_active', 1):
                raise HTTPException(status_code=401, detail="Sesi berakhir: Akun telah dinonaktifkan oleh Administrator")
            
            payload['role_id'] = user['role_id']
            payload['role'] = user['role']
            payload['tingkat_id'] = user['tingkat_id']
            payload['tingkat'] = user['tingkat']
            payload['tingkat_nama'] = user['tingkat_nama']
            payload['satker_id'] = user['satker_id']
            payload['satker_nama'] = user['satker_nama']
            payload['satker_kode'] = user['satker_kode']
            payload['eselon_1_id'] = user['unit_eselon_id'] or user['eselon_1_id']
            payload['eselon_1_kode'] = user['eselon_1_kode']
            payload['eselon_1_nama'] = user['eselon_1_nama']
            payload['eselon_1_singkatan'] = user['eselon_1_singkatan']
            
            # Permissions parsing
            perms = user.get('permissions')
            import json
            if isinstance(perms, str):
                try:
                    perms = json.loads(perms)
                except Exception:
                    perms = {}
            elif not isinstance(perms, dict):
                perms = {}
            payload['permissions'] = perms
            
            # Flag shortcuts for convenient checks
            payload['is_operator'] = (user['role'] == 'operator')
            payload['is_manajemen'] = (user['role'] in ['manajemen', 'administrasi'])
            payload['is_administrasi'] = payload['is_manajemen']  # Backwards compatibility
            
            # IT Admin: Operator tingkat K/L dengan izin can_manage_users, atau legacy role IT
            has_it_perms = bool(perms.get('can_manage_users'))
            is_it = (
                user['role'] in ['it', 'admin_it']
                or user.get('username') == 'it_admin'
                or (user['role'] == 'operator' and user['tingkat'] == 'kl' and has_it_perms)
            )
            payload['is_it'] = is_it
            payload['is_satker'] = (user['tingkat'] == 'satker')
            payload['is_eselon1'] = (user['tingkat'] == 'eselon_1')
            payload['is_kl'] = (user['tingkat'] == 'kl')
                
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token tidak valid")

def require_admin_it(user: dict = Security(get_current_user)):
    """Guard khusus IT Administrator"""
    if not user.get("is_it"):
        raise HTTPException(status_code=403, detail="Forbidden: Hanya IT Administrator yang memiliki akses")
    return user

def require_role(allowed_roles: list):
    """Guard fleksibel berdasarkan role ('operator', 'manajemen', 'administrasi')"""
    def role_checker(user: dict = Security(get_current_user)):
        # IT admin selalu punya akses bypass
        if user.get("is_it") or user.get("role") in ["it", "admin_it"]:
            return user
        expanded_roles = set(allowed_roles)
        if "manajemen" in expanded_roles:
            expanded_roles.add("administrasi")
        if "administrasi" in expanded_roles:
            expanded_roles.add("manajemen")
            
        if user.get("role") not in expanded_roles:
            raise HTTPException(status_code=403, detail=f"Forbidden: Akses membutuhkan role {allowed_roles}")
        return user
    return role_checker

def require_tingkat(allowed_tingkat: list):
    """Guard fleksibel berdasarkan tingkat ('satker', 'eselon_1', 'kl')"""
    def tingkat_checker(user: dict = Security(get_current_user)):
        # IT admin selalu punya akses bypass
        if user.get("is_it") or user.get("role") in ["it", "admin_it"]:
            return user
        if user.get("tingkat") not in allowed_tingkat:
            raise HTTPException(status_code=403, detail=f"Forbidden: Akses khusus tingkat {allowed_tingkat}")
        return user
    return tingkat_checker

def require_role_and_tingkat(allowed_roles: list, allowed_tingkat: list):
    """Guard fleksibel berdasarkan kombinasi role dan tingkat"""
    def combined_checker(user: dict = Security(get_current_user)):
        # IT admin selalu punya akses bypass
        if user.get("is_it") or user.get("role") in ["it", "admin_it"]:
            return user
        expanded_roles = set(allowed_roles)
        if "manajemen" in expanded_roles:
            expanded_roles.add("administrasi")
        if "administrasi" in expanded_roles:
            expanded_roles.add("manajemen")
            
        if user.get("role") not in expanded_roles:
            raise HTTPException(status_code=403, detail=f"Forbidden: Akses membutuhkan role {allowed_roles}")
        if user.get("tingkat") not in allowed_tingkat:
            raise HTTPException(status_code=403, detail=f"Forbidden: Akses khusus tingkat {allowed_tingkat}")
        return user
    return combined_checker

