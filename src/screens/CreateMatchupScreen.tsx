import React, { useMemo, useState } from 'react';
import { Alert, ImageBackground, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
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
  const [flowStep, setFlowStep] = useState<'choose' | 'preparing' | 'decide' | 'intro' | 'curate'>('choose');
  const [showHistory, setShowHistory] = useState(false);
  const [includedHighlightIds, setIncludedHighlightIds] = useState<string[]>([]);

  const selectedTripNames = selectedTrips.map((trip) => trip.title).join(' / ');
  const eligibleHighlightIds = useMemo(
    () => selectedTrips.flatMap((trip) => trip.ideas.filter((idea) => idea.priority !== 'Skip').map((idea) => idea.id)),
    [selectedTrips],
  );

  const toggleTrip = (tripId: string) => {
    setSelected((current) => {
      if (current.includes(tripId)) return current.filter((id) => id !== tripId);
      if (current.length >= 4) return current;
      return [...current, tripId];
    });
  };

  const continueToDecision = () => {
    if (selectedTrips.length < 2) return;
    setFlowStep('preparing');
    setTimeout(() => setFlowStep('decide'), 520);
  };

  const startOwnComparison = () => {
    if (selectedTrips.length < 2) return;
    setFlowStep('intro');
  };

  const beginOwnComparison = () => {
    onStart(selected, 'Weekend Escape');
  };

  const openShareCuration = () => {
    if (selectedTrips.length < 2) return;
    setIncludedHighlightIds((current) => {
      const stillValid = current.filter((id) => eligibleHighlightIds.includes(id));
      return stillValid.length ? stillValid : eligibleHighlightIds;
    });
    setFlowStep('curate');
  };

  const toggleHighlight = (ideaId: string) => {
    setIncludedHighlightIds((current) => (current.includes(ideaId) ? current.filter((id) => id !== ideaId) : [...current, ideaId]));
  };

  const createCuratedShareLink = async () => {
    if (selectedTrips.length < 2) return;
    const curatedTrips = selectedTrips.map((trip) => ({
      ...trip,
      ideas: trip.ideas.filter((idea) => idea.priority !== 'Skip' && (includedHighlightIds.length === 0 || includedHighlightIds.includes(idea.id))),
    }));

    if (!isSharedVotingConfigured()) {
      setShareState('missingConfig');
      setSharePreview({ url: buildMatchupShareUrl('preview-only'), trips: curatedTrips, matchupName: 'Weekend Escape', previewOnly: true });
      return;
    }

    setShareState('creating');
    try {
      const sessionId = await createMatchupSession('Weekend Escape', curatedTrips);
      setShareState('idle');
      if (!sessionId) {
        await shareMatchupInvite('Weekend Escape', curatedTrips);
        return;
      }
      onSessionCreated(sessionId);
      setSharePreview({ url: buildMatchupShareUrl(sessionId), trips: curatedTrips, matchupName: 'Weekend Escape' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Firebase error.';
      console.warn('GoWandr shared voting setup failed:', message);
      setShareState('missingConfig');
      setSharePreview({ url: buildMatchupShareUrl('preview-only'), trips: curatedTrips, matchupName: 'Weekend Escape', previewOnly: true });
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

  if (flowStep === 'preparing') {
    return (
      <View style={styles.preparingScreen}>
        <View style={styles.preparingCard}>
          <Text style={styles.preparingLabel}>Preparing comparison</Text>
          <DecisionMatchupPreview trips={selectedTrips} compact />
          <Text style={styles.preparingBody}>Pulling your trip ideas into decision mode.</Text>
        </View>
      </View>
    );
  }

  if (flowStep === 'decide') {
    return (
      <View>
        <View style={styles.readyHeaderRow}>
          <Text style={styles.back} onPress={() => setFlowStep('choose')}>Back to trips</Text>
        </View>
        <Text style={styles.heroDecisionTitle}>You've narrowed it down.</Text>
        <Text style={styles.body}>Ready to decide? Choose privately, or get a read from people you trust.</Text>

        <DecisionMatchupPreview trips={selectedTrips} />

        <View style={styles.decidePanel}>
          <Text style={styles.decideLabel}>Decision mode</Text>
          <Text style={styles.decideTitle}>How do you want to choose?</Text>
          <Text style={styles.decideBody}>Two simple paths. Same goal: get closer to the trip you will actually take.</Text>
          <View style={styles.decideCards}>
            <DecisionChoiceCard
              icon="Private"
              badge="Quick / personal / no sharing"
              title="Help Me Decide"
              body="Answer four quick questions and discover which trip pulls you most."
              action="Start"
              tone="private"
              disabled={selected.length < 2}
              onPress={startOwnComparison}
            />
            <DecisionChoiceCard
              icon="People"
              badge="Collaborative / link-based"
              title="Get Opinions"
              body="Share the highlights with friends and see which trip builds the most momentum."
              action="Create Share Link"
              tone="social"
              disabled={selected.length < 2}
              onPress={openShareCuration}
            />
          </View>
        </View>
        <TouchableOpacity onPress={() => setShowHistory((current) => !current)} style={styles.pastReadsLink}>
          <Text style={styles.pastReadsLinkText}>{showHistory ? 'Hide past reads' : 'View past reads'}</Text>
        </TouchableOpacity>
        {showHistory && (
          <VotingInbox sessions={ownedSessions} loading={ownedSessionsLoading} onRefresh={onRefreshSessions} onOpenResults={onOpenSessionResults} onDeleteSession={onDeleteSession} />
        )}
        <ShareLinkModal preview={sharePreview} onClose={() => setSharePreview(undefined)} />
      </View>
    );
  }

  if (flowStep === 'intro') {
    return (
      <View>
        <Text style={styles.back} onPress={() => setFlowStep('decide')}>Back to decision</Text>
        <Text style={styles.heroDecisionTitle}>We'll compare these one decision at a time.</Text>
        <Text style={styles.body}>About 45 seconds. Private by default. No sharing unless you choose it.</Text>
        <DecisionMatchupPreview trips={selectedTrips} />
        <View style={styles.introCard}>
          <Text style={styles.introKicker}>What happens next</Text>
          <Text style={styles.introTitle}>You will answer a few quick feel-checks.</Text>
          <Text style={styles.introBody}>GoWandr uses your answers to show which trip has the strongest pull right now.</Text>
        </View>
        <Button label="Begin" onPress={beginOwnComparison} />
      </View>
    );
  }

  if (flowStep === 'curate') {
    return (
      <View>
        <Text style={styles.back} onPress={() => setFlowStep('decide')}>Back to decision</Text>
        <Text style={styles.title}>Choose what friends should see</Text>
        <Text style={styles.body}>Pick the highlights that make each trip easy to understand. You can keep this lightweight.</Text>

        <View style={styles.curationList}>
          {selectedTrips.map((trip) => (
            <View key={trip.id} style={styles.curationCard}>
              <View style={styles.curationTripHeader}>
                <ImageBackground source={{ uri: trip.heroImage }} style={styles.curationThumb} imageStyle={styles.curationThumbImage} />
                <View style={styles.curationTripCopy}>
                  <Text style={styles.curationTripTitle}>{trip.title}</Text>
                  <Text style={styles.curationTripMeta}>{getMetaChips(trip).join(' / ')}</Text>
                </View>
              </View>

              {trip.ideas.filter((idea) => idea.priority !== 'Skip').length ? (
                <View style={styles.highlightList}>
                  {trip.ideas.filter((idea) => idea.priority !== 'Skip').map((idea) => {
                    const active = includedHighlightIds.includes(idea.id);
                    return (
                      <TouchableOpacity key={idea.id} onPress={() => toggleHighlight(idea.id)} style={[styles.highlightChoice, active && styles.highlightChoiceActive]}>
                        <View style={[styles.highlightCheck, active && styles.highlightCheckActive]}>
                          <Text style={[styles.highlightCheckText, active && styles.highlightCheckTextActive]}>{active ? 'OK' : ''}</Text>
                        </View>
                        <View style={styles.highlightCopy}>
                          <Text style={styles.highlightTitle}>{idea.title}</Text>
                          <Text style={styles.highlightMeta}>{idea.category} / {idea.priority}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.noHighlightsText}>No highlights yet. Friends will still see the trip title, photo, mood, and pace.</Text>
              )}
            </View>
          ))}
        </View>

        <View style={styles.curationActions}>
          <Button
            label={shareState === 'creating' ? 'Creating link...' : 'Create Share Link'}
            disabled={shareState === 'creating'}
            onPress={createCuratedShareLink}
          />
          <TouchableOpacity onPress={() => setFlowStep('decide')} style={styles.textCancelButton}>
            <Text style={styles.textCancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
        {shareState === 'missingConfig' && (
          <Text style={styles.shareConfigHint}>Shared links need Firebase running before friends can open the comparison.</Text>
        )}
        <ShareLinkModal preview={sharePreview} onClose={() => setSharePreview(undefined)} />
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.back} onPress={onBack}>Back home</Text>
      <Text style={styles.title}>Choose Trips</Text>
      <Text style={styles.body}>Pick 2-4 trip drafts to compare.</Text>

      <View style={styles.searchBox}>
        <Text style={styles.searchText}>Search trip drafts</Text>
      </View>
      <View style={styles.filterRow}>
        {['All', 'Solo', 'Group', 'Ready'].map((filter) => (
          <View key={filter} style={styles.filterChip}>
            <Text style={styles.filterChipText}>{filter}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Trips in the Running</Text>
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
            <Text style={styles.sectionTitle}>More Trip Ideas</Text>
            <Text style={styles.sectionCount}>{availableTrips.length}</Text>
          </View>
          <View style={styles.list}>
            {availableTrips.map((trip) => (
              <TripCompareCard key={trip.id} trip={trip} active={false} disabled={selected.length >= 4} onPress={() => toggleTrip(trip.id)} />
            ))}
          </View>
        </>
      )}

      <View style={styles.selectionBar}>
        <View style={styles.selectionCopy}>
          <Text style={styles.selectionCount}>{selectedTrips.length} {selectedTrips.length === 1 ? 'Trip' : 'Trips'} Selected</Text>
          <Text style={styles.selectionNames} numberOfLines={1}>{selectedTrips.length === 2 ? selectedTrips.map((trip) => trip.title).join(' vs ') : selectedTripNames || 'Choose at least two trip ideas.'}</Text>
        </View>
        <TouchableOpacity disabled={selectedTrips.length < 2} onPress={continueToDecision} style={[styles.continueButton, selectedTrips.length < 2 && styles.continueButtonDisabled]}>
          <Text style={styles.continueButtonText}>Continue &gt;</Text>
        </TouchableOpacity>
      </View>
      <ShareLinkModal preview={sharePreview} onClose={() => setSharePreview(undefined)} />
    </View>
  );
}

type SharePreviewState = {
  url: string;
  trips: TripDraft[];
  matchupName: string;
  previewOnly?: boolean;
};

function DecisionChoiceCard({
  icon,
  badge,
  title,
  body,
  action,
  tone,
  disabled,
  onPress,
}: {
  icon: string;
  badge: string;
  title: string;
  body: string;
  action: string;
  tone: 'private' | 'social';
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity disabled={disabled} onPress={onPress} style={[styles.decisionCard, tone === 'social' && styles.decisionCardSocial, disabled && styles.decisionCardDisabled]}>
      <View style={[styles.decisionIcon, tone === 'social' && styles.decisionIconSocial]}>
        <Text style={[styles.decisionIconText, tone === 'social' && styles.decisionIconTextSocial]}>{icon}</Text>
      </View>
      <View style={styles.decisionCopy}>
        <Text style={styles.decisionBadge}>{badge}</Text>
        <Text style={styles.decisionTitle}>{title}</Text>
        <Text style={styles.decisionBody}>{body}</Text>
        <View style={[styles.decisionButton, tone === 'social' && styles.decisionButtonSocial]}>
          <Text style={[styles.decisionButtonText, tone === 'social' && styles.decisionButtonTextSocial]}>{action}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function DecisionMatchupPreview({ trips, compact }: { trips: TripDraft[]; compact?: boolean }) {
  if (trips.length === 2) {
    return (
      <View style={[styles.matchupPreview, compact && styles.matchupPreviewCompact]}>
        <MatchupTripLine trip={trips[0]} />
        <View style={styles.vsPill}>
          <Text style={styles.vsText}>VS</Text>
        </View>
        <MatchupTripLine trip={trips[1]} alignRight />
      </View>
    );
  }

  return (
    <View style={[styles.matchupPreview, compact && styles.matchupPreviewCompact]}>
      {trips.map((trip) => (
        <MatchupTripLine key={trip.id} trip={trip} />
      ))}
    </View>
  );
}

function MatchupTripLine({ trip, alignRight }: { trip: TripDraft; alignRight?: boolean }) {
  return (
    <View style={[styles.matchupTripLine, alignRight && styles.matchupTripLineRight]}>
      <ImageBackground source={{ uri: trip.heroImage }} style={styles.matchupThumb} imageStyle={styles.matchupThumbImage} />
      <View style={[styles.matchupTripCopy, alignRight && styles.matchupTripCopyRight]}>
        <Text style={styles.matchupTripTitle} numberOfLines={1}>{trip.title}</Text>
        <Text style={styles.matchupTripMeta} numberOfLines={1}>{getMetaChips(trip).join(' / ')}</Text>
      </View>
    </View>
  );
}

function ShareLinkModal({ preview, onClose }: { preview?: SharePreviewState; onClose: () => void }) {
  const [shareStatus, setShareStatus] = useState<string | undefined>();
  if (!preview) return null;

  const copyLink = async () => {
    if (preview.previewOnly) return;
    await Clipboard.setStringAsync(preview.url);
    setShareStatus('Link copied.');
  };

  const shareLink = async () => {
    if (preview.previewOnly) return;
    await shareMatchupInvite(preview.matchupName, preview.trips, preview.url);
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.liveLinkCard}>
            <View style={styles.liveIcon}>
              <Text style={styles.liveIconText}>GO</Text>
            </View>
            <Text style={styles.modalKicker}>Live comparison</Text>
            <Text style={styles.modalTitle}>Share this link for input.</Text>
            <Text style={styles.modalBody}>
              {preview.previewOnly
                ? 'Firebase is not available in this build yet, so this link is only a preview.'
                : 'Friends can open it, review the highlights, choose the trip that pulls them most, and leave a quick reason. No login needed.'}
            </Text>
            <Text style={styles.linkPreview} numberOfLines={1}>{preview.url}</Text>
          </View>
          {!!shareStatus && <Text style={styles.modalStatus}>{shareStatus}</Text>}
          <View style={styles.modalActions}>
            <Button label={preview.previewOnly ? 'Link needs Firebase' : 'Open share sheet'} disabled={preview.previewOnly} onPress={shareLink} />
            <Button label={preview.previewOnly ? 'Copy unavailable' : 'Copy link'} variant="secondary" disabled={preview.previewOnly} onPress={copyLink} />
            <TouchableOpacity onPress={onClose} style={styles.closeModalButton}>
              <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
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
            <Text style={styles.inboxLabel}>Previous comparisons</Text>
            <Text style={styles.inboxTitle}>No saved reads yet</Text>
          </View>
        </View>
        <Text style={styles.inboxBody}>Create a working share link to save a comparison here. Previewing it yourself does not create a saved read.</Text>
      </View>
    );
  }

  return (
    <View style={styles.inbox}>
      <View style={styles.inboxHeader}>
        <View>
          <Text style={styles.inboxLabel}>Previous comparisons</Text>
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
  readyHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  historyButton: { minHeight: 38, borderRadius: 19, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.58)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.06)' },
  historyButtonText: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '700', fontSize: 13, backgroundColor: 'transparent', includeFontPadding: false },
  heroDecisionTitle: { color: colors.charcoal, fontFamily: font.heading, fontWeight: '700', fontSize: 40, lineHeight: 45, letterSpacing: -0.5, marginTop: 2, backgroundColor: 'transparent', includeFontPadding: false },
  preparingScreen: { minHeight: 560, justifyContent: 'center' },
  preparingCard: { borderRadius: 32, padding: 22, backgroundColor: 'rgba(255,255,255,0.90)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)', shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 22, shadowOffset: { width: 0, height: 10 }, elevation: 6 },
  preparingLabel: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '800', fontSize: 12, textTransform: 'uppercase', marginBottom: 14, backgroundColor: 'transparent', includeFontPadding: false },
  preparingBody: { color: colors.muted, fontFamily: font.body, fontSize: 15, lineHeight: 22, marginTop: 14, textAlign: 'center', backgroundColor: 'transparent', includeFontPadding: false },
  searchBox: { minHeight: 50, borderRadius: 19, paddingHorizontal: 16, justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)', marginBottom: 12 },
  searchText: { color: 'rgba(32,38,35,0.48)', fontFamily: font.body, fontSize: 15, backgroundColor: 'transparent', includeFontPadding: false },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  filterChip: { minHeight: 36, borderRadius: 18, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.62)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.06)' },
  filterChipText: { color: colors.muted, fontFamily: font.semibold, fontWeight: '700', fontSize: 12, backgroundColor: 'transparent', includeFontPadding: false },
  selectedSummary: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 22 },
  summaryCard: { width: '48%', borderRadius: 22, padding: 8, backgroundColor: 'rgba(255,255,255,0.80)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  summaryImage: { height: 96, borderRadius: 17, overflow: 'hidden', justifyContent: 'flex-end', padding: 11 },
  summaryImageStyle: { borderRadius: 17 },
  summaryShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.24)' },
  summaryTitle: { color: colors.white, fontFamily: font.heading, fontWeight: '700', fontSize: 17, lineHeight: 21, letterSpacing: -0.14, textShadowColor: 'rgba(0,0,0,0.25)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 5, backgroundColor: 'transparent', includeFontPadding: false },
  summaryMeta: { color: colors.muted, fontFamily: font.semibold, fontWeight: '700', fontSize: 11.5, marginTop: 8, paddingHorizontal: 2, backgroundColor: 'transparent', includeFontPadding: false },
  matchupPreview: { borderRadius: 28, padding: 16, gap: 10, backgroundColor: 'rgba(255,255,255,0.86)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)', shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 3, marginBottom: 22 },
  matchupPreviewCompact: { marginBottom: 0, shadowOpacity: 0, backgroundColor: 'rgba(168,240,212,0.20)' },
  matchupTripLine: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 12 },
  matchupTripLineRight: { flexDirection: 'row-reverse' },
  matchupThumb: { width: 82, height: 58, borderRadius: 17, overflow: 'hidden', backgroundColor: 'rgba(32,38,35,0.08)' },
  matchupThumbImage: { borderRadius: 17 },
  matchupTripCopy: { flex: 1 },
  matchupTripCopyRight: { alignItems: 'flex-end' },
  matchupTripTitle: { color: colors.charcoal, fontFamily: font.heading, fontWeight: '700', fontSize: 19, lineHeight: 23, letterSpacing: -0.18, backgroundColor: 'transparent', includeFontPadding: false },
  matchupTripMeta: { color: colors.muted, fontFamily: font.semibold, fontWeight: '600', fontSize: 13, marginTop: 4, backgroundColor: 'transparent', includeFontPadding: false },
  vsPill: { alignSelf: 'center', minWidth: 48, minHeight: 32, borderRadius: 16, paddingHorizontal: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.charcoal, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  vsText: { color: colors.white, fontFamily: font.semibold, fontWeight: '800', fontSize: 12, letterSpacing: 0.6, backgroundColor: 'transparent', includeFontPadding: false },
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
  decidePanel: { borderRadius: 28, padding: 18, backgroundColor: 'rgba(255,255,255,0.86)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: 7 }, elevation: 4, marginBottom: 14 },
  decideLabel: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '700', fontSize: 11, textTransform: 'uppercase', backgroundColor: 'transparent', includeFontPadding: false },
  decideTitle: { color: colors.charcoal, fontFamily: font.heading, fontWeight: '700', fontSize: 24, lineHeight: 29, letterSpacing: -0.24, marginTop: 5, backgroundColor: 'transparent', includeFontPadding: false },
  decideBody: { color: colors.muted, fontFamily: font.body, fontSize: 14.5, lineHeight: 21, marginTop: 5, marginBottom: 14, backgroundColor: 'transparent', includeFontPadding: false },
  decideCards: { gap: 12 },
  decisionCard: { minHeight: 148, borderRadius: 24, padding: 16, flexDirection: 'row', gap: 13, backgroundColor: 'rgba(248,250,249,0.92)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)' },
  decisionCardSocial: { backgroundColor: 'rgba(168,240,212,0.22)', borderColor: 'rgba(47,175,138,0.18)' },
  decisionCardDisabled: { opacity: 0.48 },
  decisionIcon: { width: 42, height: 42, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(168,240,212,0.52)', borderWidth: 1, borderColor: 'rgba(47,175,138,0.14)' },
  decisionIconSocial: { backgroundColor: colors.charcoal, borderColor: colors.charcoal },
  decisionIconText: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '800', fontSize: 12, backgroundColor: 'transparent', includeFontPadding: false },
  decisionIconTextSocial: { color: colors.white },
  decisionCopy: { flex: 1 },
  decisionBadge: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '800', fontSize: 10.5, textTransform: 'uppercase', marginBottom: 5, backgroundColor: 'transparent', includeFontPadding: false },
  decisionTitle: { color: colors.charcoal, fontFamily: font.heading, fontWeight: '700', fontSize: 19, lineHeight: 23, letterSpacing: -0.16, backgroundColor: 'transparent', includeFontPadding: false },
  decisionBody: { color: colors.muted, fontFamily: font.body, fontSize: 14, lineHeight: 20, marginTop: 5, backgroundColor: 'transparent', includeFontPadding: false },
  decisionAction: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '700', fontSize: 13.5, marginTop: 11, backgroundColor: 'transparent', includeFontPadding: false },
  decisionButton: { alignSelf: 'flex-start', minHeight: 38, borderRadius: 14, paddingHorizontal: 15, alignItems: 'center', justifyContent: 'center', marginTop: 13, backgroundColor: '#A8F0D4', borderWidth: 1, borderColor: 'rgba(47,175,138,0.16)' },
  decisionButtonSocial: { backgroundColor: colors.charcoal, borderColor: colors.charcoal },
  decisionButtonText: { color: '#173A33', fontFamily: font.semibold, fontWeight: '800', fontSize: 13, backgroundColor: 'transparent', includeFontPadding: false },
  decisionButtonTextSocial: { color: colors.white },
  pastReadsLink: { minHeight: 44, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, marginTop: -4, marginBottom: 14 },
  pastReadsLinkText: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '700', fontSize: 13, backgroundColor: 'transparent', includeFontPadding: false },
  introCard: { borderRadius: 26, padding: 18, backgroundColor: 'rgba(255,255,255,0.86)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)', marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  introKicker: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '800', fontSize: 11, textTransform: 'uppercase', backgroundColor: 'transparent', includeFontPadding: false },
  introTitle: { color: colors.charcoal, fontFamily: font.heading, fontWeight: '700', fontSize: 22, lineHeight: 27, letterSpacing: -0.2, marginTop: 6, backgroundColor: 'transparent', includeFontPadding: false },
  introBody: { color: colors.muted, fontFamily: font.body, fontSize: 15, lineHeight: 22, marginTop: 7, backgroundColor: 'transparent', includeFontPadding: false },
  selectionBar: { borderRadius: 26, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.92)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.08)', shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 6, marginTop: 4, marginBottom: 28 },
  selectionCopy: { flex: 1 },
  selectionCount: { color: colors.charcoal, fontFamily: font.heading, fontWeight: '700', fontSize: 16, letterSpacing: -0.1, backgroundColor: 'transparent', includeFontPadding: false },
  selectionNames: { color: colors.muted, fontFamily: font.body, fontSize: 12.5, lineHeight: 18, marginTop: 4, backgroundColor: 'transparent', includeFontPadding: false },
  continueButton: { minHeight: 50, borderRadius: 18, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2FAF8A' },
  continueButtonDisabled: { opacity: 0.42 },
  continueButtonText: { color: '#173A33', fontFamily: font.semibold, fontWeight: '800', fontSize: 14, backgroundColor: 'transparent', includeFontPadding: false },
  curationList: { gap: 14, marginBottom: 18 },
  curationCard: { borderRadius: 26, padding: 16, backgroundColor: 'rgba(255,255,255,0.84)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  curationTripHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  curationThumb: { width: 88, height: 64, borderRadius: 16, overflow: 'hidden' },
  curationThumbImage: { borderRadius: 16 },
  curationTripCopy: { flex: 1 },
  curationTripTitle: { color: colors.charcoal, fontFamily: font.heading, fontWeight: '700', fontSize: 18, lineHeight: 23, letterSpacing: -0.14, backgroundColor: 'transparent', includeFontPadding: false },
  curationTripMeta: { color: colors.muted, fontFamily: font.semibold, fontWeight: '600', fontSize: 12.5, marginTop: 3, backgroundColor: 'transparent', includeFontPadding: false },
  highlightList: { gap: 9 },
  highlightChoice: { minHeight: 58, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(248,250,249,0.84)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)' },
  highlightChoiceActive: { backgroundColor: 'rgba(168,240,212,0.34)', borderColor: 'rgba(47,175,138,0.26)' },
  highlightCheck: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(32,38,35,0.05)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.08)' },
  highlightCheckActive: { backgroundColor: '#2FAF8A', borderColor: '#2FAF8A' },
  highlightCheckText: { color: 'transparent', fontFamily: font.semibold, fontWeight: '800', fontSize: 9, backgroundColor: 'transparent', includeFontPadding: false },
  highlightCheckTextActive: { color: colors.white },
  highlightCopy: { flex: 1 },
  highlightTitle: { color: colors.charcoal, fontFamily: font.semibold, fontWeight: '700', fontSize: 14.5, backgroundColor: 'transparent', includeFontPadding: false },
  highlightMeta: { color: colors.muted, fontFamily: font.body, fontSize: 12, marginTop: 3, backgroundColor: 'transparent', includeFontPadding: false },
  noHighlightsText: { color: colors.muted, fontFamily: font.body, fontSize: 13.5, lineHeight: 19, backgroundColor: 'transparent', includeFontPadding: false },
  curationActions: { gap: 10, marginBottom: 12 },
  textCancelButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  textCancelButtonText: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '700', fontSize: 14, backgroundColor: 'transparent', includeFontPadding: false },
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,17,21,0.34)', justifyContent: 'center', paddingHorizontal: 18, paddingTop: 72, paddingBottom: 28 },
  modalSheet: { maxWidth: 520, width: '100%', alignSelf: 'center', borderRadius: 30, padding: 16, backgroundColor: 'rgba(248,250,249,0.96)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.82)', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 30, shadowOffset: { width: 0, height: 14 }, elevation: 10 },
  liveLinkCard: { borderRadius: 26, padding: 18, backgroundColor: 'rgba(255,255,255,0.84)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)' },
  liveIcon: { width: 48, height: 48, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#A8F0D4', marginBottom: 13 },
  liveIconText: { color: '#173A33', fontFamily: font.semibold, fontWeight: '800', fontSize: 12, backgroundColor: 'transparent', includeFontPadding: false },
  modalKicker: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '700', fontSize: 11, textTransform: 'uppercase', backgroundColor: 'transparent', includeFontPadding: false },
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
  modalTitle: { color: colors.charcoal, fontFamily: font.heading, fontWeight: '700', fontSize: 23, lineHeight: 28, letterSpacing: -0.2, marginTop: 5, backgroundColor: 'transparent', includeFontPadding: false },
  modalBody: { color: colors.muted, fontFamily: font.body, fontSize: 14.5, lineHeight: 21, marginTop: 7, backgroundColor: 'transparent', includeFontPadding: false },
  linkPreview: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '700', fontSize: 12, lineHeight: 17, marginTop: 14, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, backgroundColor: 'rgba(168,240,212,0.24)', overflow: 'hidden', includeFontPadding: false },
  modalStatus: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '700', fontSize: 13, textAlign: 'center', marginTop: 12, backgroundColor: 'transparent', includeFontPadding: false },
  modalActions: { gap: 10, marginTop: 14 },
  closeModalButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  closeModalText: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '700', fontSize: 14, backgroundColor: 'transparent', includeFontPadding: false },
});
