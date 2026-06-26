import AsyncStorage from '@react-native-async-storage/async-storage';
import { TripDraft } from '../types';

const TRIPS_KEY = 'gowandr:tripDrafts';

export async function saveTrips(trips: TripDraft[]) {
  await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
}

export async function loadTrips() {
  const value = await AsyncStorage.getItem(TRIPS_KEY);
  if (!value) return undefined;
  return JSON.parse(value) as TripDraft[];
}
