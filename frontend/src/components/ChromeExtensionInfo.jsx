// components/ChromeExtensionInfo.jsx

export function ChromeExtensionInfo() {
  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-400 p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-bold text-orange-900 mb-3">
        🌐 Chrome Extension - QShield Protection
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Extension Status */}
        <div className="bg-white border border-orange-300 p-4 rounded">
          <h4 className="font-bold text-orange-800 mb-2">📊 Extension Status</h4>
          <p className="text-2xl font-bold text-orange-600 mb-1">🔵 Active</p>
          <p className="text-sm text-slate-700">
            <strong>Version:</strong> 1.0.0
          </p>
          <p className="text-sm text-slate-700">
            <strong>Installations:</strong> 0 (Local Demo)
          </p>
        </div>

        {/* Features */}
        <div className="bg-white border border-orange-300 p-4 rounded">
          <h4 className="font-bold text-orange-800 mb-2">✨ Features</h4>
          <ul className="text-sm text-slate-700 space-y-1">
            <li>✅ Gmail integration</li>
            <li>✅ Page content analysis</li>
            <li>✅ Real-time alerts</li>
            <li>✅ Zero data logging</li>
          </ul>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-orange-100 border-l-4 border-orange-500 p-4 rounded mb-4">
        <h4 className="font-bold text-orange-900 mb-2">🔧 How It Works</h4>
        <ol className="text-sm text-orange-800 space-y-2">
          <li>
            <strong>1. Install</strong> - Add QShield to Chrome from extension store
          </li>
          <li>
            <strong>2. Open Email</strong> - Click the 🛡️ button on any email, message, or webpage
          </li>
          <li>
            <strong>3. Instant Analysis</strong> - QShield analyzes the content in milliseconds
          </li>
          <li>
            <strong>4. Risk Alert</strong> - Popup shows risk score and detected threats
          </li>
        </ol>
      </div>

      {/* Supported Platforms */}
      <div className="bg-white border border-orange-300 p-4 rounded mb-4">
        <h4 className="font-bold text-orange-800 mb-2">📱 Supported Platforms</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <span>📧</span> Gmail
          </div>
          <div className="flex items-center gap-1">
            <span>💬</span> WhatsApp Web
          </div>
          <div className="flex items-center gap-1">
            <span>🔗</span> Any Webpage
          </div>
          <div className="flex items-center gap-1">
            <span>📱</span> LinkedIn
          </div>
        </div>
      </div>

      {/* Security Note */}
      <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded">
        <h4 className="font-bold text-green-900 mb-1">🔒 Privacy & Security</h4>
        <p className="text-sm text-green-800">
          QShield extension does NOT store, log, or transmit any personal data. All analysis is
          done locally on your browser for maximum privacy.
        </p>
      </div>

      {/* Demo Installation */}
      <div className="mt-4 pt-4 border-t border-orange-300">
        <p className="text-xs text-orange-700">
          <strong>Demo Note:</strong> In a production environment, this extension would be available
          on the Chrome Web Store. For this hackathon, you can test the core QShield functionality
          directly on this dashboard.
        </p>
      </div>
    </div>
  );
}
