# Stop Backend and Frontend for Shopping App

Write-Host "Stopping Shopping App..." -ForegroundColor Yellow

$stopped = 0

# Stop via saved PIDs
foreach ($pidFile in @(".backend.pid", ".frontend.pid")) {
    $pidPath = "$PSScriptRoot\$pidFile"
    if (Test-Path $pidPath) {
        $savedPid = Get-Content $pidPath -ErrorAction SilentlyContinue
        if ($savedPid) {
            $proc = Get-Process -Id $savedPid -ErrorAction SilentlyContinue
            if ($proc) {
                Stop-Process -Id $savedPid -Force -ErrorAction SilentlyContinue
                Write-Host "  Stopped PID $savedPid ($($proc.Name))" -ForegroundColor Cyan
                $stopped++
            }
        }
        Remove-Item $pidPath -Force -ErrorAction SilentlyContinue
    }
}

# Also kill anything still on ports 3001 / 5173
foreach ($port in @(3001, 5173)) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -ErrorAction SilentlyContinue
    if ($conn) {
        Stop-Process -Id $conn -Force -ErrorAction SilentlyContinue
        Write-Host "  Killed process on port $port (PID $conn)" -ForegroundColor Cyan
        $stopped++
    }
}

if ($stopped -eq 0) {
    Write-Host "  No running servers found." -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "All servers stopped." -ForegroundColor Green
}
