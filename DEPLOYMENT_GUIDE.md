# 🚀 QShield AI - Deployment Guide

## 📋 Project Overview

QShield AI is a comprehensive **multi-platform phishing detection system** with:
- ✅ **Backend:** FastAPI (Python) - Port 8000
- ✅ **Frontend:** React 18 + Vite (JavaScript) - Port 5174
- ✅ **Android App:** Kotlin + Jetpack Compose
- ✅ **Chrome Extension:** Manifest V3
- ✅ **Notification Monitor:** Python + Flask

---

## 🌐 Vercel Deployment Instructions

### **Step 1: Prepare Your Project**

```bash
# Clone the GitHub repository
git clone https://github.com/MPkS1/SQUID_GAME_073.git
cd SQUID_GAME_073
```

### **Step 2: Create Vercel Account**

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub account
3. Authorize Vercel to access your repositories

### **Step 3: Import Project to Vercel**

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Click "Import Project"
3. Paste GitHub URL: `https://github.com/MPkS1/SQUID_GAME_073`
4. Click "Continue"

### **Step 4: Configure Environment Variables**

In the Vercel dashboard, add the following environment variables:

```
GOOGLE_API_KEY=AIzaSyDDerE8nSj8l4sLgntAkNHJi4pbulsraiI
GOOGLE_SAFE_BROWSING_API_KEY=AIzaSyBGQKk8c9lhGYfiOF1R-mtsw6nbpBQeRlc
FRONTEND_URL=https://your-project.vercel.app
BACKEND_PORT=8000
DEBUG=false
DEMO_MODE=false
```

### **Step 5: Deploy**

1. Click "Deploy"
2. Wait for deployment to complete (2-5 minutes)
3. Your app will be available at: `https://your-project.vercel.app`

---

## 📦 Project Structure

```
SQUID_GAME_073/
├── backend/                 # FastAPI Python backend
│   ├── main.py
│   ├── analyzer/
│   ├── utils/
│   ├── scorer.py
│   └── requirements.txt
├── frontend/                # React + Vite frontend
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── dist/
├── android-app/             # Kotlin + Jetpack Compose
│   ├── app/
│   ├── build.gradle
│   └── README.md
├── chrome-extension/        # Manifest V3
│   ├── manifest.json
│   ├── scripts/
│   ├── popup/
│   └── icons/
├── notification-monitor/    # Python + Flask
│   ├── notification_listener.py
│   ├── dashboard.py
│   └── requirements.txt
├── api/                     # Vercel serverless API
│   ├── index.py
│   └── requirements.txt
├── vercel.json             # Vercel configuration
└── .gitignore
```

---

## 🔧 Local Development

### **Backend Setup**

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Backend URL:** `http://localhost:8000`

### **Frontend Setup**

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend URL:** `http://localhost:5173` or `http://localhost:5174`

### **Test Backend**

```bash
# Health check
curl http://localhost:8000/health

# Analyze message
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Your Amazon account suspended!",
    "message_type": "email",
    "url": null
  }'
```

---

## 📱 Android App Setup

```bash
cd android-app

# Configure backend URL in build.gradle
buildConfigField "String", "API_BASE_URL", "\"https://your-project.vercel.app\""

# Build APK
./gradlew assembleDebug

# Run on emulator
./gradlew installDebugDebug
```

---

## 🔌 Chrome Extension Setup

1. Go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Navigate to `chrome-extension/` folder
5. Click "Select Folder"

---

## 🔑 API Endpoints

### **Health Check**
```bash
GET /health
```

### **Analyze Message**
```bash
POST /analyze
Content-Type: application/json

{
  "message": "string (10-5000 chars)",
  "message_type": "email|sms|chat|url",
  "url": "optional URL"
}
```

**Response:**
```json
{
  "final_risk_score": 85,
  "risk_level": "HIGH_RISK",
  "explanation": "Multiple phishing indicators detected...",
  "all_flags": ["credential_harvesting", "suspicious_url"],
  "credential_harvesting": {...},
  "anomaly_detection": {...},
  "attack_pattern": {...},
  "threat_intelligence": {...}
}
```

### **Report Phishing**
```bash
POST /report-phishing
Content-Type: application/json

{
  "message": "string",
  "reason": "string"
}
```

---

## 🚨 Troubleshooting Vercel Deployment

### **Issue: Build Failed**

**Solution:**
```bash
# Check if all dependencies are listed in requirements.txt
pip freeze > api/requirements.txt

# Ensure frontend builds correctly
cd frontend
npm run build
```

### **Issue: Backend API Not Working**

**Solution:**
1. Check environment variables in Vercel dashboard
2. Verify API_BASE_URL points to Vercel domain
3. Check CORS configuration in `api/index.py`

### **Issue: CORS Errors**

**Solution:** Update CORS origins in `api/index.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-project.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📊 Monitoring & Logs

### **Vercel Logs**
1. Go to Vercel dashboard
2. Select your project
3. Click "Deployments"
4. View logs in real-time

### **Backend Logs**
```bash
# Local development
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload --log-level DEBUG
```

---

## 🔐 Environment Variables

| Variable | Value | Required |
|----------|-------|----------|
| `GOOGLE_API_KEY` | Your Google API key | Yes |
| `GOOGLE_SAFE_BROWSING_API_KEY` | Safe Browsing API key | Yes |
| `FRONTEND_URL` | Your Vercel frontend URL | Yes |
| `BACKEND_PORT` | 8000 | No |
| `DEBUG` | true/false | No |
| `DEMO_MODE` | true/false | No |

---

## 📈 Performance Optimization

### **Frontend**
- ✅ Code splitting with Vite
- ✅ Lazy loading of components
- ✅ CSS minification
- ✅ Image optimization

### **Backend**
- ✅ Async/await for concurrent requests
- ✅ Caching analysis results
- ✅ Rate limiting (30 req/min, 300 req/hour)
- ✅ Database indexing

---

## 🎯 Next Steps

1. **Push to GitHub** ✅ 
   - Repository: https://github.com/MPkS1/SQUID_GAME_073
   
2. **Deploy to Vercel** ✅
   - Frontend automatically deployed
   - Backend available as serverless functions
   
3. **Configure Custom Domain** (Optional)
   - Go to Vercel dashboard → Settings → Domains
   - Add your custom domain
   
4. **Set up CI/CD** (Optional)
   - GitHub Actions automatically triggers Vercel deployment
   - Redeploy on every push to main branch

---

## 📞 Support

For issues or questions:
1. Check GitHub issues: https://github.com/MPkS1/SQUID_GAME_073/issues
2. Review logs in Vercel dashboard
3. Check backend logs locally

---

## 📄 License

This project is open source and available under the MIT License.

---

**Happy Deploying! 🚀**
