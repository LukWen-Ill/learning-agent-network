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
 */
export function ExplanationPanel({
  title,
  explanation,
  stateNumber,
  totalStates,
}: ExplanationPanelProps) {
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

      {/* Explanation */}
      <div className="flex-1 overflow-y-auto">
        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
          {explanation}
        </p>
      </div>
    </div>
  );
}
