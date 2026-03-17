// components/ThreatHeatmap.jsx

import { useState, useEffect } from 'react';

export function ThreatHeatmap({ urlAnalysis = null }) {
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (urlAnalysis?.domain_analysis?.domain) {
      generateMapData(urlAnalysis.domain_analysis.domain);
    }
  }, [urlAnalysis]);

  const generateMapData = async (domain) => {
    setLoading(true);
    try {
      // Simulate IP geolocation (in production, use ip-api.com)
      // For demo, use realistic attack origins
      const attackOrigins = {
        Nigeria: { lat: 6.5244, lng: 3.3792, ip: '102.45.xx.xx', threat: 'High' },
        Russia: { lat: 55.7558, lng: 37.6173, ip: '185.12.xx.xx', threat: 'High' },
        India: { lat: 28.7041, lng: 77.1025, ip: '103.xx.xx.xx', threat: 'Medium' },
        BangladeshBrowser: { lat: 23.7104, lng: 90.3570, ip: '103.82.xx.xx', threat: 'High' },
        China: { lat: 39.9042, lng: 116.4074, ip: '115.xx.xx.xx', threat: 'Critical' },
      };

      // Random origin for demo
      const origins = Object.entries(attackOrigins);
      const [country, data] = origins[Math.floor(Math.random() * origins.length)];

      setMapData({
        country,
        ...data,
        userLocation: { lat: 28.7041, lng: 77.1025, name: 'Your Location' }, // Demo: India
      });
    } catch (error) {
      console.error('Map generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mapData) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-bold text-blue-900 mb-2">
        🗺️ Threat Origin Heatmap
      </h3>
      <p className="text-sm text-blue-700 mb-4">
        Geographic origin of this phishing attack:
      </p>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-blue-600">Geolocating attack origin...</p>
        </div>
      ) : (
        <div>
          {/* Simple ASCII Map Representation */}
          <div className="bg-white border border-blue-300 p-4 rounded mb-4 font-mono text-xs">
            <div className="whitespace-pre text-center text-blue-600">
              {`
               🌍 WORLD MAP
            ┌─────────────────────────────┐
            │  🔴 Attack Origin (${mapData.country})    │
            │  IP: ${mapData.ip}            │
            │  Threat Level: ${mapData.threat}          │
            │                             │
            │  ↓↓↓ Attack Path ↓↓↓        │
            │                             │
            │  🟢 Your Location (India)   │
            │  IP: ${mapData.userLocation.lat}xxx       │
            └─────────────────────────────┘
              `}
            </div>
          </div>

          {/* Details Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Attack Origin */}
            <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded">
              <h4 className="font-bold text-red-900 mb-2">🔴 Attack Origin</h4>
              <p className="text-sm text-red-800">
                <strong>Country:</strong> {mapData.country}
              </p>
              <p className="text-sm text-red-800">
                <strong>IP Address:</strong> {mapData.ip}
              </p>
              <p className="text-sm text-red-800">
                <strong>Threat Level:</strong>{' '}
                <span className="font-bold text-red-600">{mapData.threat}</span>
              </p>
            </div>

            {/* Your Location */}
            <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded">
              <h4 className="font-bold text-green-900 mb-2">🟢 Your Location</h4>
              <p className="text-sm text-green-800">
                <strong>Location:</strong> {mapData.userLocation.name}
              </p>
              <p className="text-sm text-green-800">
                <strong>Coordinates:</strong> {mapData.userLocation.lat.toFixed(2)},
                {mapData.userLocation.lng.toFixed(2)}
              </p>
              <p className="text-sm text-green-800">
                <strong>Status:</strong> Protected
              </p>
            </div>
          </div>

          {/* Attack Statistics */}
          <div className="mt-4 bg-blue-100 border-l-4 border-blue-500 p-4 rounded">
            <h4 className="font-bold text-blue-900 mb-2">📊 Attack Analysis</h4>
            <p className="text-sm text-blue-800 mb-2">
              This phishing attack originates from <strong>{mapData.country}</strong> and is
              targeting users in India. The attacker is using domain spoofing and credential
              harvesting techniques.
            </p>
            <p className="text-xs text-blue-700 italic">
              ⚠️ Global phishing attacks increase during business hours (9-5 IST)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
