import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../theme/colors';

export function PremiumBackground() {
  const colors = useThemeColors();

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['rgba(255,255,255,0.72)', colors.canvasDeep, colors.canvas]} style={StyleSheet.absoluteFill} />
      <View style={[styles.arc, styles.arcOne, { borderColor: colors.teal }]} />
      <View style={[styles.arc, styles.arcTwo, { borderColor: colors.accent }]} />
      <View style={styles.noiseLayer}>
        {Array.from({ length: 42 }).map((_, index) => (
          <View key={index} style={[styles.noiseDot, { left: `${(index * 29) % 100}%`, top: `${(index * 47) % 100}%` }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  arc: { position: 'absolute', borderWidth: 1, opacity: 0.045, borderRadius: 999 },
  arcOne: { width: 420, height: 420, right: -210, top: 70 },
  arcTwo: { width: 320, height: 320, left: -170, bottom: 80 },
  noiseLayer: { ...StyleSheet.absoluteFillObject, opacity: 0.12 },
  noiseDot: { position: 'absolute', width: 1, height: 1, borderRadius: 1, backgroundColor: 'rgba(15,17,21,0.12)' },
});
