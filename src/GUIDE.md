# Clan Fitness Mobile — project guide

Native (Expo/React Native) client for Clan Fitness. Same users, same backend as the web app
(`clan-fitness` repo) — this app talks to it over a new `/api/v1/**` REST layer rather than
duplicating any business logic or touching Postgres directly. The web app and Android TWA keep
running unchanged; this is an additional client, not a replacement.

## Why this exists

Users kept asking for automatic device step tracking. The existing Android app is a Trusted Web
Activity — a thin browser wrapper with zero custom native code — so it structurally cannot reach
Health Connect (Android) or HealthKit (iOS). That requires an actual native app, which is what this
repo is.

## Structure

```
app/                    # Expo Router routes — thin screens only, compose features/components
  (auth)/               # sign-in, reachable only when signed out
  (app)/                # tab shell, reachable only when signed in — mirrors web's BottomNav
src/
  features/<name>/      # one folder per feature (auth, check-ins, clans, clan-chat,
                         # clan-contracts, comments, reactions, feed, system-posts, goals,
                         # notifications, profile) — each with components/, hooks/, services/,
                         # types/, and a barrel index.ts. Same feature names as the web repo.
  components/
    ui/                  # primitive controls used by 2+ features
    shared/              # composed components used by 2+ features
  services/              # cross-feature API client (src/services/api-client.ts)
  styles/
    tokens.ts             # single source of truth for every color/font — see below
  hooks/                 # app-wide hooks (cross-feature)
  types/                 # truly shared types only
```

Import direction is one-way: `app/** → features/** → components/services/utils`. Import through a
feature's `index.ts`, never a deep path into another feature.

## Design tokens — no hardcoded values

Every color/font is defined once in `src/styles/tokens.ts`, ported from the web app's
`src/app/globals.css` brand palette (not a redesign). `tailwind.config.js` reads that same file for
NativeWind's theme, so `bg-background`/`text-accent`-style classes resolve to it — and anywhere
NativeWind can't reach (status bar, splash screen, SVG fill props) imports the same constants
directly. Never hardcode a hex/px value at the call site — add it to `tokens.ts` first.

## Auth

`@clerk/expo` (same Clerk project as web — same users/sessions). Client calls
`useAuth().getToken()` and sends `Authorization: Bearer <token>` on every API request; the
Next.js backend's `auth()` (`src/lib/current-user.ts`'s `getOrSyncCurrentUser()` in the web repo)
verifies it — no separate auth system. Route protection uses Expo Router's `Stack.Protected` dual
guard in the root `_layout.tsx`: `(app)` only when signed in, `(auth)` only when signed out.

Note: `@clerk/expo`'s `useSignIn()`/`useSignUp()` use the newer "Future" API
(`signIn.password({...})` → `{ error }`, then `signIn.finalize()` to activate the session) —
not the older `create()`/`setActive()` shape shown in some older examples. Check
`node_modules/@clerk/shared/dist/types/signInFuture.d.ts` if in doubt; the types are the ground
truth here since docs/examples can lag a fast-moving SDK.

## Build order

0. **Foundations** (done) — Clerk auth, tab shell, tokens/NativeWind wiring, and a `/api/v1/me`
   spike proving the Bearer-token auth path end-to-end.
1. **Core loop** — Logs screen (gym/steps/food/thought) and Clan feed, the two screens people
   open daily.
2. **Social** — comments, reactions, clan chat (same 2s-poll model the web app uses), member
   profiles.
3. **Clans management** — create/join/manage/leaderboard/settings, onboarding/welcome.
4. **Contracts** — board + claim flow.
5. **Notifications** — Expo push token registration (both platforms via `expo-server-sdk`) + the
   in-app notification list.
6. **Device step data** — the actual payoff for going native: `react-native-health-connect`
   (Android) and a HealthKit module (iOS), both feeding the same check-in upsert logic manual
   entry already uses.

Deliberately staying web-only: the marketing landing page and the `/admin` dashboard — no
native-app benefit for either.

Run `/react-best-practices` over new screens/components at the end of each phase rather than
saving cleanup for one pass at the end.

## Distribution

No Google Play Console or Apple Developer account yet — both platforms are sideload-only during
development. Full detail lives in the technical planning doc this guide was distilled from.
