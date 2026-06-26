import React, { useState } from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';
import { TripDraft } from '../types';

export function CreateMatchupScreen({ trips, onBack, onStart }: { trips: TripDraft[]; onBack: () => void; onStart: (tripIds: string[], matchupName: string) => void }) {
  const [selected, setSelected] = useState<string[]>(['miami', 'new-orleans']);
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
        {trips.map((trip) => {
          const active = selected.includes(trip.id);
          return (
            <TouchableOpacity key={trip.id} onPress={() => toggleTrip(trip.id)} style={[styles.tripRow, active && styles.tripRowActive]}>
              <ImageBackground source={{ uri: trip.heroImage }} style={styles.thumb} imageStyle={styles.thumbImage} />
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
        <Text style={styles.previewBody}>No login needed. Friends enter a nickname, vote, and you see what feels exciting versus realistic.</Text>
      </View>
      <Button label="Start Voting" disabled={selected.length < 2} onPress={() => onStart(selected, 'Weekend Escape')} />
    </View>
  );
}

const styles = StyleSheet.create({
  back: { color: colors.tealDark, fontWeight: '900', paddingVertical: 10 },
  title: { color: colors.charcoal, fontWeight: '900', fontSize: 36 },
  body: { color: colors.muted, fontSize: 16, lineHeight: 23, marginTop: 8, marginBottom: 18 },
  list: { gap: 10, marginBottom: 16 },
  tripRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.82)', borderWidth: 1, borderColor: 'rgba(15,17,21,0.05)', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 1 },
  tripRowActive: { borderColor: '#2FAF8A', backgroundColor: 'rgba(168,240,212,0.32)', shadowOpacity: 0.09, shadowRadius: 14 },
  thumb: { width: 76, height: 68, borderRadius: 16, overflow: 'hidden' },
  thumbImage: { borderRadius: 16 },
  rowCopy: { flex: 1 },
  tripTitle: { color: colors.charcoal, fontWeight: '900', fontSize: 16 },
  tripMeta: { color: colors.muted, fontWeight: '700', marginTop: 4, fontSize: 12 },
  check: { color: 'rgba(15,17,21,0.62)', fontWeight: '900', fontSize: 12 },
  checkActive: { color: '#137D68' },
  sharePreview: { backgroundColor: colors.charcoal, borderRadius: 24, padding: 18, marginBottom: 16 },
  previewLabel: { color: colors.sun, fontWeight: '900', fontSize: 11, textTransform: 'uppercase' },
  previewTitle: { color: colors.white, fontWeight: '900', fontSize: 24, marginTop: 5 },
  previewBody: { color: colors.mist, fontSize: 14, lineHeight: 21, marginTop: 8 },
});
