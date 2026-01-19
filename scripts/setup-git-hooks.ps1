# Setup git hooks for Slow LLM Coding Agent

Write-Host "Setting up git hooks..." -ForegroundColor Cyan

# Get repository root
$repoRoot = git rev-parse --show-toplevel
$hooksSource = Join-Path $repoRoot ".git-hooks"
$hooksDest = Join-Path $repoRoot ".git\hooks"

if (-not (Test-Path $hooksSource)) {
    Write-Host "ERROR: .git-hooks directory not found" -ForegroundColor Red
    exit 1
}

# Copy hooks
$hooks = @("commit-msg", "pre-commit", "prepare-commit-msg")

foreach ($hook in $hooks) {
    $sourcePath = Join-Path $hooksSource $hook
    $destPath = Join-Path $hooksDest $hook

    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath $destPath -Force
        Write-Host "✓ Installed $hook hook" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "✓ Git hooks installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Hooks active:"
Write-Host "  - commit-msg: Validates commit message format"
Write-Host "  - pre-commit: Checks for console.log and debugger"
Write-Host "  - prepare-commit-msg: Adds Co-Authored-By footer"
Write-Host ""
Write-Host "To disable: Remove files from .git\hooks\"
Write-Host "To reinstall: Run this script again"
