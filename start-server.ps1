# StarWebFlow Production Server Starter
# Calistirilacak komut: powershell -ExecutionPolicy Bypass -File start-server.ps1

$ProjectDir = "c:\Users\sinan\Desktop\projeler\starwebflow"
$LogFile = "$ProjectDir\server-output.log"

while ($true) {
    Write-Host "[$(Get-Date)] Starting server..." -ForegroundColor Green
    
    $process = Start-Process -FilePath "node" `
        -ArgumentList "server.js" `
        -WorkingDirectory $ProjectDir `
        -RedirectStandardOutput $LogFile `
        -RedirectStandardError "$ProjectDir\server-error.log" `
        -PassThru -NoNewWindow
    
    Write-Host "[$(Get-Date)] Server PID: $($process.Id)" -ForegroundColor Cyan
    $process.WaitForExit()
    
    Write-Host "[$(Get-Date)] Server crashed (exit: $($process.ExitCode)). Restarting in 3s..." -ForegroundColor Red
    Start-Sleep -Seconds 3
}
