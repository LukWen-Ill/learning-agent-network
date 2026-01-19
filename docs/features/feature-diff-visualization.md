# Feature: Code Diff Visualization

## Overview

**Feature ID:** F004
**Priority:** High (MVP Core)
**Status:** Not Started

Highlight what changed between states. Show added lines (green) and removed lines (red) so students understand each modification.

---

## User Story

> As a **student**, I want to **see what code changed between steps**, so that I can **understand exactly what was modified and why**.

---

## Acceptance Criteria

- [ ] Highlight added lines with green background
- [ ] Highlight removed lines with red background
- [ ] Show line-by-line diff between current and previous state
- [ ] Toggle diff view on/off
- [ ] Clear visual distinction between added/removed/unchanged
- [ ] Show diff markers in the gutter (+ for added, - for removed)
- [ ] Support side-by-side view (optional, nice-to-have)
- [ ] Smooth transition when toggling diff view

---

## Data Model

### TypeScript Interfaces

```typescript
// types/diff.ts

export interface DiffLine {
  lineNumber: number;
  content: string;
  type: 'added' | 'removed' | 'unchanged';
}

export interface CodeDiff {
  addedLines: number[];    // Line numbers that were added
  removedLines: number[];  // Line numbers that were removed
  previousCode?: string;   // Previous state's code (for side-by-side)
}

export interface DiffVisualizerProps {
  code: string;
  diff: CodeDiff | null;
  language: 'python' | 'javascript';
  showDiff: boolean;
  onToggleDiff: () => void;
}

export interface DiffToggleProps {
  isEnabled: boolean;
  onChange: (enabled: boolean) => void;
}
```

### C# DTO

```csharp
// DTOs/DiffDto.cs

public record CodeDiffDto
{
    public int CodeStateId { get; init; }
    public List<int> AddedLines { get; init; } = new();
    public List<int> RemovedLines { get; init; } = new();
}

// Combined response when fetching a state with diff info
public record StateWithDiffDto
{
    public int Id { get; init; }
    public int StateIndex { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public CodeDiffDto? Diff { get; init; }
}
```

---

## API Endpoints

### GET /api/projects/{projectId}/states/{stateIndex}/diff

Returns diff information for a specific state.

**Response:**
```json
{
  "codeStateId": 5,
  "addedLines": [12, 13, 14, 15, 16],
  "removedLines": [8]
}
```

**C# Implementation:**
```csharp
app.MapGet("/api/projects/{projectId}/states/{stateIndex}/diff",
    async (int projectId, int stateIndex, AppDbContext db) =>
{
    var state = await db.CodeStates
        .Include(s => s.CodeDiff)
        .FirstOrDefaultAsync(s => s.ProjectId == projectId && s.StateIndex == stateIndex);

    if (state is null) return Results.NotFound();
    if (state.CodeDiff is null) return Results.Ok(new { addedLines = Array.Empty<int>(), removedLines = Array.Empty<int>() });

    return Results.Ok(new CodeDiffDto
    {
        CodeStateId = state.Id,
        AddedLines = state.CodeDiff.AddedLines ?? new List<int>(),
        RemovedLines = state.CodeDiff.RemovedLines ?? new List<int>()
    });
});
```

---

## Component Structure

### File Structure

```
src/
├── components/
│   └── DiffViewer/
│       ├── DiffViewer.tsx         # Main diff visualization
│       ├── DiffToggle.tsx         # On/off toggle button
│       ├── DiffGutter.tsx         # +/- markers in gutter
│       ├── DiffLine.tsx           # Single line with diff styling
│       ├── DiffViewer.types.ts
│       └── index.ts
```

### Component Hierarchy

```
<DiffViewer>
├── <DiffToggle />         # Toggle button for diff view
├── <DiffGutter />         # +/- markers column
└── <DiffLine />[]         # Individual lines with highlighting
```

### Main Component Implementation

```tsx
// components/DiffViewer/DiffViewer.tsx

import { useMemo } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { DiffToggle } from './DiffToggle';
import { DiffLine } from './DiffLine';
import type { DiffVisualizerProps } from './DiffViewer.types';

export function DiffViewer({
  code,
  diff,
  language,
  showDiff,
  onToggleDiff,
}: DiffVisualizerProps) {
  const lines = useMemo(() => code.split('\n'), [code]);

  const getLineType = (lineNumber: number): 'added' | 'removed' | 'unchanged' => {
    if (!diff || !showDiff) return 'unchanged';
    if (diff.addedLines.includes(lineNumber)) return 'added';
    if (diff.removedLines.includes(lineNumber)) return 'removed';
    return 'unchanged';
  };

  return (
    <div className="diff-viewer bg-gray-900 rounded-lg overflow-hidden">
      {/* Header with toggle */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-sm text-gray-400">Code</span>
        <DiffToggle isEnabled={showDiff} onChange={onToggleDiff} />
      </div>

      {/* Code with diff highlighting */}
      <div className="overflow-auto">
        <Highlight theme={themes.vsDark} code={code} language={language}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre className={`${className} p-4 text-sm`} style={style}>
              {tokens.map((line, i) => {
                const lineNumber = i + 1;
                const lineType = getLineType(lineNumber);

                return (
                  <DiffLine
                    key={i}
                    lineNumber={lineNumber}
                    lineType={lineType}
                    showDiff={showDiff}
                    lineProps={getLineProps({ line })}
                    tokens={line}
                    getTokenProps={getTokenProps}
                  />
                );
              })}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
}
```

### DiffLine Component

```tsx
// components/DiffViewer/DiffLine.tsx

import type { Token } from 'prism-react-renderer';

interface DiffLineProps {
  lineNumber: number;
  lineType: 'added' | 'removed' | 'unchanged';
  showDiff: boolean;
  lineProps: any;
  tokens: Token[];
  getTokenProps: (opts: { token: Token; key: number }) => any;
}

const lineStyles = {
  added: 'bg-green-900/40 border-l-4 border-green-500',
  removed: 'bg-red-900/40 border-l-4 border-red-500',
  unchanged: '',
};

const gutterStyles = {
  added: 'text-green-400',
  removed: 'text-red-400',
  unchanged: 'text-gray-500',
};

const gutterSymbols = {
  added: '+',
  removed: '-',
  unchanged: ' ',
};

export function DiffLine({
  lineNumber,
  lineType,
  showDiff,
  lineProps,
  tokens,
  getTokenProps,
}: DiffLineProps) {
  return (
    <div
      {...lineProps}
      className={`flex ${showDiff ? lineStyles[lineType] : ''}`}
    >
      {/* Diff gutter (+ / -) */}
      {showDiff && (
        <span className={`w-6 text-center select-none ${gutterStyles[lineType]}`}>
          {gutterSymbols[lineType]}
        </span>
      )}

      {/* Line number */}
      <span className="w-12 text-right pr-4 select-none text-gray-500">
        {lineNumber}
      </span>

      {/* Code content */}
      <span className="flex-1">
        {tokens.map((token, key) => (
          <span key={key} {...getTokenProps({ token, key })} />
        ))}
      </span>
    </div>
  );
}
```

### DiffToggle Component

```tsx
// components/DiffViewer/DiffToggle.tsx

interface DiffToggleProps {
  isEnabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function DiffToggle({ isEnabled, onChange }: DiffToggleProps) {
  return (
    <button
      onClick={() => onChange(!isEnabled)}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
        transition-all duration-200
        ${isEnabled
          ? 'bg-blue-600 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }
      `}
      aria-pressed={isEnabled}
    >
      <DiffIcon className="w-4 h-4" />
      {isEnabled ? 'Hide Changes' : 'Show Changes'}
    </button>
  );
}

function DiffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
```

---

## UI Mockup Description

### Diff View Enabled

```
┌─────────────────────────────────────────────────────────────┐
│  Code                                  [Show Changes: ON]    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│     1  │  # Simple Calculator                                │
│     2  │  # Build step by step                               │
│     3  │                                                     │
│  +  4  │  def validate_input(value):       ← Green BG       │
│  +  5  │      try:                         ← Green BG       │
│  +  6  │          return float(value)      ← Green BG       │
│  +  7  │      except ValueError:           ← Green BG       │
│  +  8  │          return None              ← Green BG       │
│     9  │                                                     │
│    10  │  def add(a, b):                                     │
│    11  │      return a + b                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Legend:
+ = Added line (green background, green + in gutter)
- = Removed line (red background, red - in gutter)
  = Unchanged line (no background)
```

### Diff View Disabled

```
┌─────────────────────────────────────────────────────────────┐
│  Code                                  [Show Changes: OFF]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1  │  # Simple Calculator                                   │
│  2  │  # Build step by step                                  │
│  3  │                                                        │
│  4  │  def validate_input(value):                            │
│  5  │      try:                                              │
│  6  │          return float(value)                           │
│  7  │      except ValueError:                                │
│  8  │          return None                                   │
│  ...                                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## State Management Integration

```typescript
// store/diffStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CodeDiff } from '../types';

interface DiffStore {
  showDiff: boolean;
  currentDiff: CodeDiff | null;

  setShowDiff: (show: boolean) => void;
  toggleDiff: () => void;
  setDiff: (diff: CodeDiff | null) => void;
  clearDiff: () => void;
}

export const useDiffStore = create<DiffStore>()(
  persist(
    (set, get) => ({
      showDiff: true,  // Default to showing diff
      currentDiff: null,

      setShowDiff: (show) => set({ showDiff: show }),
      toggleDiff: () => set({ showDiff: !get().showDiff }),
      setDiff: (diff) => set({ currentDiff: diff }),
      clearDiff: () => set({ currentDiff: null }),
    }),
    {
      name: 'diff-settings',
      partialize: (state) => ({ showDiff: state.showDiff }), // Only persist preference
    }
  )
);
```

---

## Color Scheme

| State | Background | Border | Gutter Text |
|-------|------------|--------|-------------|
| Added | `bg-green-900/40` | `border-green-500` | `text-green-400` |
| Removed | `bg-red-900/40` | `border-red-500` | `text-red-400` |
| Unchanged | transparent | none | `text-gray-500` |

---

## Diff Calculation (Backend)

For pre-written courses, diffs are stored in the database. Here's how to calculate them when creating course content:

```csharp
// Services/DiffCalculator.cs

public static class DiffCalculator
{
    public static (List<int> added, List<int> removed) CalculateDiff(string previousCode, string currentCode)
    {
        var previousLines = previousCode.Split('\n').ToList();
        var currentLines = currentCode.Split('\n').ToList();

        var added = new List<int>();
        var removed = new List<int>();

        // Simple line-by-line comparison
        // For MVP, we track which lines in the NEW code are different

        int maxLines = Math.Max(previousLines.Count, currentLines.Count);

        for (int i = 0; i < currentLines.Count; i++)
        {
            // Line is "added" if it doesn't exist in previous or is different
            if (i >= previousLines.Count || previousLines[i] != currentLines[i])
            {
                // Check if this line exists anywhere in previous (moved vs truly new)
                if (!previousLines.Contains(currentLines[i]))
                {
                    added.Add(i + 1); // 1-indexed
                }
            }
        }

        // Note: For MVP, we focus on added lines. Removed lines are shown in previous state.
        // A more sophisticated diff algorithm (like Myers) would be used for production.

        return (added, removed);
    }
}
```

---

## Testing Checklist

### Unit Tests

- [ ] Renders code with no diff (showDiff = false)
- [ ] Highlights added lines in green when showDiff = true
- [ ] Highlights removed lines in red when showDiff = true
- [ ] Toggle button switches diff view on/off
- [ ] Gutter shows + for added lines
- [ ] Gutter shows - for removed lines
- [ ] Handles empty diff (first state)
- [ ] Handles null diff gracefully

### Integration Tests

- [ ] Diff updates when navigating between states
- [ ] Diff toggle preference persists
- [ ] API correctly returns diff data
- [ ] Diff view syncs with code editor

### Visual Tests

- [ ] Green highlighting visible on dark background
- [ ] Red highlighting visible on dark background
- [ ] Gutter symbols properly aligned
- [ ] Scrolling works with large diffs

---

## Performance Considerations

1. **Memoization**: Memoize line type calculations to avoid recalculating on every render
2. **Virtualization**: For files with 500+ lines, consider virtual scrolling
3. **Batch Updates**: When navigating quickly, debounce diff highlighting updates

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| First state (no previous) | Show all lines as "added" or no diff |
| Empty file | Show empty editor |
| Only removed lines | Show red highlights (or placeholder) |
| Large diff (50+ lines) | Consider collapsible sections (post-MVP) |

---

## Dependencies

```json
{
  "dependencies": {
    "prism-react-renderer": "^2.3.0"
  }
}
```

---

## Related Features

- [Code Editor](./feature-code-editor.md) - Integrates with diff highlighting
- [State Navigation](./feature-state-navigation.md) - Triggers diff updates
- [Explanation Panel](./feature-explanation-panel.md) - May reference diff context
