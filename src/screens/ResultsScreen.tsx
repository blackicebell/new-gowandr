import React, { useMemo } from 'react';
import { ImageBackground, Share, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';
import { explainResult, scoreMatchup } from '../logic/matchupScore';
import { TripDraft, VoteAnswer } from '../types';

export function ResultsScreen({ trips, votes, matchupName, onRestart, onOpenLab }: { trips: TripDraft[]; votes: VoteAnswer[]; matchupName: string; onRestart: () => void; onOpenLab: (tripId: string) => void }) {
  const results = useMemo(() => scoreMatchup(trips, votes), [trips, votes]);
  const winner = results[0];
  const groupMatch = Math.max(62, Math.min(94, Math.round(72 + winner.score / 8)));
  const shareResults = () => {
    Share.share({
      message: `GoWandr matchup result for ${matchupName}:\n\nWinner: ${winner.trip.title}\n${groupMatch}% group match\n\n${explainResult(results)}\n\nNext step: move the winner into Trip Lab and plan the must-dos.`,
    }).catch(() => undefined);
  };

  return (
    <View>
      <Text style={styles.kicker}>{matchupName} result</Text>
      <Text style={styles.title}>Best Choice: {winner.trip.title}</Text>
      <Text style={styles.body}>{groupMatch}% group match. {explainResult(results)}</Text>

      <ImageBackground source={{ uri: winner.trip.heroImage }} style={styles.winner} imageStyle={styles.winnerImage}>
        <View style={styles.shade} />
        <View style={styles.scorePill}>
          <Text style={styles.scoreText}>{groupMatch}% match</Text>
        </View>
        <Text style={styles.winnerTitle}>{winner.trip.title}</Text>
      </ImageBackground>

      <View style={styles.grid}>
        <ResultStat label="Most exciting" value={[...results].sort((a, b) => b.excitement - a.excitement)[0].trip.title} />
        <ResultStat label="Easiest yes" value={[...results].sort((a, b) => b.easyYes - a.easyYes)[0].trip.title} />
        <ResultStat label="Dealbreakers" value={`${winner.dealbreakers} flagged`} />
        <ResultStat label="Commitment" value={winner.commitment > 14 ? 'Strong' : 'Building'} />
      </View>

      <View style={styles.actions}>
        <Button label="Move to Trip Lab" onPress={() => onOpenLab(winner.trip.id)} />
        <Button label="Share Result" variant="secondary" onPress={shareResults} />
        <Button label="Run Another Matchup" variant="secondary" onPress={onRestart} />
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
  kicker: { color: colors.tealDark, fontWeight: '800', textTransform: 'uppercase', fontSize: 12, marginTop: 12 },
  title: { color: colors.charcoal, fontWeight: '800', fontSize: 34, lineHeight: 39, marginTop: 5, letterSpacing: -0.4 },
  body: { color: colors.muted, fontSize: 16, lineHeight: 23, marginTop: 9, marginBottom: 18 },
  winner: { minHeight: 330, borderRadius: 28, overflow: 'hidden', justifyContent: 'space-between', marginBottom: 16 },
  winnerImage: { borderRadius: 28 },
  shade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.26)' },
  scorePill: { alignSelf: 'flex-end', margin: 14, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.94)' },
  scoreText: { color: colors.tealDark, fontWeight: '800' },
  winnerTitle: { color: colors.white, fontWeight: '800', fontSize: 32, padding: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  stat: { width: '48%', minHeight: 96, borderRadius: 20, padding: 14, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line },
  statLabel: { color: colors.tealDark, fontWeight: '800', fontSize: 10, textTransform: 'uppercase' },
  statValue: { color: colors.charcoal, fontWeight: '800', fontSize: 17, marginTop: 8 },
  actions: { gap: 10, marginTop: 18 },
});
