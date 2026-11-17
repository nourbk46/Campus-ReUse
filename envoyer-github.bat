@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Envoyer Campus ReUse sur GitHub

if not exist ".git" (
  echo Creation du depot Git local...
  git init -b main
)

rem Securite : le fichier .env (mots de passe) ne doit jamais partir
git add -A
git ls-files --cached --error-unmatch backend/.env >nul 2>&1
if not errorlevel 1 (
  echo.
  echo [STOP] backend/.env serait envoye sur GitHub. Rien n'a ete envoye.
  git rm --cached backend/.env >nul 2>&1
  pause
  exit /b 1
)

set "MSG="
set /p MSG=Message du commit (Entree = "Mise a jour du projet") : 
if "%MSG%"=="" set "MSG=Mise a jour du projet"
git commit -m "%MSG%"

git remote get-url origin >nul 2>&1
if errorlevel 1 goto demander_url
goto envoyer

:demander_url
echo.
set "URL="
set /p URL=Colle l'adresse de ton depot GitHub (ex. https://github.com/nourbk46/campus-reuse.git) : 
if "%URL%"=="" goto demander_url
git remote add origin %URL%

:envoyer
echo.
echo Envoi vers GitHub (une fenetre de connexion GitHub peut s'ouvrir)...
git push -u origin main
echo.
if errorlevel 1 (echo [ERREUR] L'envoi a echoue : lis le message ci-dessus.) else (echo [OK] Projet envoye sur GitHub !)
pause
