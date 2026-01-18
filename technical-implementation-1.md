# Technical Implementation Plan (Pre-Implementation)

**Date**: 2026-01-18
**Branch**: dev/mvp
**Status**: Planning

---

## Overview

This document outlines the implementation plan for the Slow LLM Coding Agent MVP - a locally hosted web app where students learn programming by stepping through code changes with an AI teacher.

---

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Platform | Web app (local) | Fastest for MVP, desktop later |
| First Project | Simple Greeter | Easier than calculator, teaches core concepts |
| Target Audience | Deferred | Focus on functionality first |

---

## Tech Stack

- **React 18** + **TypeScript** - Type safety, component-based
- **Vite** - Fast dev server and build
- **Monaco Editor** - VS Code's editor for syntax highlighting
- **Zustand** - Simple state management
- **Tailwind CSS** - Rapid styling
- **React Query** - API state management
- **Claude Sonnet 4 API** - Chatbox responses

---

## File Structure (Planned)

```
slow-llm-coder/
├── src/
│   ├── components/
│   │   ├── CodeViewer.tsx       # Monaco editor wrapper
│   │   ├── StateNavigator.tsx   # Timeline + prev/next buttons
│   │   ├── Chatbox.tsx          # AI chat per state
│   │   ├── ControlPanel.tsx     # Speed control
│   │   └── ExplanationPanel.tsx # Step explanation display
│   │
│   ├── stores/
│   │   └── projectStore.ts      # Zustand store
│   │
│   ├── data/
│   │   └── projects/
│   │       └── greeter.json     # Hardcoded first project
│   │
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   │
│   ├── api/
│   │   └── claude.ts            # Claude API integration
│   │
│   ├── App.tsx                  # Main layout
│   ├── main.tsx                 # Entry point
│   └── index.css                # Tailwind imports
│
├── .env                         # API key (gitignored)
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Components Specification

### 1. CodeViewer
**Purpose**: Display code with syntax highlighting and diff markers

**Props**:
- `code: string` - Current code to display
- `language: string` - Programming language
- `diff?: { added: string[]; removed: string[] }` - Lines changed

**Behavior**:
- Read-only Monaco editor
- Green highlight for added lines
- Red highlight for removed lines

---

### 2. StateNavigator
**Purpose**: Navigate between code states

**Props**:
- `totalStates: number`
- `currentState: number`
- `onStateChange: (index: number) => void`

**UI Elements**:
- Previous button (◀)
- Next button (▶)
- Timeline slider
- State counter ("Step X of Y")

---

### 3. ExplanationPanel
**Purpose**: Show explanation for current step

**Props**:
- `title: string` - Step title
- `explanation: string` - Speed-appropriate explanation
- `stateNumber: number`

---

### 4. ControlPanel
**Purpose**: Control speed setting

**Props**:
- `speed: 'low' | 'medium' | 'high'`
- `onSpeedChange: (speed) => void`

**UI Elements**:
- Speed slider (3 levels)
- Labels: "AI leads" / "Balanced" / "You lead"

---

### 5. Chatbox
**Purpose**: Ask AI questions about current state

**Props**:
- `stateId: number`
- `messages: ChatMessage[]`
- `onSendMessage: (message: string) => Promise<void>`

**Features**:
- Message history
- Input field
- Loading state
- Quick question buttons

---

## Data Model

### Project
```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  language: 'python' | 'javascript';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  states: CodeState[];
}
```

### CodeState
```typescript
interface CodeState {
  id: number;
  title: string;
  code: string;
  explanation: string;
  diff: {
    added: string[];
    removed: string[];
  } | null;
  speedExplanations: {
    low: string;
    medium: string;
    high: string;
  };
}
```

### ChatMessage
```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  stateId: number;
}
```

---

## Zustand Store

```typescript
interface ProjectStore {
  // State
  currentProject: Project | null;
  currentStateIndex: number;
  speed: 'low' | 'medium' | 'high';
  chatHistory: Map<number, ChatMessage[]>;
  isLoading: boolean;

  // Actions
  loadProject: (projectId: string) => void;
  nextState: () => void;
  prevState: () => void;
  jumpToState: (index: number) => void;
  setSpeed: (speed: 'low' | 'medium' | 'high') => void;
  addChatMessage: (stateId: number, message: ChatMessage) => void;
}
```

---

## First Project: "Build a Greeter"

A simple 7-state tutorial teaching:
1. Comments and print
2. Variables
3. User input
4. String concatenation
5. Functions
6. Function with parameter
7. Complete greeter

Each state includes three explanation levels (low/medium/high detail).

---

## App Layout (Planned)

```
┌─────────────────────────────────────────────────────────┐
│  ControlPanel (speed slider)                            │
├────────────────────────────┬────────────────────────────┤
│                            │                            │
│  CodeViewer                │  ExplanationPanel          │
│  (Monaco Editor)           │  (Step title + explanation)│
│                            │                            │
│                            ├────────────────────────────┤
│                            │                            │
│                            │  Chatbox                   │
│                            │  (Ask questions)           │
│                            │                            │
├────────────────────────────┴────────────────────────────┤
│  StateNavigator (◀ prev | slider | next ▶)              │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Order

1. Project setup (Vite + dependencies)
2. TypeScript types
3. Zustand store
4. Hardcoded project data (greeter.json)
5. Components (CodeViewer → StateNavigator → ExplanationPanel → ControlPanel → Chatbox)
6. Claude API integration
7. Main App layout
8. Tailwind styling

---

## Environment Variables

```env
VITE_CLAUDE_API_KEY=sk-ant-...
```

---

## Success Criteria

MVP is complete when:
- [ ] Can navigate through all 7 greeter states
- [ ] Code displays with syntax highlighting
- [ ] Diff highlighting shows changes
- [ ] Speed control changes explanation detail
- [ ] Can ask questions and get AI responses
- [ ] Clean, usable UI

---

**Next**: Begin implementation
