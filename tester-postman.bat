@echo off
cd /d "%~dp0"
set "PATH=C:\php83;%PATH%"
(
curl -s -o nul -w "backend: %%{http_code}\n" http://127.0.0.1:8000/up
) > "%~dp0newman.log" 2>&1
curl -s -o nul http://127.0.0.1:8000/up || start "Laravel" /min cmd /c "cd /d "%~dp0backend" && php artisan serve --no-ansi > "%~dp0serve.log" 2>&1"
timeout /t 4 >nul
call npx -y newman run "postman\Campus-ReUse-Tests.postman_collection.json" --working-dir postman --reporter-cli-no-banner --color off >> "%~dp0newman.log" 2>&1 < nul
echo FIN %errorlevel% >> "%~dp0newman.log"
