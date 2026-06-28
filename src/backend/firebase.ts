import { FirebaseApp, getApp, getApps, initializeApp } from '@firebase/app';
import { Firestore, getFirestore } from '@firebase/firestore';

type FirebaseRuntime = {
  app: FirebaseApp;
  db: Firestore;
};

const firebaseConfigFallbacks: Record<string, string> = {
  EXPO_PUBLIC_FIREBASE_API_KEY: 'AIzaSyDPTCoBTz8MhB-0bVeM7pRWkhMY1XI3UJ0',
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: 'gowandr2.firebaseapp.com',
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: 'gowandr2',
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: 'gowandr2.firebasestorage.app',
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '26451125080',
  EXPO_PUBLIC_FIREBASE_APP_ID: '1:26451125080:web:8e9f5bb78f4fba17497b2d',
};

function getEnvValue(key: string) {
  return process.env[key] || firebaseConfigFallbacks[key];
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
