@echo off
chcp 65001 >nul
cd /d "%~dp0backend"
if exist "C:\php83\php.exe" set "PATH=C:\php83;%PATH%"
"C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS campus_reuse_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo Tests Sprints 1 a 5...
php artisan test --filter="Sprint1Test|Sprint2Test|Sprint3Test|Sprint4Test|FavorisTest|AdminTest"
pause
