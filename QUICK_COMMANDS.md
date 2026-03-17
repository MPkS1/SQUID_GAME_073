# ⚡ QUICK COMMAND REFERENCE

## 🔐 STEP 1: GitHub Authentication (Choose One)

### **Option A: Personal Access Token (EASIEST)**
```powershell
# Go to: https://github.com/settings/tokens
# Click: "Generate new token (classic)"
# Select: repo (full control)
# Copy the token

# Then run:
cd 'e:\squid game\qshield-ai'
git config credential.helper manager-core
git push -u origin main

# When prompted for password: PASTE THE TOKEN (not your password!)
```

### **Option B: SSH Key**
```powershell
# Check if key exists:
Test-Path $HOME/.ssh/id_rsa

# If not, create key:
ssh-keygen -t rsa -b 4096 -f $HOME/.ssh/id_rsa -N ""

# Add to GitHub: https://github.com/settings/ssh
# Paste content of:
type $HOME/.ssh/id_rsa.pub

# Update remote and push:
cd 'e:\squid game\qshield-ai'
git remote remove origin
git remote add origin git@github.com:MPkS1/SQUID_GAME_073.git
git push -u origin main
```

---

## ✅ STEP 2: Verify Code is on GitHub

```powershell
# Check remote
cd 'e:\squid game\qshield-ai'
git remote -v

# Check branch tracking
git branch -vv
```

**Should see:**
```
origin  https://github.com/MPkS1/SQUID_GAME_073.git (fetch)
origin  https://github.com/MPkS1/SQUID_GAME_073.git (push)
* main 5cb77a3 [origin/main] Initial commit...
```

---

## 🌐 STEP 3: Deploy to Vercel

### **Option A: Via Web Dashboard (RECOMMENDED)**

1. Go to: https://vercel.com
2. Click: "New Project"
3. Click: "Import Project"
4. Paste: `https://github.com/MPkS1/SQUID_GAME_073`
5. Click: "Import"
6. Set Name: `qshield-ai`
7. Click: "Environment Variables"
8. Add these variables:

```
Name: GOOGLE_API_KEY
Value: AIzaSyDDerE8nSj8l4sLgntAkNHJi4pbulsraiI

Name: GOOGLE_SAFE_BROWSING_API_KEY
Value: AIzaSyBGQKk8c9lhGYfiOF1R-mtsw6nbpBQeRlc

Name: FRONTEND_URL
Value: https://qshield-ai.vercel.app

Name: DEBUG
Value: false

Name: DEMO_MODE
Value: false
```

9. Click: "Deploy"
10. Wait 2-5 minutes for deployment to complete

### **Option B: Via Vercel CLI**

```powershell
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd 'e:\squid game\qshield-ai'
vercel --prod

# Follow prompts:
# - Scope: Select your account
# - Link to existing project?: No
# - Project name: qshield-ai
# - Directory: ./
# - Build command: npm run build
# - Output directory: dist
```

---

## 🧪 STEP 4: Test Deployment

### **Health Check**
```powershell
# PowerShell
Invoke-WebRequest -Uri "https://qshield-ai.vercel.app/api/health" | Select-Object -ExpandProperty Content

# Or using curl
curl https://qshield-ai.vercel.app/api/health
```

**Expected:**
```json
{"status": "healthy"}
```

### **Test API Analysis**
```powershell
$body = @{
    message = "Your Amazon account suspended!"
    message_type = "email"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://qshield-ai.vercel.app/api/analyze" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body | Select-Object -ExpandProperty Content
```

### **Visit Web Interface**
```
https://qshield-ai.vercel.app
```

---

## 📱 STEP 5: Update Android App

Edit: `android-app/app/build.gradle`

**Find:**
```gradle
buildConfigField "String", "API_BASE_URL", "\"http://10.0.2.2:8000\""
```

**Replace with:**
```gradle
buildConfigField "String", "API_BASE_URL", "\"https://qshield-ai.vercel.app\""
```

**Then build:**
```bash
cd android-app
./gradlew assembleDebug
./gradlew installDebugDebug
```

---

## 🔌 STEP 6: Update Chrome Extension

Edit: `chrome-extension/background.js`

**Find:**
```javascript
const API_BASE_URL = 'http://localhost:8000';
```

**Replace with:**
```javascript
const API_BASE_URL = 'https://qshield-ai.vercel.app';
```

**Then reload in Chrome:**
1. Go to: `chrome://extensions/`
2. Find: "QShield AI"
3. Click: Refresh icon

---

## 🔄 FUTURE UPDATES

To update your live site after deployment:

```powershell
# Make changes locally
cd 'e:\squid game\qshield-ai'

# Stage changes
git add .

# Commit changes
git commit -m "Describe your changes"

# Push to GitHub
git push origin main

# Vercel automatically redeploys! ✅
```

**Check status:** https://vercel.com/dashboard → Your Project → Deployments

---

## 📊 USEFUL VERCEL COMMANDS

```powershell
# View deployment logs
vercel logs

# Check environment variables
vercel env ls

# Run locally (like Vercel)
vercel dev

# Rebuild and redeploy
vercel --prod --force
```

---

## 🆘 TROUBLESHOOTING

### **Push to GitHub fails: "Permission denied"**
→ Use Personal Access Token (Option A under Step 1)

### **Vercel deployment fails: "Build error"**
→ Check logs in Vercel dashboard
→ Verify `frontend/package.json` exists
→ Verify `api/requirements.txt` has all dependencies

### **API returns 404**
→ Check `vercel.json` routes
→ Verify `api/index.py` has correct imports
→ Check environment variables

### **Frontend shows blank page**
→ Check browser console for errors
→ Verify `frontend/dist/` was built
→ Check backend URL in code

---

## 📈 VERCEL DASHBOARD

After deployment, access your dashboard:
- **Main:** https://vercel.com/dashboard
- **Your Project:** https://vercel.com/dashboard/qshield-ai
- **Deployments:** Click "Deployments" tab
- **Logs:** Click deployment → "Logs"
- **Settings:** Click "Settings" tab

---

## 🎯 SUMMARY OF COMMANDS

```powershell
# 1. Authenticate and Push to GitHub
cd 'e:\squid game\qshield-ai'
git config credential.helper manager-core
git push -u origin main

# 2. Deploy to Vercel (via CLI)
npm install -g vercel
vercel login
vercel --prod

# 3. Test endpoints
curl https://qshield-ai.vercel.app/api/health

# 4. Update clients
# Edit android-app/build.gradle and chrome-extension/background.js

# 5. Future updates
git add .
git commit -m "Update description"
git push origin main
```

---

## ✨ TIME ESTIMATE

| Task | Time |
|------|------|
| GitHub auth + push | 2-3 min |
| Vercel deploy | 5-10 min |
| Test endpoints | 2-3 min |
| Update Android | 2-3 min |
| Update Extension | 1-2 min |
| **TOTAL** | **15-20 min** |

---

## 🎉 YOU'RE READY!

Copy-paste the commands above and you'll be live in ~20 minutes! 🚀

**Good luck!** 🛡️
