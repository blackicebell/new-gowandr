import React, { useMemo } from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { colors, font } from '../theme/colors';
import { explainResult, scoreMatchup } from '../logic/matchupScore';
import { MatchupResultSummary, TripDraft, VoteAnswer } from '../types';
import { shareMatchupResult } from '../utils/shareCards';

export function ResultsScreen({ trips, votes, matchupName, onRestart, onMoveToPlan }: { trips: TripDraft[]; votes: VoteAnswer[]; matchupName: string; onRestart: () => void; onMoveToPlan: (tripId: string, result: MatchupResultSummary) => void }) {
  const results = useMemo(() => scoreMatchup(trips, votes), [trips, votes]);
  const winner = results[0];
  if (!winner) {
    return (
      <View>
        <Text style={styles.kicker}>{matchupName} decision</Text>
        <Text style={styles.title}>No votes yet</Text>
        <Text style={styles.body}>Once someone answers the shared comparison, results will show here.</Text>
        <View style={styles.actions}>
          <Button label="Back to Compare" variant="secondary" onPress={onRestart} />
        </View>
      </View>
    );
  }
  const decisionConfidence = Math.max(62, Math.min(94, Math.round(72 + winner.score / 8)));
  const explanation = explainResult(results);

  return (
    <View>
      <Text style={styles.kicker}>{matchupName} decision</Text>
      <Text style={styles.title}>Commit to {winner.trip.title}?</Text>
      <Text style={styles.body}>{decisionConfidence}% decision confidence. {explanation}</Text>

      <ImageBackground source={{ uri: winner.trip.heroImage }} style={styles.winner} imageStyle={styles.winnerImage}>
        <View style={styles.shade} />
        <View style={styles.scorePill}>
          <Text style={styles.scoreText}>{decisionConfidence}% confident</Text>
        </View>
        <Text style={styles.winnerTitle}>{winner.trip.title}</Text>
      </ImageBackground>

      <View style={styles.grid}>
        <ResultStat label="Most exciting" value={[...results].sort((a, b) => b.excitement - a.excitement)[0].trip.title} />
        <ResultStat label="Easiest yes" value={[...results].sort((a, b) => b.easyYes - a.easyYes)[0].trip.title} />
        <ResultStat label="Concerns" value={`${winner.dealbreakers} flagged`} />
        <ResultStat label="Commitment" value={winner.commitment > 14 ? 'Strong' : 'Building'} />
      </View>

      <View style={styles.actions}>
        <Button label="Commit to This Trip" onPress={() => onMoveToPlan(winner.trip.id, { matchupName, groupMatch: decisionConfidence, summary: explanation, decidedAt: new Date().toISOString() })} />
        <Button label="Share Decision" variant="secondary" onPress={() => shareMatchupResult(matchupName, winner, decisionConfidence, explanation)} />
        <Button label="Compare Again" variant="secondary" onPress={onRestart} />
      </View>
    </View>
  );
}

function ResultStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  kicker: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '600', textTransform: 'uppercase', fontSize: 12, marginTop: 12 },
  title: { color: colors.charcoal, fontFamily: font.heading, fontWeight: '700', fontSize: 34, lineHeight: 39, marginTop: 5, letterSpacing: -0.4 },
  body: { color: colors.muted, fontFamily: font.body, fontWeight: '400', fontSize: 16, lineHeight: 23, marginTop: 9, marginBottom: 18 },
  winner: { minHeight: 330, borderRadius: 28, overflow: 'hidden', justifyContent: 'space-between', marginBottom: 16 },
  winnerImage: { borderRadius: 28 },
  shade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.26)' },
  scorePill: { alignSelf: 'flex-end', margin: 14, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.94)' },
  scoreText: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '600' },
  winnerTitle: { color: colors.white, fontFamily: font.heading, fontWeight: '700', fontSize: 32, padding: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  stat: { width: '48%', minHeight: 96, borderRadius: 20, padding: 14, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line },
  statLabel: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '600', fontSize: 10, textTransform: 'uppercase' },
  statValue: { color: colors.charcoal, fontFamily: font.heading, fontWeight: '700', fontSize: 17, marginTop: 8 },
  actions: { gap: 10, marginTop: 18 },
});
