// components/AnalyzeButton.jsx

export function AnalyzeButton({ onClick, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full mt-6 px-6 py-3 rounded-lg font-semibold text-white transition-all transform ${
        disabled
          ? 'bg-gray-400 cursor-not-allowed opacity-70'
          : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-lg hover:shadow-xl'
      }`}
    >
      {disabled ? '🔄 Analyzing...' : '🔍 Analyze Message'}
    </button>
  );
}
