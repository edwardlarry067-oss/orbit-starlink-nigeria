# ORBITFUTURE Mobile App

> Satellite internet management in your pocket — powered by ORBITFUTURE

## Overview

Complete React Native Expo application for the ORBITFUTURE satellite internet platform. Connects to the deployed API to let customers browse plans, manage subscriptions, top up their Orbit Wallet, track orders, and contact support.

---

## Screens

| Screen | Description |
|--------|-------------|
| **Splash** | Animated ORBITFUTURE logo shown for 2 seconds on launch |
| **Home** | Hero, stats, features, testimonials, WhatsApp CTA, notifications bell |
| **Plans** | All Starlink plans from API — order via Stripe or WhatsApp |
| **Wallet** | Token balance + buy bundles (starter/basic/standard/premium/enterprise) |
| **Dashboard** | Active subscription, 5-step installation tracker, order history |
| **Profile** | Account details, edit profile, change password, sign out |
| **Notifications** | In-app alerts with mark-as-read |
| **Support** | WhatsApp/email + ticket submission form |
| **Login/Register** | JWT auth — accessible from Profile tab when signed out |

---

## Quick Start — Expo Go

### 1. Install Expo Go on your device

- **Android**: [Play Store — Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iPhone**: [App Store — Expo Go](https://apps.apple.com/app/expo-go/id982107779)

### 2. Install dependencies

```bash
cd artifacts/mobile
npm install
```

### 3. Start the dev server

```bash
npx expo start
```

### 4. Scan the QR code

- **Android**: Open Expo Go → tap "Scan QR Code"
- **iPhone**: Open Camera app → scan QR → opens in Expo Go automatically

---

## Configure API URL

Edit `app.json` → `extra.apiUrl` to point to your backend:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-app.replit.app"
    }
  }
}
```

---

## Navigation Structure

```
App
├── SplashScreen (2-second animated intro)
└── NavigationContainer
    └── RootStack
        ├── Main (bottom tabs)
        │   ├── Home
        │   ├── Plans
        │   ├── Wallet
        │   ├── Dashboard
        │   └── Profile (shows Login when not authenticated)
        ├── Notifications (stack screen)
        └── Support (stack screen)
```

---

## Authentication

- JWT stored in `expo-secure-store` (encrypted)
- Auto-login checks stored token on every launch via `/api/auth/me`
- Login and Register available in one screen (toggle between modes)
- Token cleared on logout

---

## Stripe Payments

- Wallet top-up: opens Stripe Checkout in system browser
- Bundle IDs match backend exactly: `starter`, `basic`, `standard`, `premium`, `enterprise`
- On return from Stripe, pull-to-refresh updates the balance

---

## Design System

All tokens in `src/theme.ts`:

| Token | Value |
|-------|-------|
| Background | `#000000` |
| Surface | `#0a0f1e` |
| Primary (cyan) | `#00D4FF` |
| Text | `#ffffff` |
| Muted | `#6b7280` |

Components in `src/components/ui/`:
- `Button` — primary / outline / ghost / danger
- `Card` — standard and highlighted border
- `Input` — label, error state, password toggle
- `Badge` — auto-colour by status (active/pending/processing/installed/completed)
- `LoadingSpinner` — full-screen or inline
- `EmptyState` — with optional action

---

## Build for Production

### Prerequisites

```bash
npm install -g @expo/eas-cli
eas login   # login with your Expo account
```

### Android APK (internal testing)

```bash
npx eas build --platform android --profile preview
```

### Android App Bundle (Play Store)

```bash
npx eas build --platform android --profile production
```

### iOS (requires Apple Developer account — $99/yr)

```bash
npx eas build --platform ios --profile production
```

---

## App Details

| Field | Value |
|-------|-------|
| Bundle ID (iOS) | `com.orbitfuture.app` |
| Package (Android) | `com.orbitfuture.app` |
| Expo SDK | 51 |
| React Native | 0.74.5 |

---

## Support

- WhatsApp: [+1 (620) 612-3994](https://wa.me/16206123994)
- Email: support@orbitfuture.com
