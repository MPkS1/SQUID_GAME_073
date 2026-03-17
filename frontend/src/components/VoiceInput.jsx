// components/VoiceInput.jsx

import { useState, useRef } from 'react';

export function VoiceInput({ onTranscript, disabled = false }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);

  const startListening = () => {
    setError('');
    setTranscript('');

    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech Recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError('');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          // Final result
          setTranscript((prev) => prev + transcriptSegment);
        } else {
          // Interim result
          interimTranscript += transcriptSegment;
        }
      }

      // Show interim results
      if (interimTranscript) {
        setTranscript((prev) => prev.split('[INTERIM]')[0] + '[INTERIM] ' + interimTranscript);
      }
    };

    recognition.onerror = (event) => {
      setError(`Error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);

      // Clean up interim text
      const cleanedTranscript = transcript.replace('[INTERIM]', '').trim();
      setTranscript(cleanedTranscript);

      // Send transcript to parent
      if (cleanedTranscript) {
        onTranscript(cleanedTranscript);
      }
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setError('');
  };

  return (
    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-400 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-cyan-900 flex items-center gap-2">
          🎙️ Voice Input - Detect Vishing Attacks
        </h3>
        <p className="text-xs text-cyan-700">
          {isListening ? '🔴 Recording...' : '⭕ Ready'}
        </p>
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className="bg-white border border-cyan-300 p-3 rounded mb-3 max-h-24 overflow-y-auto">
          <p className="text-sm text-slate-800">
            {transcript.replace('[INTERIM] ', '')}
            {isListening && <span className="animate-pulse">▌</span>}
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-800 p-2 rounded mb-3 text-xs">
          ⚠️ {error}
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        {!isListening ? (
          <button
            onClick={startListening}
            disabled={disabled}
            className={`flex-1 px-4 py-2 rounded font-semibold flex items-center justify-center gap-2 transition-all ${
              disabled
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-cyan-500 text-white hover:bg-cyan-600 active:scale-95'
            }`}
          >
            🎙️ Start Listen
          </button>
        ) : (
          <button
            onClick={stopListening}
            className="flex-1 px-4 py-2 rounded font-semibold bg-red-500 text-white hover:bg-red-600 active:scale-95 flex items-center justify-center gap-2 animate-pulse"
          >
            ⏹️ Stop Recording
          </button>
        )}

        {transcript && (
          <button
            onClick={clearTranscript}
            className="px-4 py-2 rounded font-semibold bg-gray-300 text-gray-800 hover:bg-gray-400"
          >
            🗑️ Clear
          </button>
        )}
      </div>

      {/* Help Text */}
      <p className="text-xs text-cyan-700 mt-3">
        💡 <strong>Vishing (Voice Phishing)</strong>: Scammers call pretending to be banks,
        Amazon, or government officials. Speak the message you received and QShield will analyze
        it.
      </p>
    </div>
  );
}
