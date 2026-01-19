# Git Hooks for Slow LLM Coding Agent

## Purpose
These hooks enforce git workflow conventions documented in `docs/GIT-WORKFLOW.md`.

## Active Hooks

### commit-msg
**Validates commit message format**

Ensures commits follow: `type(scope): description`

Valid types: feat, fix, docs, refactor, test, chore, style, perf, hotfix

**Example:**
```
✓ feat(calculator): add basic operations
✗ Added calculator feature
```

### pre-commit
**Validates code quality**

Checks:
- Console statements (warning)
- Debugger statements (error)
- TypeScript compilation (warning)

**Can be bypassed:** `git commit --no-verify` (not recommended)

### prepare-commit-msg
**Auto-adds Co-Authored-By footer**

Automatically appends:
```
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

## Installation

### Automatic (Recommended)
```bash
# Bash (Git Bash on Windows, Linux, Mac)
./scripts/setup-git-hooks.sh

# PowerShell (Windows)
.\scripts\setup-git-hooks.ps1
```

### Manual
```bash
cp .git-hooks/* .git/hooks/
chmod +x .git/hooks/*
```

## Disabling Hooks

### Temporarily (single commit)
```bash
git commit --no-verify
```

### Permanently
```bash
rm .git/hooks/commit-msg
rm .git/hooks/pre-commit
rm .git/hooks/prepare-commit-msg
```

## Troubleshooting

### "permission denied" on Windows
```bash
# In Git Bash
chmod +x .git/hooks/*
```

### Hook not running
```bash
# Check if hook exists and is executable
ls -la .git/hooks/
```

### Bypass for emergency commits
```bash
git commit --no-verify -m "emergency fix"
```

## Customization

Edit hooks in `.git-hooks/` (not `.git/hooks/`), then reinstall:
```bash
./scripts/setup-git-hooks.sh
```
