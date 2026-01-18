# Teknisk Arkitektur - Slow LLM Coding Agent MVP

## Tech Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite** (snabb dev setup)
- **Monaco Editor** (VS Code's editor, har syntax highlighting built-in)
- **Tailwind CSS** (snabb styling)
- **React Query** (för API calls)

### AI Integration  
- **Anthropic Claude API** (via fetch)
- **Model**: Claude Sonnet 4 (snabb och bra för förklaringar)

### State Management
- **Zustand** (enklare än Redux, perfekt för MVP)

---

## Filstruktur

```
slow-llm-coder/
├── src/
│   ├── components/
│   │   ├── CodeViewer.tsx       # Monaco editor
│   │   ├── StateNavigator.tsx   # Timeline + steg-knappar
│   │   ├── Chatbox.tsx          # AI chat per state
│   │   ├── ControlPanel.tsx     # Speed, language controls
│   │   ├── ExplanationPanel.tsx # Visar steg-förklaring
│   │   └── DiffViewer.tsx       # Visa kod-ändringar
│   │
│   ├── stores/
│   │   └── projectStore.ts      # Zustand store
│   │
│   ├── data/
│   │   └── projects/
│   │       ├── calculator.json  # Hårdkodat projekt
│   │       └── todo-app.json
│   │
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   │
│   ├── api/
│   │   └── claude.ts            # Claude API integration
│   │
│   └── App.tsx
│
├── package.json
└── vite.config.ts
```

---

## Data Models

### Project Structure
```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  language: 'python' | 'javascript' | 'java';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  states: CodeState[];
}

interface CodeState {
  id: number;
  code: string;
  explanation: string;
  title: string;  // "Skapa add-funktion"
  diff: {
    added: string[];
    removed: string[];
    modified: { old: string; new: string }[];
  } | null;
  speedExplanations: {
    low: string;     // Kort förklaring för självständiga
    medium: string;  // Normal förklaring
    high: string;    // Detaljerad förklaring för nybörjare
  };
}
```

### Chat Message
```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  stateId: number;  // Vilken state chatten hör till
}
```

---

## State Management (Zustand)

```typescript
interface ProjectStore {
  // Current state
  currentProject: Project | null;
  currentStateIndex: number;
  speed: 'low' | 'medium' | 'high';
  language: string;
  
  // Chat history per state
  chatHistory: Map<number, ChatMessage[]>;
  
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

## Komponenter i detalj

### 1. CodeViewer Component
```typescript
interface CodeViewerProps {
  code: string;
  language: string;
  diff?: {
    added: string[];
    removed: string[];
  };
  readOnly?: boolean;
}
```

**Features**:
- Monaco Editor integration
- Syntax highlighting
- Highlight ändringar (grönt för nya rader, rött för borttagna)
- Line numbers

**Libraries**: `@monaco-editor/react`

---

### 2. StateNavigator Component
```typescript
interface StateNavigatorProps {
  totalStates: number;
  currentState: number;
  onStateChange: (newIndex: number) => void;
}
```

**UI Elements**:
- ◀️ Föregående knapp
- ▶️ Nästa knapp
- Timeline slider (0 till totalStates-1)
- "State X av Y" text
- Snabbnavigering: Hoppa till början/slutet

---

### 3. Chatbox Component
```typescript
interface ChatboxProps {
  stateId: number;
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
}
```

**Features**:
- Message history (scroll)
- Input field
- "Skickar..." loading state
- Exempel-frågor (quick actions):
  - "Varför ändrade du denna rad?"
  - "Vad gör denna funktion?"
  - "Kan du förklara detta enklare?"

---

### 4. ControlPanel Component
```typescript
interface ControlPanelProps {
  speed: 'low' | 'medium' | 'high';
  language: string;
  onSpeedChange: (speed: string) => void;
  onLanguageChange: (lang: string) => void;
}
```

**UI Elements**:
- Speed slider med 3 steg
- Language dropdown (MVP: bara Python)
- Reset button (börja om från början)

---

### 5. ExplanationPanel Component
```typescript
interface ExplanationPanelProps {
  title: string;
  explanation: string;
  stateNumber: number;
}
```

**Features**:
- Visa steg-titel
- Visa förklaring (anpassad efter speed)
- Smooth transitions mellan states

---

## API Integration

### Claude API Call
```typescript
async function askClaude(
  question: string,
  context: {
    code: string;
    explanation: string;
    stateId: number;
  }
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `Du är en tålmodig programmeringslärare. 
          
Här är koden vi jobbar med just nu:
\`\`\`
${context.code}
\`\`\`

Förklaring av detta steg: ${context.explanation}

Studentens fråga: ${question}

Svara kort och pedagogiskt.`
        }
      ]
    })
  });
  
  const data = await response.json();
  return data.content[0].text;
}
```

---

## Hårdkodat exempel-projekt: Kalkylator

```json
{
  "id": "calculator-python",
  "name": "Bygg en enkel kalkylator",
  "description": "Lär dig grunderna genom att bygga en fungerande kalkylator",
  "language": "python",
  "difficulty": "beginner",
  "states": [
    {
      "id": 0,
      "title": "Start: Tom fil",
      "code": "# Kalkylator\n# Vi ska bygga en enkel kalkylator tillsammans!\n",
      "explanation": "Vi börjar med en tom Python-fil. Redo att koda?",
      "diff": null,
      "speedExplanations": {
        "low": "Tom fil. Nästa steg: Skapa add-funktion.",
        "medium": "Vi börjar med en tom fil och kommer gradvis att bygga upp en fungerande kalkylator.",
        "high": "Vi börjar med en tom Python-fil. Python är ett bra språk för nybörjare eftersom syntaxen är ren och läsbar. Vi kommer att bygga en kalkylator steg för steg, där varje funktion hanterar en matematisk operation."
      }
    },
    {
      "id": 1,
      "title": "Skapa add-funktion",
      "code": "# Kalkylator\n\ndef add(a, b):\n    \"\"\"Adderar två tal\"\"\"\n    return a + b\n",
      "explanation": "Vi skapar vår första funktion som adderar två tal.",
      "diff": {
        "added": ["def add(a, b):", "    \"\"\"Adderar två tal\"\"\"", "    return a + b"],
        "removed": ["# Vi ska bygga en enkel kalkylator tillsammans!"]
      },
      "speedExplanations": {
        "low": "add(a, b) returnerar a + b.",
        "medium": "Vi definierar en funktion 'add' som tar två parametrar och returnerar deras summa. Docstring förklarar vad funktionen gör.",
        "high": "Vi skapar vår första funktion med 'def' keyword. Funktionen tar två parametrar (a och b) och använder return för att ge tillbaka resultatet. Docstringen (tre citattecken) är Python best practice för dokumentation."
      }
    },
    {
      "id": 2,
      "title": "Lägg till subtract-funktion",
      "code": "# Kalkylator\n\ndef add(a, b):\n    \"\"\"Adderar två tal\"\"\"\n    return a + b\n\ndef subtract(a, b):\n    \"\"\"Subtraherar b från a\"\"\"\n    return a - b\n",
      "explanation": "Nu lägger vi till en funktion för subtraktion.",
      "diff": {
        "added": ["def subtract(a, b):", "    \"\"\"Subtraherar b från a\"\"\"", "    return a - b"],
        "removed": []
      },
      "speedExplanations": {
        "low": "subtract(a, b) returnerar a - b.",
        "medium": "Samma struktur som add(), men nu subtraherar vi istället.",
        "high": "Vi följer samma pattern som add() för konsekvens. Notera att ordningen spelar roll vid subtraktion: a - b ger olika resultat än b - a."
      }
    }
    // ... fler states
  ]
}
```

---

## MVP Features Checklist

### Must Have
- [x] Projektstruktur definierad
- [ ] React setup med Vite
- [ ] Monaco Editor integration
- [ ] State navigation (next/prev/slider)
- [ ] Ett komplett hårdkodat projekt (10 states)
- [ ] Speed control som ändrar förklaringars längd
- [ ] Chatbox med Claude API
- [ ] Diff visualization
- [ ] Basic styling med Tailwind

### Nice to Have (om tid finns)
- [ ] Multiple projects
- [ ] Syntax error highlighting
- [ ] Code playback (auto-play genom states)
- [ ] Export code till fil
- [ ] Keyboard shortcuts (← → för navigation)

---

## Development Setup

```bash
# 1. Skapa projekt
npm create vite@latest slow-llm-coder -- --template react-ts

# 2. Installera dependencies
cd slow-llm-coder
npm install
npm install @monaco-editor/react
npm install zustand
npm install @tanstack/react-query
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 3. Starta dev server
npm run dev
```

---

## Environment Variables

```env
VITE_CLAUDE_API_KEY=your_api_key_here
```

---

## Next Steps for Implementation

1. **Setup projekt** (30 min)
2. **Skapa hårdkodat projekt-data** (2 tim)
3. **Bygg CodeViewer** (2 tim)
4. **Bygg StateNavigator** (1 tim)
5. **Implementera Zustand store** (1 tim)
6. **Bygg ExplanationPanel** (1 tim)
7. **Bygg Chatbox + Claude integration** (2 tim)
8. **Styling** (2 tim)
9. **Testing & bugfix** (2 tim)

**Total: ~13 timmar utveckling**

---

**Version**: 1.0  
**Uppdaterad**: 2026-01-18
