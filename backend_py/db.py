import mysql.connector
from mysql.connector import pooling
import os
from dotenv import load_dotenv

# Load .env dari root folder
load_dotenv(dotenv_path="../.env")

db_config = {
    "host": os.getenv("MYSQL_HOST", "localhost"),
    "port": int(os.getenv("MYSQL_PORT", 3306)),
    "database": os.getenv("MYSQL_DATABASE"),
    "user": os.getenv("MYSQL_USER"),
    "password": os.getenv("MYSQL_PASSWORD"),
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
