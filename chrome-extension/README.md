# QShield AI Chrome Extension

Advanced phishing and malicious link detection for websites and Gmail integration.

## Features

✨ **16 AI-Powered Threat Detection Features:**

1. **Automatic Link Scanning** - Scans all links on any website
2. **Visual Warnings** - Highlights phishing links with color-coded indicators
3. **Tooltip Alerts** - Shows risk assessment on hover
4. **Gmail Integration** - One-click analysis button in Gmail
5. **Email Threat Detection** - Full email phishing analysis
6. **Blocking Warnings** - Prevents users from clicking dangerous links
7. **Real-time Analysis** - Powered by QShield AI backend
8. **Risk Scoring** - 0-100 scale for threat assessment
9. **Multi-vector Detection** - Detects credential harvesting, vishing, BEC, etc.
10. **Pattern Recognition** - Advanced attack framework identification

## Installation Steps

### Step 1: Ensure Backend Server is Running

```bash
# Terminal 1: Start the backend
cd "e:\squid game\qshield-ai\backend"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

You should see:
```
✅ Application startup complete
🛡️ QShield AI Backend starting on 0.0.0.0:8000
```

### Step 2: Load Extension in Chrome

1. **Open Chrome** and go to `chrome://extensions/`
2. **Enable "Developer mode"** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Navigate to: `e:\squid game\qshield-ai\chrome-extension\`
5. Click **"Select Folder"**

### Step 3: Verify Installation

- You should see **"QShield AI - Phishing Detector"** in your extensions list
- The extension icon (🛡️) should appear in your toolbar
- Click the icon - you should see:
  - ✅ **Server:** 🟢 Online
  - ✅ **Gmail Integration:** Status indicator

### Step 4: Test the Extension

#### Test on Regular Websites:

1. Visit any website (e.g., Amazon, Gmail login page, etc.)
2. The extension automatically scans all links
3. **High-risk links** appear red with dashed underlines
4. **Medium-risk links** appear orange
5. **Safe links** appear green
6. Hover over any link to see the tooltip with risk score
7. Click the extension icon to see full page analysis

#### Test in Gmail:

1. Open [Gmail](https://mail.google.com)
2. Open any email
3. **"🛡️ Analyze with QShield"** button appears near the top
4. Click the button to analyze the email
5. Results show:
   - Risk score (0-100)
   - Detected threats
   - Credential harvesting status
   - Vishing detection
   - Action buttons to report or create filters

## How It Works

### Content Script (`content-script.js`)
- Runs on all websites
- Extracts all links from the page
- Sends each unique URL to backend for analysis
- Caches results to reduce API calls
- Highlights risky links with visual indicators
- Shows blocking warnings for high-risk links
- Watches for dynamically added links

### Gmail Integration (`gmail-integration.js`)
- Specifically targets Gmail
- Adds analysis button to email interface
- Extracts email subject, sender, and body
- Sends complete email content to backend
- Displays detailed threat analysis
- Provides reporting and filtering options

### Popup Interface (`popup.html`, `popup.css`, `popup.js`)
- Shows page-level risk assessment
- Lists all links with individual risk scores
- Displays detected threats and warnings
- Shows backend server status
- Provides "Full Report" button to open detailed analysis

### Background Service Worker (`background.js`)
- Handles message passing between scripts
- Makes API calls to backend
- Stores analysis results
- Monitors backend health
- Handles phishing reporting

## Configuration

### Change Backend URL

Edit `popup.js` and `content-script.js`:

```javascript
const BACKEND_URL = 'http://localhost:8000'; // Change this to your server URL
```

For production deployment:
```javascript
const BACKEND_URL = 'https://your-qshield-server.com'; // Your production URL
```

### Risk Score Thresholds

Edit `content-script.js` function `updateLinkUI()`:

```javascript
if (riskScore >= 70) {  // Change this for HIGH threshold
    // High risk
} else if (riskScore >= 40) {  // Change this for MEDIUM threshold
    // Medium risk
}
```

## Link Highlighting Guide

| Color | Style | Meaning | Action |
|-------|-------|---------|--------|
| 🔴 Red | Dashed | **CRITICAL PHISHING** | Extension blocks click and shows warning |
| 🟠 Orange | Dashed | **SUSPICIOUS** | Shows tooltip on hover with risk score |
| 🟢 Green | Solid | **SAFE** | No action needed |

## Email Analysis Fields

When analyzing an email, QShield checks for:

1. **Credential Harvesting** - Requests for passwords, OTP, SSN, credit cards
2. **Vishing Patterns** - Phone-based phishing tactics
3. **Urgency Indicators** - Artificial time pressure
4. **Spoofed Domains** - Homograph and typosquatting attacks
5. **Malware Links** - Known malicious URLs
6. **Industry-Specific Threats** - Banking, ecommerce, healthcare, etc.
7. **Attack Frameworks** - BEC, Smishing, Pretexting, etc.
8. **Anomaly Detection** - Unusual language patterns

## Keyboard Shortcuts (Optional)

You can add keyboard shortcuts in Chrome:

1. Go to `chrome://extensions/shortcuts`
2. Find "QShield AI - Phishing Detector"
3. Set shortcuts like:
   - `Ctrl+Shift+Q` - Analyze current page
   - `Ctrl+Shift+E` - Report phishing

## Troubleshooting

### Extension Not Loading

**Error:** "Failed to load unpacked extension"

**Solution:**
- Verify folder path is correct: `chrome-extension` directory
- Check `manifest.json` has no syntax errors
- Make sure all required files exist

### Server Offline Warning

**Issue:** Shows "🔴 Offline" for server status

**Solution:**
```bash
# Restart backend server
cd "e:\squid game\qshield-ai\backend"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Gmail Button Not Appearing

**Issue:** "Analyze with QShield" button doesn't show in Gmail

**Solution:**
- Refresh Gmail page: `Ctrl+R`
- Wait 2-3 seconds for button to appear
- Check browser console for errors: `F12` → Console

### Links Not Being Highlighted

**Issue:** No red/orange highlights appear on links

**Solution:**
1. Ensure backend is running: Check `http://localhost:8000/health`
2. Open popup and click "🔍 Analyze Page"
3. Check browser console for error messages

## API Endpoints Used

The extension communicates with these backend endpoints:

### Analyze Threat
```
POST /analyze
Content-Type: application/json

{
  "message": "Email or link text to analyze",
  "message_type": "email" | "website" | "sms"
}

Response:
{
  "risk_score": 75,
  "risk_level": "HIGH",
  "detected_flags": ["phishing_attempt", "credential_harvesting"],
  "credential_risk_level": "CRITICAL",
  "vishing_detected": true,
  ...
}
```

### Health Check
```
GET /health

Response: 200 OK
```

### Report Phishing (Optional)
```
POST /report-phishing
Content-Type: application/json

{
  "url": "https://example.com",
  "risk_score": 85,
  "timestamp": "2026-03-17T16:30:00Z"
}
```

## Browser Compatibility

- ✅ Chrome/Chromium 90+
- ✅ Edge 90+
- ⚠️ Brave (works but may need additional permissions)
- ❌ Firefox (requires conversion to WebExtension format)
- ❌ Safari (not supported)

## Privacy & Security

- 🔒 All analysis happens on your backend server
- 🔒 No data sent to external servers (except your configured backend)
- 🔒 Links are analyzed only when you click popup button or visit Gmail
- 🔒 Results are cached locally in browser memory
- 🔒 No personal data is stored

## Updates & Future Features

Planned enhancements:
- [ ] Dark mode theme
- [ ] Custom risk threshold settings
- [ ] Whitelist trusted domains
- [ ] Browser history analysis
- [ ] Automated phishing report integration
- [ ] Machine learning model updates
- [ ] Multi-language support

## Support

For issues or feature requests:
1. Check the troubleshooting section above
2. Ensure backend server is running
3. Restart Chrome or reload extension
4. Clear Chrome cache and cookies

## File Structure

```
chrome-extension/
├── manifest.json              # Extension configuration
├── popup.html                 # Popup UI
├── popup.css                  # Popup styling
├── popup.js                   # Popup logic
├── content-script.js          # Website link detection
├── gmail-integration.js       # Gmail email analysis
├── background.js              # Service worker
├── icons/                     # Extension icons
│   ├── icon-16.png           # 16x16 icon
│   ├── icon-48.png           # 48x48 icon
│   └── icon-128.png          # 128x128 icon
└── README.md                 # This file
```

## Version

**QShield AI Chrome Extension v1.0.0**

Built with ❤️ for cyber security
