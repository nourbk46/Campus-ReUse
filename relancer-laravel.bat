@echo off
rem Relance uniquement le serveur Laravel (le site React reste ouvert)
cd /d "%~dp0backend"
set "PATH=C:\php83;%PATH%"
php artisan config:clear --no-ansi > nul 2>&1
start "Laravel" /min cmd /c "php artisan serve --no-ansi > "%~dp0serve.log" 2>&1"
