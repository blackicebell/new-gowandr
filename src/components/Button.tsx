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
        <LinearGradient colors={[colors.teal, colors.tealDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.button}>
          <View style={styles.innerHighlight} />
          <Text style={[styles.label, { color: colors.canvasDeep, fontFamily: font.family }]}>{label}</Text>
        </LinearGradient>
      ) : (
        <View style={[styles.button, variantStyle(variant, colors)]}>
          <Text style={[styles.label, { fontFamily: font.family, color: colors.charcoal }]}>{label}</Text>
        </View>
      )}
    </PressableScale>
  );
}

function variantStyle(variant: 'primary' | 'secondary' | 'ghost', colors: ReturnType<typeof useThemeColors>) {
  if (variant === 'secondary') return { backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.line };
  if (variant === 'ghost') return { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.line };
  return { backgroundColor: colors.teal };
}

const styles = StyleSheet.create({
  pressShell: { borderRadius: 18 },
  button: { minHeight: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 18, paddingHorizontal: 22, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 22, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
  innerHighlight: { position: 'absolute', left: 1, right: 1, top: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.25)' },
  disabled: { opacity: 0.45 },
  label: { color: '#07110D', fontWeight: '900', fontSize: 15, letterSpacing: 0 },
});
