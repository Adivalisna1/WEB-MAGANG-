import os
import jwt
from fastapi import Request, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env")
JWT_SECRET = os.getenv("JWT_SECRET")

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload  # Ini isinya id, role, permissions, dll. persis kayak Express
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token tidak valid")

def require_admin_it(user: dict = Security(get_current_user)):
    if user.get("role") != "admin_it":
        raise HTTPException(status_code=403, detail="Forbidden: Hanya admin_it")
    return user
