# PayPulse AI

PayPulse AI v2.6.0 is a cross-platform employee benefits demo for earned wage access, expense claims, payroll summaries, and HR approvals. The responsive app runs on web and through Expo on mobile.

## Links

- **Live web demo:** [dist-three-kappa-22.vercel.app](https://dist-three-kappa-22.vercel.app)
- **API health:** [paypulse-api-three.vercel.app/api/health](https://paypulse-api-three.vercel.app/api/health)
- **GitHub:** [SrijanSingh2006/paypulse-ai](https://github.com/SrijanSingh2006/paypulse-ai)

## Features

- Responsive light interface with ink-blue navigation, paper-toned surfaces, and role-specific employee and HR manager views.
- INR wage accrual, eligibility limit, and simulated wage advance ledger.
- Expense claim submission with receipt attachment, search, and filters.
- Manager claim review with approve/reject actions and notes.
- Payday outlook, payslip breakdown and CSV export, and notifications.
- Rule-based Benefits Copilot for questions about demo benefits data.

## Tech stack

- **Client:** React 18, React Native 0.76, React Native Web, Expo SDK 52, TypeScript, and React Navigation.
- **Client libraries:** Axios for API requests, AsyncStorage for session/demo persistence, Expo Image Picker for receipt attachments, and Expo Vector Icons.
- **API:** Node.js, Express, TypeScript, REST endpoints, JWT authentication middleware, CORS, and dotenv.
- **Delivery:** Vercel hosting, GitHub Actions build checks, and Expo EAS build scripts for Android and iOS previews.

## Architecture and demo data

- The Expo client contains the screens, navigation, and API client.
- The Express API exposes authentication, EWA, expense, notification, payslip, release, and rule-based Copilot routes.
- Local/native clients connect to the API. The hosted web demo uses browser storage for its interactive demo state.
- The API uses seeded in-memory data; it is not backed by a database and may reset when a serverless instance restarts.
- All money movement is simulated. No real payroll or banking services are connected, and the Benefits Copilot uses rules rather than a hosted language model.

## Demo sign-in

Use either account with password `password123`:

- Employee: `employee@heftin.ai`
- HR manager: `manager@heftin.ai`

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm ci
npm ci --prefix backend
npm ci --prefix mobile
npm run dev
```

This starts the API on `http://localhost:4000` and Expo. Press `w` in the Expo terminal to open the web app. To start just the web app, run `npm run start:web` and open `http://localhost:3000`.

## Build

```bash
npm run typecheck
npm run build:backend
npm run build:web
```
