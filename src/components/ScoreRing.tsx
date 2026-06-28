import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { font, useThemeColors } from '../theme/colors';

export function ScoreRing({ score, label }: { score: number; label: string }) {
  const colors = useThemeColors();
  return (
    <View style={[styles.ring, { backgroundColor: colors.paperSoft, borderColor: colors.teal }]}>
      <Text style={[styles.score, { color: colors.charcoal, fontFamily: font.heading }]}>{score}</Text>
      <Text style={[styles.label, { color: colors.muted, fontFamily: font.semibold }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { width: 94, height: 94, borderRadius: 47, alignItems: 'center', justifyContent: 'center', borderWidth: 8 },
  score: { fontSize: 26, fontWeight: '700', letterSpacing: -0.2 },
  label: { fontSize: 10, fontWeight: '600', marginTop: 1, letterSpacing: 0 },
});
