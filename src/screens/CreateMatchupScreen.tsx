import React, { useMemo, useState } from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../components/Button';
import { buildMatchupShareUrl, createMatchupSession, isSharedVotingConfigured } from '../backend/matchupSessions';
import { scoreMatchup } from '../logic/matchupScore';
import { colors, font } from '../theme/colors';
import { MatchupSession, TripDraft } from '../types';
import { shareMatchupInvite } from '../utils/shareCards';

export function CreateMatchupScreen({
  trips,
  ownedSessions,
  ownedSessionsLoading,
  onBack,
  onStart,
  onSessionCreated,
  onRefreshSessions,
  onOpenSessionResults,
}: {
  trips: TripDraft[];
  ownedSessions: MatchupSession[];
  ownedSessionsLoading: boolean;
  onBack: () => void;
  onStart: (tripIds: string[], matchupName: string) => void;
  onSessionCreated: (sessionId: string) => void;
  onRefreshSessions: () => void;
  onOpenSessionResults: (sessionId: string) => void;
}) {
  const initialSelected = trips.slice(0, Math.min(2, trips.length)).map((trip) => trip.id);
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const selectedTrips = useMemo(() => trips.filter((trip) => selected.includes(trip.id)), [selected, trips]);
  const availableTrips = useMemo(() => trips.filter((trip) => !selected.includes(trip.id)), [selected, trips]);
  const [shareState, setShareState] = useState<'idle' | 'creating' | 'missingConfig'>('idle');

  const toggleTrip = (tripId: string) => {
    setSelected((current) => {
      if (current.includes(tripId)) return current.filter((id) => id !== tripId);
      if (current.length >= 4) return current;
      return [...current, tripId];
    });
  };

  const inviteFriends = async () => {
    if (selectedTrips.length < 2) return;
    if (!isSharedVotingConfigured()) {
      setShareState('missingConfig');
      await shareMatchupInvite('Weekend Escape', selectedTrips);
      return;
    }

    setShareState('creating');
    try {
      const sessionId = await createMatchupSession('Weekend Escape', selectedTrips);
      setShareState('idle');
      if (!sessionId) {
        await shareMatchupInvite('Weekend Escape', selectedTrips);
        return;
      }
      onSessionCreated(sessionId);
      await shareMatchupInvite('Weekend Escape', selectedTrips, buildMatchupShareUrl(sessionId));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Firebase error.';
      console.warn('GoWandr shared voting setup failed:', message);
      setShareState('missingConfig');
      await shareMatchupInvite('Weekend Escape', selectedTrips);
    }
  };

  if (trips.length < 2) {
    return (
      <View>
        <Text style={styles.back} onPress={onBack}>Back home</Text>
        <Text style={styles.title}>Choose Your Trip</Text>
        <Text style={styles.body}>You need at least two trip ideas before comparing.</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Start with one more option.</Text>
          <Text style={styles.emptyBody}>Comparison works best when you can feel the difference between two possible trips.</Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.back} onPress={onBack}>Back home</Text>
      <Text style={styles.title}>Choose Your Trip</Text>
      <Text style={styles.body}>Pick 2 to 4 trip notebooks. You will see the highlights first, then answer four quick questions.</Text>

      <VotingInbox sessions={ownedSessions} loading={ownedSessionsLoading} onRefresh={onRefreshSessions} onOpenResults={onOpenSessionResults} />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Selected Trips</Text>
        <Text style={styles.sectionCount}>{selectedTrips.length}/4</Text>
      </View>
      <View style={styles.list}>
        {selectedTrips.map((trip) => (
          <TripCompareCard key={trip.id} trip={trip} active onPress={() => toggleTrip(trip.id)} />
        ))}
      </View>

      {!!availableTrips.length && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Trip Ideas</Text>
            <Text style={styles.sectionCount}>{availableTrips.length}</Text>
          </View>
          <View style={styles.list}>
            {availableTrips.map((trip) => (
              <TripCompareCard key={trip.id} trip={trip} active={false} disabled={selected.length >= 4} onPress={() => toggleTrip(trip.id)} />
            ))}
          </View>
        </>
      )}

      <View style={styles.sharePreview}>
        <Text style={styles.previewLabel}>Shareable vote</Text>
        <Text style={styles.previewTitle}>Want friends to weigh in?</Text>
        <Text style={styles.previewBody}>Send them the same highlight-first voting link. No login needed, and their answers come back here.</Text>
      </View>
      <Text style={styles.compareHint}>{selected.length < 2 ? 'Choose at least 2 trips to compare.' : `Comparing ${selected.length} of 4 possible trips.`}</Text>
      {shareState === 'missingConfig' && (
        <Text style={styles.shareConfigHint}>Shared voting is not ready yet, so this sends a manual prompt for now.</Text>
      )}
      <View style={styles.actions}>
        <Button label="Start Deciding" disabled={selected.length < 2} onPress={() => onStart(selected, 'Weekend Escape')} />
        <Button label={shareState === 'creating' ? 'Creating Link...' : 'Share with Friends'} variant="secondary" disabled={selected.length < 2 || shareState === 'creating'} onPress={inviteFriends} />
      </View>
    </View>
  );
}

function VotingInbox({
  sessions,
  loading,
  onRefresh,
  onOpenResults,
}: {
  sessions: MatchupSession[];
  loading: boolean;
  onRefresh: () => void;
  onOpenResults: (sessionId: string) => void;
}) {
  if (!sessions.length && !loading) {
    return (
      <View style={styles.inboxEmpty}>
        <View style={styles.inboxHeader}>
          <View>
            <Text style={styles.inboxLabel}>Voting inbox</Text>
            <Text style={styles.inboxTitle}>No shared votes yet</Text>
          </View>
        </View>
        <Text style={styles.inboxBody}>When you invite people, their responses will show here so you can decide with the full picture.</Text>
      </View>
    );
  }

  return (
    <View style={styles.inbox}>
      <View style={styles.inboxHeader}>
        <View>
          <Text style={styles.inboxLabel}>Voting inbox</Text>
          <Text style={styles.inboxTitle}>{loading ? 'Checking for responses...' : `${sessions.length} shared ${sessions.length === 1 ? 'matchup' : 'matchups'}`}</Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshPill}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.inboxList}>
        {sessions.slice(0, 3).map((session) => (
          <VotingInboxCard key={session.id} session={session} onOpenResults={() => onOpenResults(session.id)} />
        ))}
      </View>
    </View>
  );
}

function VotingInboxCard({ session, onOpenResults }: { session: MatchupSession; onOpenResults: () => void }) {
  const voteBatches = session.votes ?? [];
  const votes = voteBatches.flat();
  const hasVotes = votes.length > 0;
  const leader = hasVotes ? scoreMatchup(session.trips, votes)[0] : undefined;
  const updated = formatSessionDate(session.updatedAt);

  return (
    <View style={styles.inboxCard}>
      <View style={styles.inboxCardTop}>
        <View style={styles.inboxCardCopy}>
          <Text style={styles.inboxCardTitle}>{session.matchupName}</Text>
          <Text style={styles.inboxCardMeta}>{voteBatches.length} {voteBatches.length === 1 ? 'response' : 'responses'} / updated {updated}</Text>
        </View>
        <View style={[styles.responseBadge, hasVotes && styles.responseBadgeActive]}>
          <Text style={styles.responseBadgeText}>{voteBatches.length}</Text>
        </View>
      </View>
      <Text style={styles.inboxCardBody}>{leader ? `${leader.trip.title} is leading right now.` : 'Waiting for the first response.'}</Text>
      <TouchableOpacity disabled={!hasVotes} onPress={onOpenResults} style={[styles.resultsButton, !hasVotes && styles.resultsButtonDisabled]}>
        <Text style={[styles.resultsButtonText, !hasVotes && styles.resultsButtonTextDisabled]}>{hasVotes ? 'View results' : 'No votes yet'}</Text>
      </TouchableOpacity>
    </View>
  );
}

function TripCompareCard({ trip, active, disabled, onPress }: { trip: TripDraft; active: boolean; disabled?: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity disabled={disabled && !active} key={trip.id} onPress={onPress} style={[styles.tripRow, active && styles.tripRowActive, disabled && !active && styles.tripRowDisabled]}>
      <ImageBackground source={{ uri: trip.heroImage }} style={styles.thumb} imageStyle={styles.thumbImage}>
        {active && (
          <View style={styles.checkBadge}>
            <Text style={styles.checkBadgeText}>OK</Text>
          </View>
        )}
      </ImageBackground>
      <View style={styles.rowCopy}>
        <Text style={styles.tripTitle}>{trip.title}</Text>
        <View style={styles.metaChips}>
          {getMetaChips(trip).map((chip) => (
            <View key={chip} style={styles.metaChip}>
              <Text style={styles.metaChipText}>{chip}</Text>
            </View>
          ))}
        </View>
      </View>
      <Text style={[styles.check, active && styles.checkActive]}>{active ? 'Included' : selectedActionLabel(disabled)}</Text>
    </TouchableOpacity>
  );
}

function selectedActionLabel(disabled?: boolean) {
  return disabled ? 'Max 4' : '+ Compare';
}

function getMetaChips(trip: TripDraft) {
  const tags = trip.tags.map((tag) => tag.toLowerCase());
  const chips = [
    tags.includes('beach') ? 'Beach' : tags.includes('food') ? 'Food' : tags.includes('culture') ? 'Culture' : tags.includes('relax') ? 'Reset' : tags.includes('nightlife') ? 'Nightlife' : capitalize(trip.tags[0] ?? 'Travel'),
    trip.pace,
  ];
  return chips.slice(0, 3);
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatSessionDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'recently';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  back: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '600', paddingVertical: 10 },
  title: { color: colors.charcoal, fontFamily: font.heading, fontWeight: '700', fontSize: 36, lineHeight: 43, letterSpacing: -0.4 },
  body: { color: colors.muted, fontFamily: font.body, fontWeight: '400', fontSize: 16, lineHeight: 23, marginTop: 8, marginBottom: 22 },
  inbox: { borderRadius: 26, padding: 18, backgroundColor: 'rgba(255,255,255,0.82)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)', shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 3, marginBottom: 22 },
  inboxEmpty: { borderRadius: 24, padding: 18, backgroundColor: 'rgba(255,255,255,0.64)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.06)', marginBottom: 22 },
  inboxHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  inboxLabel: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '700', fontSize: 11, textTransform: 'uppercase' },
  inboxTitle: { color: colors.charcoal, fontFamily: font.heading, fontWeight: '700', fontSize: 20, lineHeight: 25, marginTop: 4, letterSpacing: -0.2 },
  inboxBody: { color: colors.muted, fontFamily: font.body, fontSize: 14, lineHeight: 20, marginTop: 10 },
  refreshPill: { minHeight: 38, borderRadius: 19, paddingHorizontal: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(168,240,212,0.44)', borderWidth: 1, borderColor: 'rgba(47,175,138,0.16)' },
  refreshText: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '700', fontSize: 12 },
  inboxList: { gap: 10, marginTop: 14 },
  inboxCard: { borderRadius: 20, padding: 14, backgroundColor: 'rgba(255,255,255,0.82)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)' },
  inboxCardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  inboxCardCopy: { flex: 1 },
  inboxCardTitle: { color: colors.charcoal, fontFamily: font.heading, fontWeight: '700', fontSize: 17, letterSpacing: -0.12 },
  inboxCardMeta: { color: colors.muted, fontFamily: font.body, fontSize: 12.5, lineHeight: 17, marginTop: 3 },
  responseBadge: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(32,38,35,0.06)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.08)' },
  responseBadgeActive: { backgroundColor: '#A8F0D4', borderColor: 'rgba(47,175,138,0.22)' },
  responseBadgeText: { color: '#173A33', fontFamily: font.semibold, fontWeight: '700', fontSize: 14 },
  inboxCardBody: { color: colors.muted, fontFamily: font.body, fontSize: 14, lineHeight: 20, marginTop: 10 },
  resultsButton: { marginTop: 12, minHeight: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#A8F0D4' },
  resultsButtonDisabled: { backgroundColor: 'rgba(32,38,35,0.06)' },
  resultsButtonText: { color: '#173A33', fontFamily: font.semibold, fontWeight: '700', fontSize: 13 },
  resultsButtonTextDisabled: { color: 'rgba(32,38,35,0.42)' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, marginTop: 4 },
  sectionTitle: { color: colors.charcoal, fontFamily: font.heading, fontWeight: '700', fontSize: 20, letterSpacing: -0.2 },
  sectionCount: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '700', fontSize: 12 },
  list: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 22 },
  tripRow: { width: '48%', minHeight: 196, gap: 11, padding: 10, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.84)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.06)', shadowColor: '#000', shadowOpacity: 0.055, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 2 },
  tripRowActive: { borderWidth: 2, borderColor: '#2FAF8A', backgroundColor: 'rgba(255,255,255,0.92)', shadowColor: '#2FAF8A', shadowOpacity: 0.14, shadowRadius: 16, elevation: 4 },
  tripRowDisabled: { opacity: 0.48 },
  thumb: { width: '100%', height: 98, borderRadius: 17, overflow: 'hidden' },
  thumbImage: { borderRadius: 17 },
  checkBadge: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#A8F0D4', borderWidth: 1, borderColor: 'rgba(255,255,255,0.78)' },
  checkBadgeText: { color: '#173A33', fontFamily: font.semibold, fontWeight: '700', fontSize: 10 },
  rowCopy: { flex: 1 },
  tripTitle: { color: colors.charcoal, fontFamily: font.heading, fontWeight: '700', fontSize: 16, lineHeight: 20, letterSpacing: -0.12 },
  metaChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 7 },
  metaChip: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: 'rgba(168,240,212,0.30)', borderWidth: 1, borderColor: 'rgba(47,175,138,0.12)' },
  metaChipText: { color: '#173A33', fontFamily: font.semibold, fontWeight: '700', fontSize: 10.5 },
  check: { color: 'rgba(32,38,35,0.62)', fontFamily: font.semibold, fontWeight: '700', fontSize: 12 },
  checkActive: { color: '#137D68' },
  sharePreview: { backgroundColor: colors.charcoal, borderRadius: 26, padding: 20, marginBottom: 14 },
  previewLabel: { color: '#A8F0D4', fontFamily: font.semibold, fontWeight: '700', fontSize: 11, textTransform: 'uppercase' },
  previewTitle: { color: colors.white, fontFamily: font.heading, fontWeight: '700', fontSize: 24, marginTop: 5 },
  previewBody: { color: 'rgba(248,248,246,0.80)', fontFamily: font.body, fontWeight: '400', fontSize: 14, lineHeight: 21, marginTop: 8 },
  compareHint: { color: colors.muted, fontFamily: font.semibold, fontWeight: '600', fontSize: 13, textAlign: 'center', marginBottom: 10 },
  shareConfigHint: { color: colors.tealDark, fontFamily: font.body, fontWeight: '500', fontSize: 13, lineHeight: 18, textAlign: 'center', marginTop: -2, marginBottom: 10 },
  actions: { gap: 10, marginBottom: 28 },
  emptyState: { borderRadius: 26, padding: 20, backgroundColor: 'rgba(255,255,255,0.82)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)', marginTop: 16 },
  emptyTitle: { color: colors.charcoal, fontFamily: font.heading, fontWeight: '700', fontSize: 22 },
  emptyBody: { color: colors.muted, fontFamily: font.body, fontSize: 15, lineHeight: 22, marginTop: 8 },
});
