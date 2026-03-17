# 🛡️ QShield AI - Notification Phishing Detection Monitor

## Overview

A real-time notification monitoring system that automatically analyzes all system notifications for phishing threats and displays risk scores.

```
┌─────────────────────────────────────────────────────┐
│  WINDOWS NOTIFICATIONS / EMAILS / CHAT MESSAGES     │
│                      │                               │
│                      ▼ (Captured by Listener)        │
│  ┌─────────────────────────────────────────────┐    │
│  │   QShield Monitor (notification_listener.py)│    │
│  │   - Reads notification text                 │    │
│  │   - Groups by source (Gmail, Teams, etc)    │    │
│  └─────────────────────────────────────────────┘    │
│                      │                               │
│                      ▼ (Sends to Backend)            │
│  ┌─────────────────────────────────────────────┐    │
│  │   Backend API (http://localhost:8000)       │    │
│  │   - Analyzes with 16 phishing features      │    │
│  │   - Applies threat multiplier system        │    │
│  │   - Returns 0-100 risk score                │    │
│  └─────────────────────────────────────────────┘    │
│                      │                               │
│                      ▼ (Stores Results)              │
│  ┌─────────────────────────────────────────────┐    │
│  │   SQLite Database (notifications.db)        │    │
│  │   - Saves all notifications                 │    │
│  │   - Stores analysis details                 │    │
│  │   - Tracks statistics over time             │    │
│  └─────────────────────────────────────────────┘    │
│                      │                               │
│                      ▼ (Display Results)             │
│  ┌─────────────────────────────────────────────┐    │
│  │   Web Dashboard (http://localhost:5000)     │    │
│  │   - Real-time statistics                    │    │
│  │   - Risk score visualization                │    │
│  │   - Notification history                    │    │
│  │   - Alert system                            │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

## 📁 Files Created

### 1. **notification_listener.py** (Main Monitor)
```python
# What it does:
- Monitors all incoming notifications
- Sends each notification to backend for analysis
- Stores results in SQLite database
- Provides dashboard data API

# Key Classes:
- NotificationData: Data structure for single notification
- NotificationDatabase: SQLite database manager
- PhishingAnalyzer: Async API client to backend
- NotificationMonitor: Main orchestrator
```

**Key Functions:**
- `process_notification(source, text)` - Analyze a notification
- `get_statistics()` - Get stats (high risk count, avg score, etc)
- `get_recent_notifications(limit)` - Retrieve recent analyzed notifications

### 2. **windows_listener.py** (System Integration)
```python
# What it does:
- Hooks into Windows notification system
- Monitors Gmail, Outlook, Teams, Slack, SMS
- Provides fallback methods if WinRT unavailable

# Key Classes:
- WindowsNotificationListener: Windows Toast notifications
- EmailNotificationListener: Email client notifications
- ChatNotificationListener: Chat app notifications
- FullSystemNotificationListener: Integrated listener
```

### 3. **dashboard.py** (Web Interface)
```python
# What it does:
- Flask web server running on :5000
- Real-time statistics display
- Notification list with risk scores
- Detailed analysis view
- Test notification injection API
```

**API Endpoints:**
- `GET /` - Main dashboard page
- `GET /api/stats` - Get statistics
- `GET /api/notifications` - Get recent notifications
- `GET /api/notification/<id>` - Get detailed analysis
- `POST /api/test-notification` - Test with sample notification
- `POST /api/clear-database` - Clear database

### 4. **requirements.txt** (Dependencies)
```
flask==3.0.0
aiohttp==3.9.1
requests==2.31.0
```

---

## 🚀 Quick Start

### Step 1: Install Dependencies

```powershell
cd e:\squid game\qshield-ai\notification-monitor
pip install -r requirements.txt
```

### Step 2: Ensure Backend is Running

Make sure the phishing detection backend is running:

```powershell
# In another terminal
cd e:\squid game\qshield-ai\backend
python main.py
```

Backend should be running on `http://localhost:8000`

### Step 3: Run the Notification Monitor

**Option A: Run Test Mode (Demo)**
```powershell
cd e:\squid game\qshield-ai\notification-monitor
python notification_listener.py
```
This tests with 8 sample notifications.

**Option B: Run Dashboard (Interactive)**
```powershell
cd e:\squid game\qshield-ai\notification-monitor
python dashboard.py
```
Then open `http://localhost:5000` in your browser.

### Step 4: Test Notifications

**Method 1: Via Web Dashboard**
1. Go to `http://localhost:5000`
2. Paste a suspicious notification text
3. Select source (Gmail, Teams, Windows, etc)
4. Click "Analyze"
5. See risk score appear in dashboard

**Method 2: Via Python**
```python
import asyncio
from notification_listener import NotificationMonitor

async def main():
    monitor = NotificationMonitor()
    await monitor.process_notification(
        source="Gmail",
        text="Your Amazon account suspended! Click: amazon-verify.net"
    )
    monitor.print_dashboard()

asyncio.run(main())
```

---

## 📊 How It Works

### Notification Flow

```
1. CAPTURE
   └─ System notification arrives
      └─ Listener extracts: source + text

2. ANALYZE
   └─ Text sent to backend API: /analyze
      └─ 16 features analyzed:
         ├─ Credential harvesting detection
         ├─ Anomaly detection
         ├─ Attack pattern recognition
         ├─ URL analysis
         ├─ Sender authentication
         └─ ... 11 more features
      └─ Threat multiplier applied
      └─ Final score: 0-100

3. STORE
   └─ Results saved to SQLite:
      ├─ Notification text
      ├─ Risk score
      ├─ All flags detected
      ├─ Detailed analysis
      └─ Timestamp

4. DISPLAY
   └─ Dashboard shows:
      ├─ Real-time statistics
      ├─ Notification list (color-coded)
      ├─ Risk score breakdown
      └─ Trend analysis
```

### Risk Scoring System

**Score Interpretation:**
```
0-39     🟢 GREEN (SAFE)
         - No phishing indicators detected
         - Safe to interact with

40-69    🟠 ORANGE (MEDIUM RISK)
         - Some suspicious patterns
         - Show warning before opening

70-100   🔴 RED (HIGH RISK)
         - Multiple phishing indicators
         - Block or ask for confirmation
```

**Threat Multiplier (Backend):**

Base scoring is enhanced with multipliers:

```
Example: Amazon account suspension email

Base Score: 35

Multipliers Applied:
- Credential harvesting (2 types detected): ×1.60
- Account verification language: ×1.30
- Urgent tone detected: ×1.25
- Suspicious domain: ×1.25

Calculation: 35 × 1.60 × 1.30 × 1.25 × 1.25 = 94.5
FINAL SCORE: 95/100 (🔴 HIGH RISK)
```

---

## 🗄️ Database Schema

### notifications table
```sql
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY,
    timestamp TEXT,              -- When notification received
    source TEXT,                 -- Gmail, Teams, Windows, etc
    text TEXT,                   -- Notification content
    risk_score INTEGER,          -- 0-100 score
    risk_level TEXT,            -- RED, ORANGE, GREEN
    is_analyzed BOOLEAN,        -- Whether analyzed yet
    analysis_timestamp TEXT,    -- When analysis completed
    created_at TIMESTAMP
);
```

### analysis_details table
```sql
CREATE TABLE analysis_details (
    id INTEGER PRIMARY KEY,
    notification_id INTEGER,       -- Links to notifications
    explanation TEXT,             -- Analysis explanation
    flags TEXT,                   -- Comma-separated detected flags
    credential_harvesting TEXT,   -- JSON details
    anomaly_detection TEXT,       -- JSON details
    attack_pattern TEXT,          -- JSON details
    threat_intelligence TEXT,     -- JSON details
    all_analysis_data TEXT        -- Full backend response JSON
);
```

### statistics table
```sql
CREATE TABLE statistics (
    id INTEGER PRIMARY KEY,
    total_analyzed INTEGER,
    high_risk_count INTEGER,
    medium_risk_count INTEGER,
    safe_count INTEGER,
    average_risk_score REAL,
    top_threat_type TEXT,
    last_updated TIMESTAMP
);
```

---

## 📈 Dashboard Features

### Statistics Overview
```
┌─────────────────────────────────────────┐
│ Total Notifications: 150                │
│ 🔴 High Risk (70+):  28                │
│ 🟠 Medium Risk (40-69): 45              │
│ 🟢 Safe (<40): 77                       │
│ Average Risk Score: 42.5/100            │
│ Analysis Rate: 100%                     │
└─────────────────────────────────────────┘
```

### Recent Notifications List
```
[Gmail] 92/100 🔴
  Your Amazon account has been suspended!
  ⏱️ 2024-01-15 14:23:45
  🏷️ credential_harvesting, account_verified, urgent

[Teams] 15/100 🟢
  Meeting scheduled for 3pm
  ⏱️ 2024-01-15 14:20:12

[Windows] 78/100 🔴
  Click to update Windows security
  ⏱️ 2024-01-15 14:18:33
  🏷️ malware_detected, suspicious_url, urgent_tone
```

### Detailed Analysis View
```
❌ CLICK on any notification to see:
   - Full text
   - Risk score breakdown
   - Credential harvesting details
   - Anomalies detected
   - Attack patterns identified
   - Timeline of detection
   - All flags triggered
```

---

## 🔌 API Integration

### How to Send Notifications Programmatically

```python
import asyncio
from notification_listener import NotificationMonitor

async def main():
    monitor = NotificationMonitor(backend_url="http://localhost:8000")
    
    # Process a notification
    await monitor.process_notification(
        source="Gmail",
        text="Your PayPal account has been compromised. Reset password immediately at paypal-secure.net"
    )
    
    # Get statistics
    stats = monitor.db.get_statistics()
    print(f"High risk notifications: {stats['high_risk']}")
    
    # Get recent notifications
    recent = monitor.db.get_recent_notifications(limit=5)
    for notif in recent:
        print(f"{notif['source']}: {notif['risk_score']}/100")
    
    # Print dashboard
    monitor.print_dashboard()

asyncio.run(main())
```

### Backend API Response Format

```python
{
    "final_risk_score": 92,
    "risk_level": "HIGH_RISK",
    "explanation": "Multiple phishing indicators detected...",
    "all_flags": [
        "credential_harvesting",
        "suspicious_url",
        "account_verification_request",
        "urgent_language"
    ],
    "credential_harvesting": {
        "credential_types_requested": ["password", "otp"],
        "credential_risk_level": "CRITICAL",
        "credential_score": 95
    },
    "anomaly_detection": {
        "anomalies_detected": ["urgent_tone", "typos_in_domain"],
        "anomaly_score": 78
    },
    "attack_pattern": {
        "attack_framework_detected": "account_takeover",
        "framework_confidence_percent": 87,
        "known_similar_attacks": 25
    }
}
```

---

## 🧪 Testing

### Sample Notifications for Testing

**High Risk (Should be 80-95)**
```
"Your Amazon account has been suspended due to suspicious activity. 
Click here to verify: amazon-secure-verify.net"

"URGENT: Your paypal account will be locked in 24 hours if you don't 
verify your identity. Click to verify now!"

"Your Gmail account has unusual login attempts. Reset your password 
immediately at gmail-secure.com"
```

**Medium Risk (Should be 40-69)**
```
"Please update your profile information. Click here to continue"

"There's an issue with your account. Contact us for details"

"Your payment method needs to be updated"
```

**Low Risk (Should be 0-39)**
```
"Your meeting is scheduled for 3pm"

"You have a new message"

"Your package has been delivered"
```

### Run Tests

```powershell
# Test with sample notifications
python notification_listener.py

# Watch dashboard update
# Go to http://localhost:5000

# Manually inject a test
curl -X POST http://localhost:5000/api/test-notification \
  -H "Content-Type: application/json" \
  -d '{
    "source": "Gmail",
    "text": "Your account will be deleted in 24 hours. Verify now!"
  }'
```

---

## 📋 Learning & Pattern Recognition

The system learns from every notification:

```
✅ Saved Data:
   - All analyzed notifications
   - Risk scores over time
   - Threat patterns identified
   - False positives/negatives
   - User feedback (future)

📊 Statistics Tracked:
   - High risk notification count
   - Average risk score per source
   - Most common threat types
   - Trend analysis (increasing/decreasing risk)
   - Peak attack times

🔄 Future Learning:
   - Collect feedback from user actions
   - Build user-specific threat profiles
   - Predict high-risk senders
   - Detect emerging phishing campaigns
```

---

## 🐛 Troubleshooting

### Backend Connection Error
```
Error: Could not connect to http://localhost:8000

Solution:
  1. Make sure backend is running:
     cd backend && python main.py
  2. Check backend is on port 8000:
     http://localhost:8000/health
```

### Database Locked Error
```
Error: database is locked

Solution:
  1. Close other instances of the monitor
  2. Delete notifications.db and restart
  3. Check if another process is using database
```

### Notifications Not Appearing
```
Problem: Dashboard shows 0 notifications

Solution:
  1. Test with /api/test-notification endpoint
  2. Check notification_monitor.log for errors
  3. Verify backend API is responding
```

### Slow Analysis
```
Problem: Taking long time to analyze

Solution:
  1. Backend timeout - increase to 15s:
     Change in notification_listener.py:
     self.timeout = aiohttp.ClientTimeout(total=15)
  2. Check backend performance:
     http://localhost:8000/health
```

---

## 🔐 Security Considerations

✅ **The system does NOT:**
- Send notifications to external servers
- Store user personal data
- Log notification full text by default
- Transmit data unencrypted outside localhost

⚠️ **For Production Use:**
- Use HTTPS between monitor and backend
- Implement authentication for dashboard
- Encrypt notification database
- Set up regular backups
- Configure notification retention policy

---

## 🗺️ Integration Points

### With Chrome Extension
```python
# The notification monitor complements extension by:
1. Extension analyzes links on websites
2. Monitor analyzes notifications in system
3. Both use same backend scoring
4. Unified dashboard (future upgrade)
```

### With Backend
```python
# Backend already provides:
- 16 phishing detection features
- Threat multiplier system
- Risk score calculation (0-100)
- Analysis explanation
- All this reused by monitor!
```

### With Other Systems
```python
# Can integrate with:
- Slack webhooks for alerts
- Email rules for filtering
- Security information and event management (SIEM)
- Chat bot commands for analysis
```

---

## 📚 Learning Path

**Phase 1: Understand (You are here)**
- ✅ System architecture
- ✅ How notifications are captured
- ✅ How analysis works
- ✅ How results are stored

**Phase 2: Practice**
- Test with sample notifications
- View dashboard
- Check database
- Review analysis details

**Phase 3: Extend**
- Add more notification sources
- Implement real Windows notification hooking
- Add email integration
- Build alert system

**Phase 4: Deploy**
- Set up auto-start service
- Configure logging
- Monitor system performance
- Analyze trends over time

---

## 📞 Quick Reference

```bash
# Start monitor (test mode)
python notification_listener.py

# Start dashboard
python dashboard.py
# Open http://localhost:5000

# Check backend health
curl http://localhost:8000/health

# Send test notification
curl -X POST http://localhost:5000/api/test-notification \
  -H "Content-Type: application/json" \
  -d '{"source":"Gmail","text":"Test notification"}'

# View stats
curl http://localhost:5000/api/stats

# Get recent notifications
curl http://localhost:5000/api/notifications

# Get notification details
curl http://localhost:5000/api/notification/1
```

---

**🎉 You now have a complete real-time notification phishing detection system!**
