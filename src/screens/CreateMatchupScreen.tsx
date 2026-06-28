import React, { useMemo, useRef, useState } from 'react';
import { Alert, Image, ImageBackground, Modal, Platform, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient';
import { captureRef } from 'react-native-view-shot';
import { Button } from '../components/Button';
import { buildMatchupShareUrl, createMatchupSession, isSharedVotingConfigured } from '../backend/matchupSessions';
import { explainResult, scoreMatchup } from '../logic/matchupScore';
import { colors, font } from '../theme/colors';
import { MatchupSession, TripDraft } from '../types';
import { shareMatchupInvite, shareMatchupResult } from '../utils/shareCards';

export function CreateMatchupScreen({
  trips,
  ownedSessions,
  ownedSessionsLoading,
  onBack,
  onStart,
  onSessionCreated,
  onRefreshSessions,
  onOpenSessionResults,
  onDeleteSession,
}: {
  trips: TripDraft[];
  ownedSessions: MatchupSession[];
  ownedSessionsLoading: boolean;
  onBack: () => void;
  onStart: (tripIds: string[], matchupName: string) => void;
  onSessionCreated: (sessionId: string) => void;
  onRefreshSessions: () => void;
  onOpenSessionResults: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
}) {
  const initialSelected = trips.slice(0, Math.min(2, trips.length)).map((trip) => trip.id);
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const selectedTrips = useMemo(() => trips.filter((trip) => selected.includes(trip.id)), [selected, trips]);
  const availableTrips = useMemo(() => trips.filter((trip) => !selected.includes(trip.id)), [selected, trips]);
  const [shareState, setShareState] = useState<'idle' | 'creating' | 'missingConfig'>('idle');
  const [sharePreview, setSharePreview] = useState<SharePreviewState | undefined>();
  const shareCardRef = useRef<View>(null);

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
      setSharePreview({ url: buildMatchupShareUrl('preview-only'), trips: selectedTrips, matchupName: 'Weekend Escape', previewOnly: true });
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
      setSharePreview({ url: buildMatchupShareUrl(sessionId), trips: selectedTrips, matchupName: 'Weekend Escape' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Firebase error.';
      console.warn('GoWandr shared voting setup failed:', message);
      setShareState('missingConfig');
      setSharePreview({ url: buildMatchupShareUrl('preview-only'), trips: selectedTrips, matchupName: 'Weekend Escape', previewOnly: true });
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
      <Text style={styles.body}>Pick 2 to 4 trip drafts, then create a lightweight link so friends can share what pulls them.</Text>

      <VotingInbox sessions={ownedSessions} loading={ownedSessionsLoading} onRefresh={onRefreshSessions} onOpenResults={onOpenSessionResults} onDeleteSession={onDeleteSession} />

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
        <Text style={styles.previewLabel}>Get a read</Text>
        <Text style={styles.previewTitle}>Want another perspective?</Text>
        <Text style={styles.previewBody}>Send a highlight-first link. Friends choose the trip that pulls them most, leave a quick reason, and skip the login.</Text>
      </View>
      <Text style={styles.compareHint}>{selected.length < 2 ? 'Choose at least 2 trips to compare.' : `Comparing ${selected.length} of 4 possible trips.`}</Text>
      {shareState === 'missingConfig' && (
        <Text style={styles.shareConfigHint}>Shared links need Firebase running. You can still preview and share the graphic.</Text>
      )}
      <View style={styles.actions}>
        <Button label={shareState === 'creating' ? 'Creating Link...' : 'Create Share Link'} disabled={selected.length < 2 || shareState === 'creating'} onPress={inviteFriends} />
        <Button label="Preview Yourself" variant="secondary" disabled={selected.length < 2} onPress={() => onStart(selected, 'Weekend Escape')} />
      </View>
      <ShareLinkCardModal
        preview={sharePreview}
        cardRef={shareCardRef}
        onClose={() => setSharePreview(undefined)}
      />
    </View>
  );
}

type SharePreviewState = {
  url: string;
  trips: TripDraft[];
  matchupName: string;
  previewOnly?: boolean;
};

function ShareLinkCardModal({
  preview,
  cardRef,
  onClose,
}: {
  preview?: SharePreviewState;
  cardRef: React.RefObject<View | null>;
  onClose: () => void;
}) {
  const [shareStatus, setShareStatus] = useState<string | undefined>();
  if (!preview) return null;
  const leadTrip = preview.trips[0];

  const copyLink = async () => {
    if (preview.previewOnly) return;
    await Clipboard.setStringAsync(preview.url);
    setShareStatus('Link copied.');
  };

  const shareLink = async () => {
    if (preview.previewOnly) return;
    await shareMatchupInvite(preview.matchupName, preview.trips, preview.url);
  };

  const shareGraphic = async () => {
    try {
      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
        result: Platform.OS === 'web' ? 'data-uri' : 'tmpfile',
      });

      if (Platform.OS === 'web') {
        downloadDataUri(uri, `${preview.matchupName.replace(/\s+/g, '-').toLowerCase()}-gowandr-read.png`);
        setShareStatus('Graphic downloaded.');
        return;
      }

      const available = await Sharing.isAvailableAsync();
      if (!available) {
        await Share.share({ message: preview.url });
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share GoWandr card',
      });
    } catch (error) {
      setShareStatus('Could not share the graphic yet. The link still works.');
      await Share.share({ message: preview.url }).catch(() => undefined);
    }
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View ref={cardRef} collapsable={false} style={styles.shareCardCanvas}>
            <ImageBackground source={{ uri: leadTrip.heroImage }} style={styles.shareGraphic} imageStyle={styles.shareGraphicImage}>
              <View style={styles.shareGraphicShade} />
              <View style={styles.shareLogoPill}>
                <Image source={require('../../assets/brand/gowandr-logo-full-color.png')} style={styles.shareLogo} resizeMode="contain" />
              </View>
              <View style={styles.shareGraphicTop}>
                <Text style={styles.shareGraphicKicker}>GOWANDR GET A READ</Text>
                <Text style={styles.shareGraphicCount}>{preview.trips.length} trip ideas</Text>
              </View>
              <View style={styles.shareGraphicCopy}>
                <Text style={styles.shareGraphicTitle}>Which trip pulls you most?</Text>
                <Text style={styles.shareGraphicBody}>{preview.trips.map((trip) => trip.title).join(' / ')}</Text>
              </View>
              <LinearGradient colors={['#A8F0D4', '#6ED8B5', '#2FAF8A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.shareGraphicButton}>
                <Text style={styles.shareGraphicButtonText}>Share input with GoWandr</Text>
              </LinearGradient>
            </ImageBackground>
          </View>
          <Text style={styles.modalTitle}>Share card ready</Text>
          <Text style={styles.modalBody}>
            {preview.previewOnly
              ? 'This is a visual preview. Restart the local web server with Firebase env loaded to create working links.'
              : 'Send the link for the working comparison, or share the graphic when you want something more social.'}
          </Text>
          {!!shareStatus && <Text style={styles.modalStatus}>{shareStatus}</Text>}
          <View style={styles.modalActions}>
            <Button label="Share Graphic" onPress={shareGraphic} />
            <Button label={preview.previewOnly ? 'Share Link Needs Firebase' : 'Share Link'} variant="secondary" disabled={preview.previewOnly} onPress={shareLink} />
            <Button label={preview.previewOnly ? 'Copy Link Needs Firebase' : 'Copy Link'} variant="secondary" disabled={preview.previewOnly} onPress={copyLink} />
            <TouchableOpacity onPress={onClose} style={styles.closeModalButton}>
              <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function downloadDataUri(dataUri: string, filename: string) {
  if (typeof document === 'undefined') return;
  const link = document.createElement('a');
  link.href = dataUri;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function VotingInbox({
  sessions,
  loading,
  onRefresh,
  onOpenResults,
  onDeleteSession,
}: {
  sessions: MatchupSession[];
  loading: boolean;
  onRefresh: () => void;
  onOpenResults: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
}) {
  if (!sessions.length && !loading) {
    return (
      <View style={styles.inboxEmpty}>
        <View style={styles.inboxHeader}>
          <View>
            <Text style={styles.inboxLabel}>Input inbox</Text>
            <Text style={styles.inboxTitle}>No shared input yet</Text>
          </View>
        </View>
        <Text style={styles.inboxBody}>When friends answer a shared link, their input will show here so you can see what has momentum.</Text>
      </View>
    );
  }

  return (
    <View style={styles.inbox}>
      <View style={styles.inboxHeader}>
        <View>
          <Text style={styles.inboxLabel}>Input inbox</Text>
          <Text style={styles.inboxTitle}>{loading ? 'Checking for input...' : `${sessions.length} shared ${sessions.length === 1 ? 'read' : 'reads'}`}</Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshPill}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.inboxList}>
        {sessions.slice(0, 3).map((session) => (
          <VotingInboxCard key={session.id} session={session} onOpenResults={() => onOpenResults(session.id)} onDelete={() => onDeleteSession(session.id)} />
        ))}
      </View>
    </View>
  );
}

function VotingInboxCard({ session, onOpenResults, onDelete }: { session: MatchupSession; onOpenResults: () => void; onDelete: () => void }) {
  const voteBatches = session.votes ?? [];
  const responses = session.responses ?? [];
  const votes = voteBatches.flat();
  const hasVotes = votes.length > 0 || responses.length > 0;
  const results = hasVotes ? scoreMatchup(session.trips, votes) : [];
  const responseLeader = getResponseLeader(session);
  const leader = responseLeader ?? results[0];
  const updated = formatSessionDate(session.updatedAt);
  const confidence = leader ? Math.max(62, Math.min(94, Math.round(72 + ('score' in leader ? leader.score / 8 : 10)))) : 0;
  const shareResults = () => {
    if (!leader) return;
    if ('score' in leader) shareMatchupResult(session.matchupName, leader, confidence, explainResult(results));
    else shareMatchupResult(session.matchupName, { trip: leader.trip, score: leader.count, excitement: leader.count, easyYes: leader.count, commitment: leader.count, dealbreakers: 0 }, confidence, `${leader.trip.title} has the strongest momentum right now.`);
  };
  const confirmDelete = () => {
    Alert.alert('Delete comparison?', 'This removes the saved comparison and its responses from your inbox.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <View style={styles.inboxCard}>
      <View style={styles.inboxCardTop}>
        <View style={styles.inboxCardCopy}>
          <Text style={styles.inboxCardTitle}>{session.matchupName}</Text>
          <Text style={styles.inboxCardMeta}>{responses.length || voteBatches.length} {(responses.length || voteBatches.length) === 1 ? 'response' : 'responses'} / updated {updated}</Text>
        </View>
        <View style={[styles.responseBadge, hasVotes && styles.responseBadgeActive]}>
          <Text style={styles.responseBadgeText}>{responses.length || voteBatches.length}</Text>
        </View>
      </View>
      <Text style={styles.inboxCardBody}>{leader ? `${leader.trip.title} has the strongest momentum right now.` : 'Waiting for the first response.'}</Text>
      <View style={styles.inboxActions}>
        <TouchableOpacity onPress={onOpenResults} style={styles.resultsButton}>
          <Text style={styles.resultsButtonText}>{hasVotes ? 'Review input' : 'Open details'}</Text>
        </TouchableOpacity>
        {hasVotes && (
          <TouchableOpacity onPress={shareResults} style={styles.secondaryInboxButton}>
            <Text style={styles.secondaryInboxButtonText}>Share</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={confirmDelete} style={styles.deleteSessionButton}>
          <Text style={styles.deleteSessionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function getResponseLeader(session: MatchupSession) {
  const responses = session.responses ?? [];
  if (!responses.length) return undefined;
  const trips = session.trips;
  const counts = new Map<string, number>();
  responses.forEach((response) => counts.set(response.selectedTripId, (counts.get(response.selectedTripId) ?? 0) + 1));
  const sorted = trips
    .map((trip) => ({ trip, count: counts.get(trip.id) ?? 0 }))
    .sort((a, b) => b.count - a.count);
  return sorted[0]?.count ? sorted[0] : undefined;
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
  inboxActions: { gap: 8, marginTop: 12 },
  resultsButton: { minHeight: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#A8F0D4' },
  resultsButtonText: { color: '#173A33', fontFamily: font.semibold, fontWeight: '700', fontSize: 13 },
  secondaryInboxButton: { minHeight: 40, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.74)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)' },
  secondaryInboxButtonText: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '700', fontSize: 13 },
  deleteSessionButton: { minHeight: 36, alignItems: 'center', justifyContent: 'center' },
  deleteSessionText: { color: '#B84A3F', fontFamily: font.semibold, fontWeight: '600', fontSize: 13 },
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,17,21,0.34)', justifyContent: 'center', padding: 18 },
  modalSheet: { maxWidth: 520, width: '100%', alignSelf: 'center', borderRadius: 30, padding: 16, backgroundColor: 'rgba(248,250,249,0.96)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.82)', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 30, shadowOffset: { width: 0, height: 14 }, elevation: 10 },
  shareCardCanvas: { backgroundColor: '#E4F8F0', borderRadius: 28, overflow: 'hidden' },
  shareGraphic: { minHeight: 520, justifyContent: 'space-between', borderRadius: 28, overflow: 'hidden', padding: 18 },
  shareGraphicImage: { borderRadius: 28 },
  shareGraphicShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.34)' },
  shareLogoPill: { alignSelf: 'flex-start', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.94)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.74)' },
  shareLogo: { width: 112, height: 28 },
  shareGraphicTop: { marginTop: 36 },
  shareGraphicKicker: { color: '#A8F0D4', fontFamily: font.semibold, fontWeight: '800', fontSize: 12, letterSpacing: 0.3 },
  shareGraphicCount: { color: 'rgba(255,255,255,0.88)', fontFamily: font.body, fontWeight: '500', fontSize: 14, marginTop: 6 },
  shareGraphicCopy: { marginTop: 'auto', marginBottom: 18 },
  shareGraphicTitle: { color: colors.white, fontFamily: font.heading, fontWeight: '700', fontSize: 42, lineHeight: 46, letterSpacing: -0.6, textShadowColor: 'rgba(0,0,0,0.28)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 },
  shareGraphicBody: { color: 'rgba(255,255,255,0.88)', fontFamily: font.body, fontWeight: '500', fontSize: 16, lineHeight: 22, marginTop: 12 },
  shareGraphicButton: { minHeight: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  shareGraphicButtonText: { color: '#173A33', fontFamily: font.semibold, fontWeight: '800', fontSize: 15 },
  modalTitle: { color: colors.charcoal, fontFamily: font.heading, fontWeight: '700', fontSize: 23, letterSpacing: -0.2, marginTop: 16 },
  modalBody: { color: colors.muted, fontFamily: font.body, fontSize: 14.5, lineHeight: 21, marginTop: 5 },
  modalStatus: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '700', fontSize: 13, textAlign: 'center', marginTop: 10 },
  modalActions: { gap: 9, marginTop: 14 },
  closeModalButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  closeModalText: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '700', fontSize: 14 },
});
