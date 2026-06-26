import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { font, useThemeColors } from '../theme/colors';

export function Chip({ label, active = false, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  const colors = useThemeColors();
  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress} style={[styles.chip, { backgroundColor: colors.glass, borderColor: colors.line }, active && { backgroundColor: colors.teal, borderColor: colors.teal }]}>
      <Text style={[styles.text, { color: colors.charcoal, fontFamily: font.family }, active && styles.activeText]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1 },
  text: { fontSize: 12, fontWeight: '800', letterSpacing: 0 },
  activeText: { color: '#06110D' },
});
