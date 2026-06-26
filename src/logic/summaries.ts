import { TripDraft } from '../types';

export function getEchoSummary(trip: TripDraft) {
  const tags = trip.tags.join(' ');
  const categories = trip.ideas.map((idea) => idea.category);
  const foodCount = categories.filter((category) => category === 'Food').length;
  const nightlifeCount = categories.filter((category) => category === 'Nightlife').length;
  const mustDoCount = trip.ideas.filter((idea) => idea.priority === 'Must-do').length;

  if (foodCount >= 2 && nightlifeCount >= 1) return 'This trip is shaping up as a food and nightlife weekend.';
  if (tags.includes('romantic') || tags.includes('relax')) return 'This feels more like a reset trip than a packed group itinerary.';
  if (mustDoCount > 4) return 'You have a lot of must-dos. Pick the top 3 first so this stays fun.';
  if (tags.includes('beach') && tags.includes('nightlife')) return 'This draft is balancing beach time with bigger going-out energy.';
  if (foodCount >= 2) return 'Food is clearly becoming the main reason this trip works.';
  return 'This draft has a clear enough direction to compare against another trip.';
}
