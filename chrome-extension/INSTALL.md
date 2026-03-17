# Chrome Extension Installation & Connection Guide

Complete step-by-step guide to install the QShield AI Chrome Extension and connect it to your backend server.

## 📋 Prerequisites

- ✅ Chrome/Chromium browser installed
- ✅ QShield AI backend running
- ✅ Python 3.10+
- ✅ FastAPI and dependencies installed

## 🚀 Installation Process

### Phase 1: Start the Backend Server

#### Step 1.1: Open Terminal/PowerShell
```bash
# Navigate to backend directory
cd "e:\squid game\qshield-ai\backend"
```

#### Step 1.2: Start the Backend
```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Expected Output:**
```
C:\Users\YourName\AppData\Local\Programs\Python\Python310\lib\site-packages\gunicorn\gapplication.py:319: FutureWarning: ...
2026-03-17 16:30:23,803 - main - INFO - 🚀 Starting with real API keys
2026-03-17 16:30:23,803 - main - INFO - 🛡️  QShield AI Backend starting on 0.0.0.0:8000
INFO:     Application startup complete.
```

✅ **Backend is ready!** The server is now listening on `http://localhost:8000`

### Phase 2: Install Chrome Extension

#### Step 2.1: Open Chrome Extensions Page
1. Open **Google Chrome**
2. Type `chrome://extensions/` in address bar
3. Press **Enter**

#### Step 2.2: Enable Developer Mode
- Look for **"Developer mode"** toggle in top-right corner
- Click to turn it **ON** (should turn blue)

#### Step 2.3: Load Unpacked Extension
1. Click **"Load unpacked"** button
2. Navigate to: `e:\squid game\qshield-ai\chrome-extension`
3. Click **"Select Folder"**

#### Step 2.4: Verify Installation
After loading, you should see:
- ✅ Extension named: **"QShield AI - Phishing Detector"**
- ✅ Extension version: **1.0.0**
- ✅ Blue reload icon (refresh can be used anytime)
- ✅ 🛡️ icon appears in Chrome toolbar

### Phase 3: Verify Backend Connection

#### Step 3.1: Click Extension Icon
- Click 🛡️ icon in top-right of Chrome
- A popup window appears

#### Step 3.2: Check Server Status
Inside the popup, look for:
```
Server: 🟢 Online
Gmail Integration: ❌ Not on Gmail
```

✅ If you see **"🟢 Online"**, the extension is connected to your backend!

## 🔧 Configuration

### If Backend on Different URL/Port

#### For localhost with different port:
Edit these files and change:

**File 1: `chrome-extension/popup.js` (Line 4-5)**
```javascript
const BACKEND_URL = 'http://localhost:8000'; // Change port here
const API_ENDPOINT = `${BACKEND_URL}/analyze`;
```

**File 2: `chrome-extension/content-script.js` (Line 5)**
```javascript
const BACKEND_URL = 'http://localhost:8000';
```

**File 3: `chrome-extension/gmail-integration.js` (Line 5)**
```javascript
const BACKEND_URL = 'http://localhost:8000';
```

**File 4: `chrome-extension/background.js` (Line 3)**
```javascript
const BACKEND_URL = 'http://localhost:8000';
```

After editing, reload the extension:
1. Go to `chrome://extensions/`
2. Find "QShield AI" extension
3. Click the **reload icon** (↻)

#### For production/remote server:
```javascript
const BACKEND_URL = 'https://your-qshield-server.com'; // Your production domain
```

## ✅ Testing the Extension

### Test 1: Website Link Detection

1. Visit any website (e.g., amazon.com)
2. Wait 2-3 seconds
3. Links should be highlighted:
   - 🔴 Red dashed = High risk phishing
   - 🟠 Orange dashed = Medium risk
   - 🟢 Green solid = Safe

**Expected Behavior:**
- Hover over **any red link** → Shows "🚨 PHISHING LINK - DO NOT CLICK"
- Click **red link** → Shows blocking warning dialog
- Click **green link** → Opens normally

### Test 2: Gmail Integration

1. Go to [Gmail](https://mail.google.com)
2. Open any existing email
3. Look for **"🛡️ Analyze with QShield"** button near subject
4. Click the button
5. Wait 2-3 seconds for analysis
6. Results appear showing:
   - Risk score (0-100)
   - Detected threats
   - Credential harvesting status
   - Options to mark as phishing or create filters

### Test 3: Popup Analysis

1. Visit any website
2. Click 🛡️ extension icon
3. Click **"🔍 Analyze Page"** button
4. Wait 2-3 seconds
5. Results show:
   - Overall page risk score
   - Number of links analyzed
   - Number of threats found
   - Detailed list of each link with risk level

### Test 4: Use Test Messages

Try these messages for testing:

**High Risk (Should show 70+/100):**
```
URGENT: Your PayPal account has been SUSPENDED! Click to verify: paypa1.com/verify?pwd=required
```

**Medium Risk (Should show 40-60/100):**
```
Click to confirm your banking information: secure-bank-update.com/login
```

**Safe (Should show <40/100):**
```
Your package has been delivered. Track it at amazon.com/orders
```

## 📊 How the Connection Works

### Link Detection Flow
```
User visits website
    ↓
Chrome loads content-script.js
    ↓
Script extracts all links
    ↓
For each unique link:
  → Sends to backend: POST /analyze
  → Backend analyzes link
  → Response: risk_score, risk_level, threats
    ↓
Script highlights links based on risk
    ↓
Hovers and clicks trigger appropriate actions
```

### Gmail Analysis Flow
```
User opens Gmail
    ↓
gmail-integration.js loads
    ↓
Extension adds "Analyze with QShield" button
    ↓
User clicks button when reading email
    ↓
Script extracts: Subject, From, Body
    ↓
Sends to backend: POST /analyze with email content
    ↓
Backend returns full analysis
    ↓
Results displayed in email thread
    ↓
User can report or create filters
```

### Popup Analysis Flow
```
User clicks extension icon
    ↓
popup.js loads
    ↓
Checks backend health: GET /health
    ↓
User clicks "Analyze Page"
    ↓
Injection script extracts all page links
    ↓
Each link sent to: POST /analyze
    ↓
Caches results to reduce API calls
    ↓
Displays complete page analysis
```

## Behind the Scenes

### What the Backend Receives

#### From Content Script (Link Analysis):
```json
{
  "message": "Check this link: https://suspicious-site.com",
  "message_type": "website"
}
```

#### From Gmail Integration (Email Analysis):
```json
{
  "message": "Email from: attacker@spoofed.com\nSubject: URGENT: Verify Your Account\nBody: Click here to verify...",
  "message_type": "email"
}
```

#### From Popup (Page Analysis):
```json
{
  "message": "Website: https://example.com\nTitle: Example Page\nLinks found: 25\nPage content preview: ...",
  "message_type": "website"
}
```

### What the Backend Returns

```json
{
  "risk_score": 75,
  "risk_level": "HIGH",
  "detected_flags": [
    "phishing_attempt",
    "credential_harvesting",
    "urgency_manipulation"
  ],
  "credential_risk_level": "CRITICAL",
  "vishing_detected": false,
  "urls_found": ["https://suspicious-site.com"],
  "url_risks": ["https://suspicious-site.com"],
  "malware_status": "SAFE",
  ... // (and 11 other analysis fields)
}
```

## 🆘 Troubleshooting

### Problem 1: Server Shows Offline

**Symptoms:**
- Extension popup shows "🔴 Offline"
- Links not being highlighted
- Gmail button works but analysis fails

**Solutions:**

1. **Check backend is running:**
   ```bash
   # Terminal should show:
   # Application startup complete
   # 🛡️ QShield AI Backend starting on 0.0.0.0:8000
   ```

2. **Test backend directly:**
   - Open browser
   - Visit: `http://localhost:8000/health`
   - Should return: `{"status": "online", ...}`

3. **Restart backend:**
   ```bash
   # Current terminal: Ctrl+C to stop
   # Then:
   python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

4. **Restart Chrome:**
   - Close all Chrome windows
   - Wait 5 seconds
   - Reopen Chrome
   - Click extension icon again

### Problem 2: No Links Being Highlighted

**Symptoms:**
- Visit website but no red/orange/green highlights
- Links appear normal

**Solutions:**

1. **Wait for scanning:**
   - Links analyze asynchronously
   - Wait 2-3 seconds on a page
   - Refresh page if still nothing

2. **Check popup:**
   - Click 🛡️ icon
   - Click "🔍 Analyze Page"
   - If results appear, highlighting is working

3. **Reload extension:**
   - Go to `chrome://extensions/`
   - Find "QShield AI"
   - Click reload icon (↻)

4. **Check browser console:**
   - Press F12 → Console tab
   - Look for red error messages
   - If errors appear, screenshot and check configuration

### Problem 3: Gmail Button Missing

**Symptoms:**
- Open Gmail
- Click to read email
- No "🛡️ Analyze with QShield" button appears

**Solutions:**

1. **Different Gmail interface:**
   - Gmail has multiple UI versions
   - Button might appear in different location
   - Try switching to "Standard Gmail" if using "Simple HTML"

2. **Refresh Gmail:**
   - Press Ctrl+Shift+R (hard refresh)
   - Wait 3 seconds
   - Open an email

3. **Reload extension:**
   - Go to `chrome://extensions/`
   - Click reload for "QShield AI"
   - Go back to Gmail
   - Refresh Gmail page

4. **Check permissions:**
   - Go to `chrome://extensions/`
   - Click "QShield AI" extension
   - Under "Permissions" should include "mail.google.com"

### Problem 4: Extension Won't Load

**Symptoms:**
- Click "Load unpacked"
- Get error message
- Extension doesn't appear in list

**Solutions:**

1. **Check folder path:**
   - Should be: `e:\squid game\qshield-ai\chrome-extension`
   - Folder should contain: manifest.json, popup.html, content-script.js, etc.
   - NOT the parent folder with all subfolders

2. **Verify manifest.json:**
   - Open `chrome-extension/manifest.json` in text editor
   - Should start with: `{ "manifest_version": 3,`
   - Should have no syntax errors
   - Check for extra commas or missing brackets

3. **Check required files exist:**
   ```
   chrome-extension/
   ├── manifest.json ✓
   ├── popup.html ✓
   ├── popup.css ✓
   ├── popup.js ✓
   ├── content-script.js ✓
   ├── gmail-integration.js ✓
   ├── background.js ✓
   └── icons/ (folder) ✓
   ```

4. **Try again:**
   - Close Extensions tab
   - Open new tab: `chrome://extensions/`
   - Try "Load unpacked" again

## 📞 Getting Help

If you encounter an issue:

1. **Check this guide** - Most common issues have solutions above
2. **Verify backend is running** - Essential first step
3. **Reload extension** - Often fixes temporary issues
4. **Clear Chrome cache:**
   - Ctrl+Shift+Delete
   - Select "All time"
   - Check "Cookies", "Cached images and files"
   - Click "Clear data"
5. **Restart Chrome** - Closes all tabs, reopen
6. **Check browser console** - F12 → Console tab for error messages

## 🎉 Success!

Once everything is working:

✅ You have AI-powered phishing detection on every website
✅ Gmail emails are automatically analyzed
✅ Dangerous links are highlighted and blocked
✅ You're protected from social engineering attacks
✅ Your data stays on your server - nothing sent elsewhere

---

**Extension Version:** 1.0.0  
**Backend Version:** 3.0 with 16 AI-Powered Features  
**Last Updated:** March 17, 2026
