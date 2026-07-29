$ErrorActionPreference = "Stop"
$projectDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $projectDir

$nodeDir = "C:\Program Files\nodejs"
$node = Join-Path $nodeDir "node.exe"
$npm = Join-Path $nodeDir "npm.cmd"
$cf = Join-Path $env:TEMP "cloudflared.exe"
$git = Join-Path $env:TEMP "MinGit\cmd\git.exe"
$logFile = Join-Path $env:TEMP "nazorat-tunnel.log"

if (-not (Test-Path $node)) { throw "Node.js topilmadi. https://nodejs.org dan o'rnating." }
if (-not (Test-Path $cf)) {
  Write-Host "cloudflared yuklanmoqda..."
  Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile $cf -UseBasicParsing
}

if (-not (Test-Path "node_modules")) { & $npm install }
if (-not (Test-Path ".env") -and (Test-Path ".env.example")) { Copy-Item ".env.example" ".env" }

# Stop old processes on port 3000
$conn = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($conn) { Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue; Start-Sleep 1 }

# Start server
$server = Start-Process -FilePath $node -ArgumentList "server.js" -WorkingDirectory $projectDir -WindowStyle Minimized -PassThru
Start-Sleep 2

# Start tunnel and capture URL
Remove-Item $logFile -ErrorAction SilentlyContinue
Remove-Item ($logFile + ".err") -ErrorAction SilentlyContinue
$tunnel = Start-Process -FilePath $cf -ArgumentList "tunnel --url http://localhost:3000 --no-autoupdate" -RedirectStandardOutput $logFile -RedirectStandardError ($logFile + ".err") -WindowStyle Hidden -PassThru

$publicUrl = $null
for ($i = 0; $i -lt 30; $i++) {
  Start-Sleep 1
  if (Test-Path $logFile) {
    $content = Get-Content $logFile -Raw -ErrorAction SilentlyContinue
    if ($content -match "(https://[a-z0-9-]+\.trycloudflare\.com)") {
      $publicUrl = $Matches[1]
      break
    }
  }
  if (Test-Path ($logFile + ".err")) {
    $content = Get-Content ($logFile + ".err") -Raw -ErrorAction SilentlyContinue
    if ($content -match "(https://[a-z0-9-]+\.trycloudflare\.com)") {
      $publicUrl = $Matches[1]
      break
    }
  }
}

if (-not $publicUrl) { throw "Tunnel havolasi olinmadi. Qayta urinib ko'ring." }

Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "  SAYT TAYYOR!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Internet havolasi:" -ForegroundColor Cyan
Write-Host $publicUrl -ForegroundColor White
Write-Host ""
Write-Host "GitHub orqali:" -ForegroundColor Cyan
Write-Host "https://uvaysiddin75.github.io/tarix/" -ForegroundColor White
Write-Host ""

# Update live-url.json
$liveUrlObj = @{
  permanentUrl = "https://tarix.onrender.com"
  url = $publicUrl
  updated = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  status = "online"
}
$liveUrl = $liveUrlObj | ConvertTo-Json
Set-Content -Path "live-url.json" -Value $liveUrl -Encoding UTF8
Set-Content -Path "public/live-url.json" -Value $liveUrl -Encoding UTF8

# Push to GitHub
if (-not (Test-Path $git)) {
  $minGitZip = Join-Path $env:TEMP "MinGit.zip"
  $minGitDir = Join-Path $env:TEMP "MinGit"
  if (-not (Test-Path $git)) {
    Invoke-WebRequest -Uri "https://github.com/git-for-windows/git/releases/download/v2.47.1.windows.2/MinGit-2.47.1.2-64-bit.zip" -OutFile $minGitZip -UseBasicParsing
    Expand-Archive -Path $minGitZip -DestinationPath $minGitDir -Force
  }
}

if (Test-Path $git) {
  & $git add live-url.json public/live-url.json
  & $git -c user.name="Uvaysiddin" -c user.email="uvaysiddin75@gmail.com" commit -m "Update live app URL" 2>$null
  & $git push origin main 2>$null
  Write-Host "GitHub yangilandi — github.io/tarix endi ishlaydi" -ForegroundColor Green
}

Start-Process $publicUrl
Write-Host ""
Write-Host "Server va tunnel ishlayapti. Oynalarni YOPMANG." -ForegroundColor Yellow
Write-Host "To'xtatish: server va tunnel jarayonlarini yoping." -ForegroundColor Gray
Write-Host ""
Read-Host "Chiqish uchun Enter bosing (server ishlayveradi)"
