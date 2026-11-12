<#
.SYNOPSIS
    Automated Android Production Keystore Generator for Heftin PayPulse
.DESCRIPTION
    Generates a cryptographically strong 2048-bit RSA release keystore for Google Play Store app signing.
#>

param(
    [string]$KeystoreName = "paypulse-release.jks",
    [string]$Alias = "paypulse-release-key",
    [int]$ValidityDays = 10000
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🔐 Heftin PayPulse Android Production Keystore Generator" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

$destDir = "$PSScriptRoot\..\mobile\android\app"
if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}

$destPath = Join-Path $destDir $KeystoreName

if (Test-Path $destPath) {
    Write-Warning "Keystore already exists at: $destPath"
    exit 0
}

Write-Host "Target keystore path: $destPath" -ForegroundColor Yellow

$keytoolCmd = "keytool"
$keytoolArgs = @(
    "-genkeypair",
    "-v",
    "-storetype", "PKCS12",
    "-keystore", "`"$destPath`"",
    "-alias", "`"$Alias`"",
    "-keyalg", "RSA",
    "-keysize", "2048",
    "-validity", "$ValidityDays",
    "-dname", "CN=Heftin PayPulse Engineering, OU=Mobile Release, O=Heftin AI, L=San Francisco, ST=California, C=US",
    "-storepass", "PayPulseProdKey2026!",
    "-keypass", "PayPulseProdKey2026!"
)

try {
    Write-Host "Executing keytool to generate release keystore..." -ForegroundColor Cyan
    Start-Process -FilePath $keytoolCmd -ArgumentList $keytoolArgs -Wait -NoNewWindow
    Write-Host "✅ Release keystore created successfully at: $destPath" -ForegroundColor Green
    Write-Host "Store Alias: $Alias" -ForegroundColor Green
    Write-Host "Validity: $ValidityDays days" -ForegroundColor Green
} catch {
    Write-Error "keytool not found on system PATH. Ensure JDK 17+ is installed."
}

