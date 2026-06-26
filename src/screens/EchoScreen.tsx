import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { EchoCard } from '../components/EchoCard';
import { colors } from '../theme/colors';
import { TripDraft } from '../types';

export function EchoScreen({ trips, onOpenTrip, onCreateTrip, onCreateMatchup }: { trips: TripDraft[]; onOpenTrip: (tripId: string) => void; onCreateTrip: () => void; onCreateMatchup: () => void }) {
  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Trip Ideas</Text>
        <Text style={styles.body}>A lighter place to catch links, screenshots, notes, and loose ideas before they disappear in group chats.</Text>
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
  header: { paddingVertical: 18 },
  title: { color: colors.charcoal, fontWeight: '900', fontSize: 38 },
  body: { color: colors.muted, fontSize: 16, lineHeight: 23, marginTop: 8, marginBottom: 16 },
  actions: { gap: 10 },
});
