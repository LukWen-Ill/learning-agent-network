# Feature: State Navigation Timeline

## Overview

**Feature ID:** F002
**Priority:** High (MVP Core)
**Status:** Not Started

Allow students to navigate between code states using a timeline slider and prev/next buttons. Shows progress through the tutorial (e.g., "Step 5 of 15").

---

## User Story

> As a **student**, I want to **navigate between different code states**, so that I can **see how the code evolved step by step**.

---

## Acceptance Criteria

- [ ] Slider to jump to any state
- [ ] Previous/Next step buttons
- [ ] Current step indicator (e.g., "Step 5 of 15")
- [ ] Keyboard shortcuts (Left/Right arrow keys)
- [ ] Visual progress indicator
- [ ] State title displayed
- [ ] Smooth transitions between states
- [ ] Disabled states for boundaries (can't go before 0 or after max)

---

## Data Model

### TypeScript Interfaces

```typescript
// types/navigation.ts

export interface NavigationState {
  currentIndex: number;
  totalStates: number;
  currentTitle: string;
}

export interface StateNavigatorProps {
  projectId: number;
  totalStates: number;
  currentIndex: number;
  onNavigate: (index: number) => void;
  stateTitle?: string;
}

export interface TimelineMarker {
  index: number;
  title: string;
  hasChanges: boolean;
}
```

### C# DTO

```csharp
// DTOs/NavigationDto.cs

public record NavigationInfoDto
{
    public int CurrentIndex { get; init; }
    public int TotalStates { get; init; }
    public string CurrentTitle { get; init; } = string.Empty;
    public bool HasPrevious => CurrentIndex > 0;
    public bool HasNext => CurrentIndex < TotalStates - 1;
}

public record StatePreviewDto
{
    public int Index { get; init; }
    public string Title { get; init; } = string.Empty;
}
```

---

## API Endpoints

### GET /api/projects/{projectId}/navigation

Returns navigation metadata for a project.

**Response:**
```json
{
  "currentIndex": 0,
  "totalStates": 15,
  "states": [
    { "index": 0, "title": "Project Setup" },
    { "index": 1, "title": "Create add function" },
    { "index": 2, "title": "Add subtract function" }
  ]
}
```

**C# Implementation:**
```csharp
app.MapGet("/api/projects/{projectId}/navigation",
    async (int projectId, AppDbContext db) =>
{
    var project = await db.Projects
        .Include(p => p.CodeStates.OrderBy(s => s.StateIndex))
        .FirstOrDefaultAsync(p => p.Id == projectId);

    if (project is null) return Results.NotFound();

    return Results.Ok(new
    {
        TotalStates = project.TotalStates,
        States = project.CodeStates.Select(s => new StatePreviewDto
        {
            Index = s.StateIndex,
            Title = s.Title
        })
    });
});
```

---

## Component Structure

### File Structure

```
src/
├── components/
│   └── StateNavigator/
│       ├── StateNavigator.tsx       # Main container
│       ├── Timeline.tsx             # Slider component
│       ├── NavigationButtons.tsx    # Prev/Next buttons
│       ├── StepIndicator.tsx        # "Step X of Y"
│       ├── StateNavigator.types.ts
│       └── index.ts
```

### Component Hierarchy

```
<StateNavigator>
├── <StepIndicator />        # "Step 5 of 15: Add validation"
├── <Timeline />             # Interactive slider
└── <NavigationButtons />    # < Previous | Next >
```

### Main Component Implementation

```tsx
// components/StateNavigator/StateNavigator.tsx

import { useCallback, useEffect } from 'react';
import { Timeline } from './Timeline';
import { NavigationButtons } from './NavigationButtons';
import { StepIndicator } from './StepIndicator';
import type { StateNavigatorProps } from './StateNavigator.types';

export function StateNavigator({
  projectId,
  totalStates,
  currentIndex,
  onNavigate,
  stateTitle = '',
}: StateNavigatorProps) {

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < totalStates - 1;

  const handlePrevious = useCallback(() => {
    if (canGoPrevious) onNavigate(currentIndex - 1);
  }, [canGoPrevious, currentIndex, onNavigate]);

  const handleNext = useCallback(() => {
    if (canGoNext) onNavigate(currentIndex + 1);
  }, [canGoNext, currentIndex, onNavigate]);

  const handleSliderChange = useCallback((index: number) => {
    onNavigate(index);
  }, [onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevious, handleNext]);

  return (
    <div className="state-navigator bg-gray-800 rounded-lg p-4">
      <StepIndicator
        current={currentIndex + 1}
        total={totalStates}
        title={stateTitle}
      />

      <Timeline
        totalSteps={totalStates}
        currentStep={currentIndex}
        onChange={handleSliderChange}
      />

      <NavigationButtons
        onPrevious={handlePrevious}
        onNext={handleNext}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
      />
    </div>
  );
}
```

### Timeline Component

```tsx
// components/StateNavigator/Timeline.tsx

interface TimelineProps {
  totalSteps: number;
  currentStep: number;
  onChange: (step: number) => void;
}

export function Timeline({ totalSteps, currentStep, onChange }: TimelineProps) {
  return (
    <div className="timeline my-4">
      {/* Progress bar background */}
      <div className="relative h-2 bg-gray-700 rounded-full">
        {/* Progress fill */}
        <div
          className="absolute h-full bg-blue-500 rounded-full transition-all duration-200"
          style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
        />

        {/* Step markers */}
        <div className="absolute inset-0 flex justify-between items-center">
          {Array.from({ length: totalSteps }, (_, i) => (
            <button
              key={i}
              onClick={() => onChange(i)}
              className={`
                w-4 h-4 rounded-full transition-all duration-200
                ${i === currentStep
                  ? 'bg-blue-500 ring-2 ring-blue-300 scale-125'
                  : i < currentStep
                    ? 'bg-blue-500 hover:scale-110'
                    : 'bg-gray-600 hover:bg-gray-500 hover:scale-110'
                }
              `}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Slider input for accessibility */}
      <input
        type="range"
        min={0}
        max={totalSteps - 1}
        value={currentStep}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full mt-2 opacity-0 absolute cursor-pointer"
        aria-label="Step slider"
      />
    </div>
  );
}
```

### Navigation Buttons Component

```tsx
// components/StateNavigator/NavigationButtons.tsx

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

interface NavigationButtonsProps {
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export function NavigationButtons({
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
}: NavigationButtonsProps) {
  return (
    <div className="flex justify-between items-center mt-4">
      <button
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium
          transition-all duration-200
          ${canGoPrevious
            ? 'bg-gray-700 hover:bg-gray-600 text-white'
            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }
        `}
        aria-label="Go to previous step"
      >
        <ChevronLeftIcon className="w-5 h-5" />
        Previous
      </button>

      <button
        onClick={onNext}
        disabled={!canGoNext}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium
          transition-all duration-200
          ${canGoNext
            ? 'bg-blue-600 hover:bg-blue-500 text-white'
            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }
        `}
        aria-label="Go to next step"
      >
        Next
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
```

### Step Indicator Component

```tsx
// components/StateNavigator/StepIndicator.tsx

interface StepIndicatorProps {
  current: number;
  total: number;
  title: string;
}

export function StepIndicator({ current, total, title }: StepIndicatorProps) {
  return (
    <div className="step-indicator text-center">
      <div className="text-sm text-gray-400">
        Step {current} of {total}
      </div>
      <h2 className="text-lg font-semibold text-white mt-1">
        {title}
      </h2>
    </div>
  );
}
```

---

## UI Mockup Description

```
┌──────────────────────────────────────────────────────────────────┐
│                         Step 5 of 15                              │
│                   "Add input validation"                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│   ●────●────●────●────◉────○────○────○────○────○────○            │
│   1    2    3    4    5    6    7    8    9   10   11            │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│   [◀ Previous]                              [Next ▶]              │
└──────────────────────────────────────────────────────────────────┘

Legend:
● = Completed step (filled blue)
◉ = Current step (filled blue with ring)
○ = Future step (gray outline)
```

---

## State Management Integration

```typescript
// store/navigationStore.ts

import { create } from 'zustand';

interface NavigationStore {
  currentProjectId: number | null;
  currentStateIndex: number;
  totalStates: number;
  stateTitle: string;
  isLoading: boolean;

  setProject: (projectId: number, totalStates: number) => void;
  navigateToState: (index: number) => void;
  setStateTitle: (title: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useNavigationStore = create<NavigationStore>((set, get) => ({
  currentProjectId: null,
  currentStateIndex: 0,
  totalStates: 0,
  stateTitle: '',
  isLoading: false,

  setProject: (projectId, totalStates) => set({
    currentProjectId: projectId,
    totalStates,
    currentStateIndex: 0
  }),

  navigateToState: (index) => {
    const { totalStates } = get();
    if (index >= 0 && index < totalStates) {
      set({ currentStateIndex: index, isLoading: true });
    }
  },

  setStateTitle: (title) => set({ stateTitle: title }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` (Left Arrow) | Go to previous state |
| `→` (Right Arrow) | Go to next state |
| `Home` | Go to first state (optional) |
| `End` | Go to last state (optional) |

---

## Testing Checklist

### Unit Tests

- [ ] Renders current step correctly
- [ ] Previous button disabled at index 0
- [ ] Next button disabled at last index
- [ ] Clicking Previous decrements index
- [ ] Clicking Next increments index
- [ ] Slider updates index correctly
- [ ] Step markers are clickable
- [ ] Keyboard navigation works

### Integration Tests

- [ ] Navigation updates code editor
- [ ] Navigation updates explanation panel
- [ ] URL reflects current state (optional)
- [ ] Browser back/forward works (optional)

### Accessibility Tests

- [ ] All buttons have aria-labels
- [ ] Slider is keyboard accessible
- [ ] Focus indicators visible
- [ ] Screen reader announces current step

---

## Performance Considerations

1. **Prefetching**: Consider prefetching adjacent states for smoother navigation
2. **Debouncing**: Debounce slider changes to avoid excessive API calls
3. **Caching**: Cache visited states in Zustand store or React Query

---

## Related Features

- [Code Editor](./feature-code-editor.md) - Displays the code for current state
- [Explanation Panel](./feature-explanation-panel.md) - Shows explanation for current state
- [Diff Visualization](./feature-diff-visualization.md) - Shows changes from previous state
