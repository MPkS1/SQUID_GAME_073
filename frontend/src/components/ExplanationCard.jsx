// components/ExplanationCard.jsx

export function ExplanationCard({ explanation = '', allFlags = [] }) {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          <svg
            className="h-6 w-6 text-blue-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2z" clipRule="evenodd" />
          </svg>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-bold text-blue-900 mb-2">
            ⚠️ Why This Is Dangerous
          </h3>
          <p className="text-sm text-blue-800 leading-relaxed mb-4">
            {explanation}
          </p>

          {allFlags && allFlags.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-3">
                🎯 Detected Tactics:
              </h4>
              <ul className="flex flex-wrap gap-2">
                {allFlags.map((flag) => (
                  <li
                    key={flag}
                    className="inline-flex items-center bg-blue-200 text-blue-900 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    • {flag.replace(/_/g, ' ').toUpperCase()}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
