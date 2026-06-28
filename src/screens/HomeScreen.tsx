import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../components/Button';
import { EchoCard } from '../components/EchoCard';
import { PressableScale } from '../components/PressableScale';
import { starterImageUris } from '../data/imageAssets';
import { getMomentumCard } from '../logic/momentum';
import { colors, font, useThemeColors } from '../theme/colors';
import { TripDraft } from '../types';

export function HomeScreen({
  trips,
  onOpenTrip,
  onStartDraft,
  onStartMatchup,
  onAddIdea,
  onOpenPlan,
}: {
  trips: TripDraft[];
  onOpenTrip: (tripId: string) => void;
  onStartDraft: () => void;
  onStartMatchup: () => void;
  onAddIdea: () => void;
  onOpenPlan: () => void;
}) {
  const theme = useThemeColors();
  const momentum = getMomentumCard(trips);
  const continueMomentum = () => {
    if (!momentum.trip) {
      onStartDraft();
      return;
    }
    if (momentum.intent === 'compare') {
      onStartMatchup();
      return;
    }
    if (momentum.intent === 'dates' || momentum.intent === 'checklist' || momentum.intent === 'share') {
      onOpenPlan();
      return;
    }
    if (momentum.intent === 'addIdea') {
      onAddIdea();
      return;
    }
    onOpenTrip(momentum.trip.id);
  };

  return (
    <View>
      <ImageBackground source={{ uri: starterImageUris.coast }} style={styles.hero} imageStyle={styles.heroImage}>
        <LinearGradient colors={['rgba(3,8,6,0.28)', 'rgba(3,8,6,0.18)', 'rgba(3,8,6,0.76)']} locations={[0, 0.42, 1]} style={StyleSheet.absoluteFill} />
        <View style={styles.heroCopy}>
          <View style={styles.copyBlock}>
            <Text style={[styles.kicker, { color: theme.accent, fontFamily: font.semibold }]}>Collect. Compare. Commit.</Text>
            <Text style={[styles.title, { fontFamily: font.heading }]}>Collect the ideas. Choose the trip.</Text>
            <Text style={[styles.body, { fontFamily: font.body }]}>Save what you find, shape it into real options, and move toward the trip that feels worth doing.</Text>
          </View>
        </View>
      </ImageBackground>
      <View style={styles.heroActions}>
        <HeroButton label="New Trip Notebook" tone="primary" onPress={onStartDraft} />
        <HeroButton label="Add Inspiration" onPress={onAddIdea} />
      </View>

      <PressableScale onPress={continueMomentum} style={[styles.momentumCard, { backgroundColor: theme.paper, borderColor: theme.line }]}>
        <View style={styles.momentumTop}>
          <Text style={[styles.momentumEyebrow, { fontFamily: font.semibold }]}>{momentum.eyebrow}</Text>
          {momentum.trip && <Text style={[styles.momentumTrip, { fontFamily: font.semibold }]}>{momentum.trip.title}</Text>}
        </View>
        <Text style={[styles.momentumTitle, { fontFamily: font.heading }]}>{momentum.title}</Text>
        <Text style={[styles.momentumBody, { fontFamily: font.body }]}>Next: {momentum.body}</Text>
        <View style={styles.momentumCta}>
          <Text style={[styles.momentumCtaText, { fontFamily: font.semibold }]}>{momentum.cta}</Text>
        </View>
      </PressableScale>

      <View style={[styles.matchupBox, { backgroundColor: theme.paper, borderColor: theme.line }]}>
        <View style={styles.matchupCopy}>
          <Text style={[styles.boxTitle, { color: theme.charcoal, fontFamily: font.heading }]}>Compare trip ideas</Text>
          <Text style={[styles.boxBody, { color: theme.muted, fontFamily: font.body }]}>Compare your trip ideas and see which one feels most worth planning.</Text>
        </View>
        <Button label="Start Compare" onPress={onStartMatchup} />
      </View>

      <View style={styles.sectionHeader}>
        <View style={styles.sectionCopy}>
          <Text style={[styles.sectionTitle, { color: theme.charcoal, fontFamily: font.heading }]}>Trip Drafts</Text>
          <Text style={[styles.sectionHint, { color: theme.muted, fontFamily: font.body }]}>Planning alone or with people, GoWandr helps you choose what’s worth doing.</Text>
        </View>
        <Text style={[styles.sectionMeta, { color: theme.muted, fontFamily: font.semibold }]}>{trips.length} drafts</Text>
      </View>
      {trips.slice(0, 3).map((trip) => (
        <EchoCard key={trip.id} trip={trip} onPress={() => onOpenTrip(trip.id)} />
      ))}
    </View>
  );
}

function HeroButton({ label, onPress, tone = 'secondary' }: { label: string; onPress: () => void; tone?: 'primary' | 'secondary' }) {
  const isPrimary = tone === 'primary';
  return (
    <PressableScale onPress={onPress} containerStyle={isPrimary ? undefined : styles.heroButtonHalf} style={[styles.heroButton, isPrimary ? styles.heroPrimary : styles.heroSecondary]}>
      {isPrimary ? (
        <LinearGradient colors={['#A8F0D4', '#6ED8B5', '#2FAF8A']} locations={[0, 0.45, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroButtonFill}>
          <Text style={[styles.heroPrimaryText, { fontFamily: font.semibold }]}>{label}</Text>
        </LinearGradient>
      ) : (
        <Text style={[styles.heroSecondaryText, { fontFamily: font.semibold }]}>{label}</Text>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  hero: { minHeight: 314, justifyContent: 'flex-end', borderRadius: 30, overflow: 'hidden', marginTop: 4, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 22, shadowOffset: { width: 0, height: 8 }, elevation: 7 },
  heroImage: { borderRadius: 34 },
  heroCopy: { padding: 22, gap: 18 },
  copyBlock: { gap: 8 },
  kicker: { color: colors.sun, fontWeight: '600', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8 },
  title: { color: '#F8F8F6', fontWeight: '700', fontSize: 33, lineHeight: 39, letterSpacing: -0.36, textShadowColor: 'rgba(0,0,0,0.45)', textShadowRadius: 6, textShadowOffset: { width: 0, height: 2 } },
  body: { color: 'rgba(248,248,246,0.92)', fontSize: 14.5, lineHeight: 21, maxWidth: 390, fontWeight: '400', textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 3, textShadowOffset: { width: 0, height: 1 } },
  heroActions: { gap: 10, marginBottom: 16 },
  heroButtonHalf: { flex: 1 },
  heroButton: { minHeight: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  heroPrimary: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, shadowOffset: { width: 0, height: 7 }, elevation: 5 },
  heroSecondary: { backgroundColor: 'rgba(255,255,255,0.76)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.06)', shadowColor: '#000', shadowOpacity: 0.055, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 2 },
  heroButtonFill: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  heroPrimaryText: { color: '#173A33', fontWeight: '600', fontSize: 15 },
  heroSecondaryText: { color: '#26302C', fontWeight: '600', fontSize: 14, textAlign: 'center' },
  momentumCard: { borderRadius: 24, padding: 18, borderWidth: 1, shadowColor: '#173A33', shadowOpacity: 0.09, shadowRadius: 18, shadowOffset: { width: 0, height: 7 }, elevation: 4, gap: 9, marginBottom: 16 },
  momentumTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  momentumEyebrow: { color: '#137D68', fontWeight: '700', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  momentumTrip: { color: 'rgba(32,38,35,0.54)', fontWeight: '600', fontSize: 12, flexShrink: 1, textAlign: 'right' },
  momentumTitle: { color: colors.charcoal, fontWeight: '700', fontSize: 22, lineHeight: 27, letterSpacing: -0.22 },
  momentumBody: { color: colors.muted, fontSize: 14.5, lineHeight: 21 },
  momentumCta: { alignSelf: 'flex-start', marginTop: 4, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8, backgroundColor: 'rgba(168,240,212,0.56)', borderWidth: 1, borderColor: 'rgba(47,175,138,0.18)' },
  momentumCtaText: { color: '#173A33', fontWeight: '700', fontSize: 12.5 },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, marginTop: 22, marginBottom: 14 },
  sectionCopy: { flex: 1 },
  sectionTitle: { color: colors.charcoal, fontWeight: '700', fontSize: 22, letterSpacing: -0.22 },
  sectionHint: { fontSize: 13.5, lineHeight: 19, marginTop: 5 },
  sectionMeta: { color: colors.muted, fontWeight: '600', fontSize: 12, paddingTop: 6 },
  matchupBox: { borderRadius: 24, padding: 18, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.09, shadowRadius: 18, shadowOffset: { width: 0, height: 6 }, elevation: 4, gap: 14 },
  matchupCopy: { gap: 5 },
  boxTitle: { fontWeight: '700', fontSize: 22, letterSpacing: -0.22 },
  boxBody: { fontSize: 14.5, lineHeight: 21 },
});
