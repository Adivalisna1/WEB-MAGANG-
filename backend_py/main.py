import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import satker, auth, pencatatan, rekening_koran, dokumen, pimpinan, eselon_1, admin_it, stats, export

app = FastAPI(title="Pencatatan Keuangan API", version="1.0.0")

# Setup CORS aman (mendukung localhost dev, domain kustom, & jaringan lokal Wi-Fi)
raw_origins = os.getenv("ALLOWED_ORIGINS", "") or os.getenv("CORS_ORIGIN", "")
allowed_origins = [o.strip() for o in raw_origins.split(",") if o.strip()] if raw_origins else [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:80",
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(satker.router)
app.include_router(pencatatan.router)
app.include_router(rekening_koran.router)
app.include_router(dokumen.router)
app.include_router(pimpinan.router, prefix="/api/pimpinan", tags=["pimpinan"])
app.include_router(eselon_1.router, prefix="/api/eselon-1", tags=["eselon_1"])
app.include_router(admin_it.router, prefix="/api/admin-it", tags=["admin_it"])
app.include_router(stats.router, prefix="/api/stats", tags=["stats"])
app.include_router(export.router)
from routers import notifikasi, user, kertas_kerja
app.include_router(notifikasi.router, prefix="/api/notifikasi", tags=["notifikasi"])
app.include_router(user.router, prefix="/api/user", tags=["user"])
app.include_router(kertas_kerja.router)

@app.on_event("startup")
def run_startup_migrations():
    try:
        from migrations.add_sk_piutang import run_migration as migrate_sk_piutang
        migrate_sk_piutang()
    except Exception as e:
        print(f"Startup migration notice: {e}")

@app.get("/")
def read_root():
    return {"success": True, "message": "Backend FastAPI berhasil nyala! Ngebut banget kan? 🔥"}

@app.get("/api/health")
def health_check():
    return {"status": "ok", "framework": "FastAPI"}
