import { Share } from 'react-native';
import { MatchupResult } from '../logic/matchupScore';
import { TripDraft, TripIdea } from '../types';

function topIdeaLines(ideas: TripIdea[], fallback = 'Save a few must-dos first.') {
  const topIdeas = ideas.filter((idea) => idea.priority === 'Must-do').slice(0, 3);
  if (!topIdeas.length) return fallback;
  return topIdeas.map((idea, index) => `${index + 1}. ${idea.title}`).join('\n');
}

export function shareTripCard(trip: TripDraft, photoUri?: string) {
  return Share.share({
    url: photoUri ?? trip.heroImage,
    message: `${trip.title}\n${trip.subtitle}\n\nTop must-dos:\n${topIdeaLines(trip.ideas)}\n\nMade with GoWandr.`,
  }).catch(() => undefined);
}

export function shareTripPlan(trip: TripDraft, pace: TripDraft['pace'], topIdeas: TripIdea[]) {
  return Share.share({
    message: `${trip.title} plan\nPace: ${pace}\n\nTop must-dos:\n${topIdeaLines(topIdeas, 'Choose one anchor to start.')}\n\nMade with GoWandr.`,
  }).catch(() => undefined);
}

export function shareMatchupInvite(matchupName: string, trips: TripDraft[]) {
  const tripList = trips.map((trip, index) => `${index + 1}. ${trip.title}`).join('\n');
  return Share.share({
    message: `Help pick the GoWandr trip for ${matchupName}.\n\n${tripList}\n\nReply in this chat with your pick, why it wins, and any concern. No login needed.`,
  }).catch(() => undefined);
}

export function shareMatchupResult(matchupName: string, winner: MatchupResult, groupMatch: number, explanation: string) {
  return Share.share({
    message: `GoWandr matchup result for ${matchupName}:\n\nWinner: ${winner.trip.title}\n${groupMatch}% group match\n\n${explanation}\n\nNext step: move the winner into Trip Lab and plan the must-dos.`,
  }).catch(() => undefined);
}
