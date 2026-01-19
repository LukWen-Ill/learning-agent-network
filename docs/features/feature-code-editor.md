# Feature: Code Editor Display

## Overview

Display code snapshots in a read-only editor with syntax highlighting. Each "state" represents a moment in the code's evolution. Students view code as it was at each step of the tutorial.

---

## User Story

**As a** student learning to code
**I want to** see code displayed with proper syntax highlighting
**So that** I can easily read and understand the code structure

---

## Acceptance Criteria

- [ ] Syntax highlighting for Python and JavaScript
- [ ] Read-only display mode (no editing)
- [ ] Responsive layout (works on different screen sizes)
- [ ] Loads code from the current state
- [ ] Line numbers displayed
- [ ] Smooth transition when state changes
- [ ] Monospace font for code readability

---

## Data Model

### TypeScript Interface (Frontend)

```typescript
// types/codeEditor.ts

export interface CodeEditorProps {
  code: string;
  language: 'python' | 'javascript' | 'java';
  highlightedLines?: {
    added: number[];
    removed: number[];
  };
  showLineNumbers?: boolean;
  readOnly?: boolean;
}

export interface CodeEditorState {
  isLoading: boolean;
  error: string | null;
}
```

### C# DTO (Backend Response)

```csharp
// DTOs/CodeStateDto.cs

public class CodeStateDto
{
    public int Id { get; set; }
    public int StateIndex { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Language { get; set; } = "python";
}

// Used when fetching a single state's code
public class CodeContentDto
{
    public string Code { get; set; } = string.Empty;
    public string Language { get; set; } = "python";
    public int TotalLines { get; set; }
}
```

---

## API Endpoints

### Get Code for a State

```
GET /api/projects/{projectId}/states/{stateIndex}/code
```

**Response:**
```json
{
  "code": "# Simple Calculator\ndef add(a, b):\n    return a + b",
  "language": "python",
  "totalLines": 4
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Project or state not found

---

## Component Structure

### Component Tree

```
CodeEditor/
├── index.tsx           # Main export
├── CodeEditor.tsx      # Main component
├── CodeEditor.styles.ts # Tailwind classes
├── hooks/
│   └── useCodeEditor.ts # Custom hook for state
└── __tests__/
    └── CodeEditor.test.tsx
```

### Component Implementation

```tsx
// components/CodeEditor/CodeEditor.tsx

import React from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { CodeEditorProps } from '../../types/codeEditor';

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  language,
  highlightedLines,
  showLineNumbers = true,
}) => {
  const getLineClassName = (lineNumber: number): string => {
    if (highlightedLines?.added.includes(lineNumber)) {
      return 'bg-green-100 dark:bg-green-900/30';
    }
    if (highlightedLines?.removed.includes(lineNumber)) {
      return 'bg-red-100 dark:bg-red-900/30';
    }
    return '';
  };

  return (
    <div className="w-full h-full overflow-auto bg-gray-900 rounded-lg">
      <Highlight
        theme={themes.vsDark}
        code={code}
        language={language}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={`${className} p-4 text-sm`} style={style}>
            {tokens.map((line, i) => {
              const lineNumber = i + 1;
              return (
                <div
                  key={i}
                  {...getLineProps({ line })}
                  className={`${getLineClassName(lineNumber)} flex`}
                >
                  {showLineNumbers && (
                    <span className="select-none text-gray-500 w-12 text-right pr-4">
                      {lineNumber}
                    </span>
                  )}
                  <span className="flex-1">
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </span>
                </div>
              );
            })}
          </pre>
        )}
      </Highlight>
    </div>
  );
};
```

### Alternative: CodeMirror 6 Implementation

```tsx
// components/CodeEditor/CodeEditorCM.tsx

import React, { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, lineNumbers } from '@codemirror/view';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

interface Props {
  code: string;
  language: 'python' | 'javascript';
}

export const CodeEditorCM: React.FC<Props> = ({ code, language }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const languageExtension = language === 'python' ? python() : javascript();

    const state = EditorState.create({
      doc: code,
      extensions: [
        lineNumbers(),
        languageExtension,
        oneDark,
        EditorState.readOnly.of(true),
      ],
    });

    viewRef.current = new EditorView({
      state,
      parent: editorRef.current,
    });

    return () => viewRef.current?.destroy();
  }, [code, language]);

  return <div ref={editorRef} className="w-full h-full" />;
};
```

---

## State Management (Zustand)

```typescript
// store/codeEditorStore.ts

import { create } from 'zustand';

interface CodeEditorStore {
  currentCode: string;
  language: 'python' | 'javascript' | 'java';
  isLoading: boolean;
  error: string | null;

  setCode: (code: string) => void;
  setLanguage: (lang: 'python' | 'javascript' | 'java') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useCodeEditorStore = create<CodeEditorStore>((set) => ({
  currentCode: '',
  language: 'python',
  isLoading: false,
  error: null,

  setCode: (code) => set({ currentCode: code }),
  setLanguage: (language) => set({ language }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
```

---

## Styling (Tailwind CSS)

```typescript
// components/CodeEditor/CodeEditor.styles.ts

export const codeEditorStyles = {
  container: 'w-full h-full min-h-[400px] bg-gray-900 rounded-lg overflow-hidden shadow-lg',

  wrapper: 'relative h-full',

  editor: 'font-mono text-sm leading-relaxed',

  lineNumber: 'select-none text-gray-500 text-right pr-4 w-12 inline-block',

  lineContent: 'flex-1',

  lineHighlightAdded: 'bg-green-900/30 border-l-2 border-green-500',

  lineHighlightRemoved: 'bg-red-900/30 border-l-2 border-red-500',

  loadingOverlay: 'absolute inset-0 flex items-center justify-center bg-gray-900/80',

  errorMessage: 'text-red-400 text-center p-4',
};
```

---

## UI Mockup Description

```
┌─────────────────────────────────────────────────────────────┐
│  Code Editor                                          [📋]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1  │  # Simple Calculator                                  │
│  2  │  # Build step by step                                 │
│  3  │                                                       │
│  4  │  def add(a, b):              ← Green highlight       │
│  5  │      return a + b            ← Green highlight       │
│  6  │                                                       │
│  7  │  def subtract(a, b):                                  │
│  8  │      return a - b                                     │
│  9  │                                                       │
│ 10  │  # Main program                                       │
│ 11  │  result = add(5, 3)                                   │
│ 12  │  print(result)                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Legend:
- Line numbers on the left (gray)
- Green highlight = added lines (from diff)
- Red highlight = removed lines (shown in diff view)
- [📋] = Copy to clipboard button (optional)
```

---

## Dependencies

### NPM Packages

```json
{
  "dependencies": {
    "prism-react-renderer": "^2.3.0"
  }
}
```

**OR** for CodeMirror 6:

```json
{
  "dependencies": {
    "@codemirror/state": "^6.4.0",
    "@codemirror/view": "^6.24.0",
    "@codemirror/lang-python": "^6.1.0",
    "@codemirror/lang-javascript": "^6.2.0",
    "@codemirror/theme-one-dark": "^6.1.0"
  }
}
```

---

## Testing Checklist

### Unit Tests

- [ ] Renders code correctly
- [ ] Applies syntax highlighting
- [ ] Shows line numbers when enabled
- [ ] Highlights added lines in green
- [ ] Highlights removed lines in red
- [ ] Handles empty code gracefully
- [ ] Switches language correctly

### Integration Tests

- [ ] Loads code from API
- [ ] Updates when state changes
- [ ] Handles loading state
- [ ] Displays error messages

### Visual Tests

- [ ] Readable on light/dark themes
- [ ] Responsive on mobile
- [ ] Scrolls long code properly

---

## Error Handling

| Scenario | User Feedback |
|----------|---------------|
| API timeout | "Loading code..." with retry button |
| Invalid language | Fall back to plain text |
| Empty code | Show placeholder message |
| Network error | "Unable to load code. Check connection." |

---

## Performance Considerations

1. **Virtualization**: For files >500 lines, consider virtual scrolling
2. **Memoization**: Memoize syntax highlighting for unchanged code
3. **Lazy Loading**: Load CodeMirror dynamically to reduce bundle size

---

## Implementation Notes

1. Start with `prism-react-renderer` for simplicity (MVP)
2. CodeMirror 6 is optional for advanced features (post-MVP)
3. The editor is always read-only in MVP
4. Copy button is nice-to-have, not required for MVP
