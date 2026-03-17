// components/TechnicalDetails.jsx

export function TechnicalDetails({ urlAnalysis = null }) {
  if (!urlAnalysis) {
    return null;
  }

  return (
    <div className="bg-orange-50 border border-orange-300 p-4 rounded-lg shadow-sm">
      <h3 className="font-semibold text-orange-900 mb-3">
        🔗 URL Analysis Details
      </h3>

      <div className="space-y-2 text-sm text-orange-800">
        <p>
          <strong>Domain Age:</strong> {urlAnalysis.domain_age_days} days
        </p>

        {urlAnalysis.flags && urlAnalysis.flags.length > 0 && (
          <p>
            <strong>Issues Found:</strong> {urlAnalysis.flags.join(', ')}
          </p>
        )}

        {urlAnalysis.url_score !== undefined && (
          <p>
            <strong>URL Risk Score:</strong> {urlAnalysis.url_score}/100
          </p>
        )}

        {urlAnalysis.domain_analysis && (
          <div className="mt-3 pt-3 border-t border-orange-200">
            <p className="font-medium mb-2">Domain Analysis:</p>
            <p className="text-xs text-orange-700">
              Domain: {urlAnalysis.domain_analysis.domain || 'N/A'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
