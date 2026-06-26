import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { EchoCard } from '../components/EchoCard';
import { colors, font, useThemeColors } from '../theme/colors';
import { TripDraft } from '../types';

export function HomeScreen({ trips, onOpenTrip, onStartDraft, onStartMatchup, onAddIdea, onTryDemo }: { trips: TripDraft[]; onOpenTrip: (tripId: string) => void; onStartDraft: () => void; onStartMatchup: () => void; onAddIdea: () => void; onTryDemo: () => void }) {
  const theme = useThemeColors();
  return (
    <View>
      <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80' }} style={styles.hero} imageStyle={styles.heroImage}>
        <View style={styles.heroShade} />
        <View style={styles.heroCopy}>
          <Text style={[styles.kicker, { color: theme.accent, fontFamily: font.family }]}>GoWandr Trip Ideas</Text>
          <Text style={[styles.title, { fontFamily: font.family }]}>Turn travel ideas into a decision.</Text>
          <Text style={[styles.body, { fontFamily: font.family }]}>Save the places you are dreaming about, compare trip ideas with your group, and choose the one that actually feels worth doing.</Text>
          <View style={styles.actions}>
            <Button label="Start a Trip Draft" onPress={onStartDraft} />
            <Button label="Add Inspiration" variant="secondary" onPress={onAddIdea} />
            <Button label="Try Demo Matchup" variant="secondary" onPress={onTryDemo} />
          </View>
        </View>
      </ImageBackground>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.charcoal, fontFamily: font.family }]}>Saved Trip Ideas</Text>
        <Text style={[styles.sectionMeta, { color: theme.muted, fontFamily: font.family }]}>{trips.length} saved</Text>
      </View>
      {trips.slice(0, 3).map((trip) => (
        <EchoCard key={trip.id} trip={trip} onPress={() => onOpenTrip(trip.id)} />
      ))}

      <View style={[styles.matchupBox, { backgroundColor: theme.paper, borderColor: theme.line }]}>
        <Text style={[styles.boxTitle, { color: theme.charcoal, fontFamily: font.family }]}>Ready to stop debating?</Text>
        <Text style={[styles.boxBody, { color: theme.muted, fontFamily: font.family }]}>Pick 2 to 4 drafts, vote in under a minute, and see which trip has real momentum.</Text>
        <Button label="Create Matchup" onPress={onStartMatchup} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { minHeight: 520, justifyContent: 'flex-end', borderRadius: 34, overflow: 'hidden', marginTop: 8, marginBottom: 26 },
  heroImage: { borderRadius: 34 },
  heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(3,8,6,0.42)' },
  heroCopy: { padding: 22 },
  kicker: { color: colors.sun, fontWeight: '900', fontSize: 12, textTransform: 'uppercase', marginBottom: 8 },
  title: { color: colors.white, fontWeight: '900', fontSize: 42, lineHeight: 45, letterSpacing: 0 },
  body: { color: colors.white, fontSize: 16, lineHeight: 23, marginTop: 12, opacity: 0.94 },
  actions: { gap: 10, marginTop: 18 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { color: colors.charcoal, fontWeight: '900', fontSize: 22 },
  sectionMeta: { color: colors.muted, fontWeight: '800', fontSize: 12 },
  matchupBox: { borderRadius: 28, padding: 20, marginTop: 8, borderWidth: 1 },
  boxTitle: { color: colors.white, fontWeight: '900', fontSize: 24 },
  boxBody: { color: colors.mist, fontSize: 15, lineHeight: 22, marginVertical: 12 },
});
