import mysql.connector
from mysql.connector import pooling
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env dari root folder atau backend_py
env_path = Path(__file__).resolve().parent.parent / ".env"
if not env_path.exists():
    env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

db_config = {
    "host": os.getenv("MYSQL_HOST", "localhost"),
    "port": int(os.getenv("MYSQL_PORT", 3307)),
    "database": os.getenv("MYSQL_DATABASE", "web_laporan"),
    "user": os.getenv("MYSQL_USER", "laporan_user"),
    "password": os.getenv("MYSQL_PASSWORD", "#user223"),
    "pool_name": "mypool",
    "pool_size": 5
}

# Create connection pool
connection_pool = mysql.connector.pooling.MySQLConnectionPool(**db_config)

def get_db():
    conn = connection_pool.get_connection()
    try:
        yield conn
    finally:
        conn.close()
