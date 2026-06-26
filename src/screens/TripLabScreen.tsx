import React, { useState } from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { getPaceHealth, paceGuidance } from '../logic/tripPace';
import { colors } from '../theme/colors';
import { TripDraft } from '../types';

export function TripLabScreen({ trip, onBack }: { trip: TripDraft; onBack: () => void }) {
  const [pace, setPace] = useState(trip.pace);
  const guidance = paceGuidance[pace];
  const paceHealth = getPaceHealth(trip, pace);
  const topIdeas = trip.ideas.filter((idea) => idea.priority === 'Must-do').slice(0, guidance.idealMustDos);
  const backupIdeas = trip.ideas.filter((idea) => idea.priority !== 'Must-do').slice(0, 3);

  return (
    <View>
      <Text style={styles.back} onPress={onBack}>Back home</Text>
      <Text style={styles.kicker}>Trip Lab</Text>
      <Text style={styles.title}>{trip.title}</Text>
      <Text style={styles.body}>Trip Pace decides how full the plan should feel. GoWandr uses it to keep a chill trip from getting overloaded or a high-energy trip from feeling too vague.</Text>

      <ImageBackground source={{ uri: trip.heroImage }} style={styles.card} imageStyle={styles.cardImage}>
        <View style={styles.shade} />
        <Text style={styles.cardTitle}>Final plan draft</Text>
      </ImageBackground>

      <Text style={styles.sectionTitle}>Top must-dos</Text>
      <Text style={styles.sectionHelper}>{pace} trips work best with about {guidance.idealMustDos} must-do {guidance.idealMustDos === 1 ? 'anchor' : 'anchors'}.</Text>
      <View style={styles.ideaList}>
        {topIdeas.map((idea, index) => (
          <View key={idea.id} style={styles.ideaRow}>
            <Text style={styles.ideaNumber}>{index + 1}</Text>
            <View style={styles.ideaCopy}>
              <Text style={styles.ideaTitle}>{idea.title}</Text>
              <Text style={styles.ideaMeta}>{idea.category}</Text>
            </View>
          </View>
        ))}
        {!topIdeas.length && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No must-dos yet</Text>
            <Text style={styles.emptyBody}>Add or mark a few ideas as must-do so Trip Lab can shape the plan around what actually matters.</Text>
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>Trip pace</Text>
      <View style={styles.wrap}>
        {(['Relaxed', 'Balanced', 'Packed'] as const).map((item) => (
          <Chip key={item} label={item} active={pace === item} onPress={() => setPace(item)} />
        ))}
      </View>
      <View style={[styles.paceNote, paceHealth.tone === 'warning' && styles.paceWarning]}>
        <Text style={styles.paceNoteTitle}>{guidance.short}</Text>
        <Text style={styles.paceNoteBody}>{paceHealth.message}</Text>
      </View>

      <Text style={styles.sectionTitle}>Simple sections</Text>
      <View style={styles.sections}>
        <PlanBucket label="Day" value={topIdeas[0]?.title ?? getEmptyBucketCopy(pace, 'Day')} />
        <PlanBucket label="Night" value={topIdeas[1]?.title ?? getEmptyBucketCopy(pace, 'Night')} />
        <PlanBucket label="Food" value={trip.ideas.find((idea) => idea.category === 'Food')?.title ?? 'Save one food stop'} />
        <PlanBucket label="Backup" value={backupIdeas[0]?.title ?? getBackupCopy(pace)} />
      </View>

      <View style={styles.finalCard}>
        <Text style={styles.finalLabel}>Shareable decision card</Text>
        <Text style={styles.finalTitle}>{trip.title}</Text>
        <Text style={styles.finalBody}>{pace} pace means {guidance.short.toLowerCase()} Top must-do: {topIdeas[0]?.title ?? 'choose one anchor'}.</Text>
      </View>

      <Button label="Save Final Plan" onPress={onBack} />
    </View>
  );
}

function PlanBucket({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.bucket}>
      <Text style={styles.bucketLabel}>{label}</Text>
      <Text style={styles.bucketValue}>{value}</Text>
    </View>
  );
}

function getEmptyBucketCopy(pace: TripDraft['pace'], bucket: 'Day' | 'Night') {
  if (pace === 'Relaxed') return bucket === 'Day' ? 'One easy daytime anchor' : 'Keep the night flexible';
  if (pace === 'Packed') return bucket === 'Day' ? 'Stack 2 daytime plans' : 'Choose a clear night plan';
  return bucket === 'Day' ? 'Pick a daytime anchor' : 'Choose one night plan';
}

function getBackupCopy(pace: TripDraft['pace']) {
  if (pace === 'Relaxed') return 'Move extras here to protect downtime';
  if (pace === 'Packed') return 'Keep a fallback if the day runs long';
  return 'Keep one easy fallback';
}

const styles = StyleSheet.create({
  back: { color: colors.tealDark, fontWeight: '900', paddingVertical: 10 },
  kicker: { color: colors.coral, fontWeight: '900', textTransform: 'uppercase', fontSize: 12 },
  title: { color: colors.charcoal, fontWeight: '900', fontSize: 36, marginTop: 4 },
  body: { color: colors.muted, fontSize: 16, lineHeight: 23, marginTop: 8, marginBottom: 18 },
  card: { minHeight: 260, borderRadius: 28, overflow: 'hidden', justifyContent: 'flex-end', marginBottom: 18 },
  cardImage: { borderRadius: 28 },
  shade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  cardTitle: { color: colors.white, fontWeight: '900', fontSize: 30, padding: 20 },
  sectionTitle: { color: colors.charcoal, fontWeight: '900', fontSize: 21, marginTop: 16, marginBottom: 10 },
  sectionHelper: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: -4, marginBottom: 10 },
  ideaList: { gap: 10 },
  ideaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 20, backgroundColor: colors.paper, padding: 14, borderWidth: 1, borderColor: colors.line },
  ideaNumber: { width: 34, height: 34, borderRadius: 17, textAlign: 'center', textAlignVertical: 'center', lineHeight: 34, backgroundColor: colors.teal, color: colors.white, fontWeight: '900' },
  ideaCopy: { flex: 1 },
  ideaTitle: { color: colors.charcoal, fontWeight: '900', fontSize: 16 },
  ideaMeta: { color: colors.muted, fontWeight: '700', marginTop: 2 },
  emptyState: { borderRadius: 20, backgroundColor: colors.paper, padding: 16, borderWidth: 1, borderColor: colors.line },
  emptyTitle: { color: colors.charcoal, fontWeight: '900', fontSize: 16 },
  emptyBody: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 5 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  paceNote: { backgroundColor: colors.cloud, borderRadius: 20, padding: 14, marginTop: 10, borderWidth: 1, borderColor: colors.mist },
  paceWarning: { backgroundColor: '#FFF3E7', borderColor: '#F1C7A2' },
  paceNoteTitle: { color: colors.charcoal, fontWeight: '900', fontSize: 15 },
  paceNoteBody: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 5 },
  sections: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  bucket: { width: '48%', minHeight: 92, borderRadius: 20, padding: 14, backgroundColor: colors.cloud },
  bucketLabel: { color: colors.tealDark, fontWeight: '900', textTransform: 'uppercase', fontSize: 11 },
  bucketValue: { color: colors.charcoal, fontWeight: '900', fontSize: 16, marginTop: 8 },
  finalCard: { backgroundColor: colors.charcoal, borderRadius: 24, padding: 18, marginVertical: 18 },
  finalLabel: { color: colors.sun, fontWeight: '900', textTransform: 'uppercase', fontSize: 11 },
  finalTitle: { color: colors.white, fontWeight: '900', fontSize: 25, marginTop: 6 },
  finalBody: { color: colors.mist, fontSize: 15, lineHeight: 22, marginTop: 8 },
});
