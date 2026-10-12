$env:JAVA_HOME = "C:\Users\Shuvo\AppData\Local\Android\jdk21\jdk-21.0.12.1+1"
$env:ANDROID_HOME = "C:\Users\Shuvo\AppData\Local\Android\Sdk"
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\cmdline-tools\latest\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"

Write-Output "Building Android APK..."
Push-Location android
.\gradlew.bat assembleDebug
Pop-Location

Write-Output "Copying APK to project root..."
Copy-Item "android\app\build\outputs\apk\debug\app-debug.apk" "DG-Pharma.apk" -Force

$item = Get-Item "DG-Pharma.apk"
Write-Output ("Build successful! New APK size: {0:N2} MB ({1} bytes)" -f ($item.Length / 1MB), $item.Length)
