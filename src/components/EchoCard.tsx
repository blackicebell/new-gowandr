import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { font, useThemeColors } from '../theme/colors';
import { TripDraft } from '../types';
import { calculateClarityScore } from '../logic/clarityScore';
import { PressableScale } from './PressableScale';

export function EchoCard({ trip, onPress }: { trip: TripDraft; onPress: () => void }) {
  const colors = useThemeColors();
  const score = calculateClarityScore(trip).score;
  return (
    <PressableScale onPress={onPress} style={[styles.card, { backgroundColor: colors.paper, borderColor: 'rgba(255,255,255,0.15)' }]}>
      <ImageBackground source={{ uri: trip.heroImage }} style={styles.image} imageStyle={styles.imageRadius}>
        <LinearGradient colors={['rgba(0,0,0,0.25)', 'rgba(0,0,0,0.45)']} style={StyleSheet.absoluteFill} />
        <View style={styles.scorePill}>
          <Text style={[styles.scoreText, { color: '#F8F8F6', fontFamily: font.family }]}>{score}% clear</Text>
        </View>
        <View style={styles.copy}>
          <Text style={[styles.title, { fontFamily: font.family }]}>{trip.title}</Text>
          <Text style={[styles.subtitle, { fontFamily: font.family }]}>{trip.subtitle}</Text>
        </View>
      </ImageBackground>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 20, borderRadius: 28, overflow: 'hidden', borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 28, shadowOffset: { width: 0, height: 10 }, elevation: 8 },
  image: { height: 244, justifyContent: 'space-between' },
  imageRadius: { borderRadius: 28 },
  scorePill: { alignSelf: 'flex-end', margin: 16, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.45)' },
  scoreText: { fontSize: 12, fontWeight: '700', letterSpacing: 0 },
  copy: { padding: 22 },
  title: { color: '#F8F8F6', fontSize: 32, fontWeight: '700', letterSpacing: -0.32, textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 4, textShadowOffset: { width: 0, height: 2 } },
  subtitle: { color: '#F8F8F6', opacity: 0.92, marginTop: 6, fontSize: 15, fontWeight: '700', letterSpacing: 0, lineHeight: 22 },
});
