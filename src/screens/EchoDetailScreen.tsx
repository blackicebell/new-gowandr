import React, { useRef, useState } from 'react';
import { Animated, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../components/Button';
import { IdeaCard } from '../components/IdeaCard';
import { starterPhotos } from '../data/starterPhotos';
import { calculateClarityScore } from '../logic/clarityScore';
import { getMomentumStatus } from '../logic/momentum';
import { getEchoSummary } from '../logic/summaries';
import { getPaceHealth, paceGuidance } from '../logic/tripPace';
import { font, useThemeColors } from '../theme/colors';
import { TripDraft, TripIdea } from '../types';
import { shareTripCard } from '../utils/shareCards';

export function EchoDetailScreen({ trip, onBack, onAddIdea, onEditTrip, onDeleteTrip, onEditIdea, onDeleteIdea, onCompare, onMoveToPlan }: { trip: TripDraft; onBack: () => void; onAddIdea: () => void; onEditTrip: () => void; onDeleteTrip: () => void; onEditIdea: (ideaId: string) => void; onDeleteIdea: (idea: TripIdea) => void; onCompare: () => void; onMoveToPlan: () => void }) {
  const colors = useThemeColors();
  const clarity = calculateClarityScore(trip);
  const momentumStatus = getMomentumStatus(trip);
  const paceHealth = getPaceHealth(trip);
  const mustDos = trip.ideas.filter((idea) => idea.priority === 'Must-do');
  const maybes = trip.ideas.filter((idea) => idea.priority !== 'Must-do');
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
          <Text style={[styles.subtitle, { fontFamily: font.body }]}>{trip.subtitle}</Text>
        </View>
      </ImageBackground>

      <View style={styles.summaryCard}>
        <View style={styles.clarityBadge}>
          <Text style={[styles.clarityScore, { fontFamily: font.heading }]}>{momentumStatus}</Text>
          <Text style={[styles.clarityLabel, { fontFamily: font.semibold }]}>status</Text>
        </View>
        <View style={styles.summaryCopy}>
          <Text style={[styles.summaryLabel, { fontFamily: font.semibold }]}>Trip status</Text>
          <Text style={[styles.summary, { fontFamily: font.semibold }]}>{getEchoSummary(trip)}</Text>
        </View>
      </View>

      <View style={styles.chips}>
        {trip.tags.map((tag) => (
          <View key={tag} style={styles.tagPill}>
            <Text style={[styles.tagText, { fontFamily: font.semibold }]}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.briefCard}>
        <Text style={[styles.briefKicker, { fontFamily: font.semibold }]}>Trip brief</Text>
        <Text style={[styles.briefTitle, { fontFamily: font.heading }]}>{getTripMood(trip)} {getPeopleLabel(trip.companionType)}</Text>
        <View style={styles.briefGrid}>
          <BriefStat label="Mood" value={getTripMood(trip)} />
          <BriefStat label="Pace" value={trip.pace} />
          <BriefStat label="Saved" value={`${trip.ideas.length} ideas`} />
          <BriefStat label="Highlights" value={`${mustDos.length || Math.min(3, trip.ideas.length)} picked`} />
        </View>
        <Text style={[styles.briefBody, { fontFamily: font.body }]}>This is the version of the trip you are deciding on. Add highlights until the idea feels easy to compare.</Text>
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
        <Button label="Add Idea" onPress={onAddIdea} />
        <Button label="Edit Trip" variant="secondary" onPress={onEditTrip} />
        <Button label="Share Trip Card" variant="secondary" onPress={() => setShowShareComposer((current) => !current)} />
        <Button label="Compare Trips" variant="secondary" onPress={onCompare} />
        <Button label={trip.finalPlan ? 'Open Plan' : 'Commit to This Trip'} variant="ghost" onPress={onMoveToPlan} />
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
      {showShareComposer && (
        <ShareTripComposer
          trip={trip}
          photoUri={sharePhotoUri}
          onSelectPhoto={setSharePhotoUri}
          onShare={() => shareTripCard(trip, sharePhotoUri)}
          onClose={() => setShowShareComposer(false)}
        />
      )}

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { fontFamily: font.heading }]}>Top highlights</Text>
        <View style={styles.sectionDivider} />
      </View>
      <View style={styles.grid}>
        {mustDos.map((idea) => (
          <IdeaCard key={idea.id} idea={idea} onEdit={() => onEditIdea(idea.id)} onDelete={() => onDeleteIdea(idea)} />
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { fontFamily: font.heading }]}>Still considering</Text>
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

function BriefStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.briefStat}>
      <Text style={[styles.briefStatLabel, { fontFamily: font.semibold }]}>{label}</Text>
      <Text style={[styles.briefStatValue, { fontFamily: font.heading }]}>{value}</Text>
    </View>
  );
}

function ShareTripComposer({ trip, photoUri, onSelectPhoto, onShare, onClose }: { trip: TripDraft; photoUri: string; onSelectPhoto: (uri: string) => void; onShare: () => void; onClose: () => void }) {
  const photoOptions = [{ id: 'current', uri: trip.heroImage }, ...starterPhotos.map((photo) => ({ id: photo.id, uri: photo.uri }))];
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

function getPeopleLabel(companionType: TripDraft['companionType']) {
  if (companionType === 'Solo') return 'solo trip';
  if (companionType === 'Couple') return 'couple trip';
  if (companionType === 'Friends') return 'friends trip';
  if (companionType === 'Family') return 'family trip';
  return 'group trip';
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
  summaryCard: { flexDirection: 'row', gap: 18, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.82)', borderRadius: 26, padding: 22, borderWidth: 1, borderColor: 'rgba(32,38,35,0.06)', shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 22, shadowOffset: { width: 0, height: 8 }, elevation: 5 },
  clarityBadge: { width: 104, minHeight: 88, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: '#2FAF8A', borderWidth: 2, borderColor: '#A8F0D4', paddingHorizontal: 12, paddingVertical: 8, shadowColor: '#2FAF8A', shadowOpacity: 0.28, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
  clarityScore: { color: '#FFFFFF', fontSize: 17, lineHeight: 20, textAlign: 'center', fontWeight: '700', letterSpacing: -0.17 },
  clarityLabel: { color: 'rgba(255,255,255,0.82)', fontSize: 11, fontWeight: '600', marginTop: 2 },
  summaryCopy: { flex: 1 },
  summaryLabel: { color: '#137D68', fontWeight: '800', fontSize: 11, textTransform: 'uppercase' },
  summary: { color: '#202623', fontSize: 17, lineHeight: 25, marginTop: 7, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tagPill: { backgroundColor: 'rgba(255,255,255,0.72)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: 'rgba(32,38,35,0.06)' },
  tagText: { color: '#202623', fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  briefCard: { borderRadius: 26, padding: 20, backgroundColor: 'rgba(255,255,255,0.82)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.06)', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: 7 }, elevation: 4 },
  briefKicker: { color: '#137D68', fontWeight: '800', fontSize: 11, textTransform: 'uppercase' },
  briefTitle: { color: '#202623', fontWeight: '800', fontSize: 22, lineHeight: 27, marginTop: 6, letterSpacing: -0.22 },
  briefGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  briefStat: { width: '48%', borderRadius: 18, padding: 12, backgroundColor: 'rgba(168,240,212,0.26)', borderWidth: 1, borderColor: 'rgba(47,175,138,0.12)' },
  briefStatLabel: { color: '#137D68', fontWeight: '700', fontSize: 10, textTransform: 'uppercase' },
  briefStatValue: { color: '#202623', fontWeight: '800', fontSize: 15, marginTop: 5 },
  briefBody: { color: 'rgba(32,38,35,0.66)', fontSize: 14, lineHeight: 20, marginTop: 13 },
  paceCard: { borderRadius: 26, padding: 22, borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: 7 }, elevation: 4 },
  paceHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  paceIcon: { width: 42, height: 42, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(32,38,35,0.62)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.52)' },
  paceIconText: { color: '#FFFFFF', fontFamily: font.semibold, fontWeight: '600', fontSize: 18 },
  paceCopy: { flex: 1 },
  paceLabel: { color: '#137D68', fontWeight: '800', fontSize: 11, textTransform: 'uppercase' },
  paceTitle: { color: '#202623', fontWeight: '700', fontSize: 18, marginTop: 5, letterSpacing: -0.18 },
  paceBody: { color: 'rgba(32,38,35,0.66)', fontSize: 15, lineHeight: 22, marginTop: 14 },
  paceMeter: { flexDirection: 'row', gap: 8, marginTop: 18 },
  paceMeterItem: { flex: 1 },
  paceMeterBar: { height: 5, borderRadius: 999, backgroundColor: 'rgba(32,38,35,0.08)' },
  paceMeterBarActive: { backgroundColor: '#6ED8B5' },
  paceMeterText: { color: 'rgba(32,38,35,0.48)', fontFamily: font.semibold, fontSize: 10, fontWeight: '600', marginTop: 6 },
  paceMeterTextActive: { color: '#137D68' },
  actions: { gap: 12, marginVertical: 4 },
  sectionHeader: { gap: 10, marginTop: 8 },
  sectionTitle: { color: '#202623', fontWeight: '800', fontSize: 25, letterSpacing: -0.25 },
  sectionDivider: { height: 1, backgroundColor: 'rgba(32,38,35,0.08)' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 8 },
  manageDeleteButton: { minHeight: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(217,94,79,0.08)', borderWidth: 1, borderColor: 'rgba(217,94,79,0.18)', marginTop: -2, marginBottom: 6 },
  manageDeleteText: { color: '#B84A3F', fontSize: 14, fontWeight: '600' },
  voteSummaryCard: { borderRadius: 22, padding: 16, backgroundColor: 'rgba(255,255,255,0.78)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)' },
  voteSummaryLabel: { color: '#137D68', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  voteSummaryTitle: { color: '#202623', fontSize: 20, fontWeight: '700', marginTop: 5, letterSpacing: -0.2 },
  voteSummaryBody: { color: 'rgba(32,38,35,0.66)', fontSize: 14, lineHeight: 20, marginTop: 6 },
  shareComposer: { backgroundColor: 'rgba(255,255,255,0.84)', borderRadius: 26, padding: 18, borderWidth: 1, borderColor: 'rgba(32,38,35,0.06)', shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 5 },
  shareComposerKicker: { color: '#137D68', fontWeight: '800', fontSize: 11, textTransform: 'uppercase' },
  shareComposerTitle: { color: '#202623', fontWeight: '800', fontSize: 20, lineHeight: 25, marginTop: 5, marginBottom: 14, letterSpacing: -0.2 },
  sharePreview: { minHeight: 460, borderRadius: 28, overflow: 'hidden', justifyContent: 'space-between', marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 22, shadowOffset: { width: 0, height: 10 }, elevation: 5 },
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
