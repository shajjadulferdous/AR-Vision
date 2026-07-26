try {
  $r = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 90
  Write-Host "STATUS=$($r.StatusCode)"
  Write-Host "LENGTH=$($r.Content.Length)"
  Write-Host "---FIRST 800---"
  Write-Host $r.Content.Substring(0, [Math]::Min(800, $r.Content.Length))
} catch {
  Write-Host "ERR=$($_.Exception.Message)"
}