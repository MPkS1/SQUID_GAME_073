// components/ThreatTimeline.jsx

import { useState, useEffect } from 'react';

export function ThreatTimeline({ analysisHistory = [] }) {
  if (!analysisHistory || analysisHistory.length === 0) {
    return null;
  }

  const getRiskColor = (score) => {
    if (score >= 75) return 'text-red-700 bg-red-100 border-red-300';
    if (score >= 45) return 'text-yellow-700 bg-yellow-100 border-yellow-300';
    return 'text-green-700 bg-green-100 border-green-300';
  };

  const getRiskBadge = (score) => {
    if (score >= 75) return '🔴';
    if (score >= 45) return '🟡';
    return '🟢';
  };

  const getRiskLevel = (score) => {
    if (score >= 75) return 'HIGH';
    if (score >= 45) return 'MEDIUM';
    return 'SAFE';
  };

  const highCount = analysisHistory.filter((h) => h.final_risk_score >= 75).length;
  const mediumCount = analysisHistory.filter(
    (h) => h.final_risk_score >= 45 && h.final_risk_score < 75
  ).length;
  const safeCount = analysisHistory.filter((h) => h.final_risk_score < 45).length;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-slate-50 border-2 border-slate-300 p-6 rounded-lg shadow-lg mt-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4">
        📈 Threat Analysis Timeline
      </h3>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-white border border-slate-200 p-3 rounded text-center">
          <p className="text-2xl font-bold text-slate-700">{analysisHistory.length}</p>
          <p className="text-xs text-slate-600">Total Analyzed</p>
        </div>
        <div className="bg-red-100 border border-red-300 p-3 rounded text-center">
          <p className="text-2xl font-bold text-red-700">{highCount}</p>
          <p className="text-xs text-red-600">🔴 HIGH</p>
        </div>
        <div className="bg-yellow-100 border border-yellow-300 p-3 rounded text-center">
          <p className="text-2xl font-bold text-yellow-700">{mediumCount}</p>
          <p className="text-xs text-yellow-600">🟡 MEDIUM</p>
        </div>
        <div className="bg-green-100 border border-green-300 p-3 rounded text-center">
          <p className="text-2xl font-bold text-green-700">{safeCount}</p>
          <p className="text-xs text-green-600">🟢 SAFE</p>
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {analysisHistory
          .slice()
          .reverse()
          .map((item, index) => (
            <div
              key={index}
              className={`border-l-4 p-3 rounded flex items-center justify-between text-sm ${getRiskColor(
                item.final_risk_score
              )}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{getRiskBadge(item.final_risk_score)}</span>
                  <span className="font-bold">
                    {item.message_type.toUpperCase()} •{' '}
                    {getRiskLevel(item.final_risk_score)}
                  </span>
                  <span className="text-xs opacity-75">
                    {item.time || new Date().toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs opacity-90 truncate">
                  "{item.message.substring(0, 60)}..."
                </p>
                {item.all_flags && item.all_flags.length > 0 && (
                  <p className="text-xs opacity-75 mt-1">
                    <strong>Tactics:</strong> {item.all_flags.slice(0, 2).join(', ')}
                    {item.all_flags.length > 2 ? `+${item.all_flags.length - 2}` : ''}
                  </p>
                )}
              </div>
              <div className="text-right ml-4">
                <p className="font-bold text-lg">
                  {Math.round(item.final_risk_score)}/100
                </p>
              </div>
            </div>
          ))}
      </div>

      {/* Footer Stats */}
      <div className="mt-4 pt-4 border-t border-slate-300 text-xs text-slate-600">
        <p>
          ⚠️ <strong>{highCount}</strong> dangerous messages detected today. Stay alert!
        </p>
      </div>
    </div>
  );
}
