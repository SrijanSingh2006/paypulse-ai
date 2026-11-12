# Mobile App Release & Store Publishing Guide

**Application:** PayPulse AI (HR Tech & FinTech)  
**Package / Bundle ID:** `ai.heftin.paypulse`  
**Target Stores:** Google Play Console & Apple App Store Connect  
**Build Toolchain:** Expo Application Services (EAS Build), Fastlane, Android Keystore  

---

## 1. Google Play Store Release Process

### 1.1 App Signing & Keystore Setup
Google Play requires apps to be packaged as **Android App Bundles (`.aab`)** and signed using an upload key.
1. Generate the upload keystore using our automated script:
   ```bash
   # Windows PowerShell:
   powershell -ExecutionPolicy Bypass -File scripts/generate-keystore.ps1
   # macOS / Linux:
   chmod +x scripts/generate-keystore.sh && ./scripts/generate-keystore.sh
   ```
2. Configure `gradle.properties` or EAS credentials:
   ```properties
   PAYPULSE_UPLOAD_STORE_FILE=paypulse-release.jks
   PAYPULSE_UPLOAD_KEY_ALIAS=paypulse-release-key
   PAYPULSE_UPLOAD_STORE_PASSWORD=PayPulseProdKey2026!
   PAYPULSE_UPLOAD_KEY_PASSWORD=PayPulseProdKey2026!
   ```

### 1.2 Google Play Console Requirements & Data Safety Checklist
Google requires a comprehensive Data Safety declaration before publishing:
- **Personal Info**: Name and email collected for employee HR account authentication.
- **Financial Info**: User bank account masked string and earned wage transfer history for Earned Wage Access (EWA).
- **Photos & Docs**: Receipt invoices uploaded for corporate expense claims.
- **Security Practices**:
  - Data encrypted in transit using TLS 1.3.
  - User can request account/expense data deletion through HR administrators.

### 1.3 Release Tracks & Staged Rollout
1. **Internal Testing**: Fast track for Heftin AI internal QA team (immediate access via tester email list).
2. **Closed Alpha / Beta**: Targeted test group before store-wide release.
3. **Production Staged Rollout**:
   - Day 1: 10% of users
   - Day 2: 25% of users (monitor crash rate in Google Vitals)
   - Day 4: 50%
   - Day 7: 100% full release

---

## 2. Apple App Store Publishing Process

### 2.1 Certificates, Identifiers & Profiles
1. **App ID**: Register `ai.heftin.paypulse` in Apple Developer Portal.
2. **Capabilities Enabled**:
   - Push Notifications (APNs)
   - In-App Biometric Authentication (LocalAuthentication / Face ID)
3. **Distribution Certificate**: Generated and managed securely through EAS Credentials or Apple Developer Console.
4. **Provisioning Profile**: App Store Distribution Provisioning Profile matching `ai.heftin.paypulse`.

### 2.2 App Store Connect Privacy Nutrition Labels
- **Data Used to Track You**: None.
- **Data Linked to You**:
  - Financial Info (Payment info for wage advances)
  - Contact Info (Email address)
  - User Content (Receipt images)
  - Identifiers (User ID)

### 2.3 TestFlight Distribution
1. Build with EAS:
   ```bash
   cd mobile
   eas build --platform ios --profile production --auto-submit
   ```
2. Invite internal Heftin testers through TestFlight groups.

---

## 3. Versioning Strategy & SemVer
We follow Semantic Versioning (`MAJOR.MINOR.PATCH`):
- `MAJOR` (e.g. `2.0.0`): Breaking architectural rewrites or major workflow shifts.
- `MINOR` (e.g. `2.4.0`): New features (e.g. adding EdTech allowance tracking).
- `PATCH` (e.g. `2.4.1`): Hotfixes, receipt compression tweaks, and bug fixes.
- `versionCode` (Android) & `buildNumber` (iOS): Increment monotonically with every EAS build run (handled automatically in `eas.json`).

