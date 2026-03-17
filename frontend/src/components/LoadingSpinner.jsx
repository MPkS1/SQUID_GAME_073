// components/LoadingSpinner.jsx

export function LoadingSpinner({ message = "Analyzing..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="animate-spin">
        <svg
          className="h-16 w-16 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      <p className="mt-4 text-lg font-semibold text-gray-700">
        {message}
      </p>
      <p className="text-sm text-gray-500 mt-2">
        Running Gemini API, Safe Browsing, and Qiskit analysis...
      </p>
    </div>
  );
}
