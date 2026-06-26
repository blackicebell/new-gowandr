import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { EchoCard } from '../components/EchoCard';
import { colors } from '../theme/colors';
import { TripDraft } from '../types';

export function HomeScreen({ trips, onOpenTrip, onStartDraft, onStartMatchup, onTryDemo }: { trips: TripDraft[]; onOpenTrip: (tripId: string) => void; onStartDraft: () => void; onStartMatchup: () => void; onTryDemo: () => void }) {
  return (
    <View>
      <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80' }} style={styles.hero} imageStyle={styles.heroImage}>
        <View style={styles.heroShade} />
        <View style={styles.heroCopy}>
          <Text style={styles.kicker}>GoWandr Echo</Text>
          <Text style={styles.title}>Turn travel ideas into a decision.</Text>
          <Text style={styles.body}>Save the places you are dreaming about, compare trip ideas with your group, and choose the one that actually feels worth doing.</Text>
          <View style={styles.actions}>
            <Button label="Start a Trip Draft" onPress={onStartDraft} />
            <Button label="Try Demo Matchup" variant="secondary" onPress={onTryDemo} />
          </View>
        </View>
      </ImageBackground>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Active Trip Drafts</Text>
        <Text style={styles.sectionMeta}>{trips.length} saved</Text>
      </View>
      {trips.slice(0, 3).map((trip) => (
        <EchoCard key={trip.id} trip={trip} onPress={() => onOpenTrip(trip.id)} />
      ))}

      <View style={styles.matchupBox}>
        <Text style={styles.boxTitle}>Ready to stop debating?</Text>
        <Text style={styles.boxBody}>Pick 2 to 4 drafts, vote in under a minute, and see which trip has real momentum.</Text>
        <Button label="Create Matchup" onPress={onStartMatchup} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { minHeight: 520, justifyContent: 'flex-end', borderRadius: 30, overflow: 'hidden', marginTop: 8, marginBottom: 26 },
  heroImage: { borderRadius: 30 },
  heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,28,25,0.34)' },
  heroCopy: { padding: 22 },
  kicker: { color: colors.sun, fontWeight: '900', fontSize: 12, textTransform: 'uppercase', marginBottom: 8 },
  title: { color: colors.white, fontWeight: '900', fontSize: 38, lineHeight: 42 },
  body: { color: colors.white, fontSize: 16, lineHeight: 23, marginTop: 12, opacity: 0.94 },
  actions: { gap: 10, marginTop: 18 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { color: colors.charcoal, fontWeight: '900', fontSize: 22 },
  sectionMeta: { color: colors.muted, fontWeight: '800', fontSize: 12 },
  matchupBox: { backgroundColor: colors.charcoal, borderRadius: 26, padding: 20, marginTop: 8 },
  boxTitle: { color: colors.white, fontWeight: '900', fontSize: 24 },
  boxBody: { color: colors.mist, fontSize: 15, lineHeight: 22, marginVertical: 12 },
});
