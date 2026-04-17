export default function ProgressBar({ percentage, showLabel = true, size = 'md', color = 'indigo' }) {
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
  const colors = {
    indigo: 'bg-indigo-600',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  const pct = Math.min(100, Math.max(0, percentage || 0));

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>Progress</span>
          <span className="font-semibold text-gray-700 dark:text-gray-200">{pct}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`${heights[size]} ${colors[color]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
