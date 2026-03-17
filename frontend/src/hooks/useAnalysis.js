// hooks/useAnalysis.js

import { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function useAnalysis() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const analyze = async (message, messageType, url = null) => {
    console.log('🔗 useAnalysis.analyze() called with:', { message, messageType, url });
    
    if (!message || !message.trim()) {
      setError('Please enter a message to analyze');
      console.warn('⚠️ Message is empty, aborting');
      return null;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    
    console.log('📡 Making fetch request to:', `${API_BASE_URL}/analyze`);

    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          message_type: messageType || 'email',
          url: url || null,
        }),
      });

      console.log('📬 Response received. Status:', response.status, 'OK:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `API request failed: ${response.status}`
        );
      }

      const data = await response.json();
      console.log('✅ Analysis results received:', data);
      
      setResults(data);
      return data;
    } catch (err) {
      const errorMsg = err.message || 'Unknown error occurred';
      setError(errorMsg);
      console.error('❌ Analysis error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, results, error, analyze };
}
