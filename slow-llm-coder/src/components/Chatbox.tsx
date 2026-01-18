import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';

interface ChatboxProps {
  stateId: number;
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
}

// Quick question suggestions
const quickQuestions = [
  'Why did you make this change?',
  'Can you explain this simpler?',
  'What does this line do?',
];

/**
 * Chatbox - AI chat interface for asking questions about the current state
 *
 * Each state has its own chat history. Students can ask questions
 * and the AI responds in the context of the current code state.
 */
export function Chatbox({
  stateId: _stateId,
  messages,
  onSendMessage,
  isLoading,
}: ChatboxProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending a message
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput('');
    await onSendMessage(message);
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-3 border-b border-gray-700">
        <h3 className="text-white font-medium text-sm">Ask about this step</h3>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            No messages yet. Ask a question about the code!
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white ml-8'
                  : 'bg-gray-700 text-gray-200 mr-8'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))
        )}
        {isLoading && (
          <div className="bg-gray-700 text-gray-400 p-3 rounded-lg mr-8">
            <p className="text-sm">Thinking...</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick questions */}
      <div className="flex-shrink-0 p-2 border-t border-gray-700 flex gap-2 flex-wrap">
        {quickQuestions.map((q) => (
          <button
            key={q}
            onClick={() => setInput(q)}
            disabled={isLoading}
            className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded
                       hover:bg-gray-600 hover:text-white transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 p-2 border-t border-gray-700 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question..."
          disabled={isLoading}
          className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2
                     placeholder-gray-500 focus:outline-none focus:ring-2
                     focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium
                     hover:bg-blue-700 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
}
