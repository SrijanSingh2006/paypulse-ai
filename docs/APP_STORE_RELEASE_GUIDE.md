# Mobile store release checklist

PayPulse is a portfolio demo with two mobile clients: Expo / React Native and Flutter. The backend currently uses seeded in-memory demo data, accepts demo credentials, and simulates wage advances and reimbursements. No production store release has been made. Complete the items below before submitting either client to a public store.

## Google Play

1. Create or select a Play Console developer account and register the Android application ID `ai.heftin.paypulse` (the React Native app currently uses this ID). Choose a unique application ID first if the account already has it registered.
2. Replace demo authentication and in-memory storage with production services. Review the API, receipt handling, network security, account deletion, and support contact details.
3. Prepare the Play listing: app name and description, screenshots, icon, feature graphic, privacy policy URL, content rating, target audience, ads declaration, and Data safety answers based on the final app and its vendors.
4. Build a signed Android App Bundle (`.aab`) for release. Create an upload key locally, protect its password, and store signing material in a password manager or CI secrets. Never commit the keystore or passwords. Play App Signing and upload-key requirements are described in the [Android app signing guide](https://developer.android.com/studio/publish/app-signing).
5. Upload to an internal testing track, add testers, review pre-launch reports, then use the closed/open testing or production track available to the account. Google Play may require specific testing periods for new personal developer accounts. Follow the current Console prompts and [release instructions](https://support.google.com/googleplay/android-developer/answer/9859348?hl=en).

For a local upload-key file, run `keytool -genkeypair -v -storetype PKCS12 -keystore paypulse-upload.jks -alias paypulse-upload -keyalg RSA -keysize 2048 -validity 10000`. Keytool prompts for passwords; choose and securely store your own values. Do not reuse a demo password.

## Apple App Store

1. Enroll in the Apple Developer Program and register an App ID. The React Native app's current bundle ID is `ai.heftin.paypulse`; Flutter's generated iOS project must use the same ID only if the two clients are alternatives for one listing. Use a different ID for a separate listing.
2. Configure signing in Xcode with the account's Team, distribution certificate, and provisioning profile. Apple signing requires a Mac with Xcode and valid developer credentials.
3. Create the App Store Connect app record. Complete its metadata, age rating, screenshots, privacy policy, export-compliance answers, and App Privacy details based on actual runtime behavior and all integrated services.
4. Archive and upload a signed build using Xcode or Transporter, select the build in App Store Connect, complete review information, and submit it for review. See Apple's [upload guide](https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/), [submission workflow](https://developer.apple.com/help/app-store-connect/get-started/app-store-connect-workflow), and [review guidelines](https://developer.apple.com/app-store/review/).

## Demo limitations and required review

- The public API is a portfolio/demo service, not a production payroll system. Data is seeded in memory and may reset.
- Demo sign-in is not production identity management. Do not use real employee or financial data.
- Wage access and expense approval update sample records only; no bank transfer, payout, push delivery, or production payroll integration is connected.
- Receipt images are passed to the demo API as data URLs. Replace that flow with access-controlled storage and document retention controls before production.
- Re-check the current platform requirements, SDK/API target, privacy disclosures, and test-account instructions at submission time.

## Build options in this repository

- `mobile/eas.json` contains Expo internal-preview and production build profiles. EAS account access and platform signing credentials are required to create store-signed builds.
- `flutter_app/` contains the Flutter/Dart client. The Flutter GitHub Actions workflow builds a debug-signed Android install artifact for demonstration; it is not suitable for Play submission. An iOS simulator build is unsigned and is not an App Store archive.
- Public store submission remains a manual step after developer accounts, signing credentials, final privacy review, and production services are in place.
