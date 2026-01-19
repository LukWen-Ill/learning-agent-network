import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Project, Speed, ChatMessage } from '../types';

// Import project data
import greeterProject from '../data/projects/greeter.json';
import calculatorProject from '../data/projects/calculator.json';

// ============================================================================
// Store Interface
// ============================================================================

interface ProjectStore {
  // Project State
  currentProject: Project | null;
  currentStateIndex: number;
  isLoading: boolean;
  error: string | null;

  // User Preferences (persisted)
  speed: Speed;
  showDiff: boolean;

  // Chat State
  chatHistory: Map<number, ChatMessage[]>;

  // Project Actions
  loadProject: (projectId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Navigation Actions
  nextState: () => void;
  prevState: () => void;
  jumpToState: (index: number) => void;

  // User Preference Actions
  setSpeed: (speed: Speed) => void;
  setShowDiff: (show: boolean) => void;
  toggleDiff: () => void;

  // Chat Actions
  addChatMessage: (stateId: number, message: ChatMessage) => void;
  clearChatHistory: () => void;

  // Computed Getters
  getCurrentState: () => Project['states'][number] | null;
  getExplanation: () => string;
  getChatMessages: (stateId: number) => ChatMessage[];
  getTotalStates: () => number;
  isFirstState: () => boolean;
  isLastState: () => boolean;
}

// ============================================================================
// Available Projects (MVP: Hardcoded)
// ============================================================================

const projects: Record<string, Project> = {
  'greeter': greeterProject as Project,
  'calculator': calculatorProject as Project,
};

// ============================================================================
// Preferences Store (Persisted Separately)
// ============================================================================

interface PreferencesStore {
  speed: Speed;
  showDiff: boolean;
}

const defaultPreferences: PreferencesStore = {
  speed: 'medium',
  showDiff: true,
};

// ============================================================================
// Main Store
// ============================================================================

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      // Initial State
      currentProject: null,
      currentStateIndex: 0,
      isLoading: false,
      error: null,
      speed: defaultPreferences.speed,
      showDiff: defaultPreferences.showDiff,
      chatHistory: new Map(),

      // ========================================
      // Project Actions
      // ========================================

      loadProject: (projectId: string) => {
        const project = projects[projectId];
        if (project) {
          set({
            currentProject: project,
            currentStateIndex: 0,
            chatHistory: new Map(),
            error: null,
          });
        } else {
          set({ error: `Project not found: ${projectId}` });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      // ========================================
      // Navigation Actions
      // ========================================

      nextState: () => {
        const { currentProject, currentStateIndex } = get();
        if (currentProject && currentStateIndex < currentProject.states.length - 1) {
          set({ currentStateIndex: currentStateIndex + 1 });
        }
      },

      prevState: () => {
        const { currentStateIndex } = get();
        if (currentStateIndex > 0) {
          set({ currentStateIndex: currentStateIndex - 1 });
        }
      },

      jumpToState: (index: number) => {
        const { currentProject } = get();
        if (currentProject && index >= 0 && index < currentProject.states.length) {
          set({ currentStateIndex: index });
        }
      },

      // ========================================
      // User Preference Actions
      // ========================================

      setSpeed: (speed: Speed) => {
        set({ speed });
      },

      setShowDiff: (show: boolean) => {
        set({ showDiff: show });
      },

      toggleDiff: () => {
        const { showDiff } = get();
        set({ showDiff: !showDiff });
      },

      // ========================================
      // Chat Actions
      // ========================================

      addChatMessage: (stateId: number, message: ChatMessage) => {
        const { chatHistory } = get();
        const newHistory = new Map(chatHistory);
        const stateMessages = newHistory.get(stateId) || [];
        newHistory.set(stateId, [...stateMessages, message]);
        set({ chatHistory: newHistory });
      },

      clearChatHistory: () => {
        set({ chatHistory: new Map() });
      },

      // ========================================
      // Computed Getters
      // ========================================

      getCurrentState: () => {
        const { currentProject, currentStateIndex } = get();
        if (!currentProject) return null;
        return currentProject.states[currentStateIndex];
      },

      getExplanation: () => {
        const { currentProject, currentStateIndex, speed } = get();
        if (!currentProject) return '';
        const state = currentProject.states[currentStateIndex];
        return state?.speedExplanations[speed] || '';
      },

      getChatMessages: (stateId: number) => {
        const { chatHistory } = get();
        return chatHistory.get(stateId) || [];
      },

      getTotalStates: () => {
        const { currentProject } = get();
        return currentProject?.states.length || 0;
      },

      isFirstState: () => {
        const { currentStateIndex } = get();
        return currentStateIndex === 0;
      },

      isLastState: () => {
        const { currentProject, currentStateIndex } = get();
        if (!currentProject) return true;
        return currentStateIndex === currentProject.states.length - 1;
      },
    }),
    {
      name: 'slow-llm-coder-settings',
      storage: createJSONStorage(() => localStorage),
      // Only persist user preferences (speed and showDiff)
      partialize: (state) => ({
        speed: state.speed,
        showDiff: state.showDiff,
      }),
    }
  )
);

// ============================================================================
// Selector Hooks (for optimized re-renders)
// ============================================================================

// Use these selectors for better performance in components
export const useCurrentProject = () => useProjectStore((state) => state.currentProject);
export const useCurrentStateIndex = () => useProjectStore((state) => state.currentStateIndex);
export const useSpeed = () => useProjectStore((state) => state.speed);
export const useShowDiff = () => useProjectStore((state) => state.showDiff);
export const useIsLoading = () => useProjectStore((state) => state.isLoading);
export const useError = () => useProjectStore((state) => state.error);
