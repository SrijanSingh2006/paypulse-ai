# PayPulse AI

PayPulse AI is a cross-platform employee benefits and financial-wellbeing application. It brings earned wage access (EWA), expense reimbursement, payroll visibility, payslip summaries, and HR claim review into one employee-facing experience.

The repository contains **two separate mobile clients**—one built with React Native and one with Flutter—plus a browser-installable web version of the Expo client. Both native clients are designed to communicate with the same Node.js/Express REST API.

> **Project scope:** This is a portfolio/demo implementation. Wage advances, reimbursements, balances, payroll information, and sample user records are simulated. The project does not move real money, connect to a live payroll provider or bank, or provide production financial services.

## Project links

- **Live web application:** https://dist-three-kappa-22.vercel.app
- **Backend API health:** https://paypulse-api-three.vercel.app/api/health
- **Repository:** https://github.com/SrijanSingh2006/paypulse-ai
- **Store preparation guide:** [docs/APP_STORE_RELEASE_GUIDE.md](docs/APP_STORE_RELEASE_GUIDE.md)

## Main capabilities

### Employee workspace

- Sign in using the employee demo account.
- View an INR-denominated wage summary and an estimated earned-wage amount.
- See the demo eligibility calculation and previous advance activity.
- Submit a simulated wage-advance request using a demo transfer route.
- Create expense claims with amount, category, merchant, date, and an optional receipt image.
- Search/filter expense claims and follow their review status.
- Review sample payroll information and payslip earnings/deductions.
- View notifications and ask the Benefits Copilot questions about the demo's benefit rules.

### HR manager workspace

- Sign in using the HR manager demo account.
- View the manager's claims workspace and pending claim activity.
- Review submitted employee expense claims.
- Approve or reject claims and record a review note where supported by the client workflow.
- Switch back to the employee demo experience or sign out.

### Web and mobile experiences

- The Expo/React Native client can run on Android and iOS using Expo's native tooling.
- The same React Native UI is rendered in a browser through React Native Web.
- The web app includes install metadata so a supported mobile browser can add it to the device home screen.
- A separate Flutter/Dart client is included for a second native implementation using the shared API.

## Technology stack and why it is used

| Layer | Technologies | How they are used |
|---|---|---|
| Flutter mobile client | Flutter, Dart | A separate cross-platform native application for Android and iOS. |
| Flutter state and networking | Provider, HTTP, Shared Preferences | Client state management, REST calls, and local session/preferences storage. |
| Flutter device features | Image Picker, Intl | Receipt image selection and locale-aware formatting such as dates and currency. |
| React Native client | React Native, React 18, Expo SDK 52, TypeScript/TSX | Component-based cross-platform mobile application with type-checked application code. |
| React Native navigation | React Navigation, native stack and bottom tabs | Navigation between sign-in and employee/manager application screens. |
| React Native networking and persistence | Axios, AsyncStorage | API communication and local demo/session persistence. |
| React Native / Expo device modules | Expo Image Picker, Expo Haptics, Expo Vector Icons, Safe Area Context, Screens, Linear Gradient | Receipt selection, touch feedback, icons, safe layout areas, and interface effects. |
| Web rendering | React Native Web, React DOM, Expo Metro | Runs the Expo client in a browser and bundles its web build. |
| Web entry and install support | HTML, web manifest, install metadata | Browser entry document and home-screen installation metadata. |
| Backend runtime | Node.js | Runs the API server and its JavaScript application code. |
| Backend framework | Express.js | Defines REST endpoints and request middleware. |
| Backend language | TypeScript | Adds static types to backend routes, services, and data structures; it is compiled to JavaScript. |
| API security and configuration | JSON Web Tokens (JWT), CORS, dotenv | Demo token authentication, cross-origin access configuration, and environment-based settings. |
| Hosting | Vercel | Hosts the browser application and deployed API endpoints. |
| CI/CD | GitHub Actions | Runs repository checks and builds Flutter demo artifacts for Android and the iOS simulator. |
| Source control | Git, GitHub | Tracks source changes, collaboration history, and project automation. |
| Native build toolchains | Android SDK / Gradle, Xcode (macOS) | Compile Android and iOS native applications. |

### Language clarification

- **Dart** is used by the separate Flutter client.
- **TypeScript** is used by the React Native client and the Express backend.
- **JavaScript** is the runtime language produced from TypeScript and used by the Node.js/React ecosystem.
- **HTML** provides the web entry document; the actual screens are primarily rendered using React Native components through React Native Web.
- **CSS** may be used for browser-level presentation, while most shared application styling is defined in the React Native UI layer.

## High-level architecture

```text
                       PayPulse AI
                           |
             +-------------+-------------+
             |             |             |
       React Native     Flutter       Web client
        Expo/TSX        Dart          React Native Web
             |             |             |
             +-------------+-------------+
                           |
                    HTTPS / REST / JSON
                           |
                Node.js + Express API
                     TypeScript
                           |
        +------------------+------------------+
        |          |        |        |         |
      Auth        EWA    Expenses  Payslips  Notifications
        |          |        |        |         |
        +------------------+------------------+
                           |
                  Seeded demo data
                  (in-memory records)
```

### Request flow

1. The user signs in through one of the client applications.
2. The client sends the sign-in request to the authentication endpoint.
3. The API validates the demo credentials and issues a JWT where that API flow is used.
4. The client stores its local demo/session state according to that client implementation.
5. The client sends REST requests to the API for the supported workflows.
6. Express middleware and route handlers process the request and access the sample data.
7. The client updates the relevant screen with the returned result.

The hosted web experience also has a browser-local demo workspace. It should not be confused with a persistent production backend database.

## Earned Wage Access: demo calculation

The EWA screen demonstrates a simplified wage-accrual model. The sample logic uses a 30-day monthly salary basis and a 50% cap on accrued wages, less previous advances.

```text
Daily earnings = Monthly salary / 30

Accrued wages = Daily earnings × eligible days

Illustrative maximum eligibility = 50% × accrued wages

Remaining demo eligibility = Maximum eligibility
                              − previous demo advances
```

This is a sample product rule for demonstration, not a legal/payroll calculation or a connection to an employer's payroll system.

## API areas

The Express backend is organized around these API areas:

| Route area | Responsibility |
|---|---|
| `/api/health` | Health/status response for the deployed API. |
| `/auth` | Demo authentication and token-related operations. |
| `/ewa` | Earned-wage summary and simulated advance operations. |
| `/expenses` | Expense claim creation, listing, and review-related operations. |
| `/notifications` | Demo notification data and activity updates. |
| `/payslips` | Payslip and payroll summary data. |
| `/release` | Application release/version information. |
| `/ai` | Benefits Copilot responses based on the project's predefined rules and demo data. |

The Benefits Copilot is currently a **rule-/keyword-based demo assistant**, not a hosted generative AI model or an LLM integration.

## Repository layout

The main project areas are:

```text
paypulse-ai/
├── backend/          # Node.js, Express and TypeScript API
├── mobile/           # Expo / React Native / TypeScript client
│   └── public/       # Web entry document and web install assets
├── flutter_app/      # Separate Flutter / Dart client
├── docs/             # Mobile store preparation and project guides
├── .github/
│   └── workflows/    # GitHub Actions automation
├── package.json      # Root scripts
└── README.md
```

Some native platform folders may be generated as part of the Flutter setup/build workflow rather than committed as generated project scaffolding.

## Demo sign-in

Use these sample accounts in the demo application:

| Role | Email |
|---|---|
| Employee | `employee@heftin.ai` |
| HR manager | `manager@heftin.ai` |

**Demo password for both accounts:** `password123`

Use demo credentials and sample data only. Do not enter real employee, payroll, banking, or personal information.

## Run locally

### Prerequisites

- Node.js 20 or later
- npm
- Git
- Flutter stable and Android SDK for the Flutter client
- Android Studio for Android emulator/device development
- macOS with Xcode for iOS simulator/device builds

### Install JavaScript dependencies

From the repository root:

```bash
npm ci
npm ci --prefix backend
npm ci --prefix mobile
```

### Start the API and Expo app

```bash
npm run dev
```

The API uses port `4000` by default. Expo starts in the terminal; press `w` to open the web app.

To start the web client directly:

```bash
npm run start:web
```

Then open http://localhost:3000.

To start Expo for a device preview:

```bash
cd mobile
npx expo start --tunnel
```

Scan the QR code using a compatible Expo Go setup.

### Configure the API URL

The native clients are configured to use the deployed demo API by default. For local backend development, set the Expo public API URL before starting the client.

Examples:

- Android emulator: `http://10.0.2.2:4000/api`
- iOS simulator: `http://localhost:4000/api`
- Physical phone: use the computer's reachable LAN IP address, for example `http://192.168.1.10:4000/api`

Use the variable name expected by the client configuration (the Expo client uses `EXPO_PUBLIC_API_URL`). Do not commit local secrets or private environment files.

### Run Flutter

Install Flutter stable and the Android SDK. From the repository root:

```bash
cd flutter_app
flutter pub get
flutter run --dart-define=API_BASE_URL=https://paypulse-api-three.vercel.app/api
```

If platform scaffolding has not yet been generated in the working copy, generate it once using the project's configured organization and app name:

```bash
flutter create --platforms=android,ios --org ai.heftin --project-name paypulseflutter .
```

iOS builds require macOS and Xcode. Before using the iOS receipt image picker, ensure the iOS photo library usage description is present in `ios/Runner/Info.plist`.

## Web app installation

The web client can be added to a phone's home screen using a supported browser:

- **Android / Chrome:** Open the live web app, open the browser menu, then select **Install app** or **Add to Home screen**.
- **iPhone / Safari:** Open the live web app, tap **Share**, then choose **Add to Home Screen**.

This creates a home-screen web app experience. It is not the same as installing a signed native Android APK or iOS App Store application.

## Checks and builds

The root project includes scripts for the JavaScript/TypeScript checks and web/backend build. Run:

```bash
npm run typecheck
npm run build:backend
npm run build:web
```

The Flutter GitHub Actions workflow analyzes the Dart project and produces demo build artifacts for Android and the iOS simulator. A successful workflow run exposes its outputs in the **Artifacts** section.

- The Android debug APK is suitable for demo installation/sideloading.
- The iOS simulator artifact is for simulator use; it is not an iPhone install package.
- A Play Store release requires a signed Android App Bundle (AAB), production signing configuration, store metadata, and Play Console submission.
- An App Store release requires macOS/Xcode, signing certificates/profiles, App Store Connect configuration, privacy details, and review.

See [docs/APP_STORE_RELEASE_GUIDE.md](docs/APP_STORE_RELEASE_GUIDE.md) for the repository's store-preparation checklist.

## Demo limitations and production considerations

This distinction is important when demonstrating the project or discussing it in interviews:

- The project uses seeded/sample data. The API's in-memory records can reset when an instance restarts.
- The hosted web demo keeps its interactive demo workspace in browser storage; this is not a server-backed production database.
- Wage advances and reimbursements are simulated. No real UPI, bank, payment gateway, or payroll provider is connected.
- The Benefits Copilot uses predefined project rules/demo data; it is not currently backed by a hosted AI model.
- Demo authentication is for portfolio exploration. A production deployment would require stronger identity management, secure persistent storage, authorization review, audit trails, rate limiting, monitoring, and security testing.
- Real payroll and financial workflows would require appropriate provider integrations, reconciliation, compliance review, and safeguards before handling real funds or employee data.

## Resume-ready project summary

**PayPulse AI — Cross-platform Employee Benefits and Earned Wage Access Platform**

Built a cross-platform employee benefits demo with separate Flutter/Dart and React Native/TypeScript clients, a shared Node.js/Express REST API, and a browser-installable web experience. Implemented employee and HR workflows for simulated earned wage access, expense reimbursement submissions and approvals, payroll/payslip visibility, role-based demo access, and notifications. Configured GitHub Actions to validate the application and produce Android/iOS demo build artifacts.

### ATS keywords

Flutter, Dart, React Native, Expo, TypeScript, JavaScript, Node.js, Express.js, REST API, JWT, Provider, React Navigation, Axios, AsyncStorage, Shared Preferences, React Native Web, HTML, CSS, Git, GitHub, GitHub Actions, CI/CD, Vercel, Android, iOS, FinTech, HR Tech, Earned Wage Access, Expense Management, Reimbursements, Payroll, Role-Based Access, Cross-Platform Mobile Development.

---

**PayPulse AI is a portfolio demonstration.** The repository should be presented as a working cross-platform prototype with simulated financial workflows—not as a production payroll system or a published banking/payment application.
