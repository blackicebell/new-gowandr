import React, { useRef } from 'react';
import { Animated, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { font, useThemeColors } from '../theme/colors';
import { TripDraft } from '../types';
import { getMomentumStatus } from '../logic/momentum';
import { PressableScale } from './PressableScale';

export function EchoCard({ trip, onPress }: { trip: TripDraft; onPress: () => void }) {
  const colors = useThemeColors();
  const decisionLabel = getMomentumStatus(trip);
  const chips = getCardChips(trip);
  const imageOpacity = useRef(new Animated.Value(0)).current;

  const fadeInImage = () => {
    Animated.timing(imageOpacity, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  };

  return (
    <PressableScale onPress={onPress} style={[styles.card, { backgroundColor: colors.paper, borderColor: 'rgba(255,255,255,0.15)' }]}>
      <Animated.View style={{ opacity: imageOpacity }}>
      <ImageBackground source={{ uri: trip.heroImage }} onLoad={fadeInImage} style={styles.image} imageStyle={styles.imageRadius}>
        <LinearGradient colors={['rgba(0,0,0,0.04)', 'rgba(0,0,0,0.18)', 'rgba(0,0,0,0.78)']} locations={[0, 0.42, 1]} style={StyleSheet.absoluteFill} />
        <View style={styles.scorePill}>
          <Text style={[styles.scoreText, { color: '#F8F8F6', fontFamily: font.semibold }]}>{decisionLabel}</Text>
        </View>
        <View style={styles.copy}>
          <View style={styles.chipRow}>
            {chips.map((chip) => (
              <View key={chip} style={styles.metaChip}>
                <Text style={[styles.metaChipText, { fontFamily: font.semibold }]}>{chip}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.title, { fontFamily: font.heading }]}>{trip.title}</Text>
          <Text numberOfLines={1} style={[styles.subtitle, { fontFamily: font.medium }]}>{trip.subtitle}</Text>
        </View>
      </ImageBackground>
      </Animated.View>
    </PressableScale>
  );
}

function getCardChips(trip: TripDraft) {
  const people = trip.companionType === 'Solo' ? 'Solo' : 'Group';
  const mood = getMoodChip(trip);
  return [people, mood, trip.pace].filter(Boolean).slice(0, 3);
}

function getMoodChip(trip: TripDraft) {
  const tags = trip.tags.map((tag) => tag.toLowerCase());
  if (tags.includes('food')) return 'Food';
  if (tags.includes('beach')) return 'Beach';
  if (tags.includes('relax') || tags.includes('low-key')) return 'Reset';
  if (tags.includes('culture')) return 'Culture';
  if (tags.includes('nightlife')) return 'Nightlife';
  if (tags.includes('shopping')) return 'Shopping';
  return trip.tags[0] ? capitalize(trip.tags[0]) : 'Travel';
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const styles = StyleSheet.create({
  card: { marginBottom: 18, borderRadius: 24, overflow: 'hidden', borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 22, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  image: { height: 204, justifyContent: 'space-between' },
  imageRadius: { borderRadius: 24 },
  scorePill: { alignSelf: 'flex-end', margin: 13, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999, backgroundColor: 'rgba(9,20,17,0.58)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' },
  scoreText: { fontSize: 11.5, fontWeight: '700', letterSpacing: 0 },
  copy: { padding: 18 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 9 },
  metaChip: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' },
  metaChipText: { color: '#F8F8F6', fontSize: 10.5, fontWeight: '700' },
  title: { color: '#F8F8F6', fontSize: 28, lineHeight: 32, fontWeight: '700', letterSpacing: -0.28, textShadowColor: 'rgba(0,0,0,0.38)', textShadowRadius: 5, textShadowOffset: { width: 0, height: 2 } },
  subtitle: { color: '#F8F8F6', opacity: 0.9, marginTop: 4, fontSize: 14, fontWeight: '500', letterSpacing: 0, lineHeight: 20 },
});
