# Google Play: listing and Play Console answers

Everything to paste into Play Console for **Clan Fitness** (`in.clanfitness.app`). The answers
describe what the Android app actually does as of this commit. **Update them when it changes.**
Before adding push notifications, re-check the Data safety section: push tokens count as
"Device or other IDs".

Graphics are in [`graphics/`](graphics/); phone screenshots (1080 × 2160, from the demo clan) are in [`screenshots/`](screenshots/).

---

## 1. Create the app

| Field | Value |
|---|---|
| App name | Clan Fitness |
| Default language | English (United States) |
| App or game | App |
| Free or paid | Free |
| Declarations | Accept the Developer Program Policies and US export laws |

## 2. Store listing (Grow › Store presence › Main store listing)

**App name** (30 max): `Clan Fitness`

**Short description** (80 max, this is 68):

```
Log gym, steps and food with a small clan who notices when you skip.
```

**Full description** (4,000 max).

> ⚠️ **Play listings must match what the app does.** Lines marked with ⏳ describe features the
> Android app doesn't have yet (they work on the web/PWA). Remove those lines until the phase that
> adds them ships: social (reacting, commenting, chat), clans (nudges, weekly recap), contracts.

```
Clan Fitness is fitness accountability with your people. Join a small clan of friends, log your day in under a minute, and see who showed up.

LOG YOUR DAY
• Gym: mark your workout and add a note (push day, 5k run, leg day).
• Steps: fill them in from Health Connect, or type them in.
• Food: hit it, missed it, or partial, with an optional note (⏳ and photos).
• A thought for the day, if you have one.
Your weekly gym ring, streak and steps-to-goal sit at the top, so you always know where you stand.

YOUR CLAN SEES IT
• A shared feed of everyone's check-ins, grouped by day.
• ⏳ React with 🔥 👏 👎 and comment on each other's days.
• ⏳ Weekly recap: the Top 3 and the Wall of Shame.
• ⏳ Nudge the members who haven't logged yet.

STEPS FROM HEALTH CONNECT
Connect Health Connect and today's steps from Google Fit, Samsung Health, Fitbit and other apps are filled in on your Log screen. Nothing is posted to your clan until you tap Save.

⏳ LEVEL UP
Claim daily contracts, like 10k steps, beat your average, or a duel against a random clanmate, and earn points toward your level.

PRIVATE BY DESIGN
Your check-ins are shared only with the clans you join. No ads. Your data is never sold. Delete your account any time from your profile.

Clan Fitness also works on the web and as an installable app at clanfitness.in, with the same account.
```

**Graphics**

| Asset | File |
|---|---|
| App icon (512 × 512) | `graphics/store-icon-512.png` |
| Feature graphic (1024 × 500) | `graphics/feature-graphic-1024x500.png` |
| Phone screenshots (2 to 8; aspect ratio at most 2:1) | `screenshots/1-feed.png` … `5-profile.png` (1080 × 2160, demo clan only) |

**Categorization** (Store settings)

| Field | Value |
|---|---|
| App category | Health & Fitness |
| Tags | Fitness tracking, Workout tracker, Habit tracker (pick the closest available) |
| Email | yugeshr16@gmail.com |
| Website | https://www.clanfitness.in |
| Phone | Optional, leave blank |
| External marketing | Your choice |

## 3. App content (Policy and programs › App content)

### Privacy policy
`https://www.clanfitness.in/privacy`

### App access
**All or some functionality is restricted.** Add instructions:

- Name: `Reviewer account`
- Username: `yugeshr16+playreview@gmail.com`
- Password: *(kept out of the repo; it's with the app owner)*
- Other information:
  ```
  Sign in with the email and password above (not "Continue with Google"). The account is in a demo clan with sample check-ins, so the Feed, Log and Profile tabs have data. Health Connect is optional: on the Log screen, "Get steps from Health Connect" asks for read-only Steps access and fills in the Steps field; nothing is saved until you tap Save.
  ```

### Ads
**No**, the app does not contain ads.

### Content rating (IARC questionnaire)
- Email: yugeshr16@gmail.com
- Category: **Social or Communication** (users exchange messages and posts)
- Violence, fear, sexuality, language, controlled substances, gambling, crude humor: **No** to all
- Does the app allow users to interact or exchange content with other users? **Yes** (clan feed, comments, chat)
- Does the app share the user's current physical location with other users? **No**
- Does the app allow users to purchase digital goods? **No**
- Is the app a web browser or search engine? **No**

Expect a teen-or-older rating with a "Users Interact" descriptor.

### Target audience and content
- Target age groups: **18 and over** only (the privacy policy says 18+)
- Appeals to children: **No**

### News app
**No**

### COVID-19 contact tracing and status apps
**My app is not a publicly available COVID-19 contact tracing or status app**

### Government apps
**No**

### Financial features
**My app doesn't provide any financial features**

### Health apps
- Health features: **Activity and fitness** (activity tracking, workout logging, nutrition logging)
- It is **not** a medical device and doesn't diagnose or treat anything.

### Health Connect permissions (declaration form)
- Data type requested: **Steps: read** (no write, no other types)
- Justification:
  ```
  Clan Fitness is a fitness accountability app where users log their daily workout, steps and food. With the user's permission, the app reads today's step count from Health Connect only to pre-fill the Steps field on the daily Log screen, so the user doesn't have to type it. The value is only saved to the user's daily log when the user taps Save, and it is shared only with the clans the user has joined, as part of that check-in. The app does not read any other health data, does not write to Health Connect, and does not use Health Connect data for advertising or sell it.
  ```
- Privacy policy and Limited Use: covered at https://www.clanfitness.in/privacy (section "Steps from Health Connect").
- In-app rationale: Health Connect's "privacy policy" link opens the policy (handled in MainActivity).

### Data safety

**Overview**
| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **Yes** |
| Is all of the user data collected by your app encrypted in transit? | **Yes** |
| Do you provide a way for users to request that their data is deleted? | **Yes** |
| Account creation | The app lets users create an account (username/password and Google sign-in) |
| Delete account URL | `https://www.clanfitness.in/privacy#delete-account` |

**Data types.** All are *collected*, none *shared*. Service providers (Clerk, Neon, Vercel, Railway, Resend) don't count as sharing. None are processed ephemerally. None are used for advertising, marketing, analytics or fraud prevention.

| Category › Data type | Required or optional | Purposes |
|---|---|---|
| Personal info › Name | Required | App functionality, Account management |
| Personal info › Email address | Required | App functionality (notification emails), Account management |
| Personal info › User IDs | Required | App functionality, Account management |
| Personal info › Other info (date of birth, gender) | Optional | App functionality |
| Health and fitness › Health info (height, weight) | Optional | App functionality |
| Health and fitness › Fitness info (workouts, steps incl. from Health Connect, food logs) | Optional | App functionality |
| Messages › Other in-app messages (clan chat, comments) | Optional | App functionality |
| Photos and videos › Photos (food photos, profile photo) | Optional | App functionality |
| App activity › Other user-generated content (notes, daily thoughts, reactions) | Optional | App functionality |

**Not collected by the Android app:** location, contacts, financial info, web browsing, audio, files, calendar, device or other IDs, app info and performance (no crash reporting or analytics SDK in the app).

### Account deletion
Covered by the Data safety URL above, plus in-app deletion at Profile › Delete account.

## 4. Before the first release

1. ~~Demo/reviewer account~~: done. **Play Reviewer** (`yugeshr16+playreview@gmail.com`, username `playreviewer`) is the admin of the demo clan **Morning Movers**, with four demo members (Priya Sharma, Rahul Kapoor, Ananya Rao, Vikram Patel; emails `yugeshr16+demo1..4@gmail.com`, no passwords, notifications off) and sample check-ins, reactions, comments and chat from Oct 6 to 9, 2026. None of these accounts is in a real clan. Clerk's Client Trust (password sign-in email code on new devices) is **off** in production, so reviewers can sign in with just the password.
2. ~~Screenshots~~: done (`screenshots/`). Retake them from the demo account when the UI changes.
3. **Signed release bundle (AAB).** Create an upload key, kept outside the repo and backed up, build `bundleRelease`, and enrol in Play App Signing on first upload.
4. **Testing track.** Personal developer accounts created after November 2023 must run a **closed test with at least 12 testers for 14 days** before they can publish to production. Check whether that applies to your account (Play Console shows it on the Dashboard).
5. Upload to **Internal testing** first, install from the Play link on a real phone, and check sign-in, Health Connect and account deletion.
