@echo off
rem Démarre MySQL de XAMPP dans une fenêtre réduite (équivalent du bouton Start de XAMPP)
start "MySQL XAMPP" /min cmd /c "cd /d C:\xampp && mysql_start.bat"
