# QShield AI Chrome Extension - Visual Installation Guide

## Step-by-Step Visual Instructions

### STEP 1: Start Backend Server

#### 1.1 Open PowerShell/Terminal
```
Windows Key → Type "PowerShell" → Click "Windows PowerShell"
```

#### 1.2 Navigate to Backend
```bash
cd "e:\squid game\qshield-ai\backend"
```

#### 1.3 Start Server
```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### 1.4 Check Output
```
✅ EXPECTED OUTPUT:
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
🛡️  QShield AI Backend starting on 0.0.0.0:8000
```

❌ If you see errors, check:
- Python installed: `python --version` (should be 3.10+)
- Dependencies: `pip list | findstr fastapi` (should show fastapi)
- Port 8000 free: No other app using port 8000

---

### STEP 2: Open Chrome Extensions

#### 2.1 Open Chrome Browser
Click the Chrome icon on desktop or taskbar

#### 2.2 Navigate to Extensions
```
Method A: Type in address bar
chrome://extensions/

Method B: Chrome Menu → More tools → Extensions
```

#### 2.3 You Should See
```
┌─────────────────────────────────────────┐
│ Extensions                              │
├─────────────────────────────────────────┤
│                                         │
│ [Search extensions] [Developer mode]   │
│                  ↑ (toggle in top right)│
│                                         │
└─────────────────────────────────────────┘
```

---

### STEP 3: Enable Developer Mode

#### 3.1 Find Toggle in Top-Right
```
┌──────────────────────────────────────────┐
│        Extensions (Page Title)           │
│                                          │
│            Developer mode (TOGGLE)      │
│                   ↑ Click here           │
├──────────────────────────────────────────┤
```

#### 3.2 Click Toggle
- Should turn BLUE when enabled
- New buttons appear: "Load unpacked", "Pack extension"

#### 3.3 Verify
```
After clicking:
┌──────────────────────────────────────────┐
│ □ Developer mode (toggle BLUE/ON)       │
│ [Load unpacked] [Pack extension]        │
└──────────────────────────────────────────┘
```

---

### STEP 4: Load Extension

#### 4.1 Click "Load unpacked" Button
```
Button location: Top left, next to search bar
After clicking: File browser opens
```

#### 4.2 Navigate to Folder
```
Path: e:\squid game\qshield-ai\chrome-extension

Required files visible:
✓ manifest.json
✓ popup.html
✓ content-script.js
✓ gmail-integration.js
✓ background.js
✓ popup.js, popup.css
✓ icons/ (folder)
✓ README.md
```

#### 4.3 Select and Click "Select Folder" Button
```
┌─────────────────────────────────────────────┐
│ Select the folder                           │
│                                             │
│ chrome-extension/                           │
│ ├── manifest.json ✓                        │
│ ├── popup.html ✓                           │
│ └── (other files)                          │
│                                             │
│ [Cancel]  [Select Folder] ←←← CLICK HERE  │
└─────────────────────────────────────────────┘
```

#### 4.4 Extension Loads
```
WHAT YOU'LL SEE:
┌───────────────────────────────────────────┐
│ QShield AI - Phishing Detector    v1.0.0  │
│ by QShield                                │
├───────────────────────────────────────────┤
│ Enabled [🔵 Toggle] | [Details] [Delete] │
│                                           │
│ 🛡️ Icon appears in Chrome toolbar       │
│                                           │
│ Details section shows:                    │
│ ✓ Permissions: activeTab, scripting...   │
│ ✓ Host permissions: localhost:8000...    │
│ ✓ Manifest file: manifest.json           │
└───────────────────────────────────────────┘
```

---

### STEP 5: Verify Connection

#### 5.1 Click Extension Icon
```
Location: Top-right of Chrome
Icon: 🛡️

Look for small 🛡️ icon next to search bar
Click it → Popup window opens
```

#### 5.2 Check Server Status
```
POPUP WINDOW:

┌──────────────────────────────────────────┐
│       🛡️ QShield AI                      │
│  Advanced Phishing Detection              │
├──────────────────────────────────────────┤
│                                          │
│ Status: Connecting to server...          │
│ (Loading animation)                      │
│                                          │
├──────────────────────────────────────────┤
│ [🔍 Analyze Page]                        │
│ [⚙️ Settings]                            │
├──────────────────────────────────────────┤
│ Server: 🟢 Online                        │
│                                          │
│ Gmail Integration: ❌ Not on Gmail       │
└──────────────────────────────────────────┘
```

✅ **SUCCESS INDICATORS:**
- Server shows: 🟢 Online (green dot)
- No error messages
- Buttons are clickable

❌ **PROBLEM INDICATORS:**
- Server shows: 🔴 Offline (red dot)
- See error message
- Buttons disabled

---

### STEP 6: Test Website Link Detection

#### 6.1 Visit a Website
```
Go to: https://www.amazon.com
(or any other website)

Wait 2-3 seconds for scanning
```

#### 6.2 Look for Link Highlighting
```
VISUAL INDICATORS:

Safe links:
┌─────────────────────────┐
│ Account (green border)  │
└─────────────────────────┘

Suspicious links:
┌─────────────────────────┐
│ Click here (orange)     │
│ ⚠️ SUSPICIOUS           │
└─────────────────────────┘

Phishing links:
┌─────────────────────────┐
│ Verify now (red)        │
│ 🚨 PHISHING LINK        │
└─────────────────────────┘
```

#### 6.3 Hover Over Links
```
Move mouse over highlighted link
↓
Tooltip appears with:
• Risk assessment
• Risk score (0-100)
• Threat level (HIGH/MEDIUM/LOW)
```

#### 6.4 Try Clicking Red Link
```
If link is red (high-risk):
- Click the link
- See blocking warning dialog:

┌──────────────────────────────┐
│ 🚨 PHISHING LINK DETECTED    │
│                              │
│ This link has been flagged   │
│ as a potential phishing      │
│ attempt.                     │
│                              │
│ URL: https://...             │
│ Risk Score: 85/100           │
│                              │
│ Do not click or provide      │
│ personal information.        │
│                              │
│ [Go Back] [Report Phishing]  │
└──────────────────────────────┘

- Extension prevents navigation
- Click "Go Back" to dismiss
```

---

### STEP 7: Test Gmail Integration

#### 7.1 Open Gmail
```
Navigate to: https://mail.google.com
Log in if needed
```

#### 7.2 Open an Email
```
Click on any email from your inbox
Email opens in main view
```

#### 7.3 Look for Analysis Button
```
NEAR EMAIL SUBJECT/TOOLBAR:

Button appears:
┌────────────────────────────────┐
│ 🛡️ Analyze with QShield       │
│ (Purple button)                │
└────────────────────────────────┘
```

#### 7.4 Click Button
```
Button becomes:
┌────────────────────────────────┐
│ ⏳ Analyzing...                │
│ (with spinning load animation) │
└────────────────────────────────┘

Wait 2-3 seconds...
```

#### 7.5 See Results
```
ANALYSIS PANEL APPEARS:

┌──────────────────────────────────────┐
│ 🛡️ QShield AI Email Analysis        │
├──────────────────────────────────────┤
│ Risk Score:        75/100 (HIGH)      │
│ Detected Threats:  3 indicators       │
│                                       │
│ Flags:                                │
│ 🚨 Phishing attempt                  │
│ 🚨 Credential harvesting detected    │
│ 🚨 Urgency manipulation              │
│                                       │
│ Credential Risk:  CRITICAL            │
│ Vishing Detected: YES                 │
│                                       │
│ [🚨 Mark as Phishing] [🚫 Filter]   │
└──────────────────────────────────────┘
```

---

### STEP 8: Test Popup Analysis

#### 8.1 Click Extension Icon Again
```
Click 🛡️ in top-right
Popup opens
```

#### 8.2 Click "Analyze Page" Button
```
POPUP:
┌──────────────────────────────────┐
│ 🛡️ QShield AI                   │
├──────────────────────────────────┤
│ Status: Analyzing this page...   │
│ (Loading animation)              │
│                                  │
│ [🔍 Analyze Page]  (Clicked!)   │
│ [⚙️ Settings]                    │
│                                  │
│ Server: 🟢 Online                │
└──────────────────────────────────┘

Wait 2-3 seconds...
```

#### 8.3 See Analysis Results
```
RESULTS DISPLAYED:

┌──────────────────────────────────┐
│ 🛡️ QShield AI                   │
├──────────────────────────────────┤
│ 🔍 Page Analysis                │
│ Risk Score: 32/100 (MEDIUM)      │
│ Links analyzed: 47               │
│ Threats found: 2                 │
│                                  │
│ 📊 Link Details                 │
│ 🔗 amazon.com        ✅ Safe    │
│ 🔗 suspicious.ru     ⚠️ Medium  │
│ 🔗 phish-site.com    🚨 HIGH    │
│ ... (more links)                 │
│                                  │
│ ⚠️ Warnings                      │
│ "Multiple threat indicators"    │
│                                  │
│ [📄 Full Report] [⚙️ Settings]  │
├──────────────────────────────────┤
│ Server: 🟢 Online                │
└──────────────────────────────────┘
```

---

## Configuration Changes

### If Backend on Different Port

#### Find These Files:
```
├── popup.js          ← Edit line 4
├── content-script.js ← Edit line 5
├── gmail-integration.js ← Edit line 5
└── background.js     ← Edit line 3
```

#### Before (Line 4-5):
```javascript
const BACKEND_URL = 'http://localhost:8000';  // OLD
const API_ENDPOINT = `${BACKEND_URL}/analyze`;
```

#### After (e.g., port 9000):
```javascript
const BACKEND_URL = 'http://localhost:9000';  // NEW PORT
const API_ENDPOINT = `${BACKEND_URL}/analyze`;
```

#### Reload Extension:
```
1. Go to chrome://extensions/
2. Find "QShield AI"
3. Click reload icon (↻)
4. Test again
```

---

## Error Scenarios & Solutions

### Scenario 1: Server Shows Offline

```
SYMPTOM:
Server: 🔴 Offline

FIX:
1. Make sure backend is running:
   Terminal should show: "Application startup complete"

2. Check terminal hasn't closed:
   Ctrl+C will stop it

3. Restart server:
   python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

4. Give it 5 seconds to start

5. Close and reopen popup:
   Click extension icon again
```

### Scenario 2: No Links Highlighted

```
SYMPTOM:
Visit website but links appear normal (not colored)

FIX:
1. Wait 2-3 seconds on fresh page

2. Refresh page:
   Ctrl+R

3. Open popup and click "Analyze Page":
   If results show, highlighting is working

4. Reload extension:
   chrome://extensions/ → Find QShield → Click reload

5. Check browser console (F12):
   Look for red error messages
```

### Scenario 3: Gmail Button Missing

```
SYMPTOM:
Open Gmail and email, no "Analyze with QShield" button

FIX:
1. Hard refresh Gmail:
   Ctrl+Shift+R (this is important!)
   Wait 5 seconds

2. Open an email

3. If still missing, reload extension:
   chrome://extensions/ → Find QShield → Click reload
   Go back to Gmail and refresh browser

4. Check if using alternative Gmail:
   Some users have "Simple HTML" version
   Try switching to Standard Gmail
```

### Scenario 4: Extension Won't Load

```
SYMPTOM:
"Load unpacked" gives error or extension doesn't appear

FIX:
1. Check folder path is EXACTLY:
   e:\squid game\qshield-ai\chrome-extension
   NOT the parent folder

2. Verify all files exist in folder:
   manifest.json ✓
   popup.html ✓
   content-script.js ✓
   gmail-integration.js ✓
   background.js ✓

3. Open manifest.json in text editor:
   First line should be: { "manifest_version": 3,
   Check for syntax errors (extra commas, missing brackets)

4. Try again:
   Clear search boxes in Extensions page
   Click "Load unpacked" and reselect folder
```

---

## Testing Checklist

Use this checklist to verify everything works:

```
BACKEND:
□ Terminal shows "Application startup complete"
□ Can visit http://localhost:8000/health in browser
□ Returns JSON with "status": "online"

EXTENSION INSTALLATION:
□ Extension appears in chrome://extensions/
□ Icon (🛡️) appears in toolbar
□ No errors in extension details page

POPUP FUNCTIONALITY:
□ Click icon → Popup opens
□ Shows "Server: 🟢 Online"
□ Click "Analyze Page" → Results appear

WEBSITE LINK DETECTION:
□ Visit any website
□ Wait 2-3 seconds
□ Some links should be colored (red/orange/green)
□ Hover over link → Tooltip appears with risk score
□ Click red link → Blocking warning appears

GMAIL INTEGRATION:
□ Open Gmail and read any email
□ "Analyze with QShield" button appears
□ Click button → Results panel appears
□ Results show risk score and threats

ALL FEATURES WORKING:
□ High-risk links are red with dashed borders
□ Medium-risk links are orange
□ Safe links are green
□ Tooltips show on hover
□ Gmail analysis completes in <5 seconds
□ No error messages in browser console (F12)
```

---

## Success! 🎉

When all checklist items are checked, your extension is fully operational and providing:

✅ Real-time phishing detection on any website
✅ One-click Gmail email analysis
✅ Risk scoring and threat flagging
✅ Automatic link blocking and warnings
✅ AI-powered threat detection

**You're protected!** 🛡️

---

**Version:** 1.0.0  
**Last Updated:** March 17, 2026
