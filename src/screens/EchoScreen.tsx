import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { EchoCard } from '../components/EchoCard';
import { colors, font, useThemeColors } from '../theme/colors';
import { TripDraft } from '../types';

export function EchoScreen({ trips, onOpenTrip, onCreateTrip, onCreateMatchup }: { trips: TripDraft[]; onOpenTrip: (tripId: string) => void; onCreateTrip: () => void; onCreateMatchup: () => void }) {
  const theme = useThemeColors();
  return (
    <View>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.charcoal, fontFamily: font.family }]}>Trip Ideas</Text>
        <Text style={[styles.body, { color: theme.muted, fontFamily: font.family }]}>A lighter place to catch links, screenshots, notes, and loose ideas before they disappear in group chats.</Text>
        <View style={styles.actions}>
          <Button label="New Trip Idea" onPress={onCreateTrip} />
          <Button label="Compare Drafts" variant="secondary" onPress={onCreateMatchup} />
        </View>
      </View>
      {trips.map((trip) => (
        <EchoCard key={trip.id} trip={trip} onPress={() => onOpenTrip(trip.id)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingVertical: 24 },
  title: { color: colors.charcoal, fontWeight: '700', fontSize: 42, lineHeight: 50, letterSpacing: -0.42 },
  body: { color: colors.muted, fontSize: 16, lineHeight: 24, marginTop: 10, marginBottom: 20 },
  actions: { gap: 12 },
});
