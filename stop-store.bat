@echo off
echo Looking for processes using port 8080...
powershell -NoProfile -Command ^
  "$procs = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique; ^
   if (-not $procs) { Write-Host 'No server is currently listening on port 8080.' } ^
   else { foreach ($p in $procs) { Stop-Process -Id $p -Force -ErrorAction SilentlyContinue; Write-Host ('Stopped process: PID ' + $p) } }"
echo.
echo Done. Port 8080 should now be free.
pause
