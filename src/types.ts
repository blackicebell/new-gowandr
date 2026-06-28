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

export type MatchupResultSummary = {
  matchupName: string;
  groupMatch: number;
  summary: string;
  decidedAt: string;
};

export type PlanChecklistItem = {
  id: string;
  title: string;
  done: boolean;
  category?: string;
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
  finalPlan?: boolean;
  planStartDate?: string;
  planEndDate?: string;
  planCompletedAt?: string;
  latestMatchupResult?: MatchupResultSummary;
  planChecklist?: PlanChecklistItem[];
};

export type VotePrompt = 'exciting' | 'easy' | 'mood' | 'commit' | 'memorable' | 'groupFit' | 'regret';

export type VoteAnswer = {
  prompt: VotePrompt;
  tripId: string;
  reaction?: string;
  dealbreaker?: string;
  commitment: number;
  reason?: string;
  voterName?: string;
};

export type MatchupSession = {
  id: string;
  matchupName: string;
  trips: TripDraft[];
  createdAt: string;
  updatedAt: string;
  ownerDeviceId?: string;
  votes: VoteAnswer[][];
};
