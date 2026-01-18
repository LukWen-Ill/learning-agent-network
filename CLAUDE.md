# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Slow LLM Coding Agent" - An interactive coding learning platform where students learn programming alongside an AI teacher. The unique feature is "time travel" through code states, allowing students to rewind and see exactly how code evolved step by step.

**Target audience**: Students learning programming with AI as a teaching tool

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Editor**: Monaco Editor (@monaco-editor/react)
- **State Management**: Zustand
- **Styling**: Tailwind CSS v4
- **AI**: Anthropic Claude API (Claude Sonnet 4)

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

Must have: Code editor with split-view, state navigation, one complete hardcoded project, speed control, chatbox per state.

Post-MVP: Multiple languages, temperature modes, dynamic code generation, user accounts, gamification.

---

## Feature Implementation Log

This section documents every feature implementation in detail. Used as training data for model learning.

---

### [FIL-001] Project Setup
**Status**: Complete
**Date**: 2026-01-18

**Feature**: Initialize React + Vite + TypeScript project with all dependencies

**Files Created**:
- `slow-llm-coder/package.json` - Dependencies and scripts
- `slow-llm-coder/vite.config.ts` - Vite configuration (default from template)
- `slow-llm-coder/tsconfig.json` - TypeScript configuration
- `slow-llm-coder/tailwind.config.js` - Tailwind v4 content paths
- `slow-llm-coder/postcss.config.js` - PostCSS with @tailwindcss/postcss
- `slow-llm-coder/src/main.tsx` - React entry point
- `slow-llm-coder/src/index.css` - Tailwind import
- `slow-llm-coder/.env.example` - Environment variable template
- `slow-llm-coder/.gitignore` - Updated with .env exclusion

**Dependencies Installed**:
```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "@monaco-editor/react": "^4.x",
    "zustand": "^4.x",
    "@tanstack/react-query": "^5.x"
  },
  "devDependencies": {
    "tailwindcss": "^4.x",
    "@tailwindcss/postcss": "^4.x",
    "postcss": "^8.x",
    "autoprefixer": "^10.x",
    "typescript": "^5.x",
    "vite": "^7.x"
  }
}
```

**Implementation Details**:
- Used `npm create vite@latest slow-llm-coder -- --template react-ts` for scaffolding
- Tailwind v4 requires `@tailwindcss/postcss` plugin instead of direct `tailwindcss` in PostCSS
- CSS uses `@import "tailwindcss"` instead of `@tailwind` directives in v4

**Decisions Made**:
- Chose Vite over Create React App for faster dev server and modern tooling
- Picked Tailwind v4 for latest features (discovered during build it requires different PostCSS config)
- Used Zustand over Redux for simpler boilerplate

**Lessons Learned**:
- Tailwind v4 has breaking changes from v3: PostCSS plugin moved to separate package
- Must use `@import "tailwindcss"` instead of `@tailwind base/components/utilities`

---

### [FIL-002] TypeScript Types
**Status**: Complete
**Date**: 2026-01-18

**Feature**: Define all TypeScript interfaces for type safety

**Files Created**:
- `src/types/index.ts`

**Types Defined**:
```typescript
// Union types
type Speed = 'low' | 'medium' | 'high';
type Language = 'python' | 'javascript';
type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// Interfaces
interface Diff { added: string[]; removed: string[]; }
interface SpeedExplanations { low: string; medium: string; high: string; }
interface CodeState { id, title, code, explanation, diff, speedExplanations }
interface Project { id, name, description, language, difficulty, states }
interface ChatMessage { id, role, content, timestamp, stateId }
interface ChatContext { code, explanation, stateId, projectName }
```

**Implementation Details**:
- Used union types for constrained string values (Speed, Language, Difficulty)
- SpeedExplanations allows different detail levels per state
- ChatContext bundles data needed for Claude API calls
- All interfaces exported for use across components

**Decisions Made**:
- Kept types in single file for MVP simplicity
- Used `interface` over `type` for objects (better error messages, extensibility)
- Included ChatContext type to ensure consistent API payloads

**Lessons Learned**:
- Defining types upfront clarifies data flow before coding components

---

### [FIL-003] Zustand Store
**Status**: Complete
**Date**: 2026-01-18

**Feature**: Central state management for app

**Files Created**:
- `src/stores/projectStore.ts`

**Store Structure**:
```typescript
interface ProjectStore {
  // State
  currentProject: Project | null;
  currentStateIndex: number;
  speed: Speed;
  chatHistory: Map<number, ChatMessage[]>;
  isLoading: boolean;

  // Actions
  loadProject: (projectId: string) => void;
  nextState: () => void;
  prevState: () => void;
  jumpToState: (index: number) => void;
  setSpeed: (speed: Speed) => void;
  addChatMessage: (stateId: number, message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;

  // Getters
  getCurrentState: () => CodeState | null;
  getExplanation: () => string;
  getChatMessages: (stateId: number) => ChatMessage[];
}
```

**Implementation Details**:
- Uses `create` from Zustand with TypeScript generics
- Project data imported directly from JSON (MVP approach)
- Chat history uses Map for O(1) lookup per stateId
- Getter functions compute derived state (current explanation based on speed)
- Boundary checks in navigation prevent invalid state indices

**Code Pattern** - Zustand store creation:
```typescript
export const useProjectStore = create<ProjectStore>((set, get) => ({
  // Initial state values
  currentProject: null,

  // Action that modifies state
  nextState: () => {
    const { currentProject, currentStateIndex } = get();
    if (currentProject && currentStateIndex < currentProject.states.length - 1) {
      set({ currentStateIndex: currentStateIndex + 1 });
    }
  },

  // Getter that computes derived state
  getExplanation: () => {
    const { currentProject, currentStateIndex, speed } = get();
    if (!currentProject) return '';
    return currentProject.states[currentStateIndex].speedExplanations[speed];
  },
}));
```

**Decisions Made**:
- Used Map for chatHistory over object for type safety with numeric keys
- Bundled getters in store rather than separate selectors for simplicity
- Import projects directly vs fetch for MVP (no async loading)

**Lessons Learned**:
- Zustand's `get()` in actions enables accessing current state
- Map type in Zustand requires careful handling (create new Map on updates)

---

### [FIL-004] Greeter Project Data
**Status**: Complete
**Date**: 2026-01-18

**Feature**: Hardcoded tutorial project for MVP

**Files Created**:
- `src/data/projects/greeter.json`

**Project Structure**:
```json
{
  "id": "greeter",
  "name": "Build a Greeter",
  "description": "Learn Python basics by building a simple greeter program",
  "language": "python",
  "difficulty": "beginner",
  "states": [/* 7 states */]
}
```

**States (7 total)**:
1. **Hello World** - `print("Hello, World!")` - First output
2. **Using a Variable** - `name = "World"` - Store in variable, string concat
3. **Getting User Input** - `input()` - Interactive input
4. **Using f-strings** - `f"Hello, {name}!"` - Modern string formatting
5. **Creating a Function** - `def greet():` - Function definition
6. **Adding a Parameter** - `def greet(name):` - Parameterized function
7. **Complete Greeter** - Full program with main(), docstrings, if __name__

**Each State Contains**:
```json
{
  "id": 0,
  "title": "Hello World",
  "code": "# My First Python Program\nprint(\"Hello, World!\")",
  "explanation": "We start with the classic Hello World program.",
  "diff": null,
  "speedExplanations": {
    "low": "print() outputs text to the screen.",
    "medium": "We use print() to display text. Text in quotes is a string.",
    "high": "Every programmer starts here! The print() function outputs text..."
  }
}
```

**Implementation Details**:
- Each state builds on previous, teaching one concept at a time
- diff.added contains exact lines added (for highlighting)
- speedExplanations vary significantly: low is 1 sentence, high is full paragraph
- Final state teaches Python best practices (main function, docstrings, if __name__)

**Decisions Made**:
- Chose greeter over calculator for simpler MVP (fewer states, clearer progression)
- Used f-strings to teach modern Python
- Included professional patterns in final state to show "real" code structure

**Lessons Learned**:
- Writing 3 explanation levels per state is time-intensive but valuable
- diff arrays should match exact line content for accurate highlighting

---

### [FIL-005] CodeViewer Component
**Status**: Complete
**Date**: 2026-01-18

**Feature**: Monaco editor wrapper with diff highlighting

**Files Created**:
- `src/components/CodeViewer.tsx`

**Props Interface**:
```typescript
interface CodeViewerProps {
  code: string;
  language: string;
  diff?: Diff | null;
}
```

**Implementation Details**:

1. **Monaco Editor Integration**:
```typescript
import Editor, { type OnMount } from '@monaco-editor/react';

<Editor
  height="100%"
  language={language}
  value={code}
  theme="vs-dark"
  onMount={handleEditorMount}
  options={{
    readOnly: true,
    minimap: { enabled: false },
    fontSize: 14,
    // ... more options
  }}
/>
```

2. **Diff Highlighting with Decorations**:
```typescript
const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
const decorationsRef = useRef<editor.IEditorDecorationsCollection | null>(null);

const applyDiffHighlights = () => {
  const decorations: editor.IModelDeltaDecoration[] = [];

  // Find lines that match diff.added and apply green decoration
  lines.forEach((line, index) => {
    if (diff.added.some(added => added.trim() === line.trim())) {
      decorations.push({
        range: { startLineNumber: index + 1, ... },
        options: {
          isWholeLine: true,
          className: 'diff-added-line',  // Green background
          glyphMarginClassName: 'diff-added-glyph',  // Green sidebar
        },
      });
    }
  });

  decorationsRef.current.set(decorations);
};
```

3. **CSS for Highlighting** (injected via style tag):
```css
.diff-added-line { background-color: rgba(34, 197, 94, 0.2) !important; }
.diff-added-glyph { background-color: rgb(34, 197, 94); width: 4px; }
```

**Decisions Made**:
- Used Monaco decorations API over manual DOM manipulation
- Read-only mode prevents student edits (intentional for MVP)
- vs-dark theme matches overall dark UI
- Glyph margin shows green bar for added lines (git-style)

**Lessons Learned**:
- Monaco requires `type OnMount` import with verbatimModuleSyntax
- Decorations must be recreated on code/diff changes via useEffect
- Line matching uses trim() to handle whitespace differences

---

### [FIL-006] StateNavigator Component
**Status**: Complete
**Date**: 2026-01-18

**Feature**: Navigation controls for stepping through states

**Files Created**:
- `src/components/StateNavigator.tsx`

**Props Interface**:
```typescript
interface StateNavigatorProps {
  totalStates: number;
  currentState: number;
  onStateChange: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
}
```

**Implementation Details**:

1. **Button State Management**:
```typescript
const isFirst = currentState === 0;
const isLast = currentState === totalStates - 1;

<button
  onClick={onPrev}
  disabled={isFirst}
  className={isFirst ? 'bg-gray-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
>
  ◀ Prev
</button>
```

2. **Range Slider with Custom Styling**:
```typescript
<input
  type="range"
  min={0}
  max={totalStates - 1}
  value={currentState}
  onChange={(e) => onStateChange(Number(e.target.value))}
  className="[&::-webkit-slider-thumb]:appearance-none
             [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
             [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full"
/>
```

3. **Step Counter**:
```typescript
<span>Step {currentState + 1} of {totalStates}</span>
```

**Decisions Made**:
- Separated onPrev/onNext from onStateChange for cleaner handler logic
- Used native range input over custom slider for accessibility
- 1-indexed display (Step 1 of 7) though 0-indexed internally

**Lessons Learned**:
- Tailwind arbitrary variants `[&::-webkit-slider-thumb]` style native inputs
- disabled button needs both visual styling AND cursor change

---

### [FIL-007] ExplanationPanel Component
**Status**: Complete
**Date**: 2026-01-18

**Feature**: Display step title and explanation

**Files Created**:
- `src/components/ExplanationPanel.tsx`

**Props Interface**:
```typescript
interface ExplanationPanelProps {
  title: string;
  explanation: string;
  stateNumber: number;
  totalStates: number;
}
```

**Implementation Details**:
```typescript
<div className="bg-gray-800 rounded-lg p-4 h-full flex flex-col">
  {/* Step badge */}
  <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
    Step {stateNumber + 1}/{totalStates}
  </span>

  {/* Title */}
  <h2 className="text-xl font-bold text-white mb-3">{title}</h2>

  {/* Scrollable explanation */}
  <div className="flex-1 overflow-y-auto">
    <p className="text-gray-300 whitespace-pre-wrap">{explanation}</p>
  </div>
</div>
```

**Decisions Made**:
- Used flex-col with flex-1 for proper height distribution
- whitespace-pre-wrap preserves formatting in explanations
- overflow-y-auto handles long explanations with scroll

---

### [FIL-008] ControlPanel Component
**Status**: Complete
**Date**: 2026-01-18

**Feature**: Speed control and project info display

**Files Created**:
- `src/components/ControlPanel.tsx`

**Implementation Details**:

1. **Speed Level Configuration**:
```typescript
const speedLevels = [
  { value: 'low', label: 'Brief', description: 'AI leads' },
  { value: 'medium', label: 'Balanced', description: '50/50' },
  { value: 'high', label: 'Detailed', description: 'You lead' },
];
```

2. **Segmented Button Group**:
```typescript
<div className="flex bg-gray-700 rounded-lg p-1">
  {speedLevels.map((level) => (
    <button
      key={level.value}
      onClick={() => onSpeedChange(level.value)}
      className={speed === level.value
        ? 'bg-blue-600 text-white'
        : 'text-gray-400 hover:text-white hover:bg-gray-600'}
      title={level.description}
    >
      {level.label}
    </button>
  ))}
</div>
```

**Decisions Made**:
- Used button group over slider for clear discrete options
- Labels changed from "Low/Medium/High" to "Brief/Balanced/Detailed" for clarity
- Title tooltip shows original speed description on hover

---

### [FIL-009] Chatbox Component
**Status**: Complete
**Date**: 2026-01-18

**Feature**: AI chat interface per state

**Files Created**:
- `src/components/Chatbox.tsx`

**Props Interface**:
```typescript
interface ChatboxProps {
  stateId: number;
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
}
```

**Implementation Details**:

1. **Quick Question Buttons**:
```typescript
const quickQuestions = [
  'Why did you make this change?',
  'Can you explain this simpler?',
  'What does this line do?',
];

{quickQuestions.map((q) => (
  <button onClick={() => setInput(q)}>{q}</button>
))}
```

2. **Auto-scroll to Bottom**:
```typescript
const messagesEndRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);

// In JSX
<div ref={messagesEndRef} />  {/* Empty div at end of messages */}
```

3. **Enter Key Handling**:
```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
};
```

4. **Message Styling by Role**:
```typescript
<div className={msg.role === 'user'
  ? 'bg-blue-600 text-white ml-8'    // Right-aligned
  : 'bg-gray-700 text-gray-200 mr-8'  // Left-aligned
}>
```

**Decisions Made**:
- Quick questions reduce friction for common queries
- Shift+Enter allows newlines (though not visible in current single-line input)
- Loading state shows "Thinking..." placeholder

---

### [FIL-010] Claude API Integration
**Status**: Complete
**Date**: 2026-01-18

**Feature**: API wrapper for chatbox responses

**Files Created**:
- `src/api/claude.ts`

**Main Function**:
```typescript
export async function askClaude(
  question: string,
  context: ChatContext
): Promise<string>
```

**Implementation Details**:

1. **API Request**:
```typescript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',  // Required for browser calls
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{ role: 'user', content: buildPrompt(question, context) }],
  }),
});
```

2. **Prompt Construction**:
```typescript
function buildPrompt(question: string, context: ChatContext): string {
  return `You are a patient programming teacher...

The student is working through "${context.projectName}".
They are on step ${context.stateId + 1}.

Here is the current code:
\`\`\`python
${context.code}
\`\`\`

The explanation for this step is: "${context.explanation}"

The student asks: "${question}"

Respond helpfully and pedagogically...`;
}
```

3. **Error Handling**:
```typescript
if (!apiKey) {
  return 'API key not configured. Please add VITE_CLAUDE_API_KEY to your .env file.';
}

if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));
  return `Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`;
}
```

**Decisions Made**:
- Direct browser fetch with `anthropic-dangerous-direct-browser-access` header for MVP
- Returns error messages as strings rather than throwing (simpler error handling in UI)
- Plain text responses requested (no markdown) for clean display

**Lessons Learned**:
- Browser-based Claude API calls require special header
- Vite env vars must be prefixed with VITE_

---

### [FIL-011] App Layout
**Status**: Complete
**Date**: 2026-01-18

**Feature**: Main app layout combining all components

**Files Modified**:
- `src/App.tsx`

**Layout Structure**:
```
┌─────────────────────────────────────────────────────────┐
│  ControlPanel (speed + project name)                    │
├────────────────────────────┬────────────────────────────┤
│                            │  ExplanationPanel          │
│  CodeViewer                │  (title + explanation)     │
│  (Monaco Editor)           ├────────────────────────────┤
│                            │  Chatbox                   │
│                            │  (ask questions)           │
├────────────────────────────┴────────────────────────────┤
│  StateNavigator (◀ prev | slider | next ▶)              │
└─────────────────────────────────────────────────────────┘
```

**Implementation Details**:

1. **Auto-load Project on Mount**:
```typescript
useEffect(() => {
  loadProject('greeter');
}, [loadProject]);
```

2. **Chat Message Handler**:
```typescript
const handleSendMessage = async (message: string) => {
  // Add user message immediately
  addChatMessage(currentStateIndex, userMessage);

  // Get AI response
  setLoading(true);
  try {
    const response = await askClaude(message, context);
    addChatMessage(currentStateIndex, assistantMessage);
  } finally {
    setLoading(false);
  }
};
```

3. **Flexbox Layout**:
```typescript
<div className="min-h-screen bg-gray-900 p-4 flex flex-col gap-4">
  <ControlPanel ... />

  <div className="flex-1 flex gap-4 min-h-0">
    {/* Left: Code */}
    <div className="flex-1 min-w-0">
      <CodeViewer ... />
    </div>

    {/* Right: Explanation + Chat */}
    <div className="w-96 flex flex-col gap-4 min-h-0">
      <div className="h-1/2"><ExplanationPanel ... /></div>
      <div className="h-1/2"><Chatbox ... /></div>
    </div>
  </div>

  <StateNavigator ... />
</div>
```

**Decisions Made**:
- Fixed width (w-96) for right panel, flexible code panel
- 50/50 split between explanation and chatbox
- min-h-0 required for flex children to allow shrinking

---

### [FIL-012] Tailwind Styling
**Status**: Complete
**Date**: 2026-01-18

**Feature**: Visual styling for all components

**Files Modified**:
- All component files (inline Tailwind classes)
- `src/index.css`
- `postcss.config.js`

**Color Scheme**:
- Background: `bg-gray-900` (main), `bg-gray-800` (panels)
- Primary: `bg-blue-600` (buttons, highlights)
- Text: `text-white` (primary), `text-gray-300` (secondary), `text-gray-400` (muted)
- Borders: `border-gray-700`

**Common Patterns Used**:
```typescript
// Card/Panel styling
"bg-gray-800 rounded-lg p-4"

// Primary button
"bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"

// Disabled button
"bg-gray-700 text-gray-500 cursor-not-allowed"

// Input field
"bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"

// Flex layouts
"flex flex-col gap-4"
"flex-1 min-h-0"  // For proper flex shrinking
```

**Tailwind v4 Setup**:
```javascript
// postcss.config.js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}

// index.css
@import "tailwindcss";
```

**Decisions Made**:
- Dark theme throughout (matches Monaco vs-dark)
- Consistent 4px border-radius on all elements
- Gap-based spacing over margins for consistency

**Lessons Learned**:
- Tailwind v4 uses `@import "tailwindcss"` instead of `@tailwind` directives
- `min-h-0` is essential for flex items that need to shrink below content size
