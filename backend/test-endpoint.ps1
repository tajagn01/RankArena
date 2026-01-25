$body = @{
    university = "Parul University"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/university-users" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

Write-Host "`n=== Response ===" -ForegroundColor Green
Write-Host "Users found: $($response.users.Count)" -ForegroundColor Cyan

if ($response.users.Count -gt 0) {
    Write-Host "`nFirst 5 users:" -ForegroundColor Yellow
    $response.users | Select-Object -First 5 | ForEach-Object {
        Write-Host "  - $($_.name) (@$($_.leetcodeUsername)) - $($_.stats.totalSolved) solved"
    }
} else {
    Write-Host "`n❌ No users returned!" -ForegroundColor Red
}
