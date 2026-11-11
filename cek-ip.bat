@echo off
title Cek Alamat IP dan URL Web
cls
setlocal enabledelayedexpansion
set IP_WIFI=

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

echo ==============================================================================
echo   INFORMASI ALAMAT AKSES WEB LAPORAN KEUANGAN
echo ==============================================================================
echo.
echo   [1] AKSES DARI LAPTOP SENDIRI:
echo       - Web Dashboard : http://localhost:3000
echo.
echo   [2] AKSES DARI HP / LAPTOP TEMAN (SATU WI-FI):
if "%IP_WIFI%"=="" (
    echo       [!] IP Wi-Fi tidak terdeteksi. Hubungkan laptop ke Wi-Fi terlebih dahulu.
) else (
    echo       - Web Dashboard : http://%IP_WIFI%:3000
    echo       - Backend Docs  : http://%IP_WIFI%:5000/docs
)
echo.
echo ==============================================================================
echo.
pause
