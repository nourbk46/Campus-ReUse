@echo off
cd /d "%~dp0"
set "PATH=C:\php83;%PATH%"
start "Laravel" /min cmd /c "cd /d "%~dp0backend" && php artisan serve --no-ansi > "%~dp0serve.log" 2>&1"
start "React" /min cmd /c "cd /d "%~dp0frontend" && npm run dev > "%~dp0vite.log" 2>&1"
