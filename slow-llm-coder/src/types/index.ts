// Speed levels for help intensity
export type Speed = 'low' | 'medium' | 'high';

// Programming languages supported
export type Language = 'python' | 'javascript';

// Difficulty levels for projects
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// Diff information showing what changed between states
export interface Diff {
  added: string[];    // Lines added in this state
  removed: string[];  // Lines removed from previous state
}

// Speed-based explanations - different detail levels
export interface SpeedExplanations {
  low: string;    // Brief - for independent learners
  medium: string; // Balanced - standard detail
  high: string;   // Detailed - for beginners needing more guidance
}

// A single code state in the project timeline
export interface CodeState {
  id: number;                          // Unique identifier (0-indexed)
  title: string;                       // Short title for this step
  code: string;                        // Full code at this state
  explanation: string;                 // Default explanation
  diff: Diff | null;                   // What changed (null for first state)
  speedExplanations: SpeedExplanations; // Explanations per speed level
}

// A complete learning project
export interface Project {
  id: string;                   // Unique project identifier
  name: string;                 // Display name
  description: string;          // Project description
  language: Language;           // Programming language
  difficulty: Difficulty;       // Difficulty level
  states: CodeState[];          // Array of code states (timeline)
}

// Chat message in the chatbox
export interface ChatMessage {
  id: string;           // Unique message ID
  role: 'user' | 'assistant';  // Who sent the message
  content: string;      // Message content
  timestamp: number;    // Unix timestamp
  stateId: number;      // Which state this message belongs to
}

// Context sent to Claude API for answering questions
export interface ChatContext {
  code: string;         // Current code
  explanation: string;  // Current step explanation
  stateId: number;      // Current state ID
  projectName: string;  // Project name for context
}
