import React, { useRef, useState } from 'react';
import { Animated, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../components/Button';
import { IdeaCard } from '../components/IdeaCard';
import { starterPhotos } from '../data/starterPhotos';
import { calculateClarityScore } from '../logic/clarityScore';
import { getEchoSummary } from '../logic/summaries';
import { getPaceHealth, paceGuidance } from '../logic/tripPace';
import { font, useThemeColors } from '../theme/colors';
import { TripDraft } from '../types';
import { shareTripCard } from '../utils/shareCards';

export function EchoDetailScreen({ trip, onBack, onAddIdea, onCompare, onOpenLab }: { trip: TripDraft; onBack: () => void; onAddIdea: () => void; onCompare: () => void; onOpenLab: () => void }) {
  const colors = useThemeColors();
  const clarity = calculateClarityScore(trip);
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
        <Text style={[styles.backText, { color: '#137D68', fontFamily: font.family }]}>Back to Trip Ideas</Text>
      </TouchableOpacity>
      <ImageBackground source={{ uri: trip.heroImage }} style={[styles.hero, { borderColor: colors.line }]} imageStyle={styles.heroImage}>
        <LinearGradient colors={['rgba(0,0,0,0.25)', 'rgba(0,0,0,0.65)']} style={StyleSheet.absoluteFill} />
        <View style={styles.heroCopy}>
          <Text style={[styles.title, { fontFamily: font.family }]}>{trip.title}</Text>
          <Text style={[styles.subtitle, { fontFamily: font.family }]}>{trip.subtitle}</Text>
        </View>
      </ImageBackground>

      <View style={styles.summaryCard}>
        <View style={styles.clarityBadge}>
          <Text style={[styles.clarityScore, { fontFamily: font.family }]}>{clarity.score}</Text>
          <Text style={[styles.clarityLabel, { fontFamily: font.family }]}>clarity</Text>
        </View>
        <View style={styles.summaryCopy}>
          <Text style={[styles.summaryLabel, { fontFamily: font.family }]}>Trip summary</Text>
          <Text style={[styles.summary, { fontFamily: font.family }]}>{getEchoSummary(trip)}</Text>
        </View>
      </View>

      <View style={styles.chips}>
        {trip.tags.map((tag) => (
          <View key={tag} style={styles.tagPill}>
            <Text style={[styles.tagText, { fontFamily: font.family }]}>{tag}</Text>
          </View>
        ))}
      </View>

      <LinearGradient colors={['rgba(255,255,255,0.84)', 'rgba(226,248,240,0.88)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.paceCard}>
        <View style={styles.paceHeader}>
          <View style={styles.paceIcon}>
            <Text style={styles.paceIconText}>{getPaceIcon(trip.pace)}</Text>
          </View>
          <View style={styles.paceCopy}>
            <Text style={[styles.paceLabel, { fontFamily: font.family }]}>Trip pace</Text>
            <Text style={[styles.paceTitle, { fontFamily: font.family }]}>{trip.pace}: {paceGuidance[trip.pace].short}</Text>
          </View>
        </View>
        <PaceMeter pace={trip.pace} />
        <Text style={[styles.paceBody, { fontFamily: font.family }]}>{paceHealth.message}</Text>
      </LinearGradient>

      <View style={styles.actions}>
        <Button label="Add Idea" onPress={onAddIdea} />
        <Button label="Share Trip Card" variant="secondary" onPress={() => setShowShareComposer((current) => !current)} />
        <Button label="Compare This Trip" variant="secondary" onPress={onCompare} />
        <Button label="Pick Top 3" variant="ghost" onPress={onOpenLab} />
      </View>
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
        <Text style={[styles.sectionTitle, { fontFamily: font.family }]}>Must-dos</Text>
        <View style={styles.sectionDivider} />
      </View>
      <View style={styles.grid}>
        {mustDos.map((idea) => (
          <IdeaCard key={idea.id} idea={idea} />
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { fontFamily: font.family }]}>Maybe / backup</Text>
        <View style={styles.sectionDivider} />
      </View>
      <View style={styles.grid}>
        {maybes.map((idea) => (
          <IdeaCard key={idea.id} idea={idea} />
        ))}
      </View>
    </Animated.View>
  );
}

function ShareTripComposer({ trip, photoUri, onSelectPhoto, onShare, onClose }: { trip: TripDraft; photoUri: string; onSelectPhoto: (uri: string) => void; onShare: () => void; onClose: () => void }) {
  const photoOptions = [{ id: 'current', uri: trip.heroImage }, ...starterPhotos.map((photo) => ({ id: photo.id, uri: photo.uri }))];
  const topIdeas = trip.ideas.filter((idea) => idea.priority === 'Must-do').slice(0, 3);

  return (
    <View style={styles.shareComposer}>
      <Text style={[styles.shareComposerKicker, { fontFamily: font.family }]}>Share card</Text>
      <Text style={[styles.shareComposerTitle, { fontFamily: font.family }]}>Choose the photo people will see.</Text>
      <ImageBackground source={{ uri: photoUri }} style={styles.sharePreview} imageStyle={styles.sharePreviewImage}>
        <LinearGradient colors={['rgba(0,0,0,0.08)', 'rgba(0,0,0,0.62)']} style={StyleSheet.absoluteFill} />
        <View style={styles.shareBrandPill}>
          <Text style={[styles.shareBrandText, { fontFamily: font.family }]}>GoWandr</Text>
        </View>
        <View style={styles.sharePreviewCopy}>
          <Text style={[styles.sharePreviewTitle, { fontFamily: font.family }]}>{trip.title}</Text>
          <Text style={[styles.sharePreviewBody, { fontFamily: font.family }]}>{trip.subtitle}</Text>
          <View style={styles.shareIdeaList}>
            {(topIdeas.length ? topIdeas : trip.ideas.slice(0, 2)).slice(0, 3).map((idea, index) => (
              <Text key={idea.id} style={[styles.shareIdeaText, { fontFamily: font.family }]}>{index + 1}. {idea.title}</Text>
            ))}
          </View>
        </View>
      </ImageBackground>
      <View style={styles.sharePhotoGrid}>
        {photoOptions.map((photo, index) => {
          const active = photo.uri === photoUri;
          return (
            <TouchableOpacity key={`${photo.id}-${index}`} onPress={() => onSelectPhoto(photo.uri)} style={[styles.sharePhotoOption, active && styles.sharePhotoOptionActive]}>
              <ImageBackground source={{ uri: photo.uri }} style={styles.sharePhotoThumb} imageStyle={styles.sharePhotoThumbImage}>
                {active && <View style={styles.sharePhotoCheck}><Text style={styles.sharePhotoCheckText}>OK</Text></View>}
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
  clarityBadge: { minWidth: 88, minHeight: 88, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: '#2FAF8A', borderWidth: 2, borderColor: '#A8F0D4', paddingHorizontal: 14, paddingVertical: 8, shadowColor: '#2FAF8A', shadowOpacity: 0.28, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
  clarityScore: { color: '#FFFFFF', fontSize: 26, fontWeight: '700', letterSpacing: -0.26 },
  clarityLabel: { color: 'rgba(255,255,255,0.82)', fontSize: 11, fontWeight: '600', marginTop: 2 },
  summaryCopy: { flex: 1 },
  summaryLabel: { color: '#137D68', fontWeight: '800', fontSize: 11, textTransform: 'uppercase' },
  summary: { color: '#202623', fontSize: 17, lineHeight: 25, marginTop: 7, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tagPill: { backgroundColor: 'rgba(255,255,255,0.72)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: 'rgba(32,38,35,0.06)' },
  tagText: { color: '#202623', fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  paceCard: { borderRadius: 26, padding: 22, borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: 7 }, elevation: 4 },
  paceHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  paceIcon: { width: 42, height: 42, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(32,38,35,0.62)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.52)' },
  paceIconText: { color: '#FFFFFF', fontWeight: '800', fontSize: 18 },
  paceCopy: { flex: 1 },
  paceLabel: { color: '#137D68', fontWeight: '800', fontSize: 11, textTransform: 'uppercase' },
  paceTitle: { color: '#202623', fontWeight: '700', fontSize: 18, marginTop: 5, letterSpacing: -0.18 },
  paceBody: { color: 'rgba(32,38,35,0.66)', fontSize: 15, lineHeight: 22, marginTop: 14 },
  paceMeter: { flexDirection: 'row', gap: 8, marginTop: 18 },
  paceMeterItem: { flex: 1 },
  paceMeterBar: { height: 5, borderRadius: 999, backgroundColor: 'rgba(32,38,35,0.08)' },
  paceMeterBarActive: { backgroundColor: '#6ED8B5' },
  paceMeterText: { color: 'rgba(32,38,35,0.48)', fontSize: 10, fontWeight: '700', marginTop: 6 },
  paceMeterTextActive: { color: '#137D68' },
  actions: { gap: 12, marginVertical: 4 },
  sectionHeader: { gap: 10, marginTop: 8 },
  sectionTitle: { color: '#202623', fontWeight: '800', fontSize: 25, letterSpacing: -0.25 },
  sectionDivider: { height: 1, backgroundColor: 'rgba(32,38,35,0.08)' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 8 },
  shareComposer: { backgroundColor: 'rgba(255,255,255,0.84)', borderRadius: 26, padding: 18, borderWidth: 1, borderColor: 'rgba(32,38,35,0.06)', shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 5 },
  shareComposerKicker: { color: '#137D68', fontWeight: '800', fontSize: 11, textTransform: 'uppercase' },
  shareComposerTitle: { color: '#202623', fontWeight: '800', fontSize: 20, lineHeight: 25, marginTop: 5, marginBottom: 14, letterSpacing: -0.2 },
  sharePreview: { minHeight: 420, borderRadius: 26, overflow: 'hidden', justifyContent: 'space-between', marginBottom: 14 },
  sharePreviewImage: { borderRadius: 26 },
  shareBrandPill: { alignSelf: 'flex-start', margin: 16, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.86)' },
  shareBrandText: { color: '#137D68', fontWeight: '800', fontSize: 13 },
  sharePreviewCopy: { padding: 20 },
  sharePreviewTitle: { color: '#FFFFFF', fontWeight: '800', fontSize: 34, lineHeight: 40, letterSpacing: -0.34, textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 4, textShadowOffset: { width: 0, height: 2 } },
  sharePreviewBody: { color: 'rgba(255,255,255,0.88)', fontSize: 15, lineHeight: 22, marginTop: 7, fontWeight: '600' },
  shareIdeaList: { marginTop: 14, gap: 5 },
  shareIdeaText: { color: '#FFFFFF', fontSize: 13, lineHeight: 18, fontWeight: '700' },
  sharePhotoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sharePhotoOption: { width: '30%', borderRadius: 16, borderWidth: 2, borderColor: 'transparent', overflow: 'hidden' },
  sharePhotoOptionActive: { borderColor: '#2FAF8A' },
  sharePhotoThumb: { height: 74, justifyContent: 'flex-start' },
  sharePhotoThumbImage: { borderRadius: 14 },
  sharePhotoCheck: { alignSelf: 'flex-start', margin: 7, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.88)' },
  sharePhotoCheckText: { color: '#137D68', fontWeight: '800', fontSize: 10 },
  shareComposerActions: { gap: 10, marginTop: 14 },
});
