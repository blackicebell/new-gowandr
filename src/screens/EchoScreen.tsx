import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { EchoCard } from '../components/EchoCard';
import { PressableScale } from '../components/PressableScale';
import { getMomentumStatus } from '../logic/momentum';
import { colors, font, useThemeColors } from '../theme/colors';
import { TripDraft } from '../types';

type Filter = 'All' | 'Solo' | 'Group' | 'Ready' | 'Needs work';

const filters: Filter[] = ['All', 'Solo', 'Group', 'Ready', 'Needs work'];

export function EchoScreen({ trips, onOpenTrip, onCreateTrip, onCreateMatchup }: { trips: TripDraft[]; onOpenTrip: (tripId: string) => void; onCreateTrip: () => void; onCreateMatchup: () => void }) {
  const theme = useThemeColors();
  const [filter, setFilter] = useState<Filter>('All');
  const filteredTrips = useMemo(() => trips.filter((trip) => matchesFilter(trip, filter)), [filter, trips]);

  return (
    <View>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.charcoal, fontFamily: font.heading }]}>Trip Ideas</Text>
        <Text style={[styles.body, { color: theme.muted, fontFamily: font.body }]}>Save travel ideas, shape them into options, and choose what’s actually worth planning.</Text>
        <View style={styles.actions}>
          <BoardAction label="New Trip Idea" tone="primary" onPress={onCreateTrip} />
          <BoardAction label="Compare Ideas" tone="secondary" onPress={onCreateMatchup} />
        </View>
        <View style={styles.filterRow}>
          {filters.map((item) => (
            <TouchableOpacity key={item} onPress={() => setFilter(item)} style={[styles.filterChip, filter === item && styles.filterChipActive]}>
              <Text style={[styles.filterText, filter === item && styles.filterTextActive, { fontFamily: font.semibold }]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {!trips.length ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { fontFamily: font.heading }]}>Start with one place, one link, or one idea.</Text>
          <Text style={[styles.emptyBody, { fontFamily: font.body }]}>GoWandr works best when you catch the idea before it disappears.</Text>
          <BoardAction label="Create your first trip idea" tone="primary" onPress={onCreateTrip} />
        </View>
      ) : !filteredTrips.length ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { fontFamily: font.heading }]}>Nothing here yet.</Text>
          <Text style={[styles.emptyBody, { fontFamily: font.body }]}>Try another filter or add a new trip idea.</Text>
        </View>
      ) : (
        <View style={styles.cardList}>
          {filteredTrips.map((trip) => (
            <EchoCard key={trip.id} trip={trip} onPress={() => onOpenTrip(trip.id)} />
          ))}
        </View>
      )}
    </View>
  );
}

function BoardAction({ label, tone, onPress }: { label: string; tone: 'primary' | 'secondary'; onPress: () => void }) {
  const isPrimary = tone === 'primary';
  return (
    <PressableScale onPress={onPress} style={[styles.boardButton, isPrimary ? styles.boardPrimary : styles.boardSecondary]}>
      {isPrimary ? (
        <LinearGradient colors={['#A8F0D4', '#6ED8B5', '#2FAF8A']} locations={[0, 0.45, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.boardButtonFill}>
          <Text style={[styles.boardPrimaryText, { fontFamily: font.semibold }]}>{label}</Text>
        </LinearGradient>
      ) : (
        <>
          <View style={styles.compareIcon}>
            <Text style={[styles.compareIconText, { fontFamily: font.heading }]}>vs</Text>
          </View>
          <Text style={[styles.boardSecondaryText, { fontFamily: font.semibold }]}>{label}</Text>
        </>
      )}
    </PressableScale>
  );
}

function matchesFilter(trip: TripDraft, filter: Filter) {
  const status = getMomentumStatus(trip);
  if (filter === 'Solo') return trip.companionType === 'Solo';
  if (filter === 'Group') return trip.companionType !== 'Solo';
  if (filter === 'Ready') return ['Ready to compare', 'Strong option', 'Committed', 'Preparing', 'Ready to book'].includes(status);
  if (filter === 'Needs work') return ['Just started', 'Taking shape'].includes(status);
  return true;
}

const styles = StyleSheet.create({
  header: { paddingTop: 14, paddingBottom: 22 },
  title: { color: colors.charcoal, fontWeight: '700', fontSize: 42, lineHeight: 50, letterSpacing: -0.42 },
  body: { color: colors.muted, fontSize: 16, lineHeight: 24, marginTop: 8, marginBottom: 16, fontWeight: '400' },
  actions: { gap: 10 },
  boardButton: { minHeight: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  boardPrimary: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: 7 }, elevation: 5 },
  boardSecondary: { flexDirection: 'row', gap: 9, backgroundColor: 'rgba(168,240,212,0.20)', borderWidth: 1, borderColor: 'rgba(47,175,138,0.30)', shadowColor: '#2FAF8A', shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 2 },
  boardButtonFill: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  boardPrimaryText: { color: '#173A33', fontWeight: '700', fontSize: 15 },
  boardSecondaryText: { color: '#173A33', fontWeight: '700', fontSize: 15 },
  compareIcon: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(168,240,212,0.62)' },
  compareIconText: { color: '#137D68', fontSize: 14, fontWeight: '700' },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  filterChip: { minHeight: 38, borderRadius: 999, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, backgroundColor: 'rgba(255,255,255,0.68)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)' },
  filterChipActive: { backgroundColor: 'rgba(168,240,212,0.66)', borderColor: 'rgba(47,175,138,0.22)' },
  filterText: { color: 'rgba(32,38,35,0.62)', fontWeight: '700', fontSize: 12.5 },
  filterTextActive: { color: '#173A33' },
  cardList: { paddingTop: 4 },
  emptyState: { borderRadius: 26, padding: 20, backgroundColor: 'rgba(255,255,255,0.78)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: 7 }, elevation: 4, gap: 12 },
  emptyTitle: { color: colors.charcoal, fontSize: 23, lineHeight: 28, fontWeight: '700', letterSpacing: -0.23 },
  emptyBody: { color: colors.muted, fontSize: 15, lineHeight: 22, marginBottom: 4 },
});
