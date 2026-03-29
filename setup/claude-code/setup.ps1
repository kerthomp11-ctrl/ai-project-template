#Requires -Version 5.1
<#
.SYNOPSIS
    Sets up a MetaTemplate workspace for use with Claude Code.
.DESCRIPTION
    Run this script as Administrator for best results.
    Sets execution policy, creates your workspace folder, and configures
    Claude Code session commands (/open, /close, /setup).
.NOTES
    After setup, run 'claude' in your workspace folder and type /setup.
    Claude Code will prompt for your API key on first run.
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
$scriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$templateRoot = Split-Path -Parent (Split-Path -Parent $scriptDir)

# ── Create workspace structure ────────────────────────────────────────────────
Write-Host ""
Write-Host "Creating workspace at: $workspacePath" -ForegroundColor Cyan

New-Item -ItemType Directory -Force -Path $workspacePath                          | Out-Null
New-Item -ItemType Directory -Force -Path "$workspacePath\_template\commands"     | Out-Null
New-Item -ItemType Directory -Force -Path "$workspacePath\_meta"                  | Out-Null
New-Item -ItemType Directory -Force -Path "$workspacePath\.claude\commands"       | Out-Null

# ── Copy root files ───────────────────────────────────────────────────────────
Copy-Item "$templateRoot\AGENT.md"              "$workspacePath\AGENT.md"  -Force
Copy-Item "$templateRoot\AGENT.md"              "$workspacePath\CLAUDE.md" -Force  # Claude Code auto-loads CLAUDE.md
Copy-Item "$templateRoot\_template\SESSION.md"  "$workspacePath\SESSION.md"  -Force
Copy-Item "$templateRoot\_template\CONTEXT.md"  "$workspacePath\CONTEXT.md"  -Force

# ── Copy _template folder ─────────────────────────────────────────────────────
Copy-Item "$templateRoot\_template\project_plan.md"       "$workspacePath\_template\project_plan.md" -Force
Copy-Item "$templateRoot\_template\status.md"             "$workspacePath\_template\status.md"       -Force
Copy-Item "$templateRoot\_template\completed.md"          "$workspacePath\_template\completed.md"    -Force
Copy-Item "$templateRoot\_template\TRIGGERS.md"           "$workspacePath\_template\TRIGGERS.md"     -Force
Copy-Item "$templateRoot\_template\PERSONAS.md"           "$workspacePath\_template\PERSONAS.md"     -Force
Copy-Item "$templateRoot\_template\commands\open.md"      "$workspacePath\_template\commands\open.md"   -Force
Copy-Item "$templateRoot\_template\commands\close.md"     "$workspacePath\_template\commands\close.md"  -Force
Copy-Item "$templateRoot\_template\commands\setup.md"     "$workspacePath\_template\commands\setup.md"  -Force

# ── Copy _meta folder ─────────────────────────────────────────────────────────
Copy-Item "$templateRoot\_meta\DECISIONS.md"    "$workspacePath\_meta\DECISIONS.md"   -Force
Copy-Item "$templateRoot\_meta\PROCESS.md"      "$workspacePath\_meta\PROCESS.md"     -Force
Copy-Item "$templateRoot\_meta\IMPROVEMENTS.md" "$workspacePath\_meta\IMPROVEMENTS.md" -Force
Copy-Item "$templateRoot\_meta\EXAMPLES.md"     "$workspacePath\_meta\EXAMPLES.md"    -Force

# ── Copy Claude Code commands ─────────────────────────────────────────────────
Copy-Item "$templateRoot\_template\commands\open.md"   "$workspacePath\.claude\commands\open.md"  -Force
Copy-Item "$templateRoot\_template\commands\close.md"  "$workspacePath\.claude\commands\close.md" -Force
Copy-Item "$templateRoot\_template\commands\setup.md"  "$workspacePath\.claude\commands\setup.md" -Force

# ── Summary ───────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "Workspace created successfully." -ForegroundColor Green
Write-Host ""
Write-Host "Structure:" -ForegroundColor Cyan
Write-Host "  $workspacePath\"
Write-Host "  ├── AGENT.md         (AI session instructions)"
Write-Host "  ├── CLAUDE.md        (Claude Code auto-loads this)"
Write-Host "  ├── SESSION.md       (fill in your efforts)"
Write-Host "  ├── CONTEXT.md       (fill in who you are)"
Write-Host "  ├── _template\       (blank files for new efforts)"
Write-Host "  ├── _meta\           (process docs)"
Write-Host "  └── .claude\commands\ (open, close, setup)"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Open a terminal in: $workspacePath"
Write-Host "  2. Run:   claude"
Write-Host "  3. Type:  /setup"
Write-Host ""
Write-Host "Claude Code will prompt for your Anthropic API key on first run." -ForegroundColor Yellow
Write-Host ""
