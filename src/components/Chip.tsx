import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

export function Chip({ label, active = false, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress} style={[styles.chip, active && styles.active]}>
      <Text style={[styles.text, active && styles.activeText]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line },
  active: { backgroundColor: colors.teal, borderColor: colors.teal },
  text: { color: colors.charcoal, fontSize: 12, fontWeight: '700' },
  activeText: { color: colors.white },
});
