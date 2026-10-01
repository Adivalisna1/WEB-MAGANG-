from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import satker, auth, pencatatan, rekening_koran, dokumen, pimpinan, eselon_1, admin_it, stats

app = FastAPI(title="Pencatatan Keuangan API", version="1.0.0")

# Setup CORS biar Next.js bisa connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
from routers import notifikasi, user
app.include_router(notifikasi.router, prefix="/api/notifikasi", tags=["notifikasi"])
app.include_router(user.router, prefix="/api/user", tags=["user"])

@app.get("/")
def read_root():
    return {"success": True, "message": "Backend FastAPI berhasil nyala! Ngebut banget kan? 🔥"}

@app.get("/api/health")
def health_check():
    return {"status": "ok", "framework": "FastAPI"}
