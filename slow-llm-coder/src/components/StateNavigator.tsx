interface StateNavigatorProps {
  totalStates: number;
  currentState: number;
  onStateChange: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * StateNavigator - Navigation controls for stepping through code states
 *
 * Provides previous/next buttons and a timeline slider for jumping between states.
 * Shows current position in the timeline (e.g., "Step 3 of 7").
 */
export function StateNavigator({
  totalStates,
  currentState,
  onStateChange,
  onPrev,
  onNext,
}: StateNavigatorProps) {
  const isFirst = currentState === 0;
  const isLast = currentState === totalStates - 1;

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
      {/* Previous button */}
      <button
        onClick={onPrev}
        disabled={isFirst}
        className={`px-4 py-2 rounded-md font-medium transition-colors ${
          isFirst
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
        aria-label="Previous step"
      >
        ◀ Prev
      </button>

      {/* Timeline slider */}
      <div className="flex-1 flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={totalStates - 1}
          value={currentState}
          onChange={(e) => onStateChange(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-4
                     [&::-webkit-slider-thumb]:h-4
                     [&::-webkit-slider-thumb]:bg-blue-500
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:hover:bg-blue-400"
        />
        <span className="text-gray-300 text-sm whitespace-nowrap min-w-[80px] text-center">
          Step {currentState + 1} of {totalStates}
        </span>
      </div>

      {/* Next button */}
      <button
        onClick={onNext}
        disabled={isLast}
        className={`px-4 py-2 rounded-md font-medium transition-colors ${
          isLast
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
        aria-label="Next step"
      >
        Next ▶
      </button>
    </div>
  );
}
