// components/ErrorBoundary.jsx

import { useState } from 'react';

export function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  try {
    if (hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-100 border-4 border-red-500 text-red-800 px-8 py-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4">⚠️ Application Error</h2>
              <p className="mb-4 font-mono text-sm bg-red-50 p-3 rounded">
                {errorMessage}
              </p>
              <button
                onClick={() => {
                  setHasError(false);
                  setErrorMessage('');
                  window.location.reload();
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition-colors"
              >
                Reload App
              </button>
              <p className="text-xs text-red-600 mt-4">
                Check browser console for detailed error information.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return children;
  } catch (error) {
    console.error('ErrorBoundary caught error:', error);
    setHasError(true);
    setErrorMessage(error.message || 'Unknown error occurred');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-100 border-4 border-red-500 text-red-800 px-8 py-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">⚠️ Application Error</h2>
            <p className="mb-4 font-mono text-sm bg-red-50 p-3 rounded">
              {error.message || 'Unknown error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition-colors"
            >
              Reload App
            </button>
          </div>
        </div>
      </div>
    );
  }
}
