import type { Speed } from '../types';

interface ControlPanelProps {
  speed: Speed;
  projectId: string;
  showDiff: boolean;
  onSpeedChange: (speed: Speed) => void;
  onToggleDiff: () => void;
  onProjectChange: (projectId: string) => void;
}

// Available projects
const availableProjects = [
  { id: 'greeter', name: 'Build a Greeter' },
  { id: 'calculator', name: 'Build a Calculator' },
];

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
  projectId,
  showDiff,
  onSpeedChange,
  onToggleDiff,
  onProjectChange,
}: ControlPanelProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
      {/* Project selector */}
      <div className="flex items-center gap-3">
        <span className="text-gray-400 text-sm">Course:</span>
        <select
          value={projectId}
          onChange={(e) => onProjectChange(e.target.value)}
          className="bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium border-none outline-none cursor-pointer hover:bg-gray-600 transition-colors"
        >
          {availableProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        {/* Diff toggle */}
        <button
          onClick={onToggleDiff}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            showDiff
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
          title={showDiff ? 'Hide code changes' : 'Show code changes'}
        >
          <span>{showDiff ? '◉' : '○'}</span>
          Show Changes
        </button>

        {/* Speed control */}
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">Detail:</span>
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
    </div>
  );
}
