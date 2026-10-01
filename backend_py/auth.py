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
        # Fetch the latest user data from DB to match Express behavior
        with db.cursor(dictionary=True) as cursor:
            cursor.execute("SELECT id, role_id, satker_id FROM users WHERE id = %s", (payload['id'],))
            user = cursor.fetchone()
            if user:
                payload['satker_id'] = user['satker_id']
                payload['role_id'] = user['role_id']
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token tidak valid")

def require_admin_it(user: dict = Security(get_current_user)):
    if user.get("role") != "admin_it":
        raise HTTPException(status_code=403, detail="Forbidden: Hanya admin_it")
    return user
