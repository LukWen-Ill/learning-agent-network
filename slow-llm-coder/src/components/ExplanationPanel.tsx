import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';

interface ExplanationPanelProps {
  title: string;
  explanation: string;
  stateNumber: number;
  totalStates: number;
}

/**
 * ExplanationPanel - Displays the title and explanation for the current step
 *
 * Shows a step indicator, the step title, and the speed-appropriate explanation.
 * The explanation changes based on the speed setting (low/medium/high detail).
 * Supports full markdown rendering with syntax-highlighted code blocks.
 */
export function ExplanationPanel({
  title,
  explanation,
  stateNumber,
  totalStates,
}: ExplanationPanelProps) {
  // Custom markdown components for styling
  const markdownComponents: Components = {
    // Code blocks with syntax highlighting
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const isInline = !match;

      return isInline ? (
        <code className="bg-gray-700 px-1.5 py-0.5 rounded text-sm text-blue-300" {...props}>
          {children}
        </code>
      ) : (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          className="rounded-lg text-sm my-2"
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      );
    },
    // Headers
    h1: ({ children }) => <h1 className="text-xl font-bold text-white mt-4 mb-2">{children}</h1>,
    h2: ({ children }) => <h2 className="text-lg font-semibold text-white mt-3 mb-2">{children}</h2>,
    h3: ({ children }) => <h3 className="text-base font-medium text-gray-200 mt-2 mb-1">{children}</h3>,
    // Paragraphs
    p: ({ children }) => <p className="text-gray-300 leading-relaxed mb-3">{children}</p>,
    // Lists
    ul: ({ children }) => <ul className="list-disc list-inside text-gray-300 mb-3 space-y-1">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside text-gray-300 mb-3 space-y-1">{children}</ol>,
    li: ({ children }) => <li className="text-gray-300">{children}</li>,
    // Strong/bold
    strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
    // Emphasis/italic
    em: ({ children }) => <em className="italic text-gray-200">{children}</em>,
    // Blockquotes
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 my-2 text-gray-400 italic">
        {children}
      </blockquote>
    ),
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full flex flex-col">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-3">
        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
          Step {stateNumber + 1}/{totalStates}
        </span>
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold text-white mb-3">{title}</h2>

      {/* Explanation with markdown rendering */}
      <div className="flex-1 overflow-y-auto prose prose-invert max-w-none">
        <ReactMarkdown components={markdownComponents}>
          {explanation}
        </ReactMarkdown>
      </div>
    </div>
  );
}
