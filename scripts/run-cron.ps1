# Simple loop to simulate a cron job running trigger-publish every 5 minutes (300 seconds)
# Run this in a PowerShell terminal

$baseUrl = "http://localhost:3000"
$secretKey = "zintia_admin_sec_9F8eD7cBa19A2b3C4d5E6f7G8h9J0k1L2m"
$intervalSeconds = 300

Write-Host "Starting drip-feed publication loop..." -ForegroundColor Green
Write-Host "Target: $baseUrl"
Write-Host "Interval: Every $intervalSeconds seconds"
Write-Host "Press Ctrl+C to stop.`n"

while ($true) {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Triggering publication..." -NoNewline
    
    # Execute the node script
    node scripts/trigger-publish.js $baseUrl $secretKey
    
    Start-Sleep -Seconds $intervalSeconds
}
