@echo off
setlocal
cd /d "%~dp0"
if errorlevel 1 goto folder_error

where node.exe >nul 2>nul
if errorlevel 1 goto node_error
where npm.cmd >nul 2>nul
if errorlevel 1 goto node_error

echo Memasang paket proyek. Pastikan internet aktif.
echo Ini hanya diperlukan jika paket belum ada atau setelah dependensi berubah.
echo.
call npm.cmd install
if errorlevel 1 goto install_error

echo.
echo Paket selesai dipasang. Buka BUKA_PREVIEW.bat untuk melihat video.
echo.
pause
exit /b 0

:folder_error
echo Gagal membuka folder proyek.
goto failure
:node_error
echo Node.js atau npm tidak ditemukan. Install Node.js LTS lalu buka kembali jendela ini.
goto failure
:install_error
echo Pemasangan gagal. Periksa koneksi internet dan pesan kesalahan di atas.
:failure
echo.
pause
exit /b 1
