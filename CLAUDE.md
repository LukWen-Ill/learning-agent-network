# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Slow LLM Coding Agent" - An interactive coding learning platform where students learn programming alongside an AI teacher. The unique feature is "time travel" through code states, allowing students to rewind and see exactly how code evolved step by step.

**Target audience**: Students learning programming with AI as a teaching tool

**MVP Courses**: Calculator (Python) + Todo List App (JavaScript)

## SOP Implementation Agent

When implementing features, Claude Code should follow the Standard Operating Procedure:

1. **Load the SOP prompt**: `.claude/prompts/sop-implementation-agent.md`
2. **Read feature documentation**: `docs/features/feature-{name}.md`
3. **Follow the SOP guide**: `docs/SOP-CLAUDE-CODE.md`
4. **Reference implementation guide**: `docs/IMPLEMENTATION-GUIDE.md`

### Quick Start for Feature Implementation

```
1. Read docs/features/feature-{name}.md
2. Read docs/DATABASE-SCHEMA.md
3. Check existing patterns in codebase
4. Implement backend first (Models -> DTOs -> Endpoints)
5. Implement frontend (Types -> Store -> Components)
6. Integration test
7. Verify all acceptance criteria
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | C# Minimal API (.NET 8) |
| Frontend | React 18 + TypeScript + Vite |
| Code Editor | prism-react-renderer (or CodeMirror 6) |
| State Management | Zustand |
| Styling | Tailwind CSS |
| Data Fetching | React Query (@tanstack/react-query) |
| Database | MySQL (local via MySQL Workbench) |
| AI | Mistral AI (post-MVP only) |

## Commands

```bash
# Navigate to app directory
cd slow-llm-coder

# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build
```

## Git Workflow Commands

```bash
# Start new feature
/git-start feature-name

# Make smart commit
/git-commit [optional-message]

# Check status
/git-status

# Sync with main
/git-sync

# Finish feature
/git-finish

# Setup git hooks (one-time)
./scripts/setup-git-hooks.sh
```

## Architecture

### Core Concept: State-based Code Navigation

Each code change is a "state" (finer than git commits). Students navigate between states to see code evolution. Each state has:
- Code snapshot
- Explanation (with speed-based variants: low/medium/high detail)
- Diff information (added/removed lines)
- Associated chat messages

### Key Data Models

```typescript
interface Project {
  id: string;
  name: string;
  language: 'python' | 'javascript';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  states: CodeState[];
}

interface CodeState {
  id: number;
  code: string;
  explanation: string;
  title: string;
  diff: { added: string[]; removed: string[]; } | null;
  speedExplanations: { low: string; medium: string; high: string; };
}
```

### Component Structure

- `CodeViewer` - Monaco editor with syntax highlighting and diff visualization
- `StateNavigator` - Timeline slider and prev/next step buttons
- `Chatbox` - AI chat per state (questions answered in context of current code state)
- `ControlPanel` - Speed slider (3 levels)
- `ExplanationPanel` - Shows step title and explanation

### State Store (Zustand)

Central store manages: current project, state index, speed setting, and chat history per state.

### Project Data

Projects are stored as JSON files in `src/data/projects/`. MVP uses hardcoded greeter project.

## Three Main Controls

1. **Speed** (Help level): low = brief explanations, medium = balanced, high = detailed guidance
2. **Temperature** (Post-MVP): Code complexity modes
3. **Language**: Programming language selection (MVP: Python only)

## Environment Variables

Create `.env` file in `slow-llm-coder/`:
```
VITE_CLAUDE_API_KEY=your_api_key_here
```

## MVP Scope

**Must have (4 Features):**
1. Code Editor - Syntax-highlighted, read-only code display
2. State Navigation - Timeline slider and prev/next buttons
3. Explanation Panel - Three levels (Brief/Normal/Detailed)
4. Diff Visualization - Highlight added/removed lines

**MVP Content:**
- 2 pre-written courses (Calculator + Todo List)
- No AI features in MVP

**Post-MVP:**
- Multiple languages
- Temperature modes
- Dynamic code generation via Mistral AI
- User accounts
- Gamification

## Documentation

| Document | Location | Purpose |
|----------|----------|---------|
| Database Schema | `docs/DATABASE-SCHEMA.md` | MySQL tables and C#/TS models |
| Code Editor Feature | `docs/features/feature-code-editor.md` | Editor component specs |
| State Navigation Feature | `docs/features/feature-state-navigation.md` | Navigation component specs |
| Explanation Panel Feature | `docs/features/feature-explanation-panel.md` | Explanation component specs |
| Diff Visualization Feature | `docs/features/feature-diff-visualization.md` | Diff component specs |
| SOP Guide | `docs/SOP-CLAUDE-CODE.md` | Standard Operating Procedure |
| Implementation Guide | `docs/IMPLEMENTATION-GUIDE.md` | Step-by-step build instructions |
| SOP Agent Prompt | `.claude/prompts/sop-implementation-agent.md` | Reusable implementation prompt |
| **Git Workflow** | `docs/GIT-WORKFLOW.md` | Branch naming, commit conventions, PR process |
| **Git Skill** | `.claude/agents/git.md` | Automated git commands |
| **Git Hooks** | `.git-hooks/README.md` | Pre-commit validation setup |

## How to Use Documentation

### Implementing a Feature

1. Load the SOP agent prompt: `.claude/prompts/sop-implementation-agent.md`
2. Specify the feature name (e.g., "code-editor")
3. Follow the step-by-step workflow in the prompt

### Understanding a Feature

Read the feature documentation in `docs/features/feature-{name}.md`:
- User story and acceptance criteria
- Data models (TypeScript + C#)
- API endpoints
- Component structure
- UI mockups

### Building the Full MVP

Follow `docs/IMPLEMENTATION-GUIDE.md` which provides:
1. Project setup (Vite + .NET)
2. Database setup (MySQL schema)
3. Backend API implementation
4. Frontend component implementation
5. Integration steps
6. Testing checklist

### Understanding the Workflow

Read `docs/SOP-CLAUDE-CODE.md` for:
- Phase-by-phase implementation process
- Code style guidelines
- File naming conventions
- Commit message format
- Quality gates checklist

### Git Workflow

For git operations:
1. Use the git skill: `/git-start`, `/git-commit`, `/git-status`, `/git-finish`, `/git-sync`
2. Reference workflow guide: `docs/GIT-WORKFLOW.md`
3. Install git hooks (one-time): `./scripts/setup-git-hooks.sh`
4. See hook documentation: `.git-hooks/README.md`
