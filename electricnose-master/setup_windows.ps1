$ErrorActionPreference = 'Stop'

if (Get-Command git-lfs -ErrorAction SilentlyContinue) {
    Write-Host 'Downloading Git LFS model files...'
    git lfs install
    git lfs pull
} else {
    Write-Warning 'Git LFS is not installed. Install it from https://git-lfs.com, then run: git lfs pull'
}

Write-Host 'Creating Python virtual environment...'
if (-not (Test-Path .venv)) {
    python -m venv .venv
}

Write-Host 'Installing Python dependencies...'
& .\.venv\Scripts\python.exe -m pip install --upgrade pip
& .\.venv\Scripts\python.exe -m pip install -r requirements.txt

Write-Host 'Installing frontend dependencies...'
npm run frontend:install

Write-Host ''
Write-Host 'Setup complete.' -ForegroundColor Green
Write-Host 'Connect and program the Arduino, then run: npm run dev'
