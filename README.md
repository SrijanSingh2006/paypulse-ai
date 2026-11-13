# PayPulse AI

PayPulse AI is a cross-platform employee benefits demo for earned wage access, expense claims, payroll summaries, and HR approvals. The interface is available as a web app and an Expo mobile app.

## Links

- **Live web demo:** [dist-three-kappa-22.vercel.app](https://dist-three-kappa-22.vercel.app)
- **API health:** [paypulse-api-three.vercel.app/api/health](https://paypulse-api-three.vercel.app/api/health)
- **GitHub:** [SrijanSingh2006/paypulse-ai](https://github.com/SrijanSingh2006/paypulse-ai)

## Features

- Employee and HR manager demo sign-in with role-specific views.
- INR wage accrual, eligibility limit, and simulated wage advance ledger.
- Expense claim submission with receipt attachment, search, and filters.
- Manager claim review with approve/reject actions and notes.
- Payday outlook, payslip breakdown and CSV export, and notifications.
- Rule-based Benefits Copilot for questions about demo benefits data.

## Tech stack

- **Client:** React Native, React Native Web, Expo SDK 52, TypeScript, React Navigation, AsyncStorage, Axios.
- **API:** Node.js, Express, TypeScript, REST, JWT authentication middleware.
- **Hosting and CI:** Vercel and GitHub Actions.

## Architecture and demo data

- The Expo client contains the screens, navigation, and API client.
- The Express API exposes authentication, EWA, expense, notification, payslip, release, and Copilot routes.
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
