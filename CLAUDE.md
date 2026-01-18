# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Slow LLM Coding Agent" - An interactive coding learning platform where students learn programming alongside an AI teacher. The unique feature is "time travel" through code states, allowing students to rewind and see exactly how code evolved step by step.

**Target audience**: Students learning programming with AI as a teaching tool

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Editor**: Monaco Editor (@monaco-editor/react)
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Data Fetching**: React Query (@tanstack/react-query)
- **AI**: Anthropic Claude API (Claude Sonnet 4)

## Commands

```bash
# Create project
npm create vite@latest slow-llm-coder -- --template react-ts

# Install dependencies
npm install @monaco-editor/react zustand @tanstack/react-query
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Development
npm run dev

# Build
npm run build
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
  language: 'python' | 'javascript' | 'java';
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
- `ControlPanel` - Speed slider (3 levels), language selector
- `ExplanationPanel` - Shows step title and explanation
- `DiffViewer` - Visualizes code changes between states

### State Store (Zustand)

Central store manages: current project, state index, speed setting, language, and chat history per state.

### Project Data

Projects are stored as JSON files in `src/data/projects/`. MVP uses hardcoded projects (e.g., calculator tutorial with ~10-15 states).

## Three Main Controls

1. **Speed** (Help level): low = AI codes mostly, medium = 50/50, high = student codes with guidance
2. **Temperature** (Post-MVP): Code complexity modes (simple/normal/hardcore)
3. **Language**: Programming language selection (MVP: Python only)

## Environment Variables

```
VITE_CLAUDE_API_KEY=your_api_key_here
```

## MVP Scope

Must have: Code editor with split-view, state navigation, one complete hardcoded project, speed control, chatbox per state.

Post-MVP: Multiple languages, temperature modes, dynamic code generation, user accounts, gamification.
