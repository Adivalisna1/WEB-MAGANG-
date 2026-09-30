from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import satker

app = FastAPI(title="Pencatatan Keuangan API", version="1.0.0")

# Setup CORS biar Next.js bisa connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(satker.router)

@app.get("/")
def read_root():
    return {"success": True, "message": "Backend FastAPI berhasil nyala! Ngebut banget kan? 🔥"}

@app.get("/api/health")
def health_check():
    return {"status": "ok", "framework": "FastAPI"}
