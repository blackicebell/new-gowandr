# GoWandr Backend Setup

GoWandr is local-first, but shared comparisons need a tiny backend so friends can open a link, give input without login, and send answers back to the trip owner.

## What Is Wired

- Firebase Web SDK is installed.
- Firestore comparison sessions are supported through `src/backend/matchupSessions.ts`.
- Create Share Link creates a Firestore document under `comparisons/{comparisonId}` when Firebase env keys are present.
- Shared links use `/c/:comparisonId`.
- Friends can open the link, review highlights, pick the trip that pulls them most, and submit input without creating an account.
- If Firebase or Firestore is not ready, the app shows a share-card preview but disables working link actions.
- Created session IDs are saved locally on the owner's device.
- Compare includes Previous Comparisons, showing shared reads, response counts, the current leader, review results, share results, and delete actions.

## Firebase Setup

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
EXPO_PUBLIC_PUBLIC_APP_URL=http://localhost:8104
```

For Firebase Hosting:

```bash
EXPO_PUBLIC_PUBLIC_APP_URL=https://gowandr2.web.app
```

## Firestore

Create a Firestore database, then publish the rules in `firestore.rules`.

If the app shows "Shared links need Firebase running" after you tap Create Share Link, the app cannot create a Firestore document yet. Usually one of these is true:

- Firebase env vars are missing from the current build or dev server.
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

The MVP collections are:

```txt
comparisons/{comparisonId}
comparisons/{comparisonId}/responses/{responseId}
```

Each comparison stores:

- `matchupName`
- `trips`
- `responses`
- `createdAt`
- `updatedAt`
- `expiresAt`
- `status`

## Deploy Web Route And Rules

The public comparison page is the same Expo web app deployed to Firebase Hosting. Firebase Hosting rewrites all paths to `index.html`, so `/c/:comparisonId` works.

From this repo:

```bash
npm run export:web
npx firebase-tools deploy --only firestore:rules,hosting
```

For a production export, make sure `EXPO_PUBLIC_PUBLIC_APP_URL` is set to the hosted domain before exporting:

```powershell
$env:EXPO_PUBLIC_PUBLIC_APP_URL='https://gowandr2.web.app'
npm run export:web
npx firebase-tools deploy --only firestore:rules,hosting
```

## EAS Builds

EAS cloud builds do not automatically use the local `.env` on your computer. The app now tells EAS which environment bucket to use:

- `development` profile -> EAS `development` environment
- `preview` profile -> EAS `preview` environment
- `production` profile -> EAS `production` environment

Add the Firebase values to every environment you plan to build from. For internal Android testing, use `preview`. For TestFlight or App Store builds, use `production`.

```bash
npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_FIREBASE_API_KEY --value "<firebase api key>"
npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN --value "gowandr2.firebaseapp.com"
npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_FIREBASE_PROJECT_ID --value "gowandr2"
npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET --value "gowandr2.firebasestorage.app"
npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --value "<messaging sender id>"
npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_FIREBASE_APP_ID --value "<firebase app id>"
npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_PUBLIC_APP_URL --value "https://gowandr2.web.app"
```

Repeat the same commands with `--environment production` before making a TestFlight build.

Use `Plain text` visibility for `EXPO_PUBLIC_` values. These are public client config values, but they still should not be committed to source files.

To check local setup before building:

```bash
npm run check:firebase
```

## Important Next Backend Step

The app can create share links, receive friend input, and show returned responses in the owner's Previous Comparisons inbox.

The next production backend step is making session ownership stronger:

- Add anonymous auth so sessions are tied to a stable owner identity.
- Restrict update/delete access more tightly in Firestore rules.
- Add expiration cleanup for old sessions.
- Optionally add real-time listeners so the inbox updates without tapping Refresh.
