import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { font, useThemeColors } from '../theme/colors';

export function Button({ label, onPress, variant = 'primary', disabled = false }: { label: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'ghost'; disabled?: boolean }) {
  const colors = useThemeColors();
  return (
    <TouchableOpacity disabled={disabled} onPress={onPress} style={[styles.button, variantStyle(variant, colors), disabled && styles.disabled]}>
      <Text style={[styles.label, { fontFamily: font.family }, variant !== 'primary' && { color: colors.charcoal }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function variantStyle(variant: 'primary' | 'secondary' | 'ghost', colors: ReturnType<typeof useThemeColors>) {
  if (variant === 'secondary') return { backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.line };
  if (variant === 'ghost') return { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.line };
  return { backgroundColor: colors.teal };
}

const styles = StyleSheet.create({
  button: { minHeight: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 18, paddingHorizontal: 18 },
  disabled: { opacity: 0.45 },
  label: { color: '#07110D', fontWeight: '900', fontSize: 15, letterSpacing: 0 },
});
