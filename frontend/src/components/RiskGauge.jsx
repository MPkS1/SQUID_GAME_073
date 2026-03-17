// components/RiskGauge.jsx

export function RiskGauge({ score = 0, riskLevel = 'LOW' }) {
  const getRiskColor = () => {
    if (score >= 75) return '#ef4444'; // red
    if (score >= 45) return '#f59e0b'; // amber
    return '#10b981'; // green
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 shadow-md">
      <div className="relative w-32 h-32">
        <svg className="absolute inset-0" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="4"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={getRiskColor()}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color: getRiskColor() }}>
            {Math.round(score)}
          </span>
          <span className="text-xs font-medium text-gray-600">/ 100</span>
        </div>
      </div>

      <div
        className={`mt-4 px-4 py-2 rounded-full font-semibold text-white text-center ${
          score >= 75
            ? 'bg-red-500'
            : score >= 45
            ? 'bg-yellow-500'
            : 'bg-green-500'
        }`}
      >
        {riskLevel === 'HIGH' && '🔴 HIGH RISK'}
        {riskLevel === 'MEDIUM' && '🟡 MEDIUM RISK'}
        {riskLevel === 'LOW' && '🟢 SAFE'}
      </div>
    </div>
  );
}
