import { useEffect } from 'react';
import { useProjectStore } from './stores/projectStore';
import { CodeViewer } from './components/CodeViewer';
import { StateNavigator } from './components/StateNavigator';
import { ExplanationPanel } from './components/ExplanationPanel';
import { ControlPanel } from './components/ControlPanel';
import { Chatbox } from './components/Chatbox';
import { askClaude } from './api/claude';
import type { ChatMessage } from './types';
import './index.css';

/**
 * Main App Component
 *
 * Layout:
 * - Top: ControlPanel (speed control, project name)
 * - Middle Left: CodeViewer (Monaco editor with code)
 * - Middle Right Top: ExplanationPanel (step explanation)
 * - Middle Right Bottom: Chatbox (ask questions)
 * - Bottom: StateNavigator (timeline navigation)
 */
function App() {
  const {
    currentProject,
    currentStateIndex,
    speed,
    isLoading,
    loadProject,
    nextState,
    prevState,
    jumpToState,
    setSpeed,
    addChatMessage,
    getChatMessages,
    setLoading,
  } = useProjectStore();

  // Load the greeter project on mount
  useEffect(() => {
    loadProject('greeter');
  }, [loadProject]);

  // Get current state data
  const currentState = currentProject?.states[currentStateIndex];
  const explanation = currentState?.speedExplanations[speed] || '';
  const messages = getChatMessages(currentStateIndex);

  // Handle sending a chat message
  const handleSendMessage = async (message: string) => {
    if (!currentProject || !currentState) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: Date.now(),
      stateId: currentStateIndex,
    };
    addChatMessage(currentStateIndex, userMessage);

    // Get AI response
    setLoading(true);
    try {
      const response = await askClaude(message, {
        code: currentState.code,
        explanation: currentState.explanation,
        stateId: currentStateIndex,
        projectName: currentProject.name,
      });

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
        stateId: currentStateIndex,
      };
      addChatMessage(currentStateIndex, assistantMessage);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (!currentProject || !currentState) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-xl">Loading project...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 p-4 flex flex-col gap-3 overflow-hidden">
      {/* Top: Control Panel */}
      <div className="flex-shrink-0">
        <ControlPanel
          speed={speed}
          projectName={currentProject.name}
          onSpeedChange={setSpeed}
        />
      </div>

      {/* Middle: Main content area */}
      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        {/* Left: Code Viewer */}
        <div className="flex-1 min-w-0 min-h-0">
          <CodeViewer
            code={currentState.code}
            language={currentProject.language}
            diff={currentState.diff}
          />
        </div>

        {/* Right: Explanation + Chatbox */}
        <div className="w-96 flex flex-col gap-3 min-h-0 overflow-hidden">
          {/* Explanation Panel */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ExplanationPanel
              title={currentState.title}
              explanation={explanation}
              stateNumber={currentStateIndex}
              totalStates={currentProject.states.length}
            />
          </div>

          {/* Chatbox */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <Chatbox
              stateId={currentStateIndex}
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Bottom: State Navigator */}
      <div className="flex-shrink-0">
        <StateNavigator
          totalStates={currentProject.states.length}
          currentState={currentStateIndex}
          onStateChange={jumpToState}
          onPrev={prevState}
          onNext={nextState}
        />
      </div>
    </div>
  );
}

export default App;
