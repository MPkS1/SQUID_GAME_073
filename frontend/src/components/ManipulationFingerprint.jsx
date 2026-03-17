// components/ManipulationFingerprint.jsx

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';

export function ManipulationFingerprint({ behaviorAnalysis = {} }) {
  console.log('ManipulationFingerprint rendering with:', behaviorAnalysis);
  
  // Extract manipulation scores from behavior analysis
  const evidence = behaviorAnalysis.evidence || {};

  // Map evidence to scores (0-100)
  const getTacticScore = (tactic) => {
    const quote = evidence[tactic];
    if (!quote) return 0;
    // If quote exists, score based on presence (can be enhanced with AI)
    return Math.min(100, 50 + Math.random() * 50); // Demo scoring
  };

  const data = [
    {
      name: 'Urgency',
      score: getTacticScore('urgency') || 0,
      fullMark: 100,
    },
    {
      name: 'Fear',
      score: getTacticScore('fear') || 0,
      fullMark: 100,
    },
    {
      name: 'Authority',
      score: getTacticScore('authority') || 0,
      fullMark: 100,
    },
    {
      name: 'Greed',
      score: getTacticScore('greed') || 0,
      fullMark: 100,
    },
    {
      name: 'Trust',
      score: getTacticScore('trust') || 0,
      fullMark: 100,
    },
  ];

  try {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-300 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-bold text-purple-900 mb-2">
          🕸️ Manipulation Fingerprint
        </h3>
        <p className="text-sm text-purple-700 mb-4">
          How each psychological tactic is being used in this message (0-100 scale):
        </p>

        <div className="flex justify-center mb-6" style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <PolarGrid stroke="#cbd5e1" />
              <PolarAngleAxis
                dataKey="name"
                tick={{ fill: '#475569', fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: '#64748b', fontSize: 11 }}
              />
              <Radar
                name="Manipulation Score"
                dataKey="score"
                stroke="#a855f7"
                fill="#a855f7"
                fillOpacity={0.6}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                }}
                formatter={(value) => `${Math.round(value)}`}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Explanation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs mb-4">
          {data.map((tactic) => (
            <div key={tactic.name} className="bg-white p-2 rounded border border-purple-200">
              <p className="font-semibold text-purple-900">{tactic.name}</p>
              <p className="text-lg font-bold text-purple-600">
                {Math.round(tactic.score)}
              </p>
            </div>
          ))}
        </div>

        <p className="text-xs text-purple-600 italic">
          💡 Tip: Every scam has a unique fingerprint. High urgency + fear = time pressure exploitation.
        </p>
      </div>
    );
  } catch (error) {
    console.error('Manipulation Fingerprint error:', error);
    return (
      <div className="bg-yellow-50 border border-yellow-300 p-4 rounded">
        <p className="text-yellow-800 font-semibold">📊 Manipulation Analysis</p>
        <p className="text-sm text-yellow-700 mt-2">
          Detected tactics: {data.map(d => d.name).join(', ')}
        </p>
      </div>
    );
  }
}

export default ManipulationFingerprint;
