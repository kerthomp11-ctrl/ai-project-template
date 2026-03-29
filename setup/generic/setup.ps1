#Requires -Version 5.1
<#
.SYNOPSIS
    Sets up a MetaTemplate workspace for use with any AI tool.
.DESCRIPTION
    Run this script as Administrator for best results.
    Sets execution policy and creates your workspace folder with all template files.
.NOTES
    After setup, open AGENT.md in your AI tool and say "let's start".
#>

# ── Admin check ───────────────────────────────────────────────────────────────
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]"Administrator")
if (-not $isAdmin) {
    Write-Host ""
    Write-Host "NOTE: For best results, right-click this script and select 'Run as Administrator'." -ForegroundColor Yellow
    Write-Host "Continuing without admin rights — execution policy change may not apply system-wide." -ForegroundColor Yellow
    Write-Host ""
}

# ── Execution policy ──────────────────────────────────────────────────────────
Write-Host "Setting execution policy to RemoteSigned for current user..." -ForegroundColor Cyan
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
Write-Host "Done." -ForegroundColor Green
Write-Host ""

# ── Workspace location ────────────────────────────────────────────────────────
$defaultPath = Join-Path $HOME "Documents\kAI"
Write-Host "Where would you like to create your workspace?"
Write-Host "Press Enter to use the default [$defaultPath]: " -NoNewline
$userInput = Read-Host
if ([string]::IsNullOrWhiteSpace($userInput)) {
    $workspacePath = $defaultPath
} else {
    $workspacePath = $userInput
}

# ── Locate template root ──────────────────────────────────────────────────────
$scriptDir    = Split-Path -Parent $MyInvocation.MyCommand.Path
$templateRoot = Split-Path -Parent (Split-Path -Parent $scriptDir)

# ── Create workspace structure ────────────────────────────────────────────────
Write-Host ""
Write-Host "Creating workspace at: $workspacePath" -ForegroundColor Cyan

New-Item -ItemType Directory -Force -Path $workspacePath                      | Out-Null
New-Item -ItemType Directory -Force -Path "$workspacePath\_template\commands" | Out-Null
New-Item -ItemType Directory -Force -Path "$workspacePath\_meta"              | Out-Null

# ── Copy root files ───────────────────────────────────────────────────────────
Copy-Item "$templateRoot\AGENT.md"              "$workspacePath\AGENT.md"    -Force
Copy-Item "$templateRoot\_template\SESSION.md"  "$workspacePath\SESSION.md"  -Force
Copy-Item "$templateRoot\_template\CONTEXT.md"  "$workspacePath\CONTEXT.md"  -Force

# ── Copy _template folder ─────────────────────────────────────────────────────
Copy-Item "$templateRoot\_template\project_plan.md"       "$workspacePath\_template\project_plan.md" -Force
Copy-Item "$templateRoot\_template\status.md"             "$workspacePath\_template\status.md"       -Force
Copy-Item "$templateRoot\_template\completed.md"          "$workspacePath\_template\completed.md"    -Force
Copy-Item "$templateRoot\_template\TRIGGERS.md"           "$workspacePath\_template\TRIGGERS.md"     -Force
Copy-Item "$templateRoot\_template\PERSONAS.md"           "$workspacePath\_template\PERSONAS.md"     -Force

# ── Copy _meta folder ─────────────────────────────────────────────────────────
Copy-Item "$templateRoot\_meta\DECISIONS.md"    "$workspacePath\_meta\DECISIONS.md"    -Force
Copy-Item "$templateRoot\_meta\PROCESS.md"      "$workspacePath\_meta\PROCESS.md"      -Force
Copy-Item "$templateRoot\_meta\IMPROVEMENTS.md" "$workspacePath\_meta\IMPROVEMENTS.md" -Force
Copy-Item "$templateRoot\_meta\EXAMPLES.md"     "$workspacePath\_meta\EXAMPLES.md"     -Force

# ── Summary ───────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "Workspace created successfully." -ForegroundColor Green
Write-Host ""
Write-Host "Structure:" -ForegroundColor Cyan
Write-Host "  $workspacePath\"
Write-Host "  ├── AGENT.md         (AI session instructions)"
Write-Host "  ├── SESSION.md       (fill in your efforts)"
Write-Host "  ├── CONTEXT.md       (fill in who you are)"
Write-Host "  ├── _template\       (blank files for new efforts)"
Write-Host "  └── _meta\           (process docs)"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Open $workspacePath in your editor"
Write-Host "  2. Load AGENT.md in your AI tool"
Write-Host "  3. Say: let's start"
Write-Host ""
