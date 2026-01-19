# Database Schema Documentation

## Overview

This document defines the MySQL database schema for the Slow LLM Coding Agent platform. The database stores course content, code states, and explanations for the MVP.

## Entity Relationship Diagram (Conceptual)

```
┌─────────────┐       ┌─────────────┐       ┌──────────────────┐
│   Project   │ 1───* │  CodeState  │ 1───1 │   Explanation    │
└─────────────┘       └─────────────┘       └──────────────────┘
```

---

## Tables

### 1. Projects

Stores course/project metadata.

```sql
CREATE TABLE Projects (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Description TEXT,
    Language ENUM('python', 'javascript', 'java') NOT NULL DEFAULT 'python',
    Difficulty ENUM('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'beginner',
    TotalStates INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    IsActive BOOLEAN DEFAULT TRUE,

    INDEX idx_language (Language),
    INDEX idx_difficulty (Difficulty),
    INDEX idx_active (IsActive)
);
```

| Column | Type | Description |
|--------|------|-------------|
| Id | INT | Primary key, auto-increment |
| Name | VARCHAR(100) | Course name (e.g., "Calculator", "Todo List App") |
| Description | TEXT | Course description shown to students |
| Language | ENUM | Programming language for syntax highlighting |
| Difficulty | ENUM | Student skill level target |
| TotalStates | INT | Total number of code states in this course |
| CreatedAt | DATETIME | Record creation timestamp |
| UpdatedAt | DATETIME | Last update timestamp |
| IsActive | BOOLEAN | Whether course is visible to students |

---

### 2. CodeStates

Stores each code snapshot in a course.

```sql
CREATE TABLE CodeStates (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    ProjectId INT NOT NULL,
    StateIndex INT NOT NULL,
    Title VARCHAR(200) NOT NULL,
    Code TEXT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (ProjectId) REFERENCES Projects(Id) ON DELETE CASCADE,
    UNIQUE KEY uk_project_state (ProjectId, StateIndex),
    INDEX idx_project_order (ProjectId, StateIndex)
);
```

| Column | Type | Description |
|--------|------|-------------|
| Id | INT | Primary key, auto-increment |
| ProjectId | INT | Foreign key to Projects |
| StateIndex | INT | Order index (0-based) within the project |
| Title | VARCHAR(200) | Short title for this state (e.g., "Add validation function") |
| Code | TEXT | Full code snapshot at this state |
| CreatedAt | DATETIME | Record creation timestamp |

---

### 3. Explanations

Stores explanations at different detail levels for each code state.

```sql
CREATE TABLE Explanations (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    CodeStateId INT NOT NULL,
    Level ENUM('brief', 'normal', 'detailed') NOT NULL,
    Content TEXT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (CodeStateId) REFERENCES CodeStates(Id) ON DELETE CASCADE,
    UNIQUE KEY uk_state_level (CodeStateId, Level),
    INDEX idx_codestate (CodeStateId)
);
```

| Column | Type | Description |
|--------|------|-------------|
| Id | INT | Primary key, auto-increment |
| CodeStateId | INT | Foreign key to CodeStates |
| Level | ENUM | Explanation detail level |
| Content | TEXT | Markdown-formatted explanation text |
| CreatedAt | DATETIME | Record creation timestamp |

---

### 4. CodeDiffs

Stores diff information between consecutive states.

```sql
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

| Column | Type | Description |
|--------|------|-------------|
| Id | INT | Primary key, auto-increment |
| CodeStateId | INT | Foreign key to CodeStates (the "after" state) |
| AddedLines | JSON | Array of line numbers that were added |
| RemovedLines | JSON | Array of line numbers that were removed |
| CreatedAt | DATETIME | Record creation timestamp |

**Note:** `AddedLines` and `RemovedLines` store arrays like `[3, 4, 5]` representing line numbers.

---

## Full Schema Script

```sql
-- Slow LLM Coding Agent - MVP Database Schema
-- MySQL 8.0+

DROP DATABASE IF EXISTS slow_llm_coder;
CREATE DATABASE slow_llm_coder CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE slow_llm_coder;

-- Projects table
CREATE TABLE Projects (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Description TEXT,
    Language ENUM('python', 'javascript', 'java') NOT NULL DEFAULT 'python',
    Difficulty ENUM('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'beginner',
    TotalStates INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    IsActive BOOLEAN DEFAULT TRUE,

    INDEX idx_language (Language),
    INDEX idx_difficulty (Difficulty),
    INDEX idx_active (IsActive)
);

-- CodeStates table
CREATE TABLE CodeStates (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    ProjectId INT NOT NULL,
    StateIndex INT NOT NULL,
    Title VARCHAR(200) NOT NULL,
    Code TEXT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (ProjectId) REFERENCES Projects(Id) ON DELETE CASCADE,
    UNIQUE KEY uk_project_state (ProjectId, StateIndex),
    INDEX idx_project_order (ProjectId, StateIndex)
);

-- Explanations table
CREATE TABLE Explanations (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    CodeStateId INT NOT NULL,
    Level ENUM('brief', 'normal', 'detailed') NOT NULL,
    Content TEXT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (CodeStateId) REFERENCES CodeStates(Id) ON DELETE CASCADE,
    UNIQUE KEY uk_state_level (CodeStateId, Level),
    INDEX idx_codestate (CodeStateId)
);

-- CodeDiffs table
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

---

## C# Entity Models

```csharp
// Models/Project.cs
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

    // Navigation property
    public ICollection<CodeState> CodeStates { get; set; } = new List<CodeState>();
}

// Models/CodeState.cs
public class CodeState
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public int StateIndex { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public Project Project { get; set; } = null!;
    public ICollection<Explanation> Explanations { get; set; } = new List<Explanation>();
    public CodeDiff? CodeDiff { get; set; }
}

// Models/Explanation.cs
public class Explanation
{
    public int Id { get; set; }
    public int CodeStateId { get; set; }
    public string Level { get; set; } = "normal"; // brief, normal, detailed
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    // Navigation property
    public CodeState CodeState { get; set; } = null!;
}

// Models/CodeDiff.cs
public class CodeDiff
{
    public int Id { get; set; }
    public int CodeStateId { get; set; }
    public List<int>? AddedLines { get; set; }
    public List<int>? RemovedLines { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation property
    public CodeState CodeState { get; set; } = null!;
}
```

---

## TypeScript Interfaces (Frontend)

```typescript
// types/database.ts

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
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface CodeState {
  id: number;
  projectId: number;
  stateIndex: number;
  title: string;
  code: string;
  createdAt: string;
}

export interface Explanation {
  id: number;
  codeStateId: number;
  level: ExplanationLevel;
  content: string;
  createdAt: string;
}

export interface CodeDiff {
  id: number;
  codeStateId: number;
  addedLines: number[] | null;
  removedLines: number[] | null;
  createdAt: string;
}

// Composite types for API responses
export interface CodeStateWithDetails extends CodeState {
  explanations: Record<ExplanationLevel, string>;
  diff: {
    addedLines: number[];
    removedLines: number[];
  } | null;
}

export interface ProjectWithStates extends Project {
  states: CodeStateWithDetails[];
}
```

---

## Sample Data

### Calculator Course (MVP)

```sql
-- Insert Calculator project
INSERT INTO Projects (Name, Description, Language, Difficulty, TotalStates)
VALUES (
    'Simple Calculator',
    'Build a basic calculator with add, subtract, multiply, and divide operations.',
    'python',
    'beginner',
    10
);

-- Insert first code state
INSERT INTO CodeStates (ProjectId, StateIndex, Title, Code)
VALUES (1, 0, 'Project Setup', '# Simple Calculator\n# Let\'s build a calculator step by step\n');

-- Insert explanations for first state
INSERT INTO Explanations (CodeStateId, Level, Content) VALUES
(1, 'brief', 'Create a new Python file for our calculator.'),
(1, 'normal', 'We start by creating a new Python file. The comments at the top describe what we\'re building.'),
(1, 'detailed', '## Getting Started\n\nEvery Python program starts with a file. We\'ve created `calculator.py` and added:\n\n1. **A title comment** - `# Simple Calculator` tells readers what this file does\n2. **A description** - Explains our goal\n\n**Why comments?** Comments help others (and future you) understand the code.');

-- Insert diff for first state (no previous state, so empty)
INSERT INTO CodeDiffs (CodeStateId, AddedLines, RemovedLines)
VALUES (1, '[1, 2]', '[]');
```

---

## Indexes and Performance

The schema includes indexes for common query patterns:

1. **Project listing**: `idx_language`, `idx_difficulty`, `idx_active`
2. **State navigation**: `idx_project_order` for ordered state retrieval
3. **Explanation lookup**: `idx_codestate` for fast explanation fetch

---

## Migration Strategy

For development, use the full schema script. For production migrations:

1. Use a migration tool (e.g., FluentMigrator for .NET)
2. Version each schema change
3. Never modify existing data structures destructively

---

## Backup Considerations

MVP courses are pre-written content. Implement:

1. Regular mysqldump backups
2. Export to JSON for portability
3. Seed scripts for fresh deployments
