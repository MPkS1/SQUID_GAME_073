# 🚀 QUICK START GUIDE - Notification Phishing Detection Monitor

## 📦 What Was Created

5 complete files in `e:\squid game\qshield-ai\notification-monitor\`:

```
notification-monitor/
├── notification_listener.py      ← Main system (450+ lines)
├── windows_listener.py           ← System integration (200+ lines)
├── dashboard.py                  ← Web interface (600+ lines)
├── quickstart.py                 ← Interactive menu (300+ lines)
├── requirements.txt              ← Dependencies
├── __init__.py                   ← Package setup
├── README.md                     ← Full documentation
├── IMPLEMENTATION_SUMMARY.md     ← Detailed guide
└── notifications.db              ← Database (auto-created)
```

---

## ⚡ Run in 30 Seconds

### **OPTION 1: Test Mode (See it Work)**
```powershell
cd e:\squid game\qshield-ai\notification-monitor
python notification_listener.py
```
✅ Tests 8 phishing emails automatically
✅ Shows risk scores for each
✅ Displays statistics dashboard
✅ Saves data to database

### **OPTION 2: Dashboard (Interactive)**
```powershell
cd e:\squid game\qshield-ai\notification-monitor
python dashboard.py
```
Then open: `http://localhost:5000`

✅ Beautiful web interface
✅ Real-time statistics
✅ Test notifications manually
✅ View detailed analysis
✅ Click notifications to explore

### **OPTION 3: Interactive Menu**
```powershell
cd e:\squid game\qshield-ai\notification-monitor
python quickstart.py
```
✅ Choose what you want to do
✅ Check system status
✅ View documentation
✅ Easy navigation

---

## 🎯 What Do I Do With It?

```
BEFORE YOU HAD:
├─ Backend (localhost:8000) → Manual email analysis
├─ Frontend (localhost:5174) → Paste email, get score
└─ Extension → Auto-analyze links while browsing

NOW YOU HAVE:
├─ ALL THE ABOVE +
├─ Notification Monitor → Auto-analyze system notifications
├─ Dashboard (localhost:5000) → See all analyzed notifications
└─ Database → History of every notification analyzed

RESULT:
✅ Every notification auto-checked for phishing
✅ Every link on web auto-checked (extension)
✅ Every suspicious email auto-analyzed (monitor)
✅ Everything visible in one place (dashboard)
```

---

## 📊 Visual Flow

```
WINDOWS NOTIFICATIONS
        ↓ (Captured)
  Notification Monitor
        ↓ (Analyzed)
  Backend API (16 features)
        ↓ (Scored 0-100)
  SQLite Database
        ↓ (Displayed)
  Web Dashboard
        ↓ (View/Click)
  Detailed Analysis
```

---

## 🧪 Test with Real Data

Once dashboard is running (`http://localhost:5000`):

**Paste these and click "Analyze":**

### HIGH RISK (Should be 85-95) 🔴
```
Your Amazon account has been suspended. Click immediately: amazon-verify-secure.net/login
```

### MEDIUM RISK (Should be 50-70) 🟠
```
Please update your profile information by clicking the link below
```

### SAFE (Should be 10-30) 🟢
```
You have a new meeting scheduled for 3pm tomorrow
```

---

## 🔍 Understanding the Dashboard

```
┌─ Statistics ─────────────────────────────────────┐
│ Total: 15 | 🔴 5 | 🟠 4 | 🟢 6 | Avg: 48.5/100 │
└──────────────────────────────────────────────────┘

┌─ Notification List ──────────────────────────────┐
│ 🔴 [Gmail] 92/100        ← Click to see full     │
│ Your Amazon account suspended!                  │ ← Hover to preview
│ ⏰ 2024-01-15 14:30:00                           │
│ 🏷️ credential_harvesting, urgent, suspicious_url│
│                                                  │
│ 🟠 [Teams] 54/100        ← Medium risk           │
│ New message from unknown sender                 │
│                                                  │
│ 🟢 [Windows] 18/100      ← Safe                  │
│ Your battery is low                             │
└──────────────────────────────────────────────────┘

[Click any notification]
        ↓
┌─ Detailed Analysis ──────────────────────────────┐
│ Source: Gmail                                   │
│ Risk: 92/100 - HIGH RISK                        │
│                                                  │
│ Detected Issues:                                │
│ • Credential harvesting (password requested)    │
│ • Anomalies (urgent language, time pressure)    │
│ • Attack pattern (account takeover framework)   │
│ • Suspicious URL (amazon-verify != amazon.com)  │
│                                                  │
│ Full text, flags, and analysis shown here      │
└──────────────────────────────────────────────────┘
```

---

## 📝 How It Works (Simple Version)

```
1. CAPTURE
   └─ Notification arrives (Gmail, Teams, SMS, Windows)

2. ANALYZE
   └─ Backend analyzes for phishing (16 features)
     └─ Applies threat multiplier for accuracy
     └─ Returns score 0-100

3. STORE
   └─ Results saved to database
     └─ All details preserved forever
     └─ Statistics updated

4. DISPLAY
   └─ Dashboard shows:
     ├─ Color-coded risk (RED/ORANGE/GREEN)
     ├─ Notification history
     ├─ What threats detected
     └─ Full analysis breakdown

5. LEARN
   └─ Track patterns over time
     └─ Identify threat trends
     └─ Build database of threats
```

---

## 🎓 Key Concepts

### **Risk Levels**
```
🟢 GREEN (0-39)     = Safe, allow
🟠 ORANGE (40-69)   = Suspicious, warn
🔴 RED (70-100)     = Phishing, block
```

### **16 Detection Features**
Your backend already analyzes:
- Credential harvesting
- Anomalies & strange patterns
- Attack patterns (BEC, account takeover, etc)
- URL analysis & domain verification
- Sender authentication
- Grammar & spelling
- Urgency indicators
- And 9 more...

### **What Monitor Does**
- ✅ Captures notifications automatically
- ✅ Sends to backend for analysis
- ✅ Gets risk score back
- ✅ Shows you the results
- ✅ Saves to database
- ✅ Displays in dashboard

---

## 🔧 Requirements

### **Already Installed?**
- Python 3.8+ ← Check with: `python --version`
- Backend running ← Should be on localhost:8000

### **Need to Install?**
```powershell
cd e:\squid game\qshield-ai\notification-monitor
pip install -r requirements.txt
```

This installs:
- Flask (web framework)
- aiohttp (async HTTP)
- requests (HTTP library)

---

## ❓ FAQ

**Q: Do I need the backend running?**
A: Yes, monitor uses backend for phishing detection. Start backend first:
```
cd backend && python main.py
```

**Q: Can I run multiple at once?**
A: Yes! Run in separate terminals:
- Terminal 1: `python backend/main.py` (port 8000)
- Terminal 2: `python dashboard.py` (port 5000)
- Terminal 3 (optional): Monitor notifications

**Q: Where do I see the results?**
A: Open `http://localhost:5000` in your browser

**Q: How much space does database take?**
A: Each notification = ~1KB. 10,000 notifications = ~10MB

**Q: Can I clear all data?**
A: Yes, delete `notifications.db` (or click "Clear Database" in dashboard)

**Q: Will it slow down my computer?**
A: No, runs in background. Only analyzes when notifications arrive.

---

## 📚 Where to Learn More

```
QUICK START:        → Read THIS file
DETAILED USAGE:     → README.md
TECHNICAL DETAILS:  → IMPLEMENTATION_SUMMARY.md
FULL API DOCS:      → http://localhost:8000/docs
CODE WALKTHROUGH:   → notification_listener.py (well-commented)
```

---

## 🎯 Typical Usage Workflow

### **Day 1: Setup**
```
1. cd notification-monitor
2. pip install -r requirements.txt
3. Make sure backend running
4. python notification_listener.py (test mode)
5. See results
```

### **Day 2: Explore**
```
1. python dashboard.py
2. Open http://localhost:5000
3. Test with sample notifications
4. Click around to understand UI
5. Review detailed analyses
```

### **Day 3: Integrate**
```
1. Set up to run on startup
2. Monitor real notifications
3. Check dashboard periodically
4. Review historical data
5. Identify threat patterns
```

### **Ongoing: Monitor**
```
1. Dashboard runs in background
2. Analyzes notifications automatically
3. You review high-risk items
4. Database grows with history
5. Spot trends and patterns
```

---

## ✨ Example: End-to-End

**You receive Gmail notification:**
```
"Your PayPal account has been locked. Verify your details: paypal-confirm.net"
```

**What happens automatically:**

```
notification_listener.py captures:
  Source: Gmail
  Text: [Full notification text]

PhishingAnalyzer sends to backend:
  POST http://localhost:8000/analyze
  Payload: {message, message_type, url}

Backend analyzes (16 features):
  ✓ Credential harvesting: requests account info
  ✓ Anomalies: urgent tone, false URL
  ✓ Attack pattern: credential theft framework
  ✓ URL: paypal-confirm.net ≠ paypal.com (fake!)
  ... (12 more features)

Backend returns:
  final_risk_score: 91
  risk_level: HIGH_RISK
  explanation: "Multiple phishing indicators detected..."

Monitor stores in database:
  notification: source=Gmail, text=..., risk_score=91
  analysis: flags=..., details=...

Dashboard shows:
  🔴 [Gmail] 91/100
  Your PayPal account has been locked...
  Flags: credential_harvesting, suspicious_url, urgent

You can:
  - See it's high risk (🔴)
  - Click to see why
  - View all detected threats
  - Check history of similar attacks
```

---

## 🚀 Start Now!

```powershell
# 1. Open PowerShell
# 2. Navigate to monitor folder
cd e:\squid game\qshield-ai\notification-monitor

# 3. Run one of these:

# Quick test
python notification_listener.py

# OR Interactive dashboard
python dashboard.py
# Then open: http://localhost:5000

# OR Menu system
python quickstart.py
```

**That's it! Your notification phishing detector is ready to use!** 🎉

---

## 📞 Quick Commands Reference

```bash
# Install dependencies
pip install -r requirements.txt

# Test mode (8 sample notifications)
python notification_listener.py

# Start web dashboard
python dashboard.py

# Interactive menu
python quickstart.py

# Check backend health
curl http://localhost:8000/health

# View statistics
curl http://localhost:5000/api/stats

# See recent notifications
curl http://localhost:5000/api/notifications

# Test a notification
curl -X POST http://localhost:5000/api/test-notification \
  -H "Content-Type: application/json" \
  -d "{\"source\":\"Gmail\",\"text\":\"Test\"}"
```

---

**🎉 Successfully Created: Real-Time Notification Phishing Detection System**

**All files ready in:** `e:\squid game\qshield-ai\notification-monitor\`

**Next Step:** Run `python notification_listener.py` to see it in action!
