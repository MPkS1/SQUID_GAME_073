// components/FlagsDisplay.jsx

export function FlagsDisplay({ allFlags = [] }) {
  if (!allFlags || allFlags.length === 0) {
    return null;
  }

  return (
    <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg">
      <h3 className="text-sm font-semibold text-indigo-900 mb-3">
        🚩 Security Flags
      </h3>
      <div className="flex flex-wrap gap-2">
        {allFlags.map((flag) => (
          <span
            key={flag}
            className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-900 px-3 py-1 rounded-full text-xs font-medium"
          >
            <span className="text-sm">⚡</span>
            {flag.replace(/_/g, ' ')}
          </span>
        ))}
      </div>
    </div>
  );
}
