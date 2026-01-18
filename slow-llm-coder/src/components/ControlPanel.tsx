import type { Speed } from '../types';

interface ControlPanelProps {
  speed: Speed;
  projectName: string;
  onSpeedChange: (speed: Speed) => void;
}

// Speed level configuration
const speedLevels: { value: Speed; label: string; description: string }[] = [
  { value: 'low', label: 'Brief', description: 'AI leads' },
  { value: 'medium', label: 'Balanced', description: '50/50' },
  { value: 'high', label: 'Detailed', description: 'You lead' },
];

/**
 * ControlPanel - Controls for speed setting and project info
 *
 * Speed determines how detailed explanations are:
 * - Low: Brief explanations, AI does most of the work
 * - Medium: Balanced explanations, shared work
 * - High: Detailed explanations, student does most with guidance
 */
export function ControlPanel({
  speed,
  projectName,
  onSpeedChange,
}: ControlPanelProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
      {/* Project name */}
      <div className="flex items-center gap-3">
        <span className="text-gray-400 text-sm">Project:</span>
        <span className="text-white font-medium">{projectName}</span>
      </div>

      {/* Speed control */}
      <div className="flex items-center gap-4">
        <span className="text-gray-400 text-sm">Explanation Detail:</span>
        <div className="flex bg-gray-700 rounded-lg p-1">
          {speedLevels.map((level) => (
            <button
              key={level.value}
              onClick={() => onSpeedChange(level.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                speed === level.value
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-600'
              }`}
              title={level.description}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
