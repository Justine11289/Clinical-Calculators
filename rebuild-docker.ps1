# CGMH EHRCALC - Docker Rebuild and Start Script
# This script stops existing containers, rebuilds the image (including all updates), and starts the container

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CGMH EHRCALC - Docker Rebuild & Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker status..." -ForegroundColor Yellow
docker info > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker is not running or not installed" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "Docker is running ✓" -ForegroundColor Green
Write-Host ""

# Stop and remove existing containers
Write-Host "Stopping existing containers..." -ForegroundColor Yellow
docker-compose down
Write-Host ""

# Clean up old images (optional)
Write-Host "Do you want to clean up old Docker images? (y/N): " -ForegroundColor Yellow -NoNewline
$cleanup = Read-Host
if ($cleanup -eq 'y' -or $cleanup -eq 'Y') {
    Write-Host "Cleaning up old images..." -ForegroundColor Yellow
    docker image prune -f
    docker rmi medcalcehr:latest -f 2>$null
}
Write-Host ""

# Rebuild image
Write-Host "Rebuilding Docker image (including launch.html)..." -ForegroundColor Yellow
docker-compose build --no-cache
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker build failed" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "Build complete ✓" -ForegroundColor Green
Write-Host ""

# Start container
Write-Host "Starting container..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Container start failed" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "Container started ✓" -ForegroundColor Green
Write-Host ""

# Wait for container initialization
Write-Host "Waiting for container initialization..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Show container status
Write-Host ""
Write-Host "Container Status:" -ForegroundColor Cyan
docker-compose ps
Write-Host ""

# Verify launch.html existence
Write-Host "Verifying launch.html existence inside container..." -ForegroundColor Yellow
$launchCheck = docker exec medcalcehr-app ls -la /usr/share/nginx/html/launch.html 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "launch.html found in container ✓" -ForegroundColor Green
} else {
    Write-Host "Warning: launch.html not found" -ForegroundColor Red
}
Write-Host ""

# Get local IP
Write-Host "Getting local IP address..." -ForegroundColor Yellow
$ipAddresses = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "127.*"} | Select-Object -ExpandProperty IPAddress
Write-Host ""

# Show access info
Write-Host "========================================" -ForegroundColor Green
Write-Host "Application started successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Local Access:" -ForegroundColor Cyan
Write-Host "  Home:     http://localhost:8080/" -ForegroundColor White
Write-Host "  Launch:   http://localhost:8080/launch.html" -ForegroundColor White
Write-Host ""

if ($ipAddresses) {
    Write-Host "Network Access (for SMART Launcher):" -ForegroundColor Cyan
    foreach ($ip in $ipAddresses) {
        Write-Host "  Home:     http://${ip}:8080/" -ForegroundColor White
        Write-Host "  Launch:   http://${ip}:8080/launch.html" -ForegroundColor White
    }
    Write-Host ""
}

Write-Host "SMART Health IT Launcher:" -ForegroundColor Cyan
Write-Host "  https://launch.smarthealthit.org/" -ForegroundColor White
Write-Host ""
Write-Host "Settings for SMART Launcher:" -ForegroundColor Yellow
Write-Host "  App Launch URL: http://localhost:8080/launch.html" -ForegroundColor White
if ($ipAddresses -and $ipAddresses.Count -gt 0) {
    Write-Host "  Or: http://$($ipAddresses[0]):8080/launch.html" -ForegroundColor White
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Ask to view logs
Write-Host "Do you want to view container logs? (y/N): " -ForegroundColor Yellow -NoNewline
$viewLogs = Read-Host
if ($viewLogs -eq 'y' -or $viewLogs -eq 'Y') {
    Write-Host ""
    Write-Host "Showing container logs (Press Ctrl+C to exit)..." -ForegroundColor Cyan
    Write-Host ""
    docker-compose logs -f
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
Write-Host ""
Write-Host "Useful Commands:" -ForegroundColor Cyan
Write-Host "  View Logs:   docker-compose logs -f" -ForegroundColor White
Write-Host "  Stop:        docker-compose down" -ForegroundColor White
Write-Host "  Restart:     docker-compose restart" -ForegroundColor White
Write-Host "  Status:      docker-compose ps" -ForegroundColor White
Write-Host ""


