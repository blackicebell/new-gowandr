import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeName } from '../theme/colors';

const THEME_KEY = 'gowandr:theme';

export async function loadThemeName() {
  const value = await AsyncStorage.getItem(THEME_KEY);
  if (value === 'green' || value === 'pink' || value === 'blue') return value;
  return 'green';
}

export async function saveThemeName(themeName: ThemeName) {
  await AsyncStorage.setItem(THEME_KEY, themeName);
}
