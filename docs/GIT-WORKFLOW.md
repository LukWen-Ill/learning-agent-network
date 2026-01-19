# Git Workflow Guide

## Purpose
This guide defines the git workflow for the Slow LLM Coding Agent project, ensuring consistent collaboration between humans and AI (Claude Code).

---

## Branch Naming Convention

### Pattern
```
{type}/{feature-name}
```

### Branch Types

| Type | Purpose | Base Branch | Example |
|------|---------|-------------|---------|
| `dev/` | New features | `main` | `dev/calculator`, `dev/state-navigation` |
| `fix/` | Bug fixes | `main` or `dev/*` | `fix/navigation-overflow` |
| `docs/` | Documentation only | `main` | `docs/api-reference` |
| `refactor/` | Code refactoring | `main` | `refactor/state-management` |
| `test/` | Test additions | `main` | `test/unit-tests-chatbox` |
| `release/` | Release preparation | `main` | `release/v1.0.0` |
| `hotfix/` | Production fixes | `main` | `hotfix/critical-bug` |

### Naming Rules
- Use lowercase with hyphens: `dev/calculator-feature` ✓
- No spaces or special characters: `dev/Calculator Feature` ✗
- Be descriptive but concise: `dev/calc` ✗, `dev/calculator` ✓
- Match feature documentation: If `docs/features/feature-code-editor.md`, use `dev/code-editor`

---

## Branch Lifecycle

### 1. Starting a Feature

**Manual:**
```bash
git checkout main
git pull origin main
git checkout -b dev/feature-name
```

**With Git Skill:**
```
/git-start feature-name
```

This automatically:
- Checks for uncommitted changes
- Creates branch from latest main
- Checks out the new branch

### 2. During Development

**Workflow:**
```
1. Make changes to files
2. Test locally
3. Stage changes: git add .
4. Commit: /git-commit
5. Push regularly: git push -u origin dev/feature-name
```

**Commit Frequency:**
- Commit after each logical unit of work (not mid-feature)
- Each commit should compile and run (if possible)
- Don't commit broken code to feature branch

**Syncing with Main:**
If main branch has updates while you work:
```bash
# Option 1: Rebase (cleaner history, preferred)
git fetch origin
git rebase origin/main

# Option 2: Merge (preserves exact history)
git merge origin/main
```

**With Git Skill:**
```
/git-sync
```

### 3. Finishing a Feature

**Checklist:**
- [ ] All acceptance criteria met (check feature doc)
- [ ] Code compiles: `npm run build`
- [ ] Tests pass: `npm test` (if tests exist)
- [ ] No console.log statements
- [ ] Updated documentation
- [ ] All changes committed

**Push to Remote:**
```bash
git push -u origin dev/feature-name
```

**With Git Skill:**
```
/git-finish
```

### 4. Creating Pull Request

**Using GitHub CLI:**
```bash
gh pr create --title "feat(calculator): add Calculator component" \
  --body "Implements acceptance criteria from feature-calculator.md"
```

**PR Title Format:**
```
{type}({scope}): {description}
```
Same as commit message format.

**PR Body Template:**
```markdown
## Summary
- Brief description of what this PR implements
- Reference to feature documentation: `docs/features/feature-{name}.md`

## Changes
- List major changes
- Highlight breaking changes (if any)

## Test Plan
- [ ] Manual testing completed
- [ ] Unit tests added/updated
- [ ] Integration tests pass

## Screenshots (if UI changes)
[Add screenshots]

## Related Issues
Closes #123
```

### 5. Merging Pull Request

**Merge Strategy:**
- **Squash and Merge** (Preferred for feature branches)
  - Combines all commits into one
  - Keeps main history clean
  - Use when: Multiple small commits in feature branch

- **Rebase and Merge** (For clean feature branches)
  - Preserves individual commits
  - Use when: Each commit is meaningful and well-formatted

- **Merge Commit** (Rarely)
  - Creates merge commit
  - Use when: Need to preserve exact feature branch history

**After Merge:**
```bash
# Switch to main
git checkout main
git pull origin main

# Delete local feature branch
git branch -d dev/feature-name

# Delete remote branch (optional, GitHub can auto-delete)
git push origin --delete dev/feature-name
```

---

## Commit Message Format

### Structure
```
type(scope): description

[optional body]

[optional footer]

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

### Commit Types

| Type | When to Use | Example |
|------|-------------|---------|
| `feat` | New feature or enhancement | `feat(calculator): add multiplication operation` |
| `fix` | Bug fix | `fix(navigation): prevent overflow on last state` |
| `docs` | Documentation only | `docs(readme): update installation steps` |
| `refactor` | Code restructuring (no behavior change) | `refactor(store): simplify state management` |
| `test` | Adding/updating tests | `test(calculator): add unit tests for operations` |
| `chore` | Maintenance, dependencies | `chore(deps): update React to 18.3.0` |
| `style` | Code style/formatting | `style(editor): apply consistent indentation` |
| `perf` | Performance improvement | `perf(diff): optimize diff calculation algorithm` |

### Scope Examples

Based on directory structure:
- `calculator` - Calculator component/feature
- `code-editor` - Code editor component
- `state-navigation` - State navigation feature
- `chatbox` - Chatbox component
- `backend` - Backend changes
- `api` - API endpoints
- `db` - Database schema
- `deps` - Dependencies

### Description Rules
- Use imperative mood: "add" not "added" or "adds"
- Lowercase first letter
- No period at the end
- Max 72 characters
- Be specific: "fix navigation bug" ✗, "fix navigation overflow on last state" ✓

### Body Guidelines
- Wrap at 72 characters
- Explain WHAT and WHY, not HOW
- Reference related issues/PRs
- List breaking changes

### Examples

**Feature:**
```
feat(calculator): add Calculator component with basic operations

Implements Calculator component following the architecture defined in
feature-calculator.md. Includes TypeScript interfaces and Zustand store
integration.

Acceptance criteria:
- Add, subtract, multiply, divide operations
- Clear and reset functionality
- Display current result

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**Bug Fix:**
```
fix(state-navigation): prevent navigation past last state

Fixed bug where clicking "Next" on the last state caused an index out of
bounds error. Added boundary check in StateNavigator component.

Fixes #42

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**Documentation:**
```
docs(git-workflow): add branching strategy guide

Added comprehensive git workflow documentation covering branch naming,
commit conventions, and PR process. Aligned with existing SOP docs.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

## Special Workflows

### Working on Multiple Features Simultaneously

**Best Practice:** Avoid. Finish one feature before starting another.

**If Necessary:**
```bash
# Save work on current feature
git add .
git commit -m "wip: progress on feature A"
git push

# Switch to new feature
git checkout main
git checkout -b dev/feature-b

# Resume feature A later
git checkout dev/feature-a
```

### Handling Conflicts

**During Rebase/Merge:**
```bash
# 1. Identify conflicts
git status

# 2. Resolve in editor (look for <<<<<<< markers)
# 3. Stage resolved files
git add .

# 4. Continue rebase
git rebase --continue

# Or if merging
git commit
```

**Prevention:**
- Sync with main regularly
- Communicate with team about overlapping work
- Keep feature branches short-lived (< 1 week)

### Emergency Fixes

**Hotfix Workflow:**
```bash
# Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# Fix the bug
# Commit
git commit -m "hotfix(api): fix critical authentication bug"

# Push and create PR immediately
git push -u origin hotfix/critical-bug
gh pr create --title "hotfix: fix critical authentication bug"
```

---

## Educational Context

This project is a **learning platform for students**. The git workflow is designed to:

1. **Teach Git Best Practices** - Students learn professional git workflows
2. **Enable Code Time Travel** - Branch history becomes learning material
3. **Document AI Collaboration** - Co-Authored-By shows AI contributions
4. **Support Incremental Learning** - Small, atomic commits show progression

### For Students

When working on assignments:
- Each step of your implementation should be a commit
- Write descriptive commit messages (you're creating learning material!)
- Use `/git-commit` to get guidance on message format
- Review your commit history to see your learning progression

### For Instructors

When creating course content:
- Use feature branches for each lesson/module
- Commit granularly to create navigable code states
- Write detailed commit messages (these become explanations)
- Tag important milestones: `git tag v1.0-calculator-complete`

---

## Integration with Pre-commit Hooks

Pre-commit hooks (see installation below) enforce:
- Branch naming convention
- Commit message format
- No console.log in committed code
- TypeScript compilation (warning only)

**Installation:**
```bash
# Run setup script
./scripts/setup-git-hooks.sh

# Or manually
cp .git-hooks/commit-msg .git/hooks/commit-msg
chmod +x .git/hooks/commit-msg
```

See `.git-hooks/README.md` for detailed hook documentation.

---

## Quick Reference

### Common Commands

```bash
# Start feature
/git-start feature-name

# Check status
/git-status

# Make commit
/git-commit

# Sync with main
/git-sync

# Finish feature
/git-finish

# Create PR
gh pr create --title "type(scope): description"
```

### Branch Naming Cheat Sheet
```
dev/calculator        ✓
dev/code-editor       ✓
fix/navigation-bug    ✓
docs/api-guide        ✓
dev/Calculator        ✗ (use lowercase)
dev/my feature        ✗ (no spaces)
calculator            ✗ (missing type)
```

### Commit Message Cheat Sheet
```
feat(calculator): add component        ✓
fix(api): handle null responses        ✓
docs: update README                    ✓
Added calculator feature               ✗ (wrong format)
fix: bug                               ✗ (not descriptive)
feat(calculator) add feature           ✗ (missing colon)
```

---

## Troubleshooting

**"Branch already exists"**
```bash
# List all branches
git branch -a

# Delete local branch (if safe)
git branch -D dev/old-feature

# Delete remote branch
git push origin --delete dev/old-feature
```

**"Uncommitted changes prevent checkout"**
```bash
# Option 1: Commit them
git add .
git commit -m "wip: save progress"

# Option 2: Stash them
git stash
git checkout other-branch
git stash pop  # When ready to restore
```

**"Merge conflict"**
```bash
# See conflicting files
git status

# Edit files, resolve conflicts
# Stage resolved files
git add .

# Complete merge/rebase
git rebase --continue
# or
git commit
```

**"Pushed wrong commit"**
```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes) - DANGEROUS
git reset --hard HEAD~1

# If already pushed - create fix commit instead
# DO NOT force push to shared branches
```

---

## References

- Commit Convention: Follows [Conventional Commits](https://www.conventionalcommits.org/)
- SOP Documentation: `docs/SOP-CLAUDE-CODE.md`
- Feature Docs: `docs/features/feature-*.md`
- Git Skill: `.claude/agents/git.md`
- Git Hooks: `.git-hooks/README.md`
