#!/usr/bin/env bash
# Setup git hooks for Slow LLM Coding Agent

echo "Setting up git hooks..."

# Get repository root
repo_root=$(git rev-parse --show-toplevel)

# Copy hooks from .git-hooks/ to .git/hooks/
hooks_source="$repo_root/.git-hooks"
hooks_dest="$repo_root/.git/hooks"

if [ ! -d "$hooks_source" ]; then
  echo "❌ ERROR: .git-hooks directory not found"
  exit 1
fi

# Copy each hook
for hook in commit-msg pre-commit prepare-commit-msg; do
  if [ -f "$hooks_source/$hook" ]; then
    cp "$hooks_source/$hook" "$hooks_dest/$hook"
    chmod +x "$hooks_dest/$hook"
    echo "✓ Installed $hook hook"
  fi
done

echo ""
echo "✓ Git hooks installed successfully!"
echo ""
echo "Hooks active:"
echo "  - commit-msg: Validates commit message format"
echo "  - pre-commit: Checks for console.log and debugger"
echo "  - prepare-commit-msg: Adds Co-Authored-By footer"
echo ""
echo "To disable: Remove files from .git/hooks/"
echo "To reinstall: Run this script again"
