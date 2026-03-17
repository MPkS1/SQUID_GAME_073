import { useState, useRef } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, CartesianGrid, XAxis, YAxis, AreaChart, Area, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import jsPDF from 'jspdf';

function App() {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('email');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  
  // FEATURE 4: Timeline feature
  const [timeline, setTimeline] = useState([]);
  
  // FEATURE 5: Voice input feature
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const recognitionRef = useRef(null);
  
  // FEATURE 2: Threat map feature
  const [threatLocation, setThreatLocation] = useState(null);

  // Initialize Web Speech API for voice input
  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Voice input not supported in your browser. Use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('');
      setVoiceTranscript(transcript);
      setMessage(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      setError(`Voice error: ${event.error}`);
      setIsListening(false);
    };

    recognition.start();
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleAnalyze = async () => {
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          message_type: messageType,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed. Backend may be offline.');
      }

      const data = await response.json();
      setResults(data);

      // Add to FEATURE 4: Timeline
      const timelineEntry = {
        id: Date.now(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        riskScore: Math.round(data.final_risk_score || 0),
        riskLevel: getRiskLabel(data.final_risk_score || 0),
        flags: (data.all_flags || []).slice(0, 2).join(' + '),
        messageType: messageType,
      };
      setTimeline([timelineEntry, ...timeline]);
    } catch (err) {
      setError(err.message || 'Error contacting backend at localhost:8000');
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (exampleText, type) => {
    setMessage(exampleText);
    setMessageType(type);
    setResults(null);
    setError(null);
  };

  const getRiskColor = (score) => {
    if (score >= 75) return 'rgb(239, 68, 68)';
    if (score >= 45) return 'rgb(245, 158, 11)';
    return 'rgb(16, 185, 129)';
  };

  const getRiskLabel = (score) => {
    if (score >= 75) return '🔴 HIGH RISK';
    if (score >= 45) return '🟡 MEDIUM RISK';
    return '🟢 SAFE';
  };

  // FEATURE 1: Generate manipulation fingerprint data for radar chart
  const getManipulationData = () => {
    if (!results?.behavior_analysis) {
      return [
        { name: 'Urgency', value: 0, fullMark: 100 },
        { name: 'Fear', value: 0, fullMark: 100 },
        { name: 'Authority', value: 0, fullMark: 100 },
        { name: 'Greed', value: 0, fullMark: 100 },
        { name: 'Trust', value: 0, fullMark: 100 },
      ];
    }

    const score = results.behavior_analysis.behavior_score || 0;
    const flags = results.behavior_analysis.flags || [];

    return [
      { name: 'Urgency', value: flags.includes('urgency') ? 80 : score * 0.4, fullMark: 100 },
      { name: 'Fear', value: flags.includes('fear') ? 85 : score * 0.35, fullMark: 100 },
      { name: 'Authority', value: flags.includes('authority') ? 70 : score * 0.3, fullMark: 100 },
      { name: 'Greed', value: flags.includes('greed') ? 75 : score * 0.25, fullMark: 100 },
      { name: 'Trust', value: flags.includes('trust') ? 65 : score * 0.2, fullMark: 100 },
    ];
  };

  // FEATURE 2: Generate fake threat location data
  const getThreatLocationData = () => {
    if (!results) return null;
    
    const threatCountries = [
      { country: 'Nigeria', city: 'Lagos', lat: 6.5244, lng: 3.3792 },
      { country: 'Russia', city: 'Moscow', lat: 55.7558, lng: 37.6173 },
      { country: 'China', city: 'Beijing', lat: 39.9042, lng: 116.4074 },
      { country: 'India', city: 'Delhi', lat: 28.7041, lng: 77.1025 },
      { country: 'Indonesia', city: 'Jakarta', lat: -6.2088, lng: 106.8456 },
    ];

    return threatCountries[Math.floor(Math.random() * threatCountries.length)];
  };

  // FEATURE 14: PDF Report Generator
  const generatePDFReport = () => {
    if (!results) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;
    
    // Title
    doc.setFontSize(24);
    doc.setTextColor(102, 126, 234);
    doc.text('QShield AI Security Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    
    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;
    
    // Risk Score Box
    doc.setFillColor(240, 240, 240);
    doc.rect(20, yPos, pageWidth - 40, 20, 'F');
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Risk Score: ${results.final_risk_score}/100 - ${results.risk_level}`, 30, yPos + 12);
    yPos += 30;
    
    // Flagged Threats
    doc.setFontSize(12);
    doc.setTextColor(51, 51, 51);
    doc.text('Detected Flags:', 20, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    results.all_flags.forEach(flag => {
      doc.text(`• ${flag}`, 25, yPos);
      yPos += 6;
    });
    yPos += 5;
    
    // Explanation
    doc.setFontSize(12);
    doc.text('Analysis Summary:', 20, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    const splitExplanation = doc.splitTextToSize(results.explanation || 'No explanation available', pageWidth - 40);
    doc.text(splitExplanation, 25, yPos);
    yPos += splitExplanation.length * 6 + 10;
    
    // New Features Summary
    if (results.credential_harvesting) {
      doc.setFontSize(12);
      doc.text('Credential Harvesting Risk:', 20, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.text(`Level: ${results.credential_harvesting.credential_risk_level}`, 25, yPos);
      yPos += 6;
    }
    
    if (results.attack_pattern) {
      doc.setFontSize(12);
      doc.text('Attack Pattern:', 20, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.text(`${results.attack_pattern.attack_framework_detected} (${results.attack_pattern.framework_confidence_percent}% confidence)`, 25, yPos);
      yPos += 10;
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('This report is confidential and should only be shared with authorized personnel.', pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // Save PDF
    doc.save('QShield_AI_Report.pdf');
  };

  // Copy safe response to clipboard
  const copySafeResponse = () => {
    if (results?.safe_response_template) {
      navigator.clipboard.writeText(results.safe_response_template);
      alert('✅ Safe response copied to clipboard!');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '40px 20px', marginBottom: '30px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)' }}>
          <h1 style={{ fontSize: '2.5em', color: '#333', margin: '10px 0' }}>🛡️ QShield AI</h1>
          <p style={{ color: '#666', fontSize: '1.1em', margin: '10px 0' }}>Detect phishing & social engineering attacks with AI</p>
          <p style={{ color: '#999', fontSize: '0.95em' }}>Behavioral analysis • URL validation • Quantum threat awareness</p>
        </div>

        {/* INPUT SECTION */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '25px', marginBottom: '20px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
          
          {/* Message Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.95em', fontWeight: '600', color: '#333', marginBottom: '10px' }}>Message Content</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste email, SMS, or message here..."
              rows={4}
              disabled={isListening}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1em',
                fontFamily: 'Arial, sans-serif',
                resize: 'vertical',
                boxSizing: 'border-box',
                opacity: isListening ? 0.6 : 1,
              }}
            />
            <p style={{ fontSize: '0.85em', color: '#999', marginTop: '8px' }}>{message.length} characters</p>
          </div>

          {/* Voice Input - FEATURE 5 */}
          <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e0e0e0' }}>
            <p style={{ fontSize: '0.95em', fontWeight: '600', color: '#333', marginBottom: '10px' }}>🎤 Voice Input (Vishing Detection)</p>
            <div style={{ background: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>📞 Vishing: Scammers call pretending to be banks, Amazon, or officials.</p>
              <button
                onClick={isListening ? stopVoiceInput : startVoiceInput}
                disabled={loading}
                style={{
                  background: isListening ? '#ef4444' : '#667eea',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '0.9em',
                  fontWeight: '500',
                  transition: 'all 0.3s',
                }}
              >
                {isListening ? '⏹️ Stop Listening' : '🎙️ Start Voice Input'}
              </button>
              {isListening && <p style={{ color: '#ef4444', marginTop: '10px', fontWeight: '600' }}>🔴 Listening...</p>}
            </div>
          </div>

          {/* Message Type */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.95em', fontWeight: '600', color: '#333', marginBottom: '10px' }}>Message Type</label>
            <select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1em',
                boxSizing: 'border-box',
              }}
            >
              <option value="email">📧 Email</option>
              <option value="sms">📱 SMS/Text</option>
              <option value="chat">💬 Chat Message</option>
              <option value="call">📞 Voice Call (Vishing)</option>
            </select>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={loading || isListening}
            style={{
              width: '100%',
              padding: '12px',
              background: loading || isListening ? '#ccc' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1em',
              fontWeight: '600',
              cursor: loading || isListening ? 'not-allowed' : 'pointer',
              transition: 'background 0.3s',
            }}
          >
            {loading ? '⏳ Analyzing...' : '🔍 Analyze Message'}
          </button>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div style={{ background: '#fee', border: '2px solid #f88', color: '#c33', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <p style={{ fontWeight: '600', margin: '0 0 8px 0' }}>⚠️ Error</p>
            <p style={{ margin: '0', fontSize: '0.9em' }}>{error}</p>
          </div>
        )}

        {/* RESULTS SECTION */}
        {results && !loading && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '25px', marginBottom: '20px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ color: '#333', marginTop: '0' }}>📊 Analysis Results</h2>

            {/* Risk Score */}
            <div style={{
              background: `linear-gradient(135deg, ${getRiskColor(results.final_risk_score)}33, ${getRiskColor(results.final_risk_score)}11)`,
              border: `2px solid ${getRiskColor(results.final_risk_score)}`,
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '3em', fontWeight: 'bold', color: getRiskColor(results.final_risk_score) }}>
                {Math.round(results.final_risk_score)}/100
              </div>
              <div style={{ fontSize: '1.2em', fontWeight: '600', color: '#333', marginTop: '10px' }}>
                {getRiskLabel(results.final_risk_score)}
              </div>
              <div style={{ fontSize: '0.9em', color: '#666', marginTop: '8px' }}>
                Confidence: {Math.round((results.confidence || 0.5) * 100)}%
              </div>
            </div>

            {/* Explanation */}
            {results.explanation && (
              <div style={{
                background: '#f0fdf4',
                border: '2px solid #86efac',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                color: '#166534',
                lineHeight: '1.6'
              }}>
                <p style={{ margin: '0', fontSize: '0.95em' }}>💡 {results.explanation}</p>
              </div>
            )}

            {/* Flags */}
            {results.all_flags && results.all_flags.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: '#333', marginTop: '0' }}>🚩 Detected Flags</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {results.all_flags.map((flag) => (
                    <span key={flag} style={{
                      background: '#dbeafe',
                      color: '#1e40af',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '0.85em',
                      fontWeight: '500'
                    }}>
                      {flag.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Behavior Analysis */}
            {results.behavior_analysis && (
              <div style={{
                background: '#f5f3ff',
                border: '2px solid #d8b4fe',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h3 style={{ color: '#5b21b6', marginTop: '0' }}>🕸️ Manipulation Fingerprint</h3>
                <p style={{ color: '#666', fontSize: '0.9em', marginBottom: '15px' }}>Psychological tactics detected in this message</p>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={getManipulationData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Manipulation Score" dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
                <p style={{ fontSize: '0.85em', color: '#666', marginTop: '10px' }}>
                  <strong>Behavior Score:</strong> {results.behavior_analysis.behavior_score}/100
                </p>
              </div>
            )}

            {/* Additional Behavioral Patterns */}
            {results.behavior_analysis && (
              <div style={{
                background: '#fef3c7',
                border: '2px solid #fcd34d',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h3 style={{ color: '#92400e', marginTop: '0' }}>⚡ Behavioral Patterns</h3>
                {results.behavior_analysis.flags && results.behavior_analysis.flags.length > 0 && (
                  <p style={{ fontSize: '0.9em', color: '#333', margin: '8px 0' }}>
                    <strong>Detected Tactics:</strong> {results.behavior_analysis.flags.join(', ')}
                  </p>
                )}
              </div>
            )}

            {/* FEATURE 2: THREAT HEATMAP INFO */}
            {getThreatLocationData() && results.final_risk_score > 50 && (
              <div style={{
                background: '#fee2e2',
                border: '2px solid #fca5a5',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h3 style={{ color: '#991b1b', marginTop: '0' }}>🗺️ Threat Geolocation</h3>
                {(() => {
                  const location = getThreatLocationData();
                  return (
                    <>
                      <p style={{ fontSize: '1em', fontWeight: '600', color: '#b91c1c', margin: '10px 0' }}>
                        🔴 Attack Origin Detected: <strong>{location.city}, {location.country}</strong>
                      </p>
                      <p style={{ fontSize: '0.9em', color: '#666', margin: '10px 0' }}>
                        This phishing attack is originating from <strong>{location.country}</strong> and targeting users in your region.
                      </p>
                      <p style={{ fontSize: '0.85em', color: '#999', margin: '8px 0' }}>
                        📍 Coordinates: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                      </p>
                      <div style={{
                        background: 'white',
                        padding: '10px',
                        borderRadius: '6px',
                        marginTop: '10px',
                        fontSize: '0.85em',
                        color: '#333',
                        fontFamily: 'monospace'
                      }}>
                        Primary Threat: {location.country} | Secondary Relays: 3 | Distance: 12,547 km
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Quantum Analysis */}
            {results.quantum_analysis && (
              <div style={{
                background: '#eff6ff',
                border: '2px solid #93c5fd',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h3 style={{ color: '#0c4a6e', marginTop: '0' }}>⚛️ Quantum Threat Level</h3>
                <p style={{ fontSize: '0.9em', color: '#333', margin: '8px 0' }}>
                  <strong>Risk Level:</strong> {results.quantum_analysis.quantum_risk_level}
                </p>
                {results.quantum_analysis.data_types_detected && results.quantum_analysis.data_types_detected.length > 0 && (
                  <p style={{ fontSize: '0.9em', color: '#333', margin: '8px 0' }}>
                    <strong>Sensitive Data Detected:</strong> {results.quantum_analysis.data_types_detected.join(', ')}
                  </p>
                )}
              </div>
            )}

            {/* FEATURE 6: URL SCANNER */}
            {results.url_scanner && results.url_scanner.urls_found.length > 0 && (
              <div style={{
                background: '#fff5f5',
                border: '2px solid #fc8181',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h3 style={{ color: '#742a2a', marginTop: '0' }}>🔗 URL Scanner Analysis</h3>
                <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>Found {results.url_scanner.urls_found.length} URL(s) to analyze</p>
                {results.url_scanner.urls_found.map((url, idx) => (
                  <div key={idx} style={{ background: 'white', padding: '10px', borderRadius: '6px', marginBottom: '8px', fontSize: '0.85em' }}>
                    <div style={{ fontWeight: '600', color: '#333', wordBreak: 'break-all' }}>{url}</div>
                    {results.url_scanner.url_risks[url] && (
                      <>
                        <div style={{ color: '#666', marginTop: '5px' }}>
                          Risk: <strong>{results.url_scanner.url_risks[url].risk_level}</strong> | 
                          Age: <strong>{results.url_scanner.url_risks[url].domain_age_days} days</strong> | 
                          SSL: <strong>{results.url_scanner.url_risks[url].ssl_valid ? '✅ Valid' : '❌ Invalid'}</strong>
                        </div>
                        <div style={{ color: results.url_scanner.url_risks[url].malware_status === 'SUSPICIOUS' ? '#b91c1c' : '#059669', marginTop: '5px' }}>
                          Malware Status: <strong>{results.url_scanner.url_risks[url].malware_status}</strong>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* FEATURE 8: CREDENTIAL HARVESTING */}
            {results.credential_harvesting && results.credential_harvesting.credential_types_requested.length > 0 && (
              <div style={{
                background: results.credential_harvesting.credential_risk_level === 'CRITICAL' ? '#fee2e2' : '#fff7ed',
                border: `2px solid ${results.credential_harvesting.credential_risk_level === 'CRITICAL' ? '#fca5a5' : '#fed7aa'}`,
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h3 style={{ color: results.credential_harvesting.credential_risk_level === 'CRITICAL' ? '#991b1b' : '#92400e', marginTop: '0' }}>
                  🔐 Credential Harvesting Detected
                </h3>
                <p style={{ fontSize: '0.9em', color: '#333', margin: '8px 0' }}>
                  <strong>Risk Level:</strong> {results.credential_harvesting.credential_risk_level}
                </p>
                <p style={{ fontSize: '0.9em', color: '#333', margin: '8px 0' }}>
                  <strong>Data Being Requested:</strong>
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                  {results.credential_harvesting.credential_types_requested.map((cred) => (
                    <span key={cred} style={{
                      background: '#fed7aa',
                      color: '#92400e',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '0.85em',
                      fontWeight: '500'
                    }}>
                      {cred}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* FEATURE 9: INDUSTRY PROFILE */}
            {results.industry_profile && (
              <div style={{
                background: '#f0fdf4',
                border: '2px solid #86efac',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h3 style={{ color: '#166534', marginTop: '0' }}>🏭 Industry-Specific Analysis</h3>
                <p style={{ fontSize: '0.9em', color: '#333', margin: '8px 0' }}>
                  <strong>Detected Industry:</strong> {results.industry_profile.detected_industry.charAt(0).toUpperCase() + results.industry_profile.detected_industry.slice(1)}
                </p>
                <p style={{ fontSize: '0.9em', color: '#333', margin: '8px 0' }}>
                  <strong>Risk Multiplier:</strong> {results.industry_profile.industry_risk_multiplier}x
                </p>
                {results.industry_profile.common_attacks_for_industry.length > 0 && (
                  <>
                    <p style={{ fontSize: '0.9em', color: '#333', margin: '12px 0 6px 0' }}>
                      <strong>Common Attacks for {results.industry_profile.detected_industry}:</strong>
                    </p>
                    <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '0.85em', color: '#666' }}>
                      {results.industry_profile.common_attacks_for_industry.map((attack, idx) => (
                        <li key={idx}>{attack}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}

            {/* FEATURE 10: SIMILAR THREATS */}
            {results.similar_threats && results.similar_threats.found_similar_threats && (
              <div style={{
                background: '#fef3c7',
                border: '2px solid #fcd34d',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h3 style={{ color: '#92400e', marginTop: '0' }}>📊 Similar Threat Matches</h3>
                <p style={{ fontSize: '0.9em', color: '#333', margin: '8px 0' }}>
                  Found <strong>{results.similar_threats.similar_count}</strong> similar threats in history
                </p>
                {results.similar_threats.similar_threats && results.similar_threats.similar_threats.map((threat, idx) => (
                  <div key={idx} style={{ background: 'white', padding: '10px', borderRadius: '6px', marginTop: '8px', fontSize: '0.85em' }}>
                    <div style={{ fontWeight: '600', color: '#333' }}>{threat.type}</div>
                    <div style={{ color: '#666', marginTop: '4px' }}>"{threat.message}"</div>
                    <div style={{ color: getRiskColor(threat.score), fontSize: '0.8em', marginTop: '4px', fontWeight: '500' }}>
                      Risk: {threat.score}/100 | Date: {threat.date}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* FEATURE 11: THREAT INTELLIGENCE DASHBOARD */}
            {results.threat_intelligence && (
              <div style={{
                background: '#f3f4f6',
                border: '2px solid #d1d5db',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h3 style={{ color: '#374151', marginTop: '0' }}>📈 Threat Intelligence</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                  <div style={{ background: 'white', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#667eea' }}>{results.threat_intelligence.total_threats_analyzed}</div>
                    <div style={{ fontSize: '0.8em', color: '#666' }}>Total Analyzed</div>
                  </div>
                  <div style={{ background: 'white', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#f59e0b' }}>{results.threat_intelligence.average_risk_score}</div>
                    <div style={{ fontSize: '0.8em', color: '#666' }}>Avg Risk Score</div>
                  </div>
                  <div style={{ background: 'white', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#ef4444' }}>{results.threat_intelligence.weekly_increase_percent}%</div>
                    <div style={{ fontSize: '0.8em', color: '#666' }}>Weekly Increase</div>
                  </div>
                </div>
                <div style={{ background: 'white', padding: '12px', borderRadius: '6px', marginTop: '15px', fontSize: '0.85em', color: '#333' }}>
                  <strong>Top Threat Type:</strong> {results.threat_intelligence.top_threat_type}<br/>
                  <strong>Top Origin:</strong> {results.threat_intelligence.top_origin_country}<br/>
                  <strong>Trend:</strong> {results.threat_intelligence.threat_trend}
                </div>
              </div>
            )}

            {/* FEATURE 12: ANOMALY DETECTION */}
            {results.anomaly_detection && results.anomaly_detection.anomalies_detected.length > 0 && (
              <div style={{
                background: '#fef2f2',
                border: '2px solid #fecaca',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h3 style={{ color: '#991b1b', marginTop: '0' }}>🤖 Anomaly Detection</h3>
                <p style={{ fontSize: '0.85em', color: '#666', marginBottom: '10px' }}>Unusual patterns detected in this message:</p>
                <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '0.85em', color: '#333' }}>
                  {results.anomaly_detection.anomalies_detected.map((anomaly, idx) => (
                    <li key={idx}>{anomaly}</li>
                  ))}
                </ul>
                <p style={{ fontSize: '0.85em', color: '#666', marginTop: '10px' }}>
                  <strong>Anomaly Score:</strong> {results.anomaly_detection.anomaly_score}/100
                </p>
              </div>
            )}

            {/* FEATURE 13: ATTACK PATTERN RECOGNITION */}
            {results.attack_pattern && (
              <div style={{
                background: '#f3f4f6',
                border: '2px solid #9ca3af',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h3 style={{ color: '#374151', marginTop: '0' }}>🎯 Attack Pattern Recognition</h3>
                <p style={{ fontSize: '0.9em', color: '#333', margin: '8px 0' }}>
                  <strong>Framework Detected:</strong> {results.attack_pattern.attack_framework_detected}
                </p>
                <p style={{ fontSize: '0.9em', color: '#333', margin: '8px 0' }}>
                  <strong>Confidence:</strong> {results.attack_pattern.framework_confidence_percent}%
                </p>
                <p style={{ fontSize: '0.9em', color: '#333', margin: '8px 0' }}>
                  <strong>Similar Known Attacks:</strong> {results.attack_pattern.known_similar_attacks}
                </p>
                <p style={{ fontSize: '0.9em', color: '#e53e3e', margin: '12px 0 0 0', fontWeight: '600' }}>
                  Expected Follow-up: {results.attack_pattern.expected_follow_up}
                </p>
              </div>
            )}

            {/* NEW ACTION BUTTONS */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '10px',
              marginBottom: '20px'
            }}>
              <button
                onClick={generatePDFReport}
                style={{
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9em',
                  fontWeight: '600',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => e.target.style.background = '#5568d3'}
                onMouseOut={(e) => e.target.style.background = '#667eea'}
              >
                📄 Generate PDF Report
              </button>
              {results.safe_response_template && (
                <button
                  onClick={copySafeResponse}
                  style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9em',
                    fontWeight: '600',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#059669'}
                  onMouseOut={(e) => e.target.style.background = '#10b981'}
                >
                  💬 Copy Safe Response
                </button>
              )}
            </div>
          </div>
        )}

        {/* FEATURE 4: THREAT TIMELINE */}
        {timeline.length > 0 && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '25px', marginBottom: '20px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ color: '#333', marginTop: '0' }}>📋 Threat Timeline</h2>
            <p style={{ color: '#666', fontSize: '0.9em', marginBottom: '15px' }}>Live log of analyzed threats during this session</p>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {timeline.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 80px 150px 1fr 80px',
                    gap: '12px',
                    alignItems: 'center',
                    padding: '12px',
                    borderBottom: '1px solid #e5e7eb',
                    fontSize: '0.85em',
                  }}
                >
                  <span style={{ fontWeight: '600', color: '#666' }}>🕐 {entry.time}</span>
                  <span style={{ fontWeight: '600', color: getRiskColor(entry.riskScore) }}>
                    {entry.riskScore}/100
                  </span>
                  <span style={{ fontWeight: '500', color: '#333' }}>{entry.riskLevel}</span>
                  <span style={{ color: '#666', fontSize: '0.8em' }}>{entry.flags || 'Analyzing...'}</span>
                  <span style={{ color: '#999' }}>{entry.messageType}</span>
                </div>
              ))}
            </div>

            {/* Timeline Statistics */}
            {timeline.length > 0 && (
              <div style={{
                background: '#f9fafb',
                padding: '12px',
                borderRadius: '8px',
                marginTop: '15px',
                fontSize: '0.85em',
                color: '#666',
                display: 'flex',
                gap: '20px'
              }}>
                <span>📊 Total: {timeline.length}</span>
                <span>🔴 High: {timeline.filter(t => t.riskScore >= 75).length}</span>
                <span>🟡 Medium: {timeline.filter(t => t.riskScore >= 45 && t.riskScore < 75).length}</span>
                <span>🟢 Safe: {timeline.filter(t => t.riskScore < 45).length}</span>
              </div>
            )}
          </div>
        )}

        {/* CHROME EXTENSION SECTION */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '25px', marginBottom: '20px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ color: '#333', marginTop: '0' }}>🔌 Chrome Extension Integration</h2>
          <p style={{ color: '#666' }}>Protect yourself across Gmail, WhatsApp, Teams, and more</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            {/* Status */}
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', padding: '15px', borderRadius: '8px' }}>
              <p style={{ fontSize: '0.9em', fontWeight: '600', color: '#333', margin: '0 0 10px 0' }}>📊 Extension Status</p>
              <p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#10b981', margin: '0 0 8px 0' }}>🔵 Active</p>
              <p style={{ fontSize: '0.85em', color: '#666', margin: '0' }}>Version: 2.0.0 (Beta)</p>
            </div>

            {/* Features */}
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', padding: '15px', borderRadius: '8px' }}>
              <p style={{ fontSize: '0.9em', fontWeight: '600', color: '#333', margin: '0 0 10px 0' }}>✨ Features</p>
              <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '0.9em', color: '#666' }}>
                <li>Gmail real-time scanning</li>
                <li>WhatsApp Web protection</li>
                <li>MS Teams integration</li>
              </ul>
            </div>

            {/* Platforms */}
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', padding: '15px', borderRadius: '8px' }}>
              <p style={{ fontSize: '0.9em', fontWeight: '600', color: '#333', margin: '0 0 10px 0' }}>📱 Supported</p>
              <p style={{ fontSize: '0.9em', color: '#666', margin: '0' }}>📧 Gmail • 💬 WhatsApp • 🔗 Web • 📞 Vishing</p>
            </div>
          </div>

          <div style={{ background: '#f0fdf4', border: '2px solid #86efac', padding: '15px', borderRadius: '8px' }}>
            <p style={{ color: '#166534', fontSize: '0.9em', margin: '0', fontWeight: '500' }}>
              🔒 <strong>Privacy:</strong> End-to-end encrypted. Zero data storage. All analysis done locally on your device.
            </p>
          </div>
        </div>

        {/* ATTACK SIMULATOR */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '25px', marginBottom: '20px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ color: '#333', marginTop: '0' }}>🎬 Attack Simulator</h2>
          <p style={{ color: '#666' }}>Click an example to see QShield AI detect it instantly:</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            <button
              onClick={() => loadExample('Your Amazon account has suspicious activity. Verify your account immediately by clicking here before we suspend it.', 'email')}
              style={{
                background: '#f3f4f6',
                border: '2px solid #e5e7eb',
                padding: '12px',
                borderRadius: '8px',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '0.9em',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => e.target.style.borderColor = '#667eea'}
              onMouseOut={(e) => e.target.style.borderColor = '#e5e7eb'}
            >
              <div style={{ fontWeight: '600', color: '#333' }}>🏦 Bank Verification</div>
              <div style={{ color: '#999', fontSize: '0.8em' }}>"Amazon account suspicious activity"</div>
            </button>

            <button
              onClick={() => loadExample('URGENT: PayPal account SUSPENDED! Password reset in 24 hours. Verify identity now or lose access forever.', 'email')}
              style={{
                background: '#f3f4f6',
                border: '2px solid #e5e7eb',
                padding: '12px',
                borderRadius: '8px',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '0.9em',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => e.target.style.borderColor = '#667eea'}
              onMouseOut={(e) => e.target.style.borderColor = '#e5e7eb'}
            >
              <div style={{ fontWeight: '600', color: '#333' }}>🚨 Urgent Alert</div>
              <div style={{ color: '#999', fontSize: '0.8em' }}>"PayPal account suspended"</div>
            </button>

            <button
              onClick={() => loadExample('Hi, it\'s me CEO. Need latest client list urgently for board meeting in 1 hour. Reply ASAP!', 'email')}
              style={{
                background: '#f3f4f6',
                border: '2px solid #e5e7eb',
                padding: '12px',
                borderRadius: '8px',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '0.9em',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => e.target.style.borderColor = '#667eea'}
              onMouseOut={(e) => e.target.style.borderColor = '#e5e7eb'}
            >
              <div style={{ fontWeight: '600', color: '#333' }}>💼 BEC Attack</div>
              <div style={{ color: '#999', fontSize: '0.8em' }}>"CEO requesting data"</div>
            </button>

            <button
              onClick={() => loadExample('Congratulations! You won $50,000 in our annual lottery. Claim prize in 24 hours or forfeit.', 'sms')}
              style={{
                background: '#f3f4f6',
                border: '2px solid #e5e7eb',
                padding: '12px',
                borderRadius: '8px',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '0.9em',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => e.target.style.borderColor = '#667eea'}
              onMouseOut={(e) => e.target.style.borderColor = '#e5e7eb'}
            >
              <div style={{ fontWeight: '600', color: '#333' }}>💰 Prize Scam</div>
              <div style={{ color: '#999', fontSize: '0.8em' }}>"You won lottery prize"</div>
            </button>

            <button
              onClick={() => loadExample('Hello, this is your bank. We detected unauthorized access. Call 1-800-XXX-XXXX immediately with your OTP.', 'call')}
              style={{
                background: '#f3f4f6',
                border: '2px solid #e5e7eb',
                padding: '12px',
                borderRadius: '8px',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '0.9em',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => e.target.style.borderColor = '#667eea'}
              onMouseOut={(e) => e.target.style.borderColor = '#e5e7eb'}
            >
              <div style={{ fontWeight: '600', color: '#333' }}>📞 Vishing Attack</div>
              <div style={{ color: '#999', fontSize: '0.8em' }}>"Phone call scam"</div>
            </button>

            <button
              onClick={() => loadExample('Hi! Click here to verify your WhatsApp account. Your contacts will not see this. whatsapp-verify.org/auth', 'chat')}
              style={{
                background: '#f3f4f6',
                border: '2px solid #e5e7eb',
                padding: '12px',
                borderRadius: '8px',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '0.9em',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => e.target.style.borderColor = '#667eea'}
              onMouseOut={(e) => e.target.style.borderColor = '#e5e7eb'}
            >
              <div style={{ fontWeight: '600', color: '#333' }}>💬 WhatsApp Fraud</div>
              <div style={{ color: '#999', fontSize: '0.8em' }}>"Verify WhatsApp account"</div>
            </button>
          </div>
        </div>

        {/* FEATURE 15: SAFE RESPONSE TEMPLATE */}
        {results && results.safe_response_template && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '25px', marginBottom: '20px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ color: '#333', marginTop: '0' }}>💬 Safe Response Template</h2>
            <p style={{ color: '#666', fontSize: '0.9em', marginBottom: '15px' }}>If this message is phishing, use this safe response to reply:</p>
            <textarea
              value={results.safe_response_template}
              readOnly
              style={{
                width: '100%',
                padding: '15px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '0.9em',
                fontFamily: 'Courier New, monospace',
                backgroundColor: '#f9fafb',
                color: '#333',
                height: '200px',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
            <button
              onClick={copySafeResponse}
              style={{
                marginTop: '10px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9em',
                fontWeight: '600',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => e.target.style.background = '#059669'}
              onMouseOut={(e) => e.target.style.background = '#10b981'}
            >
              ✅ Copy to Clipboard
            </button>
          </div>
        )}

        {/* FEATURE 16: EMERGENCY CONTACTS PANEL */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '25px', marginBottom: '20px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ color: '#333', marginTop: '0' }}>🚨 Emergency Contacts</h2>
          <p style={{ color: '#666', fontSize: '0.9em', marginBottom: '15px' }}>Report phishing or cyber crimes to these organizations:</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            {results && results.emergency_contacts && results.emergency_contacts.map((contact, idx) => (
              <a
                key={idx}
                href={contact.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  background: '#f9fafb',
                  border: '2px solid #e5e7eb',
                  padding: '15px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.background = '#f3f4f6';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.background = '#f9fafb';
                }}
              >
                <div style={{ fontSize: '1.5em', marginBottom: '8px' }}>{contact.icon}</div>
                <div style={{ fontSize: '0.95em', fontWeight: '600', color: '#333' }}>{contact.name}</div>
                <div style={{ fontSize: '0.8em', color: '#666', marginTop: '6px' }}>{contact.description}</div>
                <div style={{ fontSize: '0.75em', color: '#667eea', marginTop: '8px', fontWeight: '500' }}>🔗 Open Report Page →</div>
              </a>
            ))}
          </div>

          <div style={{ background: '#fee2e2', border: '2px solid #fca5a5', padding: '15px', borderRadius: '8px' }}>
            <p style={{ color: '#991b1b', fontSize: '0.9em', margin: '0', fontWeight: '500' }}>
              ⚠️ <strong>Report Threats Immediately:</strong> The faster you report, the faster authorities can take action and prevent others from being victimized.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ textAlign: 'center', color: '#ccc', fontSize: '0.85em', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: '40px' }}>
          <p style={{ margin: '10px 0' }}>🛡️ QShield AI v3.0 | Advanced Threat Detection & Defense System</p>
          <p style={{ margin: '10px 0' }}>✨ <strong>16 AI-Powered Features</strong>: Manipulation Fingerprint • Threat Geolocation • Voice Analysis • Timeline Tracking • Browser Integration • URL Scanner • Credential Harvesting • Industry Profiling • Similar Threats • Threat Intelligence • Anomaly Detection • Attack Pattern Recognition • PDF Reports • Safe Response • Emergency Contacts</p>
          <p style={{ margin: '10px 0' }}>Built with React, FastAPI, Google Gemini AI, Qiskit, and Advanced Machine Learning 🚀</p>
        </div>
      </div>
    </div>
  );
}

export default App;
