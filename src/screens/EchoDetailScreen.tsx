import React from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { IdeaCard } from '../components/IdeaCard';
import { ScoreRing } from '../components/ScoreRing';
import { calculateClarityScore } from '../logic/clarityScore';
import { getEchoSummary } from '../logic/summaries';
import { colors } from '../theme/colors';
import { TripDraft } from '../types';

export function EchoDetailScreen({ trip, onBack, onAddIdea, onCompare, onOpenLab }: { trip: TripDraft; onBack: () => void; onAddIdea: () => void; onCompare: () => void; onOpenLab: () => void }) {
  const clarity = calculateClarityScore(trip);
  const mustDos = trip.ideas.filter((idea) => idea.priority === 'Must-do');
  const maybes = trip.ideas.filter((idea) => idea.priority !== 'Must-do');

  return (
    <View>
      <TouchableOpacity onPress={onBack} style={styles.back}>
        <Text style={styles.backText}>Back to Echo</Text>
      </TouchableOpacity>
      <ImageBackground source={{ uri: trip.heroImage }} style={styles.hero} imageStyle={styles.heroImage}>
        <View style={styles.shade} />
        <View style={styles.heroCopy}>
          <Text style={styles.title}>{trip.title}</Text>
          <Text style={styles.subtitle}>{trip.subtitle}</Text>
        </View>
      </ImageBackground>

      <View style={styles.summaryCard}>
        <ScoreRing score={clarity.score} label="clarity" />
        <View style={styles.summaryCopy}>
          <Text style={styles.summaryLabel}>Echo summary</Text>
          <Text style={styles.summary}>{getEchoSummary(trip)}</Text>
        </View>
      </View>

      <View style={styles.chips}>
        {trip.tags.map((tag) => (
          <Chip key={tag} label={tag} active />
        ))}
      </View>

      <View style={styles.actions}>
        <Button label="Add Idea" onPress={onAddIdea} />
        <Button label="Compare This Trip" variant="secondary" onPress={onCompare} />
        <Button label="Pick Top 3" variant="ghost" onPress={onOpenLab} />
      </View>

      <Text style={styles.sectionTitle}>Must-dos</Text>
      <View style={styles.grid}>
        {mustDos.map((idea) => (
          <IdeaCard key={idea.id} idea={idea} />
        ))}
      </View>

      <Text style={styles.sectionTitle}>Maybe / backup</Text>
      <View style={styles.grid}>
        {maybes.map((idea) => (
          <IdeaCard key={idea.id} idea={idea} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start', paddingVertical: 10 },
  backText: { color: colors.tealDark, fontWeight: '900' },
  hero: { minHeight: 320, justifyContent: 'flex-end', borderRadius: 28, overflow: 'hidden' },
  heroImage: { borderRadius: 28 },
  shade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.26)' },
  heroCopy: { padding: 20 },
  title: { color: colors.white, fontWeight: '900', fontSize: 36 },
  subtitle: { color: colors.white, fontSize: 15, lineHeight: 22, marginTop: 6, opacity: 0.94 },
  summaryCard: { flexDirection: 'row', gap: 16, alignItems: 'center', backgroundColor: colors.paper, borderRadius: 24, padding: 16, marginTop: 16, borderWidth: 1, borderColor: colors.line },
  summaryCopy: { flex: 1 },
  summaryLabel: { color: colors.coral, fontWeight: '900', fontSize: 11, textTransform: 'uppercase' },
  summary: { color: colors.charcoal, fontSize: 16, lineHeight: 23, marginTop: 5, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  actions: { gap: 10, marginVertical: 20 },
  sectionTitle: { color: colors.charcoal, fontWeight: '900', fontSize: 22, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 12 },
});
