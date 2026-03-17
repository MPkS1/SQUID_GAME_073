// components/RiskBar.jsx

export function RiskBar({ score = 0 }) {
  const getRiskColor = () => {
    if (score >= 75) return 'bg-red-500';
    if (score >= 45) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-sm">
      <div
        className={`h-full ${getRiskColor()} transition-all duration-700`}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}
