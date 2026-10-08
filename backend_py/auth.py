import os
import jwt
from fastapi import Request, HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from db import get_db

load_dotenv(dotenv_path="../.env")
JWT_SECRET = os.getenv("JWT_SECRET")

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security), db = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        # Fetch the latest user data with full role, tingkat, satker, and eselon 1 info
        with db.cursor(dictionary=True) as cursor:
            cursor.execute("""
                SELECT u.id, u.role_id, u.tingkat_id, u.satker_id, u.eselon_1_id, u.nama, u.username, u.email,
                       r.nama AS role, t.kode AS tingkat, t.nama AS tingkat_nama,
                       s.nama AS satker_nama, s.NO_Satker AS satker_kode,
                       ue.id AS unit_eselon_id, ue.kode AS eselon_1_kode, ue.nama AS eselon_1_nama, ue.singkatan AS eselon_1_singkatan
                FROM users u
                JOIN roles r ON r.id = u.role_id
                JOIN tingkats t ON t.id = u.tingkat_id
                LEFT JOIN satkers s ON s.id = u.satker_id
                LEFT JOIN unit_eselon_1 ue ON ue.id = COALESCE(u.eselon_1_id, s.eselon_1_id)
                WHERE u.id = %s
            """, (payload['id'],))
            user = cursor.fetchone()
            if user:
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
                
                # Flag shortcuts for convenient checks
                payload['is_operator'] = (user['role'] == 'operator')
                payload['is_administrasi'] = (user['role'] == 'administrasi')
                payload['is_it'] = (user['role'] in ['it', 'admin_it'])
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
    if user.get("role") not in ["it", "admin_it"] and user.get("role_id") not in [3, 4]:
        raise HTTPException(status_code=403, detail="Forbidden: Hanya IT Administrator yang memiliki akses")
    return user

def require_role(allowed_roles: list):
    """Guard fleksibel berdasarkan role ('operator', 'administrasi', 'it')"""
    def role_checker(user: dict = Security(get_current_user)):
        # IT admin selalu punya akses bypass
        if user.get("role") in ["it", "admin_it"]:
            return user
        if user.get("role") not in allowed_roles:
            raise HTTPException(status_code=403, detail=f"Forbidden: Akses membutuhkan role {allowed_roles}")
        return user
    return role_checker

def require_tingkat(allowed_tingkat: list):
    """Guard fleksibel berdasarkan tingkat ('satker', 'eselon_1', 'kl')"""
    def tingkat_checker(user: dict = Security(get_current_user)):
        # IT admin selalu punya akses bypass
        if user.get("role") in ["it", "admin_it"]:
            return user
        if user.get("tingkat") not in allowed_tingkat:
            raise HTTPException(status_code=403, detail=f"Forbidden: Akses khusus tingkat {allowed_tingkat}")
        return user
    return tingkat_checker
