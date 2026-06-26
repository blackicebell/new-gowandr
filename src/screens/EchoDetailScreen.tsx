import React, { useRef } from 'react';
import { Animated, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../components/Button';
import { IdeaCard } from '../components/IdeaCard';
import { calculateClarityScore } from '../logic/clarityScore';
import { getEchoSummary } from '../logic/summaries';
import { getPaceHealth, paceGuidance } from '../logic/tripPace';
import { font, useThemeColors } from '../theme/colors';
import { TripDraft } from '../types';

export function EchoDetailScreen({ trip, onBack, onAddIdea, onCompare, onOpenLab }: { trip: TripDraft; onBack: () => void; onAddIdea: () => void; onCompare: () => void; onOpenLab: () => void }) {
  const colors = useThemeColors();
  const clarity = calculateClarityScore(trip);
  const paceHealth = getPaceHealth(trip);
  const mustDos = trip.ideas.filter((idea) => idea.priority === 'Must-do');
  const maybes = trip.ideas.filter((idea) => idea.priority !== 'Must-do');
  const fade = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 160, useNativeDriver: true }).start();
  }, [fade]);

  return (
    <Animated.View style={[styles.screen, { opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }]}>
      <TouchableOpacity onPress={onBack} style={styles.back}>
        <Text style={[styles.backText, { color: colors.teal, fontFamily: font.family }]}>Back to Trip Ideas</Text>
      </TouchableOpacity>
      <ImageBackground source={{ uri: trip.heroImage }} style={[styles.hero, { borderColor: colors.line }]} imageStyle={styles.heroImage}>
        <LinearGradient colors={['rgba(0,0,0,0.25)', 'rgba(0,0,0,0.65)']} style={StyleSheet.absoluteFill} />
        <View style={styles.heroCopy}>
          <Text style={[styles.title, { fontFamily: font.family }]}>{trip.title}</Text>
          <Text style={[styles.subtitle, { fontFamily: font.family }]}>{trip.subtitle}</Text>
        </View>
      </ImageBackground>

      <View style={[styles.summaryCard, { borderColor: 'rgba(255,255,255,0.12)' }]}>
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

      <LinearGradient colors={['rgba(14,165,233,0.15)', 'rgba(37,99,235,0.15)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.paceCard, { borderColor: colors.line }]}>
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
        <Button label="Compare This Trip" variant="secondary" onPress={onCompare} />
        <Button label="Pick Top 3" variant="ghost" onPress={onOpenLab} />
      </View>

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
  backText: { fontWeight: '900', fontSize: 14 },
  hero: { minHeight: 340, justifyContent: 'flex-end', borderRadius: 30, overflow: 'hidden', borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 28, shadowOffset: { width: 0, height: 10 }, elevation: 8 },
  heroImage: { borderRadius: 30 },
  heroCopy: { padding: 24 },
  title: { color: '#F8F8F6', fontWeight: '700', fontSize: 41, lineHeight: 49, letterSpacing: -0.41, textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 4, textShadowOffset: { width: 0, height: 2 } },
  subtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 16, lineHeight: 23, marginTop: 8, fontWeight: '500' },
  summaryCard: { flexDirection: 'row', gap: 18, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 26, padding: 22, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 28, shadowOffset: { width: 0, height: 10 }, elevation: 8 },
  clarityBadge: { minWidth: 88, minHeight: 88, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.45)', borderWidth: 2, borderColor: '#A8F0D4', paddingHorizontal: 14, paddingVertical: 8 },
  clarityScore: { color: '#F8F8F6', fontSize: 26, fontWeight: '700', letterSpacing: -0.26 },
  clarityLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '600', marginTop: 2 },
  summaryCopy: { flex: 1 },
  summaryLabel: { color: '#F4D06F', fontWeight: '900', fontSize: 11, textTransform: 'uppercase' },
  summary: { color: '#F8F8F6', fontSize: 17, lineHeight: 25, marginTop: 7, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tagPill: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  tagText: { color: '#F8F8F6', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  paceCard: { borderRadius: 26, padding: 22, borderWidth: 1 },
  paceHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  paceIcon: { width: 42, height: 42, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.45)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  paceIconText: { color: '#A8F0D4', fontWeight: '900', fontSize: 18 },
  paceCopy: { flex: 1 },
  paceLabel: { color: '#F4D06F', fontWeight: '900', fontSize: 11, textTransform: 'uppercase' },
  paceTitle: { color: '#F8F8F6', fontWeight: '700', fontSize: 18, marginTop: 5, letterSpacing: -0.18 },
  paceBody: { color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 22, marginTop: 14 },
  paceMeter: { flexDirection: 'row', gap: 8, marginTop: 18 },
  paceMeterItem: { flex: 1 },
  paceMeterBar: { height: 5, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)' },
  paceMeterBarActive: { backgroundColor: '#6ED8B5' },
  paceMeterText: { color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: '700', marginTop: 6 },
  paceMeterTextActive: { color: '#F8F8F6' },
  actions: { gap: 12, marginVertical: 4 },
  sectionHeader: { gap: 10, marginTop: 8 },
  sectionTitle: { color: '#F8F8F6', fontWeight: '700', fontSize: 25, letterSpacing: -0.25 },
  sectionDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 8 },
});
