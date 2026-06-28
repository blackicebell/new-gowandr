import { TripDraft } from '../types';
import { starterImageUris } from './imageAssets';

export const demoTrips: TripDraft[] = [
  {
    id: 'miami',
    title: 'Miami Birthday',
    subtitle: 'Beach days, rooftops, and a group-ready celebration.',
    heroImage: starterImageUris.coast,
    tags: ['beach', 'nightlife', 'friends', 'celebration', 'active'],
    pace: 'Packed',
    companionType: 'Friends',
    ideas: [
      idea('miami-1', 'Rooftop dinner', 'Nightlife', 'Must-do', ['friends', 'luxury'], 'Dress-up dinner before going out.', 'https://www.tiktok.com/@gowandr/video/7350000000000000000'),
      idea('miami-2', 'Beach day', 'Beach', 'Must-do', ['beach', 'chill'], 'Keep one afternoon totally open.', 'https://www.instagram.com/p/C7gowandr-demo/'),
      idea('miami-3', 'Wynwood photos', 'Photo Spot', 'Maybe', ['culture', 'friends'], 'Good daytime group moment.', 'https://www.youtube.com/watch?v=gowandrDemo01'),
      idea('miami-4', 'Night out', 'Nightlife', 'Must-do', ['active', 'nightlife'], 'The birthday anchor.', 'https://www.timeout.com/miami/nightlife'),
      idea('miami-5', 'Brunch spot', 'Food', 'Maybe', ['food'], 'Easy recovery morning.'),
    ],
  },
  {
    id: 'new-orleans',
    title: 'New Orleans Weekend',
    subtitle: 'Food, music, and an easier yes for the whole group.',
    heroImage: starterImageUris.nightOut,
    tags: ['food', 'music', 'culture', 'friends', 'low-key'],
    pace: 'Balanced',
    companionType: 'Friends',
    ideas: [
      idea('nola-1', 'Live jazz night', 'Nightlife', 'Must-do', ['music', 'culture'], 'Pick a spot that does not require a huge plan.'),
      idea('nola-2', 'French Quarter walk', 'Culture', 'Maybe', ['walking', 'culture'], 'Good first-day energy.'),
      idea('nola-3', 'Beignets', 'Food', 'Must-do', ['food', 'low-key'], 'Simple, iconic, low effort.'),
      idea('nola-4', 'Garden District', 'Photo Spot', 'Maybe', ['walking', 'photo spot'], 'Pretty daytime option.'),
      idea('nola-5', 'Food crawl', 'Food', 'Must-do', ['food', 'friends'], 'The trip is basically about this.'),
    ],
  },
  {
    id: 'jamaica',
    title: 'Jamaica Reset',
    subtitle: 'Warm, slow, romantic, and clearly a real reset.',
    heroImage: starterImageUris.island,
    tags: ['beach', 'romantic', 'relax', 'warm', 'dream trip'],
    pace: 'Relaxed',
    companionType: 'Couple',
    ideas: [
      idea('jamaica-1', 'Beach resort day', 'Beach', 'Must-do', ['beach', 'relax'], 'No rushing. That is the point.'),
      idea('jamaica-2', 'Sunset dinner', 'Food', 'Must-do', ['romantic', 'food'], 'Make this the memory.'),
      idea('jamaica-3', 'Waterfall visit', 'Adventure', 'Maybe', ['active', 'nature'], 'Only if it does not eat the whole day.'),
      idea('jamaica-4', 'Spa morning', 'Relax', 'Maybe', ['relax', 'luxury'], 'Good premium upgrade.'),
      idea('jamaica-5', 'Slow breakfast', 'Food', 'Must-do', ['low-key'], 'Protect the slow mornings.'),
    ],
  },
  {
    id: 'mexico-city',
    title: 'Mexico City Food Trip',
    subtitle: 'Culture, walking, markets, and a trip built around taste.',
    heroImage: starterImageUris.food,
    tags: ['food', 'culture', 'city', 'walking', 'adventure'],
    pace: 'Balanced',
    companionType: 'Group',
    ideas: [
      idea('cdmx-1', 'Taco crawl', 'Food', 'Must-do', ['food', 'walking'], 'The obvious centerpiece.'),
      idea('cdmx-2', 'Museum day', 'Culture', 'Maybe', ['culture'], 'Give it a calm afternoon.'),
      idea('cdmx-3', 'Park walk', 'Relax', 'Maybe', ['walking', 'low-key'], 'Good between meals.'),
      idea('cdmx-4', 'Rooftop drinks', 'Nightlife', 'Maybe', ['nightlife'], 'Fun without making it a party trip.'),
      idea('cdmx-5', 'Market visit', 'Shopping', 'Must-do', ['food', 'culture'], 'Easy shared adventure.'),
    ],
  },
];

function idea(id: string, title: string, category: TripDraft['ideas'][number]['category'], priority: TripDraft['ideas'][number]['priority'], tags: string[], note: string, link?: string) {
  return { id, title, category, priority, tags, note, link };
}
