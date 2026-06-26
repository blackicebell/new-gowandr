import React from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import { TripDraft } from '../types';
import { calculateClarityScore } from '../logic/clarityScore';

export function EchoCard({ trip, onPress }: { trip: TripDraft; onPress: () => void }) {
  const score = calculateClarityScore(trip).score;
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <ImageBackground source={{ uri: trip.heroImage }} style={styles.image} imageStyle={styles.imageRadius}>
        <View style={styles.overlay} />
        <View style={styles.scorePill}>
          <Text style={styles.scoreText}>{score}% clear</Text>
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{trip.title}</Text>
          <Text style={styles.subtitle}>{trip.subtitle}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 16, borderRadius: 24, overflow: 'hidden', backgroundColor: colors.charcoal },
  image: { height: 214, justifyContent: 'space-between' },
  imageRadius: { borderRadius: 24 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.24)' },
  scorePill: { alignSelf: 'flex-end', margin: 14, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.92)' },
  scoreText: { color: colors.tealDark, fontSize: 12, fontWeight: '800' },
  copy: { padding: 18 },
  title: { color: colors.white, fontSize: 27, fontWeight: '900' },
  subtitle: { color: colors.white, opacity: 0.92, marginTop: 4, fontSize: 14, fontWeight: '600' },
});
