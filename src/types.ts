export type IdeaCategory = 'Food' | 'Stay' | 'Beach' | 'Nightlife' | 'Culture' | 'Adventure' | 'Shopping' | 'Photo Spot' | 'Relax' | 'Other';

export type IdeaPriority = 'Must-do' | 'Maybe' | 'Skip';

export type TripIdea = {
  id: string;
  title: string;
  note?: string;
  link?: string;
  category: IdeaCategory;
  tags: string[];
  priority: IdeaPriority;
  imageUrl?: string;
};

export type TripDraft = {
  id: string;
  title: string;
  subtitle: string;
  heroImage: string;
  tags: string[];
  pace: 'Relaxed' | 'Balanced' | 'Packed';
  companionType: 'Solo' | 'Couple' | 'Friends' | 'Family' | 'Group';
  ideas: TripIdea[];
};

export type VotePrompt = 'exciting' | 'easy' | 'commit' | 'memorable' | 'groupFit' | 'regret';

export type VoteAnswer = {
  prompt: VotePrompt;
  tripId: string;
  reaction?: string;
  dealbreaker?: string;
  commitment: number;
};
