# LinkGen - Capstone Project (Stage 1)

LinkGen is our capstone mobile app project focused on reducing elderly loneliness in Hong Kong by building meaningful intergenerational connections between verified elderly users and verified youth users.

## Why We Built LinkGen

Many elderly people in Hong Kong experience social isolation, limited mobility, and reduced access to everyday support. At the same time, many young people want to help but do not have a structured, trusted way to connect.

LinkGen is designed to close this gap:
- Elderly users can request practical in-person help and join community activities.
- Youth users can discover requests/events, match, and chat directly.
- The long-term goal is safer, culturally aware, community-based support.

## Stage 1 Prototype Goals

This first stage validates the core product flow:
1. Role-aware experience (`youth` vs `elderly`)
2. Youth swipe discovery for tasks/events
3. Elderly-friendly request posting flow
4. Match creation and basic chat
5. Translation-ready chat interaction (mock translation in Stage 1)
6. Demo-ready fake/sample data
7. **Full UI localization** (English, Traditional Chinese, Simplified Chinese) so navigation, forms, alerts, and demo content follow the user’s selected language

## Languages (i18n)

The app stores a language preference with the auth profile (`en`, `zh-Hant`, `zh-Hans`). Changing language updates tab labels, screen copy, placeholders, categories, district names, and built-in sample tasks/events.

- Central strings live in `lib/i18n.ts`.
- Localized demo cards/pins are built in `lib/localizedSamples.ts`.
- **User-generated text** stored in Firestore (task titles, event descriptions, etc.) is shown as written; automatic translation of that content would require a separate product/backend approach.

## Current Features

- **Role-aware tabs**
  - Youth: Discover (swipe), Matches, Events, Chat, Profile, Map
  - Elderly: Help Requests, Community Events, Chat, Profile, New request
- **Discover (Youth)**
  - Toggle between Tasks and Events
  - Swipe right/left behavior with Firestore write
- **Events (Youth)**
  - Browse and register for community events (with capacity and optimistic join)
- **Matches (Youth)**
  - Displays matched tasks/events
- **Elderly Help Requests**
  - List own requests, create new request, delete request
- **Events (Elderly)**
  - List view (Firestore-backed, with localized fallbacks when empty)
- **Chat**
  - Firestore-backed messages + mock “Translate” action
- **Map Preview (Youth)**
  - Request locations shown in list format (lat/lng preview)

## Tech Stack

- Expo + React Native
- Expo Router
- Firebase Authentication + Firestore
- `react-native-deck-swipe`

## Project Structure

- `app/(tabs)/...` - main role-aware tab screens
- `app/auth.tsx` - login/signup and language selection
- `app/elderly/...` - elderly route aliases/redirects
- `store/authRole.tsx` - role, language, and auth bootstrap
- `lib/i18n.ts` - UI strings and label helpers
- `lib/localizedSamples.ts` - localized demo tasks/events/matches/map pins
- `hooks/useTranslation.ts` - translation hook (wraps auth context)
- `utils/firebase.ts` - Firebase initialization
- `scripts/seedData.ts` - seed script for demo data

## Local Setup

```bash
npm install
```

Create a `.env` file in the project root with your Firebase web config variables from the Firebase console. The `.env` file is gitignored.

```bash
npx expo start -c
```

## Seed Demo Data

```bash
npm run seed
```

This seeds:
- elderly/youth users
- tasks
- events
- sample match records

## Demo Flow (Stage 1)

1. Open app and sign in, or use **Profile** to switch role between youth and elderly
2. Set **Language** on the auth screen or in profile flow as needed
3. As youth: swipe right on Discover cards; open Events, Matches, and Chat
4. As elderly: create a help request and browse community events

## Stage 1 Notes

- Some features are intentionally simplified for prototype speed:
  - immediate matching after youth right-swipe
  - mock translation output
  - map shown as preview list without full native map rendering
- Production stages will add:
  - full verification workflows
  - true two-sided matching logic (e.g. embeddings / KNN on a backend)
  - robust translation API integration
  - richer safety and moderation controls

---

Capstone team project - LinkGen, Stage 1 prototype.
