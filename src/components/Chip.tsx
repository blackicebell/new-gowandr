import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { font, useThemeColors } from '../theme/colors';

export function Chip({ label, active = false, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  const colors = useThemeColors();
  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress} style={[styles.chip, { backgroundColor: 'rgba(255,255,255,0.72)', borderColor: 'rgba(32,38,35,0.08)' }, active && { backgroundColor: colors.teal, borderColor: colors.tealDark }]}>
      <Text style={[styles.text, { color: colors.charcoal, fontFamily: font.family }, active && styles.activeText]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: { minHeight: 36, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 12.5, fontWeight: '700', letterSpacing: -0.05 },
  activeText: { color: '#202623' },
});
