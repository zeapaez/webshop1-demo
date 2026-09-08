@echo off
cd /d "%~dp0"
echo Starting local server at http://localhost:8080 ...
start "NimbusStore - local server (do not close)" cmd /k python -m http.server 8080
timeout /t 1 /nobreak >nul
start "" http://localhost:8080/login.html
