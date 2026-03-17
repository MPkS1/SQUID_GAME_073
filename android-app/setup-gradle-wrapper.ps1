# Download and setup Gradle Wrapper
$gradleUrl = "https://services.gradle.org/distributions/gradle-8.0-bin.zip"
$wrapperDir = "gradle\wrapper"
$downloadPath = "$wrapperDir\gradle-8.0-bin.zip"
$extractPath = "$wrapperDir"

Write-Host "Downloading Gradle wrapper..." -ForegroundColor Yellow

# Download the gradle distribution
try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $gradleUrl -OutFile $downloadPath
    Write-Host "Download complete!" -ForegroundColor Green
} catch {
    Write-Host "Error downloading gradle: $_" -ForegroundColor Red
    exit 1
}

# Extract to find gradle-wrapper.jar
Write-Host "Extracting gradle files..." -ForegroundColor Yellow
Add-Type -AssemblyName System.IO.Compression.FileSystem

try {
    # Extract all files
    [System.IO.Compression.ZipFile]::ExtractToDirectory($downloadPath, $extractPath)
    
    # Find and move the jar
    $jarSource = Get-ChildItem -Path "$extractPath\gradle-*" -Filter "gradle-wrapper.jar" -Recurse
    if ($jarSource) {
        Copy-Item $jarSource.FullName "$wrapperDir\gradle-wrapper.jar"
        Write-Host "gradle-wrapper.jar installed!" -ForegroundColor Green
    }
    
    # Cleanup
    Remove-Item $downloadPath
    Get-ChildItem -Path "$extractPath\gradle-*" -Directory | Remove-Item -Recurse -Force
    
    Write-Host "Setup complete! Ready to build." -ForegroundColor Green
} catch {
    Write-Host "Error extracting: $_" -ForegroundColor Red
    exit 1
}
