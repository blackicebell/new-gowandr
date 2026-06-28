import { addDoc, arrayUnion, collection, deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from '@firebase/firestore';
import { getFirebaseRuntime, hasFirebaseConfig } from './firebase';
import { MatchupSession, TripDraft, VoteAnswer } from '../types';

const MATCHUP_SESSIONS_COLLECTION = 'matchupSessions';

export function isSharedVotingConfigured() {
  return hasFirebaseConfig();
}

export function buildMatchupShareUrl(sessionId: string) {
  const baseUrl = process.env.EXPO_PUBLIC_PUBLIC_APP_URL || 'http://localhost:8099';
  return `${baseUrl.replace(/\/$/, '')}?matchup=${encodeURIComponent(sessionId)}`;
}

export async function createMatchupSession(matchupName: string, trips: TripDraft[]) {
  const runtime = getFirebaseRuntime();
  if (!runtime) return undefined;

  const now = new Date().toISOString();
  const payload = {
    matchupName,
    trips: trips.map(stripTripForSession),
    createdAt: now,
    updatedAt: now,
    createdAtServer: serverTimestamp(),
    votes: [],
  };
  const sessionRef = await addDoc(collection(runtime.db, MATCHUP_SESSIONS_COLLECTION), payload);
  return sessionRef.id;
}

export async function loadMatchupSession(sessionId: string): Promise<MatchupSession | undefined> {
  const runtime = getFirebaseRuntime();
  if (!runtime) return undefined;

  const snapshot = await getDoc(doc(runtime.db, MATCHUP_SESSIONS_COLLECTION, sessionId));
  if (!snapshot.exists()) return undefined;
  const data = snapshot.data() as Omit<MatchupSession, 'id'>;
  return {
    id: snapshot.id,
    matchupName: data.matchupName,
    trips: data.trips,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    ownerDeviceId: data.ownerDeviceId,
    votes: data.votes ?? [],
  };
}

export async function submitMatchupVotes(sessionId: string, votes: VoteAnswer[]) {
  const runtime = getFirebaseRuntime();
  if (!runtime) return false;

  await updateDoc(doc(runtime.db, MATCHUP_SESSIONS_COLLECTION, sessionId), {
    votes: arrayUnion(votes),
    updatedAt: new Date().toISOString(),
  });
  return true;
}

export async function deleteMatchupSession(sessionId: string) {
  const runtime = getFirebaseRuntime();
  if (!runtime) return false;

  await deleteDoc(doc(runtime.db, MATCHUP_SESSIONS_COLLECTION, sessionId));
  return true;
}

function stripTripForSession(trip: TripDraft): TripDraft {
  // Voting only needs the comparison brief. Keep prep data private to the owner's device.
  const {
    finalPlan: _finalPlan,
    planStartDate: _planStartDate,
    planEndDate: _planEndDate,
    planCompletedAt: _planCompletedAt,
    latestMatchupResult: _latestMatchupResult,
    planChecklist: _planChecklist,
    ...votingTrip
  } = trip;

  return removeUndefinedDeep(votingTrip) as TripDraft;
}

function removeUndefinedDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(removeUndefinedDeep);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entryValue]) => entryValue !== undefined)
        .map(([key, entryValue]) => [key, removeUndefinedDeep(entryValue)]),
    );
  }

  return value;
}
