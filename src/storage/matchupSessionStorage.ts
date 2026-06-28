import AsyncStorage from '@react-native-async-storage/async-storage';

const MATCHUP_SESSION_IDS_KEY = 'gowandr:ownedMatchupSessionIds';

export async function saveOwnedMatchupSessionIds(sessionIds: string[]) {
  await AsyncStorage.setItem(MATCHUP_SESSION_IDS_KEY, JSON.stringify(sessionIds));
}

export async function loadOwnedMatchupSessionIds() {
  const value = await AsyncStorage.getItem(MATCHUP_SESSION_IDS_KEY);
  if (!value) return [];
  return JSON.parse(value) as string[];
}
