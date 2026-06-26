import { TripDraft } from '../types';

export function calculateClarityScore(trip: TripDraft) {
  let score = 0;
  const reasons: string[] = [];
  const mustDos = trip.ideas.filter((idea) => idea.priority === 'Must-do').length;

  if (trip.title.trim().length > 2) score += 15;
  if (trip.ideas.length >= 3) score += 15;
  if (mustDos >= 1) score += 15;
  if (trip.tags.length >= 2 && trip.tags.length <= 6) score += 15;
  if (trip.companionType) score += 10;
  if (trip.pace) score += 10;

  if (mustDos >= 8) {
    score -= 10;
    reasons.push('Too many must-dos can turn this into homework.');
  }

  if (hasConflict(trip.tags, 'family', 'nightlife') || hasConflict(trip.tags, 'relax', 'packed')) {
    score -= 10;
    reasons.push('The vibe is split. Choose the trip you actually want this to be.');
  }

  if (mustDos >= 3) reasons.push('The strongest ideas are already visible.');
  if (trip.tags.includes('food')) reasons.push('Food is becoming a clear anchor.');
  if (trip.tags.includes('beach') && trip.tags.includes('nightlife')) reasons.push('This is split between beach reset and party energy.');

  return {
    score: Math.max(0, Math.min(100, score)),
    reasons: reasons.slice(0, 2),
  };
}

function hasConflict(tags: string[], left: string, right: string) {
  return tags.includes(left) && tags.includes(right);
}
