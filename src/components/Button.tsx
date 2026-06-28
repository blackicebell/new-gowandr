import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { font, useThemeColors } from '../theme/colors';
import { PressableScale } from './PressableScale';

export function Button({ label, onPress, variant = 'primary', disabled = false }: { label: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'ghost'; disabled?: boolean }) {
  const colors = useThemeColors();
  const isPrimary = variant === 'primary';

  return (
    <PressableScale disabled={disabled} onPress={onPress} style={[styles.pressShell, disabled && styles.disabled]}>
      {isPrimary ? (
        <LinearGradient colors={['#A8F0D4', '#6ED8B5', '#2FAF8A']} locations={[0, 0.4, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.button}>
          <Text style={[styles.label, { color: colors.charcoal, fontFamily: font.semibold }]}>{label}</Text>
        </LinearGradient>
      ) : (
        <View style={[styles.button, variantStyle(variant, colors)]}>
          <Text style={[styles.label, styles.secondaryLabel, { fontFamily: font.semibold, color: colors.charcoal }]}>{label}</Text>
        </View>
      )}
    </PressableScale>
  );
}

function variantStyle(variant: 'primary' | 'secondary' | 'ghost', colors: ReturnType<typeof useThemeColors>) {
  if (variant === 'secondary') {
    return {
      backgroundColor: 'rgba(248,250,249,0.84)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.74)',
      shadowOpacity: 0.16,
    };
  }
  if (variant === 'ghost') return { backgroundColor: 'rgba(255,255,255,0.48)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.62)' };
  return { backgroundColor: colors.teal };
}

const styles = StyleSheet.create({
  pressShell: { borderRadius: 18 },
  button: { minHeight: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 18, paddingHorizontal: 22, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  disabled: { opacity: 0.45 },
  label: { color: '#202623', fontSize: 15, letterSpacing: 0, textAlign: 'center', backgroundColor: 'transparent', includeFontPadding: false },
  secondaryLabel: {},
});
