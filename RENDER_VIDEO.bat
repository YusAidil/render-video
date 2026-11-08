@echo off
setlocal
cd /d "%~dp0"
if errorlevel 1 goto folder_error

where node.exe >nul 2>nul
if errorlevel 1 goto node_error
where npm.cmd >nul 2>nul
if errorlevel 1 goto node_error
if not exist "node_modules\@remotion\cli\package.json" goto package_error

if not exist "hasil\" mkdir "hasil"
if not exist "hasil\" goto output_error
set "timestamp="
for /f "delims=" %%T in ('powershell.exe -NoProfile -Command "Get-Date -Format yyyyMMdd-HHmmss"') do set "timestamp=%%T"
if not defined timestamp goto time_error
set "output=hasil\video-%timestamp%.mp4"

echo Render dimulai. Proses ini bisa membutuhkan beberapa waktu.
echo Jika ada beberapa video, pilih nama video lalu tekan Enter.
echo.
call npm.cmd run render -- --output "%output%" --overwrite=false --concurrency=1
if errorlevel 1 goto render_error
if not exist "%output%" goto render_error

echo.
echo SELESAI. Video tersimpan di:
echo %CD%\%output%
echo.
pause
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
:output_error
echo Folder hasil tidak dapat dibuat. Periksa izin penyimpanan dan ruang disk.
goto failure
:time_error
echo Waktu untuk nama file tidak dapat dibaca. Periksa PowerShell di Windows.
goto failure
:render_error
echo Render gagal. Periksa pesan kesalahan di atas.
:failure
echo.
pause
exit /b 1
