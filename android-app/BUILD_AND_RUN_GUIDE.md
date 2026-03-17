# Android App - Build & Run Guide

## Option 1: Build Using Android Studio (Recommended - Easiest)

Since Android Studio is already installed on your system, this is the fastest way:

### Steps:

1. **Open the Android Project**
   - Open Android Studio
   - Select `File` → `Open`
   - Navigate to: `e:\squid game\qshield-ai\android-app`
   - Click `Open`

2. **Wait for Gradle Sync**
   - Android Studio will automatically sync the Gradle project
   - You'll see a progress bar at the top
   - Wait until it says "Gradle build finished"
   - This might take 2-3 minutes on first run

3. **Build the Debug APK**
   - Go to `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - OR press `Ctrl+Shift+B`
   - Wait for the build to complete
   - You'll see a notification saying "APK(s) generated successfully"

4. **Locate the Built APK**
   - The APK will be at: `e:\squid game\qshield-ai\android-app\app\build\outputs\apk\debug\app-debug.apk`

### Run on Android Emulator:

1. **Setup Android Emulator** (if not already done)
   - In Android Studio, go to `Tools` → `Device Manager`
   - Click `+` to create a new virtual device
   - Select a device (e.g., Pixel 4)
   - Select Android Version API 34 (lowest in the list)
   - Click Create
   - Start the emulator

2. **Run the App**
   -Go to `Run` → `Run 'app'`
   - OR press `Shift+F10`
   - Select the emulator from the device list
   - Click `OK`
   - App will install and launch in the emulator

---

## Option 2: Build Using Command Line (Advanced)

If you prefer using PowerShell:

### Prerequisites:
- Java 11+ (You have Java 24 ✓)
- Android SDK (You have Android SDK ✓)
- Network access to download Gradle

### Steps:

1. **Set Environment Variables**
   ```powershell
   $env:ANDROID_HOME='C:\Users\purus\AppData\Local\Android\sdk'
   $env:JAVA_HOME='C:\Program Files\Java\jdk-24'  # Adjust path to your Java installation
   cd 'e:\squid game\qshield-ai\android-app'
   ```

2. **Attempt Gradle Build (might require additional setup)**
   ```powershell
   .\gradlew.bat clean assembleDebug
   ```

3. **If gradle-wrapper.jar is missing** (likely scenario):
   - You'll get an error about missing gradle-wrapper.jar
   - Follow "Option 1" (Android Studio) instead, as it handles Gradle setup automatically

---

## Option 3: Manual Gradle Setup (For Command Line Build)

If you want to complete the gradle-wrapper.jar setup:

1. **Download Gradle 8.0**
   - Go to: https://gradle.org/releases/
   - Download: gradle-8.0 (Binary only)
   - Extract to a temporary folder

2. **Copy the wrapper JAR**
   ```powershell
   $gradleExtractPath = 'C:\path\to\extracted\gradle-8.0'
   Copy-Item "$gradleExtractPath\lib\gradle-wrapper-8.0.jar" `
     -Destination 'e:\squid game\qshield-ai\android-app\gradle\wrapper\gradle-wrapper.jar'
   ```

3. **Build the APK**
   ```powershell
   cd 'e:\squid game\qshield-ai\android-app'
   .\gradlew.bat clean assembleDebug
   ```

4. **Get your APK**
   - Output: `e:\squid game\qshield-ai\android-app\app\build\outputs\apk\debug\app-debug.apk`

---

## Update Backend URL (Important!)

Before running the app, update the API endpoint to point to your Vercel deployment:

1. Edit: `e:\squid game\qshield-ai\android-app\app\build.gradle`
2. Find this line (around line 22):
   ```gradle
   buildConfigField "String", "API_BASE_URL", "\"http://10.0.2.2:8000\""
   ```
3. Replace with your Vercel URL:
   ```gradle
   buildConfigField "String", "API_BASE_URL", "\"https://your-vercel-domain.vercel.app\""
   ```
4. Rebuild the app

---

## Testing the App

Once built and running on emulator:

1. **Dashboard Tab**
   - Shows app statistics
   - Displays recent analyses

2. **Analysis Tab**
   - Paste suspicious text or URL
   - Get instant phishing risk assessment
   - View detailed risk breakdown

3. **History Tab**
   - See all previous analyses
   - Delete individual analyses

---

## Troubleshooting

### "Gradle not found" error
**Solution**: Use Option 1 (Android Studio) which handles all Gradle setup automatically

### "Android SDK not found"
**Solution**: Open Android Studio once, it will auto-detect your SDK at:
`C:\Users\purus\AppData\Local\Android\sdk`

### "gradle-wrapper.jar not found"
**Solution**: The gradle-wrapper.jar wasn't successfully downloaded. Use Android Studio instead.

### Network timeout during build
**Solution**: Gradle is downloading dependencies. Wait and retry. If network is slow, try again later.

### "Build successful but app won't start"
**Solution**: Make sure the API_BASE_URL is correctly set and Vercel backend is deployed

---

## Next Steps

1. ✅ Build the Android app using Android Studio (Option 1)
2. ✅ Connect Vercel backend URL in build.gradle
3. ✅ Run on Android Emulator
4. ✅ Test all three tabs
5. ✅ Deploy to actual Android device (optional)

---

**Questions?** Check the main README.md in the android-app folder.
