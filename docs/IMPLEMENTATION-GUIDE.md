# MVP Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing the Slow LLM Coding Agent MVP. Follow these steps in order to build the complete application.

**MVP Scope:**
- 2 pre-written courses: Calculator (Python) + Todo List App (JavaScript)
- 4 core features: Code Editor, State Navigation, Explanation Panel, Diff Visualization
- 3-level explanation system: Brief / Normal / Detailed
- No AI integration in MVP

---

## Table of Contents

1. [Project Setup](#1-project-setup)
2. [Database Setup](#2-database-setup)
3. [Backend Implementation](#3-backend-implementation)
4. [Frontend Implementation](#4-frontend-implementation)
5. [Feature Implementation Order](#5-feature-implementation-order)
6. [Integration](#6-integration)
7. [Course Content Creation](#7-course-content-creation)
8. [Testing](#8-testing)
9. [Deployment Checklist](#9-deployment-checklist)

---

## 1. Project Setup

### 1.1 Create Frontend Project

```bash
# Create Vite + React + TypeScript project
npm create vite@latest slow-llm-coder -- --template react-ts
cd slow-llm-coder

# Install dependencies
npm install

# Install additional packages
npm install zustand @tanstack/react-query
npm install prism-react-renderer react-markdown react-syntax-highlighter
npm install -D @types/react-syntax-highlighter

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 1.2 Configure Tailwind CSS

**tailwind.config.js:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**src/index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles */
body {
  @apply bg-gray-900 text-white;
}
```

### 1.3 Create Backend Project

```bash
# Create .NET minimal API project
mkdir backend
cd backend

dotnet new web -n SlowLlmCoder
cd SlowLlmCoder

# Install packages
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Pomelo.EntityFrameworkCore.MySql
dotnet add package Microsoft.EntityFrameworkCore.Design
```

### 1.4 Project Structure

```
slow-llm-coder/
├── backend/
│   └── SlowLlmCoder/
│       ├── Data/
│       │   └── AppDbContext.cs
│       ├── Models/
│       │   ├── Project.cs
│       │   ├── CodeState.cs
│       │   ├── Explanation.cs
│       │   └── CodeDiff.cs
│       ├── DTOs/
│       │   └── *.cs
│       ├── Endpoints/
│       │   └── *.cs
│       ├── Program.cs
│       └── appsettings.json
├── src/
│   ├── components/
│   │   ├── CodeEditor/
│   │   ├── StateNavigator/
│   │   ├── ExplanationPanel/
│   │   └── DiffViewer/
│   ├── store/
│   │   └── *.ts
│   ├── types/
│   │   └── *.ts
│   ├── hooks/
│   │   └── *.ts
│   ├── App.tsx
│   └── main.tsx
├── docs/
│   └── (documentation files)
└── package.json
```

---

## 2. Database Setup

### 2.1 Create MySQL Database

Using MySQL Workbench or command line:

```sql
CREATE DATABASE slow_llm_coder CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2.2 Run Schema Script

Execute the full schema from `docs/DATABASE-SCHEMA.md`:

```sql
USE slow_llm_coder;

-- Create Projects table
CREATE TABLE Projects (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Description TEXT,
    Language ENUM('python', 'javascript', 'java') NOT NULL DEFAULT 'python',
    Difficulty ENUM('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'beginner',
    TotalStates INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    IsActive BOOLEAN DEFAULT TRUE
);

-- Create CodeStates table
CREATE TABLE CodeStates (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    ProjectId INT NOT NULL,
    StateIndex INT NOT NULL,
    Title VARCHAR(200) NOT NULL,
    Code TEXT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ProjectId) REFERENCES Projects(Id) ON DELETE CASCADE,
    UNIQUE KEY uk_project_state (ProjectId, StateIndex)
);

-- Create Explanations table
CREATE TABLE Explanations (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    CodeStateId INT NOT NULL,
    Level ENUM('brief', 'normal', 'detailed') NOT NULL,
    Content TEXT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CodeStateId) REFERENCES CodeStates(Id) ON DELETE CASCADE,
    UNIQUE KEY uk_state_level (CodeStateId, Level)
);

-- Create CodeDiffs table
CREATE TABLE CodeDiffs (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    CodeStateId INT NOT NULL,
    AddedLines JSON,
    RemovedLines JSON,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CodeStateId) REFERENCES CodeStates(Id) ON DELETE CASCADE,
    UNIQUE KEY uk_codestate_diff (CodeStateId)
);
```

### 2.3 Configure Connection String

**backend/SlowLlmCoder/appsettings.json:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=slow_llm_coder;User=root;Password=yourpassword;"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

---

## 3. Backend Implementation

### 3.1 Create Entity Models

See `docs/DATABASE-SCHEMA.md` for full model definitions.

**backend/Models/Project.cs:**
```csharp
public class Project
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Language { get; set; } = "python";
    public string Difficulty { get; set; } = "beginner";
    public int TotalStates { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<CodeState> CodeStates { get; set; } = new List<CodeState>();
}
```

### 3.2 Create DbContext

**backend/Data/AppDbContext.cs:**
```csharp
using Microsoft.EntityFrameworkCore;
using SlowLlmCoder.Models;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Project> Projects => Set<Project>();
    public DbSet<CodeState> CodeStates => Set<CodeState>();
    public DbSet<Explanation> Explanations => Set<Explanation>();
    public DbSet<CodeDiff> CodeDiffs => Set<CodeDiff>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CodeState>()
            .HasIndex(c => new { c.ProjectId, c.StateIndex })
            .IsUnique();

        modelBuilder.Entity<Explanation>()
            .HasIndex(e => new { e.CodeStateId, e.Level })
            .IsUnique();
    }
}
```

### 3.3 Configure Program.cs

**backend/Program.cs:**
```csharp
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))
    ));

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("AllowFrontend");

// Add endpoints here (see 3.4)

app.Run();
```

### 3.4 Implement API Endpoints

**List Projects:**
```csharp
app.MapGet("/api/projects", async (AppDbContext db) =>
{
    var projects = await db.Projects
        .Where(p => p.IsActive)
        .Select(p => new
        {
            p.Id,
            p.Name,
            p.Description,
            p.Language,
            p.Difficulty,
            p.TotalStates
        })
        .ToListAsync();

    return Results.Ok(projects);
});
```

**Get Project with States:**
```csharp
app.MapGet("/api/projects/{id}", async (int id, AppDbContext db) =>
{
    var project = await db.Projects
        .Include(p => p.CodeStates.OrderBy(s => s.StateIndex))
            .ThenInclude(s => s.Explanations)
        .Include(p => p.CodeStates)
            .ThenInclude(s => s.CodeDiff)
        .FirstOrDefaultAsync(p => p.Id == id);

    if (project is null) return Results.NotFound();

    return Results.Ok(new
    {
        project.Id,
        project.Name,
        project.Description,
        project.Language,
        project.Difficulty,
        project.TotalStates,
        States = project.CodeStates.Select(s => new
        {
            s.Id,
            s.StateIndex,
            s.Title,
            s.Code,
            Explanations = s.Explanations.ToDictionary(e => e.Level, e => e.Content),
            Diff = s.CodeDiff != null ? new
            {
                AddedLines = s.CodeDiff.AddedLines,
                RemovedLines = s.CodeDiff.RemovedLines
            } : null
        })
    });
});
```

**Get Single State:**
```csharp
app.MapGet("/api/projects/{projectId}/states/{stateIndex}", async (int projectId, int stateIndex, AppDbContext db) =>
{
    var state = await db.CodeStates
        .Include(s => s.Explanations)
        .Include(s => s.CodeDiff)
        .FirstOrDefaultAsync(s => s.ProjectId == projectId && s.StateIndex == stateIndex);

    if (state is null) return Results.NotFound();

    return Results.Ok(new
    {
        state.Id,
        state.StateIndex,
        state.Title,
        state.Code,
        Explanations = state.Explanations.ToDictionary(e => e.Level, e => e.Content),
        Diff = state.CodeDiff != null ? new
        {
            AddedLines = state.CodeDiff.AddedLines,
            RemovedLines = state.CodeDiff.RemovedLines
        } : null
    });
});
```

---

## 4. Frontend Implementation

### 4.1 Create Type Definitions

**src/types/index.ts:**
```typescript
export type Language = 'python' | 'javascript' | 'java';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type ExplanationLevel = 'brief' | 'normal' | 'detailed';

export interface Project {
  id: number;
  name: string;
  description: string | null;
  language: Language;
  difficulty: Difficulty;
  totalStates: number;
}

export interface CodeState {
  id: number;
  stateIndex: number;
  title: string;
  code: string;
  explanations: Record<ExplanationLevel, string>;
  diff: {
    addedLines: number[];
    removedLines: number[];
  } | null;
}

export interface ProjectWithStates extends Project {
  states: CodeState[];
}
```

### 4.2 Create Main Store

**src/store/appStore.ts:**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProjectWithStates, ExplanationLevel } from '../types';

interface AppStore {
  // Project state
  currentProject: ProjectWithStates | null;
  currentStateIndex: number;
  isLoading: boolean;
  error: string | null;

  // User preferences
  explanationLevel: ExplanationLevel;
  showDiff: boolean;

  // Actions
  setProject: (project: ProjectWithStates) => void;
  setStateIndex: (index: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setExplanationLevel: (level: ExplanationLevel) => void;
  setShowDiff: (show: boolean) => void;
  navigateNext: () => void;
  navigatePrevious: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      currentProject: null,
      currentStateIndex: 0,
      isLoading: false,
      error: null,
      explanationLevel: 'normal',
      showDiff: true,

      setProject: (project) => set({ currentProject: project, currentStateIndex: 0 }),
      setStateIndex: (index) => set({ currentStateIndex: index }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setExplanationLevel: (level) => set({ explanationLevel: level }),
      setShowDiff: (show) => set({ showDiff: show }),

      navigateNext: () => {
        const { currentProject, currentStateIndex } = get();
        if (currentProject && currentStateIndex < currentProject.totalStates - 1) {
          set({ currentStateIndex: currentStateIndex + 1 });
        }
      },

      navigatePrevious: () => {
        const { currentStateIndex } = get();
        if (currentStateIndex > 0) {
          set({ currentStateIndex: currentStateIndex - 1 });
        }
      },
    }),
    {
      name: 'slow-llm-coder-settings',
      partialize: (state) => ({
        explanationLevel: state.explanationLevel,
        showDiff: state.showDiff,
      }),
    }
  )
);
```

### 4.3 Create API Hook

**src/hooks/useProject.ts:**
```typescript
import { useQuery } from '@tanstack/react-query';
import type { ProjectWithStates } from '../types';

const API_BASE = 'http://localhost:5000/api';

export function useProject(projectId: number) {
  return useQuery<ProjectWithStates>({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/projects/${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch project');
      return response.json();
    },
  });
}

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/projects`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      return response.json();
    },
  });
}
```

---

## 5. Feature Implementation Order

Implement features in this order (each builds on the previous):

### Phase 1: Foundation

1. **Project Setup** (Section 1)
2. **Database Setup** (Section 2)
3. **Backend API** (Section 3)
4. **Type Definitions** (Section 4.1)
5. **App Store** (Section 4.2)

### Phase 2: Core Features

Implement in this order:

| Order | Feature | Doc Reference | Depends On |
|-------|---------|---------------|------------|
| 1 | Code Editor | `feature-code-editor.md` | Types, Store |
| 2 | State Navigation | `feature-state-navigation.md` | Code Editor |
| 3 | Explanation Panel | `feature-explanation-panel.md` | State Navigation |
| 4 | Diff Visualization | `feature-diff-visualization.md` | Code Editor |

### Phase 3: Integration

1. Create main App layout
2. Connect all components
3. Add loading/error states
4. Test full flow

---

## 6. Integration

### 6.1 App Layout

**src/App.tsx:**
```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from './store/appStore';
import { useProject } from './hooks/useProject';
import { CodeEditor } from './components/CodeEditor';
import { StateNavigator } from './components/StateNavigator';
import { ExplanationPanel } from './components/ExplanationPanel';

const queryClient = new QueryClient();

function AppContent() {
  const { currentStateIndex, explanationLevel, showDiff, setStateIndex, setExplanationLevel, setShowDiff } = useAppStore();
  const { data: project, isLoading, error } = useProject(1); // Load first project

  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-500">Error loading project</div>;
  if (!project) return null;

  const currentState = project.states[currentStateIndex];

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 px-6 py-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">{project.name}</h1>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor (left side) */}
        <div className="flex-1 p-4">
          <CodeEditor
            code={currentState.code}
            language={project.language}
            diff={showDiff ? currentState.diff : null}
          />
        </div>

        {/* Right panel */}
        <div className="w-96 border-l border-gray-700 flex flex-col">
          <ExplanationPanel
            title={currentState.title}
            explanations={currentState.explanations}
            currentLevel={explanationLevel}
            onLevelChange={setExplanationLevel}
          />
        </div>
      </div>

      {/* Footer with navigation */}
      <footer className="bg-gray-800 px-6 py-4 border-t border-gray-700">
        <StateNavigator
          totalStates={project.totalStates}
          currentIndex={currentStateIndex}
          onNavigate={setStateIndex}
          stateTitle={currentState.title}
          showDiff={showDiff}
          onToggleDiff={() => setShowDiff(!showDiff)}
        />
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
```

---

## 7. Course Content Creation

### 7.1 Calculator Course (Python)

Create seed data for the Calculator course with ~10 states:

| State | Title | Code Summary |
|-------|-------|--------------|
| 0 | Project Setup | Comments and file header |
| 1 | Create add function | `def add(a, b)` |
| 2 | Create subtract function | `def subtract(a, b)` |
| 3 | Create multiply function | `def multiply(a, b)` |
| 4 | Create divide function | `def divide(a, b)` |
| 5 | Add input validation | `validate_input()` |
| 6 | Create main menu | Menu display function |
| 7 | Get user input | Input handling |
| 8 | Process calculation | Switch/match operations |
| 9 | Complete program | Full working calculator |

### 7.2 Todo List Course (JavaScript)

Create seed data for the Todo List course with ~12 states:

| State | Title | Code Summary |
|-------|-------|--------------|
| 0 | Project Setup | HTML structure |
| 1 | Create task array | `let tasks = []` |
| 2 | Add task function | `addTask()` |
| 3 | Display tasks | `renderTasks()` |
| 4 | Delete task | `deleteTask(id)` |
| 5 | Toggle complete | `toggleComplete(id)` |
| 6 | Add event listeners | DOM events |
| 7 | Input handling | Form submission |
| 8 | Filter tasks | All/Active/Completed |
| 9 | Local storage | Persistence |
| 10 | Edit task | Inline editing |
| 11 | Complete app | Full working todo |

### 7.3 Explanation Guidelines

For each state, write three explanations:

**Brief:** 1-2 sentences describing what was added.

**Normal:** Short paragraph explaining what and why.

**Detailed:** Full markdown with:
- Headers
- Code blocks
- Lists
- Conceptual explanations

---

## 8. Testing

### 8.1 Backend Testing

```bash
cd backend/SlowLlmCoder

# Test API endpoints
curl http://localhost:5000/api/projects
curl http://localhost:5000/api/projects/1
curl http://localhost:5000/api/projects/1/states/0
```

### 8.2 Frontend Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

### 8.3 Manual Testing Checklist

- [ ] Projects load correctly
- [ ] Code displays with syntax highlighting
- [ ] Navigation works (prev/next/slider)
- [ ] Keyboard shortcuts work (arrow keys)
- [ ] Explanations switch between levels
- [ ] Diff highlighting shows/hides
- [ ] User preferences persist
- [ ] Loading states display
- [ ] Error states display

---

## 9. Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] No console errors
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Course content seeded

### Build Commands

```bash
# Frontend
npm run build

# Backend
cd backend/SlowLlmCoder
dotnet publish -c Release
```

### Environment Configuration

- Frontend: Set `VITE_API_URL` environment variable
- Backend: Configure `ConnectionStrings__DefaultConnection`

---

## Appendix: File Checklist

### Backend Files

- [ ] `backend/SlowLlmCoder/Models/Project.cs`
- [ ] `backend/SlowLlmCoder/Models/CodeState.cs`
- [ ] `backend/SlowLlmCoder/Models/Explanation.cs`
- [ ] `backend/SlowLlmCoder/Models/CodeDiff.cs`
- [ ] `backend/SlowLlmCoder/Data/AppDbContext.cs`
- [ ] `backend/SlowLlmCoder/Program.cs`
- [ ] `backend/SlowLlmCoder/appsettings.json`

### Frontend Files

- [ ] `src/types/index.ts`
- [ ] `src/store/appStore.ts`
- [ ] `src/hooks/useProject.ts`
- [ ] `src/components/CodeEditor/CodeEditor.tsx`
- [ ] `src/components/CodeEditor/index.ts`
- [ ] `src/components/StateNavigator/StateNavigator.tsx`
- [ ] `src/components/StateNavigator/Timeline.tsx`
- [ ] `src/components/StateNavigator/NavigationButtons.tsx`
- [ ] `src/components/StateNavigator/StepIndicator.tsx`
- [ ] `src/components/StateNavigator/index.ts`
- [ ] `src/components/ExplanationPanel/ExplanationPanel.tsx`
- [ ] `src/components/ExplanationPanel/SpeedSelector.tsx`
- [ ] `src/components/ExplanationPanel/MarkdownRenderer.tsx`
- [ ] `src/components/ExplanationPanel/index.ts`
- [ ] `src/App.tsx`
- [ ] `src/main.tsx`

### Documentation Files

- [x] `docs/DATABASE-SCHEMA.md`
- [x] `docs/features/feature-code-editor.md`
- [x] `docs/features/feature-state-navigation.md`
- [x] `docs/features/feature-explanation-panel.md`
- [x] `docs/features/feature-diff-visualization.md`
- [x] `docs/SOP-CLAUDE-CODE.md`
- [x] `docs/IMPLEMENTATION-GUIDE.md`
- [x] `.claude/prompts/sop-implementation-agent.md`
