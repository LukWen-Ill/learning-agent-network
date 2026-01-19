# Feature: Per-State Explanation Panel

## Overview

**Feature ID:** F003
**Priority:** High (MVP Core)
**Status:** Not Started

Display contextual explanations for each code state. Shows what was added/changed and why. Explanations are pre-written (not AI-generated in MVP).

---

## User Story

> As a **student**, I want to **read explanations for each code state**, so that I can **understand what the code does and why changes were made**.

---

## Acceptance Criteria

- [ ] Display title for each state
- [ ] Display detailed explanation text
- [ ] Markdown rendering support (headers, code blocks, lists, bold/italic)
- [ ] Three detail levels: Brief / Normal / Detailed
- [ ] Speed selector to switch between detail levels
- [ ] Smooth transitions when changing states
- [ ] Scrollable content for long explanations
- [ ] Code snippets within explanations are highlighted

---

## Data Model

### TypeScript Interfaces

```typescript
// types/explanation.ts

export type ExplanationLevel = 'brief' | 'normal' | 'detailed';

export interface ExplanationContent {
  brief: string;
  normal: string;
  detailed: string;
}

export interface ExplanationPanelProps {
  title: string;
  explanations: ExplanationContent;
  currentLevel: ExplanationLevel;
  onLevelChange: (level: ExplanationLevel) => void;
}

export interface SpeedSelectorProps {
  currentLevel: ExplanationLevel;
  onChange: (level: ExplanationLevel) => void;
}
```

### C# DTO

```csharp
// DTOs/ExplanationDto.cs

public record ExplanationDto
{
    public int CodeStateId { get; init; }
    public string Title { get; init; } = string.Empty;
    public Dictionary<string, string> Explanations { get; init; } = new();
}

// Example structure:
// {
//   "codeStateId": 5,
//   "title": "Add input validation",
//   "explanations": {
//     "brief": "Added validation to check for empty input.",
//     "normal": "We added a validation function...",
//     "detailed": "## Input Validation\n\n..."
//   }
// }
```

---

## API Endpoint

### GET /api/projects/{projectId}/states/{stateIndex}/explanation

Returns all explanation levels for a code state.

**Response:**
```json
{
  "codeStateId": 5,
  "title": "Add input validation",
  "explanations": {
    "brief": "Added validation to check user input before processing.",
    "normal": "We added a `validate_input` function that checks if the input is a valid number. This prevents crashes when users enter invalid data.",
    "detailed": "## Input Validation\n\nIn this step, we add **input validation** to make our calculator more robust.\n\n### Why Validate Input?\n\nUsers might enter:\n- Letters instead of numbers\n- Empty strings\n- Special characters\n\n### The Code\n\n```python\ndef validate_input(value):\n    try:\n        return float(value)\n    except ValueError:\n        return None\n```\n\n### How It Works\n\n1. The `try` block attempts to convert the input to a `float`\n2. If successful, it returns the number\n3. If it fails, it catches the `ValueError` and returns `None`"
  }
}
```

**C# Implementation:**
```csharp
app.MapGet("/api/projects/{projectId}/states/{stateIndex}/explanation",
    async (int projectId, int stateIndex, AppDbContext db) =>
{
    var state = await db.CodeStates
        .Include(s => s.Explanations)
        .FirstOrDefaultAsync(s => s.ProjectId == projectId && s.StateIndex == stateIndex);

    if (state is null) return Results.NotFound();

    return Results.Ok(new ExplanationDto
    {
        CodeStateId = state.Id,
        Title = state.Title,
        Explanations = state.Explanations.ToDictionary(
            e => e.Level,
            e => e.Content
        )
    });
});
```

---

## Component Structure

### File Structure

```
src/
├── components/
│   └── ExplanationPanel/
│       ├── ExplanationPanel.tsx     # Main container
│       ├── SpeedSelector.tsx        # Brief/Normal/Detailed toggle
│       ├── MarkdownRenderer.tsx     # Renders markdown content
│       ├── ExplanationPanel.types.ts
│       └── index.ts
```

### Component Hierarchy

```
<ExplanationPanel>
├── <SpeedSelector />       # Level toggle: Brief | Normal | Detailed
├── <ExplanationTitle />    # State title
└── <MarkdownRenderer />    # Rendered explanation content
```

### Main Component Implementation

```tsx
// components/ExplanationPanel/ExplanationPanel.tsx

import { SpeedSelector } from './SpeedSelector';
import { MarkdownRenderer } from './MarkdownRenderer';
import type { ExplanationPanelProps } from './ExplanationPanel.types';

export function ExplanationPanel({
  title,
  explanations,
  currentLevel,
  onLevelChange,
}: ExplanationPanelProps) {
  const currentExplanation = explanations[currentLevel];

  return (
    <div className="explanation-panel bg-gray-800 rounded-lg p-6 h-full flex flex-col">
      {/* Header with speed selector */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <SpeedSelector
          currentLevel={currentLevel}
          onChange={onLevelChange}
        />
      </div>

      {/* Scrollable explanation content */}
      <div className="flex-1 overflow-y-auto">
        <MarkdownRenderer content={currentExplanation} />
      </div>
    </div>
  );
}
```

### Speed Selector Component

```tsx
// components/ExplanationPanel/SpeedSelector.tsx

import type { ExplanationLevel, SpeedSelectorProps } from './ExplanationPanel.types';

const levels: { value: ExplanationLevel; label: string; description: string }[] = [
  { value: 'brief', label: 'Brief', description: 'Quick summary' },
  { value: 'normal', label: 'Normal', description: 'Standard explanation' },
  { value: 'detailed', label: 'Detailed', description: 'In-depth walkthrough' },
];

export function SpeedSelector({ currentLevel, onChange }: SpeedSelectorProps) {
  return (
    <div className="speed-selector flex gap-1 bg-gray-700 rounded-lg p-1">
      {levels.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`
            px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
            ${currentLevel === value
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-600'
            }
          `}
          aria-pressed={currentLevel === value}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
```

### Markdown Renderer Component

```tsx
// components/ExplanationPanel/MarkdownRenderer.tsx

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-content prose prose-invert max-w-none">
      <ReactMarkdown
        components={{
          // Custom code block rendering with syntax highlighting
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : 'text';

            return !inline ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={language}
                PreTag="div"
                className="rounded-lg"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className="bg-gray-700 px-1.5 py-0.5 rounded text-sm" {...props}>
                {children}
              </code>
            );
          },
          // Custom heading styles
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-white mt-6 mb-3">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-white mt-5 mb-2">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium text-gray-200 mt-4 mb-2">{children}</h3>
          ),
          // Custom paragraph
          p: ({ children }) => (
            <p className="text-gray-300 leading-relaxed mb-4">{children}</p>
          ),
          // Custom list styles
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-1">{children}</ol>
          ),
          // Strong/bold
          strong: ({ children }) => (
            <strong className="font-semibold text-white">{children}</strong>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
```

---

## UI Mockup Description

```
┌────────────────────────────────────────────────────────────────┐
│  Add input validation            [Brief][Normal][Detailed]     │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ## Input Validation                                           │
│                                                                │
│  In this step, we add **input validation** to make our        │
│  calculator more robust.                                       │
│                                                                │
│  ### Why Validate Input?                                       │
│                                                                │
│  Users might enter:                                            │
│  • Letters instead of numbers                                  │
│  • Empty strings                                               │
│  • Special characters                                          │
│                                                                │
│  ### The Code                                                  │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐     │
│  │ def validate_input(value):                           │     │
│  │     try:                                             │     │
│  │         return float(value)                          │     │
│  │     except ValueError:                               │     │
│  │         return None                                  │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                │
│  ### How It Works                                              │
│                                                                │
│  1. The `try` block attempts to convert the input             │
│  2. If successful, it returns the number                      │
│  3. If it fails, it catches the error                         │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Explanation Level Guidelines

### Brief (Quick Summary)
- 1-2 sentences
- Focus on **what** was done
- No code snippets
- Example: "Added validation to check user input before processing."

### Normal (Standard)
- 2-4 sentences or a short paragraph
- Focus on **what** and **why**
- May include inline code references
- Example: "We added a `validate_input` function that checks if the input is a valid number. This prevents crashes when users enter invalid data."

### Detailed (In-depth)
- Multiple paragraphs with structure
- Full markdown formatting (headers, lists, code blocks)
- Focus on **what**, **why**, and **how**
- Include conceptual explanations
- Example: Full markdown document with sections, code blocks, and detailed walkthrough

---

## State Management Integration

```typescript
// store/explanationStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ExplanationLevel, ExplanationContent } from '../types';

interface ExplanationStore {
  currentLevel: ExplanationLevel;
  explanations: ExplanationContent | null;
  title: string;

  setLevel: (level: ExplanationLevel) => void;
  setExplanations: (explanations: ExplanationContent, title: string) => void;
  clearExplanations: () => void;
}

export const useExplanationStore = create<ExplanationStore>()(
  persist(
    (set) => ({
      currentLevel: 'normal',
      explanations: null,
      title: '',

      setLevel: (level) => set({ currentLevel: level }),
      setExplanations: (explanations, title) => set({ explanations, title }),
      clearExplanations: () => set({ explanations: null, title: '' }),
    }),
    {
      name: 'explanation-settings',
      partialize: (state) => ({ currentLevel: state.currentLevel }), // Only persist level preference
    }
  )
);
```

---

## Testing Checklist

### Unit Tests

- [ ] Renders title correctly
- [ ] Displays correct explanation for selected level
- [ ] Speed selector toggles between levels
- [ ] Markdown renders correctly (headers, lists, code)
- [ ] Code blocks have syntax highlighting
- [ ] Handles empty explanations gracefully
- [ ] Scrolling works for long content

### Integration Tests

- [ ] Updates when state navigation changes
- [ ] Level preference persists across sessions
- [ ] API data loads correctly

### Accessibility Tests

- [ ] Speed selector buttons have proper ARIA states
- [ ] Heading hierarchy is correct
- [ ] Color contrast meets WCAG standards
- [ ] Content is readable by screen readers

---

## Dependencies

```json
{
  "dependencies": {
    "react-markdown": "^9.0.0",
    "react-syntax-highlighter": "^15.5.0"
  }
}
```

---

## Content Writing Guidelines

When writing explanations for courses:

1. **Brief**: One-liner that summarizes the change
2. **Normal**: Short paragraph explaining the what and why
3. **Detailed**:
   - Start with a clear heading
   - Explain the concept being introduced
   - Show the relevant code
   - Walk through how it works
   - Mention common mistakes or gotchas

---

## Related Features

- [State Navigation](./feature-state-navigation.md) - Triggers explanation updates
- [Code Editor](./feature-code-editor.md) - Displays the code being explained
