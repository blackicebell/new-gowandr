import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'gowandr:hasSeenOnboarding';

export async function loadHasSeenOnboarding() {
  const value = await AsyncStorage.getItem(ONBOARDING_KEY);
  return value === 'true';
}

export async function saveHasSeenOnboarding() {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
}
