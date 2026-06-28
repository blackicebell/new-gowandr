import { TripDraft } from '../types';

export const paceGuidance: Record<TripDraft['pace'], { label: string; short: string; detail: string; idealMustDos: number; dailyAnchors: string; warningAt: number }> = {
  Relaxed: {
    label: 'Relaxed',
    short: 'More open time, fewer plans.',
    detail: 'Best when the trip should feel easy, restful, or romantic. Keep only the plans that truly matter.',
    idealMustDos: 2,
    dailyAnchors: '1 main plan per day',
    warningAt: 4,
  },
  Balanced: {
    label: 'Balanced',
    short: 'A few anchors with room to breathe.',
    detail: 'Best when the trip needs structure without feeling overplanned. Choose clear anchors, but leave space for slow mornings and changes.',
    idealMustDos: 3,
    dailyAnchors: '2 main plans per day',
    warningAt: 6,
  },
  Packed: {
    label: 'Packed',
    short: 'High-energy, more planned moments.',
    detail: 'Best when the trip should feel full and high-energy. It can be fun, but only if the commitment is real.',
    idealMustDos: 5,
    dailyAnchors: '3 main plans per day',
    warningAt: 8,
  },
};

export function getPaceHealth(trip: TripDraft, pace: TripDraft['pace'] = trip.pace) {
  const guidance = paceGuidance[pace];
  const mustDos = trip.ideas.filter((idea) => idea.priority === 'Must-do').length;
  const totalIdeas = trip.ideas.length;

  if (mustDos === 0) {
    return {
      tone: 'empty' as const,
      message: `For a ${pace.toLowerCase()} trip, start by choosing ${guidance.idealMustDos} top ${guidance.idealMustDos === 1 ? 'highlight' : 'highlights'}.`,
    };
  }

  if (mustDos > guidance.warningAt) {
    return {
      tone: 'warning' as const,
      message: `${pace} pace works best with about ${guidance.idealMustDos} top highlights. You have ${mustDos}, so this may start feeling like homework.`,
    };
  }

  if (pace === 'Relaxed' && totalIdeas > 8) {
    return {
      tone: 'warning' as const,
      message: 'This is set to relaxed, but there are a lot of saved ideas. Move extras into backup so the trip still feels calm.',
    };
  }

  if (pace === 'Packed' && mustDos < 3) {
    return {
      tone: 'nudge' as const,
      message: 'Packed trips need more clear anchors. Add a few highlights so this does not become vague energy.',
    };
  }

  return {
    tone: 'good' as const,
    message: `${pace} looks realistic here. Aim for ${guidance.dailyAnchors.toLowerCase()} and keep the rest as backups.`,
  };
}

export function getPaceScoreAdjustment(trip: TripDraft) {
  const health = getPaceHealth(trip);
  if (health.tone === 'warning') return -8;
  if (health.tone === 'nudge') return -3;
  if (health.tone === 'good') return 5;
  return 0;
}
