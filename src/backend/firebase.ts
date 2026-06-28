import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';

type FirebaseRuntime = {
  app: FirebaseApp;
  db: Firestore;
};

function getEnvValue(key: string) {
  return process.env[key];
}

export function hasFirebaseConfig() {
  return Boolean(
    getEnvValue('EXPO_PUBLIC_FIREBASE_API_KEY') &&
      getEnvValue('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN') &&
      getEnvValue('EXPO_PUBLIC_FIREBASE_PROJECT_ID') &&
      getEnvValue('EXPO_PUBLIC_FIREBASE_APP_ID'),
  );
}

export function getFirebaseRuntime(): FirebaseRuntime | undefined {
  if (!hasFirebaseConfig()) return undefined;

  const app = getApps().length
    ? getApp()
    : initializeApp({
        apiKey: getEnvValue('EXPO_PUBLIC_FIREBASE_API_KEY'),
        authDomain: getEnvValue('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
        projectId: getEnvValue('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
        storageBucket: getEnvValue('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
        messagingSenderId: getEnvValue('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
        appId: getEnvValue('EXPO_PUBLIC_FIREBASE_APP_ID'),
      });

  return { app, db: getFirestore(app) };
}
