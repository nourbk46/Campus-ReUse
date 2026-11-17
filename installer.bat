@echo off
chcp 65001 >nul
title Campus ReUse - Installation
cd /d "%~dp0"

echo ============================================
echo   Campus ReUse - Installation (Sprint 1)
echo ============================================
echo.

REM ---- PHP (on prefere C:\php83 : PHP 8.3) ----
if exist "C:\php83\php.exe" set "PATH=C:\php83;%PATH%"
where php >nul 2>nul || set "PATH=C:\xampp\php;%PATH%"
where php >nul 2>nul || (echo [ERREUR] PHP introuvable. Installe XAMPP dans C:\xampp. & pause & exit /b 1)
php -r "exit(version_compare(PHP_VERSION,'8.2.0','>=')?0:1);" || (echo [ERREUR] PHP 8.2 minimum requis. Version actuelle : & php -v & pause & exit /b 1)

REM ---- Extensions PHP necessaires (zip pour Composer, fileinfo pour les photos) ----
for %%E in (fileinfo pdo_mysql mbstring openssl) do (
  php -r "exit(extension_loaded('%%E')?0:1);" || (echo [ERREUR] Extension PHP "%%E" desactivee. Ouvre C:\xampp\php\php.ini, enleve le ; devant extension=%%E, enregistre et relance. & pause & exit /b 1)
)

REM ---- Composer ----
set "CMP=composer"
where composer >nul 2>nul || set "CMP=php C:\xampp\php\composer.phar"
if not "%CMP%"=="composer" if not exist "C:\xampp\php\composer.phar" (echo [ERREUR] Composer introuvable. Installe Composer-Setup.exe depuis getcomposer.org & pause & exit /b 1)

REM ---- Node ----
where npm >nul 2>nul || (echo [ERREUR] Node.js introuvable. Installe Node.js LTS depuis nodejs.org & pause & exit /b 1)
node -e "process.exit(parseInt(process.versions.node)>=20?0:1)" || (echo [ERREUR] Node.js 20 minimum requis. Version actuelle : & node -v & echo Installe Node.js LTS depuis nodejs.org & pause & exit /b 1)

REM ---- Base MySQL ----
echo [1/6] Creation de la base campus_reuse_s1...
"C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS campus_reuse_s1 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if errorlevel 1 (echo [ERREUR] MySQL ne repond pas. Ouvre XAMPP et clique Start sur MySQL, puis relance installer.bat & pause & exit /b 1)

REM ---- Backend ----
cd /d "%~dp0backend"
if not exist .env (copy .env.example .env >nul & set "NEWKEY=1")

echo [2/6] Installation des dependances Laravel (quelques minutes)...
call %CMP% install --no-interaction
if errorlevel 1 (echo [ERREUR] composer install a echoue. Voir le message ci-dessus. & pause & exit /b 1)
if defined NEWKEY php artisan key:generate

echo [3/6] Creation des tables...
php artisan migrate --force
if errorlevel 1 (echo [ERREUR] Migration echouee. & pause & exit /b 1)

echo [4/6] Comptes de test...
php artisan db:seed --force

echo [5/6] Lien de stockage des photos...
php artisan storage:link

REM ---- Frontend ----
echo [6/6] Installation des dependances React...
cd /d "%~dp0frontend"
call npm install
if errorlevel 1 (echo [ERREUR] npm install a echoue. & pause & exit /b 1)

echo.
echo ============================================
echo   Installation terminee !
echo   Lance maintenant : lancer.bat
echo ============================================
pause
