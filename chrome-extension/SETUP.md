# QShield AI Chrome Extension - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Start Backend Server

```bash
cd "e:\squid game\qshield-ai\backend"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Expected output:
```
✅ Application startup complete
🛡️ QShield AI Backend starting on 0.0.0.0:8000
```

### 2. Install Chrome Extension

1. Open **Chrome** → type `chrome://extensions/` → press Enter
2. Toggle **"Developer mode"** ON (top-right)
3. Click **"Load unpacked"**
4. Select folder: `e:\squid game\qshield-ai\chrome-extension`
5. Press **"Select Folder"**

### 3. Verify Installation

- Extension icon appears (🛡️) in toolbar
- Click icon → should show "🟢 Online"

## ✅ Test It

### Test 1: Website Link Detection
1. Visit any website
2. Links are automatically highlighted
3. Red = Dangerous
4. Orange = Suspicious
5. Green = Safe

### Test 2: Gmail Integration
1. Open Gmail
2. Open any email
3. Click **"🛡️ Analyze with QShield"** button
4. See threat analysis results

### Test 3: Use Popup
1. Click extension icon
2. Click **"🔍 Analyze Page"**
3. See detailed page analysis with all links

## 🎯 What Each Color Means

| Color | Meaning | Action |
|-------|---------|--------|
| 🔴 Red | PHISHING | Don't click, extension will block it |
| 🟠 Orange | SUSPICIOUS | Verify before clicking |
| 🟢 Green | SAFE | Safe to click |

## ⚙️ Configuration

### Change Server URL

If backend is running on different URL/port:

**File:** `popup.js` (lines 4-5)
```javascript
const BACKEND_URL = 'http://localhost:8000'; // Change this
```

Also update in:
- `content-script.js` (line 5)
- `gmail-integration.js` (line 5)
- `background.js` (line 3)

## 🆘 Troubleshooting

### "Server is Offline"
```bash
# Make sure backend is running:
cd "e:\squid game\qshield-ai\backend"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### No links highlighted
1. Refresh page
2. Wait 2-3 seconds
3. Links should appear colored

### Gmail button missing
1. Refresh Gmail: `Ctrl+R`
2. Open an email
3. Button should appear at top

### Extension not loading
1. Check path is: `e:\squid game\qshield-ai\chrome-extension`
2. Click reload icon next to extension
3. Verify all files exist

## 📊 Features Detected

When analyzing any link or email, the extension detects:

- ✅ Phishing attempts
- ✅ Credential harvesting
- ✅ Suspicious URLs
- ✅ Vishing (voice phishing)
- ✅ Business Email Compromise
- ✅ Malware links
- ✅ Spoofed domains
- ✅ Urgency manipulation

## 🎓 Example Test Links

Try analyzing these message types:

**High Risk:**
- "Verify your PayPal: paypa1.com/verify - Password required"
- "Confirm credentials now: amaz0n-verify.ru/login"

**Medium Risk:**
- "Update billing info: secure-bank-verify.net"
- "Click to confirm identity"

**Safe:**
- "Package delivered, track at amazon.com"
- "Your appointment is confirmed"

---

**All done!** 🎉 Your browser now has AI-powered phishing detection.
