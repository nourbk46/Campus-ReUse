@echo off
cd /d "%~dp0backend"
set "PATH=C:\php83;%PATH%"
(
echo === DONNEES DE DEMO ===
php artisan db:seed --class=DemoSeeder --force --no-ansi
) > "%~dp0demo.log" 2>&1 < nul
echo FIN >> "%~dp0demo.log"
