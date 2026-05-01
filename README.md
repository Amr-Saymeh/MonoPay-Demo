
# MonoPay

MonoPay is a student-friendly mobile payment app built with Expo and React Native. It is designed as a simple digital wallet experience with features for sending money, requesting payments, scanning QR codes, tracking spending, and managing goals.

## 🚀 Overview

This app is a learning project that demonstrates how to build a multi-screen financial app using modern React Native tools. It includes authentication, navigation, custom UI components, and a set of common wallet app features.

## ⭐ Main Features

- **User Authentication**: Sign up, log in, selfie verification, and pending account screens.
- **Wallet Management**: View wallet balances, create wallets, and access payment tools.
- **Send & Request Money**: Transfer funds, request money from contacts, and manage requests.
- **QR Code Payments**: Scan QR codes to send or receive money quickly.
- **Transaction Insights**: Track spending and view insights to help manage finances.
- **Goals & Savings**: Add financial goals, track progress, and view savings summaries.
- **Exchange & Transfers**: Access exchange and transfer screens for money movement.
- **Settings & Approval Flow**: Manage app settings and approve users or requests where needed.

## 🧩 Project Structure

- `app/` - Main Expo app entry and screens.
- `components/` - Reusable UI components and feature-specific cards.
- `src/` - App logic, services, providers, and translations.
- `assets/` - Application images and static assets.
- `hooks/` - Custom hooks for themes, auth, and app behavior.
- `constants/` - Theme and app constants.

## 🛠️ Tech Stack

- React Native + Expo
- TypeScript
- Tailwind-style styling with NativeWind
- Firebase for backend configuration and services
- Custom hooks and context providers for state management

## 📦 Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Expo development server:
   ```bash
   npx expo start
   ```
3. Open the app in the Expo Go mobile app or an emulator.

## 💡 Notes for Students

- Look at `app/` for the main screen layout and navigation logic.
- Explore `components/ui/` to see how common UI elements are built.
- Check `src/services/` for how features like authentication and goals are organized.
- Use `hooks/` to understand reusable logic patterns.

## 📚 Why This Project Helps

MonoPay is a good study project because it combines:

- real mobile UI design,
- user flows for payments,
- React Native navigation,
- backend service structure,
- and state management using custom hooks and context.

Enjoy exploring the app and learning how a wallet-style mobile project is built


```
MonoPay-Demo
├─ app
│  ├─ (auth)
│  │  ├─ id-scan.tsx
│  │  ├─ login.tsx
│  │  ├─ pending.tsx
│  │  ├─ selfie.tsx
│  │  ├─ signup-details.tsx
│  │  ├─ welcome.tsx
│  │  └─ _layout.tsx
│  ├─ (tabs)
│  │  ├─ approve-users.tsx
│  │  ├─ FeturesPage.tsx
│  │  ├─ HomePage.tsx
│  │  ├─ index.tsx
│  │  ├─ settings
│  │  │  ├─ avatar-camera.tsx
│  │  │  ├─ change-password.tsx
│  │  │  ├─ edit-profile.tsx
│  │  │  ├─ index.tsx
│  │  │  └─ _layout.tsx
│  │  ├─ wallets
│  │  │  ├─ add.tsx
│  │  │  ├─ index.tsx
│  │  │  └─ _layout.tsx
│  │  └─ _layout.tsx
│  ├─ CustomaztionFeture.tsx
│  ├─ exchange.tsx
│  ├─ explore.tsx
│  ├─ global.css
│  ├─ globals.css
│  ├─ index.tsx
│  ├─ modal.tsx
│  ├─ requests.tsx
│  ├─ transfer.tsx
│  └─ _layout.tsx
├─ app.json
├─ assets
│  └─ images
│     ├─ favicon.png
│     ├─ icon.png
│     ├─ partial-react-logo.png
│     ├─ react-logo.png
│     ├─ react-logo@2x.png
│     ├─ react-logo@3x.png
│     └─ splash-icon.png
├─ babel.config.js
├─ components
│  ├─ exchange
│  │  ├─ CurrencyListItem.tsx
│  │  └─ Header.tsx
│  ├─ external-link.tsx
│  ├─ FeturesPage
│  │  ├─ FeturesPage.tsx
│  │  └─ icons.ts
│  ├─ haptic-tab.tsx
│  ├─ hello-wave.tsx
│  ├─ HomePageFolder
│  │  ├─ ADVERTISEMENT.tsx
│  │  ├─ CustomizationFeture
│  │  │  └─ Customization.tsx
│  │  ├─ HomeHeader.tsx
│  │  ├─ QuickActions.tsx
│  │  └─ TotalBalance.tsx
│  ├─ language-switch.tsx
│  ├─ parallax-scroll-view.tsx
│  ├─ theme-toggle.tsx
│  ├─ themed-text.tsx
│  ├─ themed-view.tsx
│  └─ ui
│     ├─ auth-input.tsx
│     ├─ collapsible.tsx
│     ├─ gradient-button.tsx
│     ├─ icon-symbol.ios.tsx
│     └─ icon-symbol.tsx
├─ constants
│  └─ theme.ts
├─ eslint.config.js
├─ global.css
├─ hooks
│  ├─ use-auth.ts
│  ├─ use-color-scheme.ts
│  ├─ use-color-scheme.web.ts
│  ├─ use-i18n.ts
│  ├─ use-signup-flow.ts
│  └─ use-theme-color.ts
├─ metro.config.js
├─ nativewind-env.d.ts
├─ package-lock.json
├─ package.json
├─ README.md
├─ scripts
│  └─ reset-project.js
├─ servisec
│  └─ exchageServices
│     ├─ ConvertCurrency.ts
│     └─ Currency.ts
├─ src
│  ├─ features
│  │  ├─ requests
│  │  │  ├─ components
│  │  │  │  └─ RequestCard.tsx
│  │  │  ├─ hooks
│  │  │  │  └─ useMoneyRequests.ts
│  │  │  ├─ requests-feature.md
│  │  │  └─ screens
│  │  │     └─ RequestsScreen.tsx
│  │  └─ transfer
│  │     ├─ components
│  │     │  ├─ AmountInput.tsx
│  │     │  ├─ CategoryPicker.tsx
│  │     │  ├─ ConfirmBottomSheet.tsx
│  │     │  ├─ SegmentedControl.tsx
│  │     │  ├─ UserPicker.tsx
│  │     │  └─ WalletPicker.tsx
│  │     ├─ hooks
│  │     │  ├─ useAllUsers.ts
│  │     │  ├─ useContactUsers.ts
│  │     │  ├─ useRequestMoney.ts
│  │     │  ├─ useSendMoney.ts
│  │     │  └─ useUserWallets.ts
│  │     ├─ screens
│  │     │  └─ MakeTransactionScreen.tsx
│  │     ├─ services
│  │     │  └─ transferService.ts
│  │     ├─ transfer-feature.md
│  │     └─ types
│  │        └─ index.ts
│  ├─ firebaseConfig.js
│  ├─ i18n
│  │  ├─ transferTranslations.ts
│  │  └─ translations.ts
│  ├─ providers
│  │  ├─ AuthProvider.tsx
│  │  ├─ FeaturesProvider.tsx
│  │  ├─ LanguageProvider.tsx
│  │  ├─ SignupFlowProvider.tsx
│  │  └─ ThemeModeProvider.tsx
│  └─ services
│     ├─ auth.service.ts
│     ├─ cloudinary.service.ts
│     ├─ test.service.js
│     └─ user.service.ts
├─ tailwind.config.js
└─ tsconfig.json

```
