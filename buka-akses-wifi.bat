@echo off
title Buka Akses Web untuk Wi-Fi Lokal (Firewall Setup)

:: Cek apakah dijalankan sebagai Administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Meminta izin Administrator untuk membuka port 3000 dan 5000 di Firewall...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

cls
echo ==============================================================================
echo   MEMBUKA AKSES FIREWALL WINDOWS UNTUK WEB LAPORAN (PORT 3000 ^& 5000)
echo ==============================================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "if (-not (Get-NetFirewallRule -DisplayName 'Web Laporan Frontend (3000)' -ErrorAction SilentlyContinue)) { New-NetFirewallRule -DisplayName 'Web Laporan Frontend (3000)' -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -Profile Any | Out-Null; Write-Host '[OK] Port 3000 (Frontend) berhasil dibuka.' -ForegroundColor Green } else { Write-Host '[OK] Port 3000 (Frontend) sudah terbuka.' -ForegroundColor Cyan };" ^
  "if (-not (Get-NetFirewallRule -DisplayName 'Web Laporan Backend (5000)' -ErrorAction SilentlyContinue)) { New-NetFirewallRule -DisplayName 'Web Laporan Backend (5000)' -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow -Profile Any | Out-Null; Write-Host '[OK] Port 5000 (Backend) berhasil dibuka.' -ForegroundColor Green } else { Write-Host '[OK] Port 5000 (Backend) sudah terbuka.' -ForegroundColor Cyan }"

echo.
echo ==============================================================================
echo   ALAMAT LINK UNTUK DIBAGIKAN KE HP / LAPTOP TEMAN (SATU WI-FI):
echo ==============================================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -like '*Wi-Fi*' -and $_.IPAddress -notlike '169.254.*' } | Select-Object -First 1 -ExpandProperty IPAddress);" ^
  "if ($ip) { Write-Host ('  Link Web : http://' + $ip + ':3000') -ForegroundColor Yellow; Write-Host ('  Link API : http://' + $ip + ':5000/docs') -ForegroundColor Gray } else { Write-Host '  [!] IP Wi-Fi tidak ditemukan.' -ForegroundColor Red }"

echo.
echo ==============================================================================
echo   CATATAN:
echo   1. Pastikan Docker / jalankan-web.bat sudah dinyalakan.
echo   2. Pastikan alamat di browser pakai HTTP (bukan HTTPS) dan TITIK DUA (:3000).
echo   3. Pastikan HP / Laptop teman terhubung di Wi-Fi yang sama.
echo ==============================================================================
echo.
pause
