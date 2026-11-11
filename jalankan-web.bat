@echo off
title Menjalankan Web Laporan Keuangan...
cls
echo ==============================================================================
echo   MENYALAKAN SEMUA CONTAINER DOCKER (DATABASE, BACKEND, FRONTEND)...
echo ==============================================================================
echo.

docker compose up -d

echo.
echo ==============================================================================
echo   MENCARI ALAMAT IP WI-FI LAPTOP ANDA...
echo ==============================================================================

setlocal enabledelayedexpansion
set IP_WIFI=

REM Mengambil IP Address aktif dari ipconfig (mengabaikan VirtualBox / adapter dummy)
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set temp_ip=%%a
    set temp_ip=!temp_ip: =!
    if not "!temp_ip!"=="" (
        echo !temp_ip! | findstr /v "192.168.56. 127.0.0.1 169.254." >nul
        if not errorlevel 1 (
            if "!IP_WIFI!"=="" set IP_WIFI=!temp_ip!
        )
    )
)

cls
echo ==============================================================================
echo   [OK] SEMUA SERVICE WEB TELAH AKTIF DAN BERJALAN!
echo ==============================================================================
echo.
echo   [1] AKSES DARI LAPTOP INI (PRIBADI):
echo       - Web Dashboard   : http://localhost:3000
echo       - Backend API Doc : http://localhost:5000/docs
echo.
echo   [2] AKSES DARI HP / LAPTOP TEMAN (SATU WI-FI):
if "%IP_WIFI%"=="" (
    echo       [!] IP Wi-Fi tidak terdeteksi. Pastikan laptop terhubung ke Wi-Fi.
    echo           Gunakan http://localhost:3000 untuk akses lokal.
) else (
    echo       - Web Dashboard   : http://%IP_WIFI%:3000
    echo       - Backend API     : http://%IP_WIFI%:5000/docs
)
echo.
echo ==============================================================================
echo   CATATAN PENTING:
echo   - Pastikan HP / Laptop teman terhubung ke Wi-Fi yang sama persis.
echo   - Jika teman gagal membuka link (Can't be reached), pastikan profil
echo     Wi-Fi disetel ke 'Private' atau izinkan port 3000 di Windows Firewall.
echo ==============================================================================
echo.
pause
