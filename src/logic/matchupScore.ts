import { TripDraft, VoteAnswer } from '../types';
import { calculateClarityScore } from './clarityScore';
import { getPaceHealth } from './tripPace';

export type MatchupResult = {
  trip: TripDraft;
  score: number;
  commitment: number;
  dealbreakers: number;
  easyYes: number;
  excitement: number;
};

export function scoreMatchup(trips: TripDraft[], votes: VoteAnswer[]): MatchupResult[] {
  return trips
    .map((trip) => {
      const tripVotes = votes.filter((vote) => vote.tripId === trip.id);
      const excitement = tripVotes.filter((vote) => vote.prompt === 'exciting' || vote.prompt === 'memorable').length;
      const ease = tripVotes.filter((vote) => vote.prompt === 'easy' || vote.prompt === 'groupFit').length;
      const commitment = tripVotes.reduce((sum, vote) => sum + vote.commitment, 0);
      const dealbreakers = tripVotes.filter((vote) => vote.dealbreaker).length;
      const budgetConcern = tripVotes.filter((vote) => vote.dealbreaker === 'Too expensive' || vote.dealbreaker === 'Budget check' || vote.dealbreaker === 'Needs budget check').length;
      const easyYes = tripVotes.filter((vote) => ['Easy yes', "I'm in", 'Everyone can go', 'Fits budget', 'Dates work', 'Ready to plan'].includes(vote.reaction ?? '')).length;
      const mustDos = trip.ideas.filter((idea) => idea.priority === 'Must-do').length;
      const clarity = calculateClarityScore(trip).score / 10;
      const paceRisk = getPaceHealth(trip).tone === 'warning' ? 8 : 0;
      const lowCommitPackedRisk = trip.pace === 'Packed' && commitment < 8 ? 6 : 0;
      const score = excitement * 12 + ease * 14 + commitment * 6 + easyYes * 8 + mustDos * 2 + clarity - dealbreakers * 10 - budgetConcern * 8 - paceRisk - lowCommitPackedRisk;

      return { trip, score: Math.round(score), commitment, dealbreakers, easyYes, excitement };
    })
    .sort((a, b) => b.score - a.score);
}

export function explainResult(results: MatchupResult[]) {
  const winner = results[0];
  const runnerUp = results[1];

  if (!runnerUp) return `${winner.trip.title} is the clearest choice so far.`;
  if (winner.dealbreakers < runnerUp.dealbreakers && winner.commitment >= runnerUp.commitment) {
    return `${winner.trip.title} is the easiest yes. It has stronger commitment and fewer concerns.`;
  }
  if (winner.excitement > runnerUp.excitement && winner.dealbreakers > runnerUp.dealbreakers) {
    return `${winner.trip.title} is the most exciting, but check the concerns before committing.`;
  }
  return `${winner.trip.title} has the best balance of excitement, realism, and actual commitment.`;
}
