import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const OWNER_DEVICE_ID_KEY = 'gowandr:ownerDeviceId';
const COMPARISON_BROWSER_ID_KEY = 'gowandr:comparisonBrowserId';

export async function getOwnerDeviceId() {
  return getPersistentId(OWNER_DEVICE_ID_KEY, 'owner');
}

export async function getComparisonBrowserId() {
  return getPersistentId(COMPARISON_BROWSER_ID_KEY, 'browser');
}

async function getPersistentId(key: string, prefix: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    const saved = window.localStorage.getItem(key);
    if (saved) return saved;
    const next = createId(prefix);
    window.localStorage.setItem(key, next);
    return next;
  }

  const saved = await AsyncStorage.getItem(key);
  if (saved) return saved;
  const next = createId(prefix);
  await AsyncStorage.setItem(key, next);
  return next;
}

function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
