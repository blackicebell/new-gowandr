# GoWandr Backend Setup

GoWandr is local-first, but shared voting needs a tiny backend so friends can open a link, vote without login, and send answers back to the trip owner.

## What is wired

- Firebase Web SDK is installed.
- Firestore sessions are supported through `src/backend/matchupSessions.ts`.
- Invite Friends creates a Firestore `matchupSessions` document when Firebase env keys are present.
- Shared links use `?matchup=<sessionId>`.
- Voters can open the link, answer the quiz, and submit votes without creating an account.
- If Firebase or Firestore is not ready, Invite Friends falls back to the manual text-share prompt.
- Created session IDs are saved locally on the owner's device.
- Compare includes a Voting Inbox that shows shared matchups, response counts, the current leader, and a View Results action.

## Firebase setup

1. Create a Firebase project.
2. Add a Web app inside that Firebase project.
3. Copy `.env.example` to `.env`.
4. Fill in:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=
EXPO_PUBLIC_PUBLIC_APP_URL=
```

For local web testing:

```bash
EXPO_PUBLIC_PUBLIC_APP_URL=http://localhost:8100
```

For production:

```bash
EXPO_PUBLIC_PUBLIC_APP_URL=https://your-production-domain.com
```

## Firestore

Create a Firestore database, then publish the rules in `firestore.rules`.

If the app shows “Shared voting is not ready yet” after you tap Invite Friends, the code can see your Firebase keys, but Firestore still needs one of these:

- Firestore Database has not been created yet.
- The database was created, but the rules from `firestore.rules` have not been published.
- The app needs a dev-server restart after changing `.env`.

From the Firebase console:

1. Go to Build -> Firestore Database.
2. Click Create database.
3. Choose Production mode.
4. Pick the default location.
5. Open the Rules tab.
6. Replace the rules with the contents of `firestore.rules`.
7. Click Publish.

The MVP collection is:

```txt
matchupSessions/{sessionId}
```

Each session stores:

- `matchupName`
- `trips`
- `votes`
- `createdAt`
- `updatedAt`

## Important next backend step

The app can create share links, receive voter submissions, and show returned responses in the owner's Voting Inbox.

The next production backend step is making session ownership stronger:

- add anonymous auth so sessions are tied to a stable owner identity
- restrict write access more tightly in Firestore rules
- add expiration or archival for old sessions
- optionally add real-time listeners so the inbox updates without tapping Refresh
