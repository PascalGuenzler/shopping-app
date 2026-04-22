# Start Backend and Frontend for Shopping App

Write-Host "Starting Shopping App..." -ForegroundColor Green

# Kill any existing node processes on our ports
$ports = @(3001, 5173)
foreach ($port in $ports) {
    $proc = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
    if ($proc) {
        Stop-Process -Id $proc -Force -ErrorAction SilentlyContinue
    }
}
Start-Sleep 1

# Start Backend
Write-Host "  Starting Backend on http://localhost:3001 ..." -ForegroundColor Cyan
$backend = Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory "$PSScriptRoot\backend" -WindowStyle Normal -PassThru
Start-Sleep 3

# Verify backend
$backendOk = $false
try {
    $res = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing -TimeoutSec 5
    if ($res.StatusCode -eq 200) { $backendOk = $true }
} catch {}

if ($backendOk) {
    Write-Host "  Backend OK" -ForegroundColor Green
} else {
    Write-Host "  Backend failed to start!" -ForegroundColor Red
    exit 1
}

# Start Frontend
Write-Host "  Starting Frontend on http://localhost:5173 ..." -ForegroundColor Cyan
$frontend = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npx vite" -WorkingDirectory "$PSScriptRoot\frontend" -WindowStyle Normal -PassThru
Start-Sleep 4

Write-Host ""
Write-Host "App is running!" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "  Backend:  http://localhost:3001" -ForegroundColor Yellow
Write-Host ""
Write-Host "Backend PID:  $($backend.Id)" -ForegroundColor Gray
Write-Host "Frontend PID: $($frontend.Id)" -ForegroundColor Gray
Write-Host ""
Write-Host "Run .\stop.ps1 to stop all servers." -ForegroundColor Gray

# Save PIDs for stop script
"$($backend.Id)" | Out-File "$PSScriptRoot\.backend.pid"
"$($frontend.Id)" | Out-File "$PSScriptRoot\.frontend.pid"
