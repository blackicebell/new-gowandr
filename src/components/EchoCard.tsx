import React from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { font, useThemeColors } from '../theme/colors';
import { TripDraft } from '../types';
import { calculateClarityScore } from '../logic/clarityScore';

export function EchoCard({ trip, onPress }: { trip: TripDraft; onPress: () => void }) {
  const colors = useThemeColors();
  const score = calculateClarityScore(trip).score;
  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, { backgroundColor: colors.paper, borderColor: colors.line }]}>
      <ImageBackground source={{ uri: trip.heroImage }} style={styles.image} imageStyle={styles.imageRadius}>
        <View style={styles.overlay} />
        <View style={[styles.scorePill, { backgroundColor: colors.charcoal }]}>
          <Text style={[styles.scoreText, { color: colors.canvasDeep, fontFamily: font.family }]}>{score}% clear</Text>
        </View>
        <View style={styles.copy}>
          <Text style={[styles.title, { fontFamily: font.family }]}>{trip.title}</Text>
          <Text style={[styles.subtitle, { fontFamily: font.family }]}>{trip.subtitle}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 16, borderRadius: 28, overflow: 'hidden', borderWidth: 1 },
  image: { height: 228, justifyContent: 'space-between' },
  imageRadius: { borderRadius: 28 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.30)' },
  scorePill: { alignSelf: 'flex-end', margin: 14, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.92)' },
  scoreText: { fontSize: 12, fontWeight: '900', letterSpacing: 0 },
  copy: { padding: 18 },
  title: { color: '#FFFFFF', fontSize: 29, fontWeight: '900', letterSpacing: 0 },
  subtitle: { color: '#FFFFFF', opacity: 0.92, marginTop: 5, fontSize: 14, fontWeight: '700', letterSpacing: 0 },
});
