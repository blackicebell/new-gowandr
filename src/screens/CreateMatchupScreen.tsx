import React, { useMemo, useState } from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';
import { TripDraft } from '../types';
import { shareMatchupInvite } from '../utils/shareCards';

export function CreateMatchupScreen({ trips, onBack, onStart }: { trips: TripDraft[]; onBack: () => void; onStart: (tripIds: string[], matchupName: string) => void }) {
  const [selected, setSelected] = useState<string[]>(['miami', 'new-orleans']);
  const sortedTrips = useMemo(
    () => [...trips].sort((a, b) => Number(selected.includes(b.id)) - Number(selected.includes(a.id))),
    [selected, trips],
  );
  const selectedTrips = trips.filter((trip) => selected.includes(trip.id));
  const toggleTrip = (tripId: string) => {
    setSelected((current) => {
      if (current.includes(tripId)) return current.filter((id) => id !== tripId);
      if (current.length >= 4) return current;
      return [...current, tripId];
    });
  };

  return (
    <View>
      <Text style={styles.back} onPress={onBack}>Back home</Text>
      <Text style={styles.title}>Create Matchup</Text>
      <Text style={styles.body}>Choose 2 to 4 trip drafts. Voting is intentionally short so friends can answer before the group chat wanders off.</Text>
      <View style={styles.list}>
        {sortedTrips.map((trip) => {
          const active = selected.includes(trip.id);
          return (
            <TouchableOpacity key={trip.id} onPress={() => toggleTrip(trip.id)} style={[styles.tripRow, active && styles.tripRowActive]}>
              <ImageBackground source={{ uri: trip.heroImage }} style={styles.thumb} imageStyle={styles.thumbImage}>
                {active && <View style={styles.thumbTint} />}
              </ImageBackground>
              <View style={styles.rowCopy}>
                <Text style={styles.tripTitle}>{trip.title}</Text>
                <Text style={styles.tripMeta}>{trip.pace} pace • {trip.companionType}</Text>
              </View>
              <Text style={[styles.check, active && styles.checkActive]}>{active ? 'Selected' : 'Add'}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.sharePreview}>
        <Text style={styles.previewLabel}>Share preview</Text>
        <Text style={styles.previewTitle}>Weekend Escape</Text>
        <Text style={styles.previewBody}>No login needed. Start the in-app vote here, or share a text version to group chat and collect replies there.</Text>
      </View>
      <View style={styles.actions}>
        <Button label="Start Voting" disabled={selected.length < 2} onPress={() => onStart(selected, 'Weekend Escape')} />
        <Button label="Share to Group Chat" variant="secondary" disabled={selected.length < 2} onPress={() => shareMatchupInvite('Weekend Escape', selectedTrips)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { color: colors.tealDark, fontWeight: '800', paddingVertical: 10 },
  title: { color: colors.charcoal, fontWeight: '800', fontSize: 36, letterSpacing: -0.4 },
  body: { color: colors.muted, fontSize: 16, lineHeight: 23, marginTop: 8, marginBottom: 18 },
  list: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  tripRow: { width: '48%', minHeight: 176, gap: 10, padding: 10, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.82)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.06)', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 1 },
  tripRowActive: { borderColor: '#2FAF8A', backgroundColor: 'rgba(168,240,212,0.32)', shadowOpacity: 0.09, shadowRadius: 14 },
  thumb: { width: '100%', height: 88, borderRadius: 16, overflow: 'hidden' },
  thumbImage: { borderRadius: 16 },
  thumbTint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(168,240,212,0.16)' },
  rowCopy: { flex: 1, justifyContent: 'center' },
  tripTitle: { color: colors.charcoal, fontWeight: '800', fontSize: 16, lineHeight: 20 },
  tripMeta: { color: colors.muted, fontWeight: '700', marginTop: 4, fontSize: 12 },
  check: { color: 'rgba(32,38,35,0.62)', fontWeight: '800', fontSize: 12 },
  checkActive: { color: '#137D68' },
  sharePreview: { backgroundColor: colors.charcoal, borderRadius: 24, padding: 18, marginBottom: 16 },
  previewLabel: { color: colors.sun, fontWeight: '800', fontSize: 11, textTransform: 'uppercase' },
  previewTitle: { color: colors.white, fontWeight: '800', fontSize: 24, marginTop: 5 },
  previewBody: { color: colors.mist, fontSize: 14, lineHeight: 21, marginTop: 8 },
  actions: { gap: 10 },
});
