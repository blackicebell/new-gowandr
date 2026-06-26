import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export function ScoreRing({ score, label }: { score: number; label: string }) {
  return (
    <View style={styles.ring}>
      <Text style={styles.score}>{score}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { width: 94, height: 94, borderRadius: 47, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cloud, borderWidth: 8, borderColor: colors.teal },
  score: { color: colors.charcoal, fontSize: 26, fontWeight: '900' },
  label: { color: colors.muted, fontSize: 10, fontWeight: '800', marginTop: 1 },
});
