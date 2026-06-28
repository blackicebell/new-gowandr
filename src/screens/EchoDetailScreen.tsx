import React, { useRef, useState } from 'react';
import { Animated, Image, ImageBackground, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../components/Button';
import { IdeaCard } from '../components/IdeaCard';
import { starterPhotos } from '../data/starterPhotos';
import { getMomentumStatus } from '../logic/momentum';
import { getPaceHealth, paceGuidance } from '../logic/tripPace';
import { font, useThemeColors } from '../theme/colors';
import { TripDraft, TripIdea } from '../types';
import { shareTripCard } from '../utils/shareCards';

export function EchoDetailScreen({ trip, onBack, onAddIdea, onEditTrip, onDeleteTrip, onEditIdea, onDeleteIdea, onCompare, onMoveToPlan }: { trip: TripDraft; onBack: () => void; onAddIdea: () => void; onEditTrip: () => void; onDeleteTrip: () => void; onEditIdea: (ideaId: string) => void; onDeleteIdea: (idea: TripIdea) => void; onCompare: () => void; onMoveToPlan: () => void }) {
  const colors = useThemeColors();
  const momentumStatus = getMomentumStatus(trip);
  const paceHealth = getPaceHealth(trip);
  const mustDos = trip.ideas.filter((idea) => idea.priority === 'Must-do');
  const maybes = trip.ideas.filter((idea) => idea.priority !== 'Must-do');
  const readyToCommit = mustDos.length >= 3 || trip.ideas.length >= 4;
  const [showShareComposer, setShowShareComposer] = useState(false);
  const [sharePhotoUri, setSharePhotoUri] = useState(trip.heroImage);
  const fade = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 160, useNativeDriver: true }).start();
  }, [fade]);

  React.useEffect(() => {
    setSharePhotoUri(trip.heroImage);
    setShowShareComposer(false);
  }, [trip.id, trip.heroImage]);

  return (
    <Animated.View style={[styles.screen, { opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }]}>
      <TouchableOpacity onPress={onBack} style={styles.back}>
        <Text style={[styles.backText, { color: '#137D68', fontFamily: font.semibold }]}>Back to Trip Ideas</Text>
      </TouchableOpacity>
      <ImageBackground source={{ uri: trip.heroImage }} style={[styles.hero, { borderColor: colors.line }]} imageStyle={styles.heroImage}>
        <LinearGradient colors={['rgba(0,0,0,0.25)', 'rgba(0,0,0,0.65)']} style={StyleSheet.absoluteFill} />
        <View style={styles.heroCopy}>
          <Text style={[styles.title, { fontFamily: font.heading }]}>{trip.title}</Text>
          <Text style={[styles.subtitle, { fontFamily: font.body }]}>{getHeroStory(trip)}</Text>
        </View>
      </ImageBackground>

      <View style={styles.momentumCard}>
        <View style={styles.momentumTop}>
          <View>
            <Text style={[styles.cardKicker, { fontFamily: font.semibold }]}>Next step</Text>
            <Text style={[styles.momentumTitle, { fontFamily: font.heading }]}>{getNextStepTitle(trip, mustDos.length)}</Text>
          </View>
          <View style={styles.momentumBadge}>
            <Text style={[styles.momentumBadgeText, { fontFamily: font.heading }]}>{getMomentumBadge(momentumStatus, mustDos.length)}</Text>
          </View>
        </View>
        <Text style={[styles.momentumBody, { fontFamily: font.body }]}>{getNextStepBody(trip, mustDos.length)}</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.min(100, (Math.min(3, mustDos.length) / 3) * 100)}%` }]} />
        </View>
        <Text style={[styles.progressText, { fontFamily: font.semibold }]}>{Math.min(3, mustDos.length)} of 3 highlights chosen</Text>
      </View>

      <View style={styles.glanceCard}>
        <Text style={[styles.cardKicker, { fontFamily: font.semibold }]}>Trip at a glance</Text>
        <View style={styles.glanceGrid}>
          <GlanceItem icon="01" label="Mood" value={getTripMood(trip)} />
          <GlanceItem icon="02" label="Who" value={trip.companionType} />
          <GlanceItem icon="03" label="Pace" value={trip.pace} />
          <GlanceItem icon="04" label="Progress" value={getShortStatus(momentumStatus)} />
        </View>
      </View>

      <View style={styles.whyCard}>
        <Text style={[styles.cardKicker, { fontFamily: font.semibold }]}>Why this trip?</Text>
        {getWhyThisTrip(trip).map((reason) => (
          <View key={reason} style={styles.reasonRow}>
            <View style={styles.reasonDot}>
              <Text style={[styles.reasonCheck, { fontFamily: font.semibold }]}>OK</Text>
            </View>
            <Text style={[styles.reasonText, { fontFamily: font.body }]}>{reason}</Text>
          </View>
        ))}
      </View>

      <LinearGradient colors={['rgba(255,255,255,0.84)', 'rgba(226,248,240,0.88)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.paceCard}>
        <View style={styles.paceHeader}>
          <View style={styles.paceIcon}>
            <Text style={styles.paceIconText}>{getPaceIcon(trip.pace)}</Text>
          </View>
          <View style={styles.paceCopy}>
            <Text style={[styles.paceLabel, { fontFamily: font.semibold }]}>Trip pace</Text>
            <Text style={[styles.paceTitle, { fontFamily: font.heading }]}>{trip.pace}: {paceGuidance[trip.pace].short}</Text>
          </View>
        </View>
        <PaceMeter pace={trip.pace} />
        <Text style={[styles.paceBody, { fontFamily: font.body }]}>{paceHealth.message}</Text>
      </LinearGradient>

      <View style={styles.actions}>
        <Button label="Add Inspiration" onPress={onAddIdea} />
        {readyToCommit && (
          <View style={styles.commitCard}>
            <Text style={[styles.commitTitle, { fontFamily: font.heading }]}>Ready to make this your trip?</Text>
            <Text style={[styles.commitBody, { fontFamily: font.body }]}>You have enough inspiration to move from maybe to momentum.</Text>
            <Button label={`Commit to ${trip.title}`} variant="secondary" onPress={onMoveToPlan} />
          </View>
        )}
        {trip.ideas.length >= 2 && <Button label="Compare Trips" variant="secondary" onPress={onCompare} />}
        {!!trip.ideas.length && <Button label="Share Trip Card" variant="secondary" onPress={() => setShowShareComposer(true)} />}
        <TouchableOpacity style={styles.editTripLink} onPress={onEditTrip}>
          <Text style={[styles.editTripText, { fontFamily: font.semibold }]}>Edit trip details</Text>
        </TouchableOpacity>
      </View>
      {trip.latestMatchupResult && (
        <View style={styles.voteSummaryCard}>
          <Text style={[styles.voteSummaryLabel, { fontFamily: font.semibold }]}>Latest compare</Text>
          <Text style={[styles.voteSummaryTitle, { fontFamily: font.heading }]}>{trip.latestMatchupResult.groupMatch}% decision confidence</Text>
          <Text style={[styles.voteSummaryBody, { fontFamily: font.body }]}>{trip.latestMatchupResult.summary}</Text>
        </View>
      )}
      <TouchableOpacity style={styles.manageDeleteButton} onPress={onDeleteTrip}>
        <Text style={[styles.manageDeleteText, { fontFamily: font.semibold }]}>Delete Trip</Text>
      </TouchableOpacity>
      <Modal visible={showShareComposer} transparent animationType="fade" onRequestClose={() => setShowShareComposer(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <ShareTripComposer
              trip={trip}
              photoUri={sharePhotoUri}
              onSelectPhoto={setSharePhotoUri}
              onShare={() => shareTripCard(trip, sharePhotoUri)}
              onClose={() => setShowShareComposer(false)}
            />
          </View>
        </View>
      </Modal>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { fontFamily: font.heading }]}>Top highlights</Text>
        <Text style={[styles.sectionHint, { fontFamily: font.body }]}>Pick 3 experiences that define this trip.</Text>
        <View style={styles.sectionDivider} />
      </View>
      {mustDos.length ? (
        <View style={styles.grid}>
          {mustDos.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} onEdit={() => onEditIdea(idea.id)} onDelete={() => onDeleteIdea(idea)} />
          ))}
        </View>
      ) : (
        <EmptyHighlights onAddIdea={onAddIdea} />
      )}

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { fontFamily: font.heading }]}>More inspiration</Text>
        <Text style={[styles.sectionHint, { fontFamily: font.body }]}>Ideas you saved but have not made anchors yet.</Text>
        <View style={styles.sectionDivider} />
      </View>
      <View style={styles.grid}>
        {maybes.map((idea) => (
          <IdeaCard key={idea.id} idea={idea} onEdit={() => onEditIdea(idea.id)} onDelete={() => onDeleteIdea(idea)} />
        ))}
      </View>
    </Animated.View>
  );
}

function GlanceItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.glanceItem}>
      <View style={styles.glanceIcon}>
        <Text style={[styles.glanceIconText, { fontFamily: font.semibold }]}>{icon}</Text>
      </View>
      <View style={styles.glanceCopy}>
        <Text style={[styles.glanceLabel, { fontFamily: font.semibold }]}>{label}</Text>
        <Text numberOfLines={1} style={[styles.glanceValue, { fontFamily: font.heading }]}>{value}</Text>
      </View>
    </View>
  );
}

function EmptyHighlights({ onAddIdea }: { onAddIdea: () => void }) {
  return (
    <View style={styles.emptyHighlights}>
      <Text style={[styles.emptyHighlightsTitle, { fontFamily: font.heading }]}>Choose the moments that define this trip.</Text>
      <Text style={[styles.emptyHighlightsBody, { fontFamily: font.body }]}>Favorites become the evidence you compare later. Start with a restaurant, view, activity, stay, or saved video.</Text>
      <View style={styles.exampleRow}>
        {['Restaurant', 'View', 'Boat tour', 'Coffee'].map((item) => (
          <View key={item} style={styles.examplePill}>
            <Text style={[styles.exampleText, { fontFamily: font.semibold }]}>{item}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.emptyAction} onPress={onAddIdea}>
        <Text style={[styles.emptyActionText, { fontFamily: font.semibold }]}>Add first highlight</Text>
      </TouchableOpacity>
    </View>
  );
}

function ShareTripComposer({ trip, photoUri, onSelectPhoto, onShare, onClose }: { trip: TripDraft; photoUri: string; onSelectPhoto: (uri: string) => void; onShare: () => void; onClose: () => void }) {
  const photoOptions = uniquePhotoOptions([{ id: 'current', uri: trip.heroImage }, ...starterPhotos.map((photo) => ({ id: photo.id, uri: photo.uri }))]);
  const topIdeas = trip.ideas.filter((idea) => idea.priority === 'Must-do').slice(0, 3);

  return (
    <View style={styles.shareComposer}>
      <Text style={[styles.shareComposerKicker, { fontFamily: font.semibold }]}>Share card</Text>
      <Text style={[styles.shareComposerTitle, { fontFamily: font.heading }]}>Choose the photo people will see.</Text>
      <ImageBackground source={{ uri: photoUri }} style={styles.sharePreview} imageStyle={styles.sharePreviewImage}>
        <LinearGradient colors={['rgba(0,0,0,0.22)', 'rgba(0,0,0,0.18)', 'rgba(0,0,0,0.78)']} style={StyleSheet.absoluteFill} />
        <View style={styles.shareBrandPill}>
          <Image source={require('../../assets/brand/gowandr-logo-full-color.png')} style={styles.shareBrandLogo} resizeMode="contain" />
        </View>
        <View style={styles.sharePreviewCopy}>
          <Text style={[styles.sharePreviewTitle, { fontFamily: font.heading }]}>{trip.title}</Text>
          <Text style={[styles.sharePreviewBody, { fontFamily: font.body }]}>{trip.subtitle}</Text>
          <View style={styles.shareIdeaList}>
          <Text style={[styles.shareIdeaLabel, { fontFamily: font.semibold }]}>Top highlights</Text>
            {(topIdeas.length ? topIdeas : trip.ideas.slice(0, 2)).slice(0, 3).map((idea, index) => (
              <Text key={idea.id} style={[styles.shareIdeaText, { fontFamily: font.semibold }]}>{index + 1}. {idea.title}</Text>
            ))}
          </View>
          <View style={styles.sharePreviewCta}>
            <Text style={[styles.sharePreviewCtaText, { fontFamily: font.semibold }]}>Compare this trip with GoWandr</Text>
          </View>
        </View>
      </ImageBackground>
      <View style={styles.sharePhotoHeader}>
        <Text style={[styles.sharePhotoTitle, { fontFamily: font.heading }]}>Choose share photo</Text>
        <Text style={[styles.sharePhotoHint, { fontFamily: font.body }]}>This only changes the card you share.</Text>
      </View>
      <View style={styles.sharePhotoGrid}>
        {photoOptions.map((photo, index) => {
          const active = photo.uri === photoUri;
          return (
            <TouchableOpacity key={`${photo.id}-${index}`} onPress={() => onSelectPhoto(photo.uri)} style={[styles.sharePhotoOption, active && styles.sharePhotoOptionActive]}>
              <ImageBackground source={{ uri: photo.uri }} style={styles.sharePhotoThumb} imageStyle={styles.sharePhotoThumbImage}>
                <LinearGradient colors={['rgba(0,0,0,0.04)', 'rgba(0,0,0,0.42)']} style={StyleSheet.absoluteFill} />
                {active && <View style={styles.sharePhotoCheck}><Text style={styles.sharePhotoCheckText}>Selected</Text></View>}
              </ImageBackground>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.shareComposerActions}>
        <Button label="Share Card" onPress={onShare} />
        <Button label="Close Preview" variant="secondary" onPress={onClose} />
      </View>
    </View>
  );
}

function uniquePhotoOptions(options: { id: string; uri: string }[]) {
  const seen = new Set<string>();
  return options.filter((option) => {
    if (seen.has(option.uri)) return false;
    seen.add(option.uri);
    return true;
  });
}

function PaceMeter({ pace }: { pace: TripDraft['pace'] }) {
  const activeIndex = pace === 'Relaxed' ? 0 : pace === 'Balanced' ? 1 : 2;
  return (
    <View style={styles.paceMeter}>
      {['Slow', 'Balanced', 'Fast'].map((label, index) => (
        <View key={label} style={styles.paceMeterItem}>
          <View style={[styles.paceMeterBar, index <= activeIndex && styles.paceMeterBarActive]} />
          <Text style={[styles.paceMeterText, index === activeIndex && styles.paceMeterTextActive]}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

function getPaceIcon(pace: TripDraft['pace']) {
  if (pace === 'Relaxed') return '~';
  if (pace === 'Packed') return '>>';
  return '=';
}

function getTripMood(trip: TripDraft) {
  const tags = trip.tags.map((tag) => tag.toLowerCase());
  if (tags.includes('food')) return 'Food';
  if (tags.includes('nightlife') || tags.includes('celebration')) return 'Celebrate';
  if (tags.includes('romantic')) return 'Romance';
  if (tags.includes('relax') || tags.includes('low-key')) return 'Reset';
  if (tags.includes('adventure')) return 'Adventure';
  if (tags.includes('culture')) return 'Explore';
  return 'Travel';
}

function getHeroStory(trip: TripDraft) {
  const mood = getTripMood(trip).toLowerCase();
  const pace = trip.pace.toLowerCase();
  const who = trip.companionType.toLowerCase();
  if (trip.ideas.length) {
    const anchors = trip.ideas
      .filter((idea) => idea.priority === 'Must-do')
      .slice(0, 2)
      .map((idea) => idea.title.toLowerCase());
    if (anchors.length) return `Built around ${anchors.join(' and ')}, with a ${pace} pace for ${who}.`;
  }
  return `A ${pace}, ${mood}-focused idea for ${who}, ready for the moments that make it worth choosing.`;
}

function getNextStepTitle(trip: TripDraft, highlightCount: number) {
  if (highlightCount <= 0) return 'Add your first highlight.';
  if (highlightCount < 3) return `Add ${3 - highlightCount} more ${3 - highlightCount === 1 ? 'highlight' : 'highlights'}.`;
  if (trip.ideas.length < 4) return 'This trip is taking shape.';
  return 'Ready to compare or commit.';
}

function getNextStepBody(trip: TripDraft, highlightCount: number) {
  if (highlightCount <= 0) return 'This trip becomes easier to compare once you choose the moments that actually define it.';
  if (highlightCount < 3) return 'Pick the places, saves, or notes that make this trip feel different from the others.';
  if (trip.ideas.length < 4) return 'You have enough anchors to remember why this trip matters. A few more supporting ideas can make the decision easier.';
  return 'You have enough inspiration to compare it against other trip drafts or move it into the plan.';
}

function getMomentumBadge(status: string, highlightCount: number) {
  if (status.includes('Committed') || status.includes('Preparing')) return 'Plan';
  if (highlightCount >= 3 || status.includes('Ready') || status.includes('Strong')) return 'Ready';
  return `${Math.min(2, highlightCount)}/3`;
}

function getShortStatus(status: string) {
  if (status.includes('Committed')) return 'Committed';
  if (status.includes('Ready') || status.includes('Strong')) return 'Ready';
  if (status.includes('Taking')) return 'Shaping';
  if (status.includes('Started')) return 'Started';
  return status;
}

function getWhyThisTrip(trip: TripDraft) {
  const reasons = [];
  const mood = getTripMood(trip).toLowerCase();
  reasons.push(`${capitalize(mood)} is the mood you chose.`);
  reasons.push(`${trip.pace} pace fits how this trip should feel.`);
  if (trip.companionType === 'Solo') reasons.push('It starts as your own decision, with room to share later.');
  else reasons.push(`${trip.companionType} can weigh in before the plan gets serious.`);
  if (trip.ideas.length) reasons.push(`${trip.ideas.length} saved ${trip.ideas.length === 1 ? 'idea' : 'ideas'} already point toward why this could work.`);
  else reasons.push('The next saved link or note will make the trip feel more real.');
  return reasons.slice(0, 4);
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const styles = StyleSheet.create({
  screen: { gap: 18 },
  back: { alignSelf: 'flex-start', paddingVertical: 10, paddingHorizontal: 2 },
  backText: { fontWeight: '800', fontSize: 14 },
  hero: { minHeight: 340, justifyContent: 'flex-end', borderRadius: 30, overflow: 'hidden', borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 28, shadowOffset: { width: 0, height: 10 }, elevation: 8 },
  heroImage: { borderRadius: 30 },
  heroCopy: { padding: 24 },
  title: { color: '#F8F8F6', fontWeight: '700', fontSize: 41, lineHeight: 49, letterSpacing: -0.41, textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 4, textShadowOffset: { width: 0, height: 2 } },
  subtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 16, lineHeight: 23, marginTop: 8, fontWeight: '500' },
  momentumCard: { gap: 13, backgroundColor: 'rgba(255,255,255,0.86)', borderRadius: 26, padding: 22, borderWidth: 1, borderColor: 'rgba(32,38,35,0.06)', shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 22, shadowOffset: { width: 0, height: 8 }, elevation: 5 },
  momentumTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 },
  cardKicker: { color: '#137D68', fontWeight: '800', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.2 },
  momentumTitle: { color: '#202623', fontWeight: '800', fontSize: 22, lineHeight: 27, marginTop: 6, letterSpacing: -0.22 },
  momentumBadge: { minWidth: 74, minHeight: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, backgroundColor: '#2FAF8A', shadowColor: '#2FAF8A', shadowOpacity: 0.24, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  momentumBadgeText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  momentumBody: { color: 'rgba(32,38,35,0.68)', fontSize: 15, lineHeight: 22, fontWeight: '500' },
  progressTrack: { height: 8, borderRadius: 999, backgroundColor: 'rgba(32,38,35,0.07)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: '#2FAF8A' },
  progressText: { color: '#137D68', fontSize: 12, fontWeight: '700' },
  glanceCard: { borderRadius: 26, padding: 20, backgroundColor: 'rgba(255,255,255,0.82)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.06)', shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 18, shadowOffset: { width: 0, height: 7 }, elevation: 4 },
  glanceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  glanceItem: { width: '48%', minHeight: 78, borderRadius: 18, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(168,240,212,0.24)', borderWidth: 1, borderColor: 'rgba(47,175,138,0.14)' },
  glanceIcon: { width: 34, height: 34, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(47,175,138,0.14)' },
  glanceIconText: { color: '#137D68', fontSize: 9, fontWeight: '800' },
  glanceCopy: { flex: 1 },
  glanceLabel: { color: '#137D68', fontWeight: '800', fontSize: 10, textTransform: 'uppercase' },
  glanceValue: { color: '#202623', fontWeight: '800', fontSize: 15, marginTop: 4, letterSpacing: -0.15 },
  whyCard: { gap: 12, borderRadius: 26, padding: 20, backgroundColor: 'rgba(255,255,255,0.78)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.06)', shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 18, shadowOffset: { width: 0, height: 7 }, elevation: 4 },
  reasonRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reasonDot: { width: 36, height: 36, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#A8F0D4' },
  reasonCheck: { color: '#137D68', fontSize: 11, fontWeight: '800' },
  reasonText: { flex: 1, color: 'rgba(32,38,35,0.72)', fontSize: 15, lineHeight: 21, fontWeight: '500' },
  paceCard: { borderRadius: 24, padding: 18, borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  paceHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  paceIcon: { width: 42, height: 42, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(32,38,35,0.62)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.52)' },
  paceIconText: { color: '#FFFFFF', fontFamily: font.semibold, fontWeight: '600', fontSize: 18 },
  paceCopy: { flex: 1 },
  paceLabel: { color: '#137D68', fontWeight: '800', fontSize: 11, textTransform: 'uppercase' },
  paceTitle: { color: '#202623', fontWeight: '700', fontSize: 17, lineHeight: 22, marginTop: 4, letterSpacing: -0.17 },
  paceBody: { color: 'rgba(32,38,35,0.66)', fontSize: 14, lineHeight: 20, marginTop: 12 },
  paceMeter: { flexDirection: 'row', gap: 8, marginTop: 14 },
  paceMeterItem: { flex: 1 },
  paceMeterBar: { height: 5, borderRadius: 999, backgroundColor: 'rgba(32,38,35,0.08)' },
  paceMeterBarActive: { backgroundColor: '#6ED8B5' },
  paceMeterText: { color: 'rgba(32,38,35,0.48)', fontFamily: font.semibold, fontSize: 10, fontWeight: '600', marginTop: 6 },
  paceMeterTextActive: { color: '#137D68' },
  actions: { gap: 10, marginVertical: 2 },
  commitCard: { gap: 10, borderRadius: 24, padding: 18, backgroundColor: 'rgba(255,255,255,0.82)', borderWidth: 1, borderColor: 'rgba(47,175,138,0.16)', shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 18, shadowOffset: { width: 0, height: 7 }, elevation: 3 },
  commitTitle: { color: '#202623', fontWeight: '800', fontSize: 20, lineHeight: 25, letterSpacing: -0.2 },
  commitBody: { color: 'rgba(32,38,35,0.66)', fontSize: 14, lineHeight: 20, fontWeight: '500' },
  editTripLink: { minHeight: 42, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  editTripText: { color: '#137D68', fontSize: 14, fontWeight: '700' },
  sectionHeader: { gap: 10, marginTop: 8 },
  sectionTitle: { color: '#202623', fontWeight: '800', fontSize: 25, letterSpacing: -0.25 },
  sectionHint: { color: 'rgba(32,38,35,0.62)', fontSize: 14, lineHeight: 20, fontWeight: '500' },
  sectionDivider: { height: 1, backgroundColor: 'rgba(32,38,35,0.08)' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 8 },
  emptyHighlights: { gap: 13, borderRadius: 26, padding: 20, marginBottom: 6, backgroundColor: 'rgba(255,255,255,0.78)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.06)', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  emptyHighlightsTitle: { color: '#202623', fontSize: 20, lineHeight: 25, fontWeight: '800', letterSpacing: -0.2 },
  emptyHighlightsBody: { color: 'rgba(32,38,35,0.66)', fontSize: 14, lineHeight: 21, fontWeight: '500' },
  exampleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  examplePill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(168,240,212,0.34)', borderWidth: 1, borderColor: 'rgba(47,175,138,0.14)' },
  exampleText: { color: '#137D68', fontSize: 12, fontWeight: '700' },
  emptyAction: { minHeight: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#A8F0D4', borderWidth: 1, borderColor: 'rgba(47,175,138,0.18)' },
  emptyActionText: { color: '#173A33', fontSize: 14, fontWeight: '800' },
  manageDeleteButton: { alignSelf: 'center', minHeight: 34, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', marginTop: -2, marginBottom: 4 },
  manageDeleteText: { color: '#B84A3F', fontSize: 13, fontWeight: '600' },
  voteSummaryCard: { borderRadius: 22, padding: 16, backgroundColor: 'rgba(255,255,255,0.78)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)' },
  voteSummaryLabel: { color: '#137D68', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  voteSummaryTitle: { color: '#202623', fontSize: 20, fontWeight: '700', marginTop: 5, letterSpacing: -0.2 },
  voteSummaryBody: { color: 'rgba(32,38,35,0.66)', fontSize: 14, lineHeight: 20, marginTop: 6 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(10,18,16,0.36)', padding: 20, justifyContent: 'center' },
  modalSheet: { maxWidth: 520, width: '100%', alignSelf: 'center' },
  shareComposer: { backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: 26, padding: 18, borderWidth: 1, borderColor: 'rgba(32,38,35,0.06)', shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 8 },
  shareComposerKicker: { color: '#137D68', fontWeight: '800', fontSize: 11, textTransform: 'uppercase' },
  shareComposerTitle: { color: '#202623', fontWeight: '800', fontSize: 20, lineHeight: 25, marginTop: 5, marginBottom: 14, letterSpacing: -0.2 },
  sharePreview: { minHeight: 390, borderRadius: 28, overflow: 'hidden', justifyContent: 'space-between', marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 22, shadowOffset: { width: 0, height: 10 }, elevation: 5 },
  sharePreviewImage: { borderRadius: 26 },
  shareBrandPill: { alignSelf: 'flex-start', margin: 18, width: 126, height: 42, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  shareBrandLogo: { width: 102, height: 24 },
  sharePreviewCopy: { padding: 20, gap: 10 },
  sharePreviewTitle: { color: '#F8F8F6', fontWeight: '800', fontSize: 36, lineHeight: 41, letterSpacing: -0.36, textShadowColor: 'rgba(0,0,0,0.48)', textShadowRadius: 6, textShadowOffset: { width: 0, height: 2 } },
  sharePreviewBody: { color: 'rgba(248,248,246,0.92)', fontSize: 15, lineHeight: 22, fontWeight: '600', textShadowColor: 'rgba(0,0,0,0.32)', textShadowRadius: 3, textShadowOffset: { width: 0, height: 1 } },
  shareIdeaList: { marginTop: 4, gap: 6, borderRadius: 18, padding: 14, backgroundColor: 'rgba(5,18,15,0.56)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' },
  shareIdeaLabel: { color: '#A8F0D4', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginBottom: 1 },
  shareIdeaText: { color: '#F8F8F6', fontSize: 13, lineHeight: 18, fontWeight: '700' },
  sharePreviewCta: { minHeight: 48, borderRadius: 999, backgroundColor: '#A8F0D4', alignItems: 'center', justifyContent: 'center', marginTop: 4, paddingHorizontal: 14, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  sharePreviewCtaText: { color: '#173A33', fontWeight: '800', fontSize: 13, textAlign: 'center' },
  sharePhotoHeader: { marginBottom: 10 },
  sharePhotoTitle: { color: '#202623', fontSize: 15, fontWeight: '800', letterSpacing: -0.15 },
  sharePhotoHint: { color: 'rgba(32,38,35,0.62)', fontSize: 13, lineHeight: 18, marginTop: 3, fontWeight: '500' },
  sharePhotoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sharePhotoOption: { width: '31%', borderRadius: 16, borderWidth: 2, borderColor: 'rgba(32,38,35,0.06)', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.6)' },
  sharePhotoOptionActive: { borderColor: '#2FAF8A' },
  sharePhotoThumb: { height: 82, justifyContent: 'flex-end' },
  sharePhotoThumbImage: { borderRadius: 14 },
  sharePhotoCheck: { alignSelf: 'flex-start', margin: 7, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.92)' },
  sharePhotoCheckText: { color: '#137D68', fontFamily: font.semibold, fontWeight: '600', fontSize: 10 },
  shareComposerActions: { gap: 10, marginTop: 14 },
});
