@echo off
setlocal
cd /d "%~dp0"
if errorlevel 1 goto folder_error

where node.exe >nul 2>nul
if errorlevel 1 goto node_error
where npm.cmd >nul 2>nul
if errorlevel 1 goto node_error
if not exist "node_modules\@remotion\cli\package.json" goto package_error

echo Membuka preview video di browser...
echo Tutup jendela ini setelah selesai melihat preview.
echo.
call npm.cmd run start
if errorlevel 1 goto preview_error
exit /b 0

:folder_error
echo Gagal membuka folder proyek.
goto failure
:node_error
echo Node.js atau npm tidak ditemukan. Install Node.js LTS lalu buka kembali jendela ini.
goto failure
:package_error
echo Paket proyek belum tersedia. Jalankan PASANG_PAKET.bat terlebih dahulu.
goto failure
:preview_error
echo Preview gagal dibuka. Periksa pesan kesalahan di atas.
:failure
echo.
pause
exit /b 1
