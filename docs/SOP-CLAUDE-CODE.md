# Standard Operating Procedure (SOP) for Claude Code

## Purpose

This document defines the standard workflow for Claude Code when implementing features for the Slow LLM Coding Agent project. Following this SOP ensures consistent, high-quality code that aligns with project architecture.

---

## Quick Reference Checklist

Before starting any implementation task:

- [ ] Read the feature documentation in `docs/features/`
- [ ] Check existing patterns in the codebase
- [ ] Review DATABASE-SCHEMA.md for data models
- [ ] Identify dependencies and related features

---

## Phase 1: Understand the Task

### Step 1.1: Read Feature Documentation

**Location:** `docs/features/feature-{name}.md`

Before writing any code, read the complete feature documentation. Extract:

1. **Acceptance Criteria** - What must be implemented
2. **Data Models** - TypeScript interfaces and C# DTOs
3. **API Endpoints** - Backend routes and responses
4. **Component Structure** - Frontend file organization
5. **Dependencies** - Required packages

### Step 1.2: Check Related Features

Look at the "Related Features" section in the documentation. Understand how this feature interacts with others.

### Step 1.3: Review Existing Code

Search the codebase for existing patterns:

```bash
# Find similar components
ls src/components/

# Find existing types
ls src/types/

# Find existing API routes
grep -r "app.Map" backend/

# Find Zustand stores
ls src/store/
```

---

## Phase 2: Implement Backend (C# Minimal API)

### Step 2.1: Create/Update Entity Models

**Location:** `backend/Models/`

Follow the pattern from DATABASE-SCHEMA.md:

```csharp
// Models/{EntityName}.cs
public class EntityName
{
    public int Id { get; set; }
    // Properties match database columns
    // Include navigation properties
}
```

### Step 2.2: Create DTOs

**Location:** `backend/DTOs/`

DTOs shape the API response:

```csharp
// DTOs/{EntityName}Dto.cs
public record EntityNameDto
{
    public int Id { get; init; }
    // Only include properties needed by frontend
}
```

### Step 2.3: Add API Endpoints

**Location:** `backend/Program.cs` or `backend/Endpoints/`

Follow the existing endpoint patterns:

```csharp
app.MapGet("/api/{resource}", async (AppDbContext db) =>
{
    var items = await db.Items.ToListAsync();
    return Results.Ok(items);
});
```

### Step 2.4: Update DbContext

**Location:** `backend/Data/AppDbContext.cs`

Add new DbSet if needed:

```csharp
public DbSet<NewEntity> NewEntities => Set<NewEntity>();
```

### Step 2.5: Run Migrations (if schema changed)

```bash
cd backend
dotnet ef migrations add {MigrationName}
dotnet ef database update
```

---

## Phase 3: Implement Frontend (React + TypeScript)

### Step 3.1: Create Type Definitions

**Location:** `src/types/{feature}.ts`

Match the interfaces from feature documentation:

```typescript
// types/{feature}.ts
export interface FeatureProps {
  // Props interface
}

export interface FeatureState {
  // State interface
}
```

### Step 3.2: Create Component Directory

**Structure:**
```
src/components/{ComponentName}/
├── {ComponentName}.tsx       # Main component
├── {SubComponent}.tsx        # Child components
├── {ComponentName}.types.ts  # Local types (if not in src/types/)
├── index.ts                  # Barrel export
└── __tests__/
    └── {ComponentName}.test.tsx
```

### Step 3.3: Implement Main Component

Follow the component pattern from documentation:

```tsx
// components/{ComponentName}/{ComponentName}.tsx

import { SubComponent } from './SubComponent';
import type { ComponentProps } from './types';

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // Implementation
  return (
    <div className="component-name">
      <SubComponent />
    </div>
  );
}
```

### Step 3.4: Create Barrel Export

```typescript
// components/{ComponentName}/index.ts
export { ComponentName } from './{ComponentName}';
export type { ComponentProps } from './types';
```

### Step 3.5: Add to Zustand Store

**Location:** `src/store/{feature}Store.ts`

```typescript
import { create } from 'zustand';

interface FeatureStore {
  // State
  data: DataType | null;
  isLoading: boolean;

  // Actions
  setData: (data: DataType) => void;
  setLoading: (loading: boolean) => void;
}

export const useFeatureStore = create<FeatureStore>((set) => ({
  data: null,
  isLoading: false,

  setData: (data) => set({ data }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
```

### Step 3.6: Add API Hooks (if using React Query)

**Location:** `src/hooks/use{Feature}.ts`

```typescript
import { useQuery } from '@tanstack/react-query';

export function useFeature(id: number) {
  return useQuery({
    queryKey: ['feature', id],
    queryFn: () => fetch(`/api/feature/${id}`).then(r => r.json()),
  });
}
```

---

## Phase 4: Integration

### Step 4.1: Connect Components to Store

```tsx
// In parent component or page
import { useFeatureStore } from '../store/featureStore';
import { FeatureComponent } from '../components/FeatureComponent';

function ParentPage() {
  const { data, isLoading } = useFeatureStore();

  if (isLoading) return <LoadingSpinner />;

  return <FeatureComponent data={data} />;
}
```

### Step 4.2: Wire Up API Calls

Connect frontend to backend endpoints using fetch or React Query.

### Step 4.3: Test Integration

1. Start backend: `cd backend && dotnet run`
2. Start frontend: `npm run dev`
3. Test all acceptance criteria manually
4. Check browser console for errors
5. Check network tab for API calls

---

## Phase 5: Testing

### Step 5.1: Write Unit Tests

**Location:** `src/components/{Component}/__tests__/`

```tsx
import { render, screen } from '@testing-library/react';
import { ComponentName } from '../ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName prop="value" />);
    expect(screen.getByText('expected text')).toBeInTheDocument();
  });
});
```

### Step 5.2: Run Tests

```bash
# Frontend tests
npm test

# Backend tests
cd backend && dotnet test
```

### Step 5.3: Manual Testing Checklist

Go through the acceptance criteria in the feature documentation one by one.

---

## Phase 6: Cleanup and Documentation

### Step 6.1: Remove Console Logs

Search and remove any `console.log` statements added during development.

### Step 6.2: Add JSDoc Comments (if complex)

```typescript
/**
 * Calculates the diff between two code states
 * @param previous - The previous code state
 * @param current - The current code state
 * @returns Object containing added and removed line numbers
 */
function calculateDiff(previous: string, current: string) {
  // ...
}
```

### Step 6.3: Update CLAUDE.md (if needed)

If you've introduced new patterns or conventions, document them.

---

## Code Style Guidelines

### TypeScript/React

- Use functional components with TypeScript
- Props interfaces named `{Component}Props`
- Use named exports (not default)
- Prefer Tailwind CSS classes over custom CSS
- Use `className` strings, not template literals for simple classes

### C#

- Use records for DTOs
- Use async/await for database operations
- Follow minimal API patterns
- Use meaningful route names

### General

- No magic numbers/strings - use constants
- Meaningful variable names
- Keep functions small and focused
- Handle errors gracefully

---

## File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| React Component | PascalCase | `CodeEditor.tsx` |
| Type Definition | camelCase | `codeEditor.ts` |
| Zustand Store | camelCase + Store | `codeEditorStore.ts` |
| C# Model | PascalCase | `CodeState.cs` |
| C# DTO | PascalCase + Dto | `CodeStateDto.cs` |
| Test File | Same as source + .test | `CodeEditor.test.tsx` |

---

## Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```
feat(code-editor): add syntax highlighting for Python

fix(navigation): prevent navigation past last state

refactor(store): simplify state management for diffs
```

---

## Quality Gates

Before marking a task complete, verify:

### Code Quality
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] No console errors in browser
- [ ] No network errors in browser dev tools

### Functionality
- [ ] All acceptance criteria met
- [ ] Edge cases handled (empty data, errors)
- [ ] Loading states implemented
- [ ] Error states implemented

### Integration
- [ ] Works with related features
- [ ] State updates correctly
- [ ] API calls succeed

---

## Troubleshooting

### Common Issues

**"Cannot find module"**
- Check import paths
- Run `npm install`
- Restart TypeScript server

**"API returns 404"**
- Verify endpoint exists in backend
- Check route parameters
- Ensure backend is running

**"State not updating"**
- Check Zustand store actions
- Verify component subscribes to store
- Check React Query cache settings

**"Database error"**
- Verify MySQL is running
- Check connection string
- Run pending migrations

---

## Reference Documents

- Feature Docs: `docs/features/feature-*.md`
- Database Schema: `docs/DATABASE-SCHEMA.md`
- Implementation Guide: `docs/IMPLEMENTATION-GUIDE.md`
- Project Overview: `CLAUDE.md`

---

## SOP Prompt File

For automated implementation following this SOP, load the prompt file:

**Location:** `.claude/prompts/sop-implementation-agent.md`

This prompt file provides step-by-step instructions for Claude Code to follow this SOP automatically.
