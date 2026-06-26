import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

export function Button({ label, onPress, variant = 'primary', disabled = false }: { label: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'ghost'; disabled?: boolean }) {
  return (
    <TouchableOpacity disabled={disabled} onPress={onPress} style={[styles.button, styles[variant], disabled && styles.disabled]}>
      <Text style={[styles.label, variant !== 'primary' && styles.darkLabel]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 18, paddingHorizontal: 18 },
  primary: { backgroundColor: colors.teal },
  secondary: { backgroundColor: colors.cloud },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.line },
  disabled: { opacity: 0.45 },
  label: { color: colors.white, fontWeight: '800', fontSize: 15 },
  darkLabel: { color: colors.charcoal },
});
