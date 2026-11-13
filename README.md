# PayPulse

PayPulse is a portfolio project for employee pay and benefits. Employees can view earned wages, submit reimbursement claims with receipt images, and explore a simulated wage advance. HR users can review claims. The project includes a React Native / TypeScript client and a separate Flutter / Dart client that use the same REST API, plus an installable web version of the Expo client.

## Links

- **Live web app:** [dist-three-kappa-22.vercel.app](https://dist-three-kappa-22.vercel.app)
- **API health:** [paypulse-api-three.vercel.app/api/health](https://paypulse-api-three.vercel.app/api/health)
- **GitHub repository:** [SrijanSingh2006/paypulse-ai](https://github.com/SrijanSingh2006/paypulse-ai)
- **Mobile store preparation:** [docs/APP_STORE_RELEASE_GUIDE.md](docs/APP_STORE_RELEASE_GUIDE.md)

## Features

- Sign-in screen with employee and HR demo accounts, persistent demo session, and role switching.
- INR earned-wage summary, eligibility progress, transaction history, and simulated advance requests.
- Expense creation with optional receipt attachment, status filters, and HR approval or rejection.
- Responsive web client that can be installed from a supported mobile browser.
- Independent Flutter/Dart Android and iOS client using the same API as the React Native client.

## Technology and architecture

- **Flutter mobile client:** Flutter, Dart, Provider, HTTP, Shared Preferences, Image Picker, and Intl in `flutter_app/`.
- **React Native mobile client:** Expo SDK 52, React Native, TypeScript/TSX, React Navigation, Axios, and AsyncStorage in `mobile/`.
- **JavaScript:** TypeScript is compiled to JavaScript for React Native and Node.js; the API runs on the JavaScript runtime.
- **Web app:** React Native Web with an HTML entry document, web manifest, and install metadata in `mobile/public/`.
- **API:** Node.js, Express, TypeScript, JWT demo authentication, and REST endpoints in `backend/`.
- **Delivery and source control:** Vercel for the web/API deployments, GitHub Actions for client checks and Flutter Android/iOS build artifacts, and Git/GitHub for version control.

The two native clients are separate apps, not a single screen written in two frameworks. They connect to the shared Express API. The browser demo uses the Expo web client.

The Expo app ID is `ai.heftin.paypulse`; the Flutter CI scaffold uses `ai.heftin.paypulseflutter`. Decide whether the clients are alternate implementations of one store listing or two separate listings before registering production app IDs.

## Demo accounts

Password for both accounts: `password123`

- Employee: `employee@heftin.ai`
- HR manager: `manager@heftin.ai`

The API uses seeded in-memory records that may reset. Wage advances and reimbursements are simulated; no money is transferred. Use demo data only.

## Run the web and React Native client

Requirements: Node.js 20+ and npm.

```bash
npm ci
npm ci --prefix backend
npm ci --prefix mobile
npm run dev
```

The API starts on `http://localhost:4000` and Expo starts in the terminal. Press `w` to open the web client. To open web directly, run `npm run start:web` and visit `http://localhost:3000`. For an Expo Go preview, run `cd mobile && npx expo start --tunnel` and scan its QR code.

By default, the native clients use the deployed demo API. To point Expo at your local API, set `EXPO_PUBLIC_API_URL` before starting Expo (`http://10.0.2.2:4000/api` for an Android emulator, `http://localhost:4000/api` for an iOS simulator, or your computer's LAN address for a physical phone).

## Install the web app on a phone

- **Android:** Open the live web app in Chrome, open the menu, then choose **Install app** or **Add to Home screen**.
- **iPhone:** Open it in Safari, tap **Share**, then choose **Add to Home Screen**.

This installs the web client in a standalone window. It is separate from the Flutter and Expo native apps.

## Run the Flutter client

Install Flutter stable and the Android SDK. From the Flutter project folder, generate platform scaffolding once; iOS generation and device builds require macOS with Xcode.

```bash
cd flutter_app
flutter create --platforms=android,ios --org ai.heftin --project-name paypulseflutter .
flutter pub get
flutter run --dart-define=API_BASE_URL=https://paypulse-api-three.vercel.app/api
```

Before running the iOS client, add `NSPhotoLibraryUsageDescription` to `ios/Runner/Info.plist` to explain receipt image selection. Android Studio or Xcode can launch the app on an emulator/simulator or connected device.

## Build and verification

```bash
npm run typecheck
npm run build:backend
npm run build:web
```

The **Flutter mobile build** GitHub Actions workflow analyzes Dart and builds a debug-signed Android APK plus an unsigned iOS simulator app. Download them from a successful workflow run's Artifacts section. The APK is for device demonstration and sideloading, not Play Store submission. Store-signed builds require developer accounts and release signing credentials; see the [store release checklist](docs/APP_STORE_RELEASE_GUIDE.md).
