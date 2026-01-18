import { create } from 'zustand';
import type { Project, Speed, ChatMessage } from '../types';

// Import project data (will be created next)
import greeterProject from '../data/projects/greeter.json';

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

  // Computed getters
  getCurrentState: () => Project['states'][number] | null;
  getExplanation: () => string;
  getChatMessages: (stateId: number) => ChatMessage[];
}

// Available projects (hardcoded for MVP)
const projects: Record<string, Project> = {
  'greeter': greeterProject as Project,
};

export const useProjectStore = create<ProjectStore>((set, get) => ({
  // Initial state
  currentProject: null,
  currentStateIndex: 0,
  speed: 'medium',
  chatHistory: new Map(),
  isLoading: false,

  // Load a project by ID
  loadProject: (projectId: string) => {
    const project = projects[projectId];
    if (project) {
      set({
        currentProject: project,
        currentStateIndex: 0,
        chatHistory: new Map(),
      });
    } else {
      console.error(`Project not found: ${projectId}`);
    }
  },

  // Navigate to next state
  nextState: () => {
    const { currentProject, currentStateIndex } = get();
    if (currentProject && currentStateIndex < currentProject.states.length - 1) {
      set({ currentStateIndex: currentStateIndex + 1 });
    }
  },

  // Navigate to previous state
  prevState: () => {
    const { currentStateIndex } = get();
    if (currentStateIndex > 0) {
      set({ currentStateIndex: currentStateIndex - 1 });
    }
  },

  // Jump to specific state
  jumpToState: (index: number) => {
    const { currentProject } = get();
    if (currentProject && index >= 0 && index < currentProject.states.length) {
      set({ currentStateIndex: index });
    }
  },

  // Change speed setting
  setSpeed: (speed: Speed) => {
    set({ speed });
  },

  // Add a chat message to a state's history
  addChatMessage: (stateId: number, message: ChatMessage) => {
    const { chatHistory } = get();
    const newHistory = new Map(chatHistory);
    const stateMessages = newHistory.get(stateId) || [];
    newHistory.set(stateId, [...stateMessages, message]);
    set({ chatHistory: newHistory });
  },

  // Set loading state
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  // Get current code state
  getCurrentState: () => {
    const { currentProject, currentStateIndex } = get();
    if (!currentProject) return null;
    return currentProject.states[currentStateIndex];
  },

  // Get explanation based on current speed
  getExplanation: () => {
    const { currentProject, currentStateIndex, speed } = get();
    if (!currentProject) return '';
    const state = currentProject.states[currentStateIndex];
    return state.speedExplanations[speed];
  },

  // Get chat messages for a state
  getChatMessages: (stateId: number) => {
    const { chatHistory } = get();
    return chatHistory.get(stateId) || [];
  },
}));
