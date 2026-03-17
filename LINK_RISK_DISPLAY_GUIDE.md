# 🛡️ Chrome Extension - Link Risk Level Display Guide

## ✨ New Features

Your Chrome extension now displays **risk levels for every link** in THREE ways:

### **1. 🏷️ Risk Badges on Links**
Every link now shows a badge with the **risk score (0-100)**:
- **RED badge** = High Risk (70-100) 🔴
- **ORANGE badge** = Medium Risk (40-69) 🟠  
- **GREEN badge** = Safe (0-39) 🟢

**Visual Example:**
```
Click here → [95/100]     (Red - PHISHING)
Learn more → [45/100]     (Orange - SUSPICIOUS)  
Homepage  → [12/100]      (Green - SAFE)
```

---

### **2. 📋 Floating Link Panel**
A floating panel appears in the **bottom-right corner** showing:
- List of all links on the page
- Risk score for each link
- Risk category (High/Medium/Safe)
- Link URL preview

**Features:**
- ✅ Draggable - Move it anywhere on screen
- ✅ Click any link to scroll and highlight it
- ✅ Close button (✕) to hide the panel
- ✅ Updates in real-time as you browse

**Panel Layout:**
```
┌─────────────────────────────────────┐
│ 🛡️ QShield - Page Links        ✕   │
├─────────────────────────────────────┤
│ 🚨 Phishing Link 1                  │
│ suspicious-login.com    95/100  RED │
│                                     │
│ ⚠️ Medium Risk Link                 │
│ example.com/ads         48/100 ORNG │
│                                     │
│ ✅ Google                           │
│ google.com              18/100 GRN  │
└─────────────────────────────────────┘
```

---

### **3. 🎨 Visual Link Highlighting**
All links on the page are color-coded:

| Color | Style | Meaning |
|-------|-------|---------|
| 🔴 RED | Red border + light red bg | High Risk (70+) |
| 🟠 ORANGE | Orange border + light orange bg | Medium Risk (40-69) |
| 🟢 GREEN | Green underline | Safe (<40) |

---

## 🔧 How It Works

### **When You Open a Page:**
1. ✅ Extension scans ALL links
2. ✅ Sends each link to backend for analysis
3. ✅ Displays risk score on each link
4. ✅ Shows floating panel with summary
5. ✅ Highlights links by color

### **When You Hover Over a Link:**
- 💬 Tooltip appears showing:
  - Risk level (HIGH/MEDIUM/SAFE)
  - Exact risk score (0-100)
  - Warning message if high-risk

### **When You Click a High-Risk Link (70+):**
- 🛑 Modal warning appears blocking navigation
- Options:
  - ❌ "Go Back" - Safe option
  - 🚨 "Report to QShield" - Send to our database

### **Dynamic Links:**
- 📍 New links added to page are automatically scanned
- Real-time analysis in the floating panel

---

## 📊 Risk Score Interpretation

```
0-20:   🟢 Very Safe        - Regular websites, known brands
20-40:  🟢 Safe             - Low phishing indicators  
40-60:  🟠 Medium Risk      - Some suspicious patterns
60-70:  🟠 High Risk        - Multiple phishing indicators
70-100: 🔴 Very High Risk   - Likely phishing attempt
```

---

## 🎯 What Gets Flagged as High Risk?

The extension detects:

✅ **Link Indicators**
- New domain (<30 days old)
- Domain doesn't match link text
- Unusual TLD patterns
- Shortened URLs (bit.ly, etc.)

✅ **Page Context**
- Time pressure language ("within 24 hours")
- Account threats ("suspended", "locked")
- Generic greetings ("Dear Customer")
- Multiple suspicious CTAs

✅ **Attack Patterns**
- Pretexting attacks (fake verification)
- Account takeover attempts
- BEC (Business Email Compromise)
- Credential harvesting

---

## 🖱️ Interactive Features

### **Link Panel - Dragging**
Grab the header "🛡️ QShield - Page Links" and drag the panel anywhere

### **Link Panel - Click Links**
Click any link in the panel to:
- Scroll page to that link
- Highlight it with a blue glow for 2 seconds
- Perfect for quick reference

### **Hover Tooltips**
Hover over any link to see:
- Detailed risk assessment
- Exact score and level
- Specific warning message

---

## 📱 Example Scenarios

### **Scenario 1: Phishing Email**
```
Email text: "Verify your Amazon account immediately"
Link: "secure-amazon-verify.xyz"

Extension shows:
- 🔴 RED badge: 92/100
- Tooltip: "🚨 PHISHING LINK - DO NOT CLICK"
- Panel: Shows as "High Risk" with red color
- Click prevention: Modal warning appears
```

### **Scenario 2: Legitimate Website**  
```
Email text: "Read our blog post"
Link: "blog.example.com/article"

Extension shows:
- 🟢 GREEN badge: 18/100
- Tooltip: "✅ Safe"
- Panel: Shows as "Safe" with green color
- Click allowed: No warnings
```

### **Scenario 3: Suspicious External Link**
```
Website text: "Click to claim prize!"
Link: "prize-claim.xyz?id=12345"

Extension shows:
- 🟠 ORANGE badge: 52/100
- Tooltip: "⚠️ SUSPICIOUS - VERIFY BEFORE CLICKING"
- Panel: Shows as "Medium Risk" with orange color
- Click allowed: Can proceed but with warning
```

---

## 🔌 Technical Details

### **What Data Shows:**
- Link URL
- Risk Score (0-100)
- Risk Level (HIGH/MEDIUM/SAFE)
- Risk Factors detected
- Confidence percentage

### **What Gets Analyzed:**
1. **URL Analysis** - Domain age, SSL, reputation
2. **Page Context** - Message content, urgency, threats
3. **Attack Patterns** - Known phishing frameworks
4. **Credential Harvesting** - Password/OTP requests
5. **Industry Profile** - Banking, healthcare, corporate, etc.

### **Cache System:**
- Links are analyzed once and cached
- Same link = instant display on other pages
- Reduces API calls and improves performance

---

## ✅ Testing the Feature

### **Test Case 1: High-Risk Page**
1. Create email: "Your account is suspended! Verify here"
2. Add link: suspicious-domain.xyz
3. Extension should show: 🔴 85-95/100
4. Status: BLOCKED (click prevention)

### **Test Case 2: Safe Page**
1. Regular company website
2. Normal links to legitimate domains  
3. Extension should show: 🟢 10-25/100
4. Status: ALLOWED

### **Test Case 3: Medium Risk**
1. Email with some phishing indicators
2. Links to somewhat suspicious domains
3. Extension should show: 🟠 45-65/100
4. Status: ALLOWED (with warning)

---

## 🚀 Using in Email

### **Gmail Integration:**
1. Open any email in Gmail
2. Click "🛡️ Analyze with QShield" button
3. Panel shows risk levels for all email links
4. Links are color-coded in the email

### **Regular Email Client:**
1. Extension automatically analyzes email links
2. Floating panel shows risks
3. Click links to see warnings before opening

---

## 🔐 Privacy & Security

✅ **What's Shared:**
- Only the link/message content
- No personal data from your computer
- No passwords or sensitive data

❌ **What's NOT Shared:**
- Your browsing history
- Personal information
- Files or attachments
- Cookies or login credentials

---

## 📝 Summary

Your extension now provides **comprehensive link risk assessment** with:

1. **Visual Indicators** - Color-coded links (🔴🟠🟢)
2. **Risk Badges** - Score displayed on each link
3. **Floating Panel** - Full list of links with risks
4. **Tooltips** - Hover for detailed information
5. **Blocking** - High-risk links show warnings
6. **Real-time** - Dynamic links analyzed automatically

**You're now protected from phishing while browsing!** 🛡️
