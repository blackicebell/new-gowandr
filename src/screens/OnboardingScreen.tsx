import React, { useState } from 'react';
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { colors, font, useThemeColors } from '../theme/colors';

const slides = [
  {
    title: 'Save the trip ideas before they disappear.',
    body: 'Drop in links, screenshots, notes, restaurants, videos, and “we should go here” moments without building a whole itinerary.',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Compare trips without another messy group chat.',
    body: 'Pick 2 to 4 trip ideas, let people choose one, then ask why. Excitement is useful, but commitment is what decides the trip.',
    image: 'https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Turn the winner into a simple plan.',
    body: 'Keep the top must-dos, set the pace, and leave enough breathing room for the trip to feel like a trip.',
    image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=80',
  },
];

export function OnboardingScreen({ onFinish, onTryDemo }: { onFinish: () => void; onTryDemo: () => void }) {
  const theme = useThemeColors();
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const isLast = index === slides.length - 1;

  return (
    <View style={[styles.screen, { backgroundColor: theme.canvas }]}>
      <View style={styles.brandRow}>
        <Image source={require('../../assets/brand/gowandr-logo-full-color.png')} style={styles.logo} resizeMode="contain" />
      </View>
      <ImageBackground source={{ uri: slide.image }} style={styles.hero} imageStyle={styles.heroImage}>
        <View style={styles.shade} />
        <View style={styles.copy}>
          <View style={styles.dots}>
            {slides.map((item, dotIndex) => (
              <View key={item.title} style={[styles.dot, dotIndex === index && { width: 42, backgroundColor: theme.accent }]} />
            ))}
          </View>
          <Text style={[styles.title, { fontFamily: font.family }]}>{slide.title}</Text>
          <Text style={[styles.body, { fontFamily: font.family }]}>{slide.body}</Text>
        </View>
      </ImageBackground>
      <View style={styles.actions}>
        <Button label={isLast ? 'Start with Trip Ideas' : 'Next'} onPress={() => (isLast ? onFinish() : setIndex((current) => current + 1))} />
        <Button label="Try Demo Matchup" variant="secondary" onPress={onTryDemo} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 26 },
  brandRow: { alignItems: 'flex-start', marginBottom: 14 },
  logo: { width: 154, height: 38 },
  hero: { flex: 1, minHeight: 540, borderRadius: 34, overflow: 'hidden', justifyContent: 'flex-end', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 28, shadowOffset: { width: 0, height: 10 }, elevation: 8 },
  heroImage: { borderRadius: 32 },
  shade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.34)' },
  copy: { padding: 26 },
  dots: { flexDirection: 'row', gap: 7, marginBottom: 14 },
  dot: { width: 24, height: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.45)' },
  dotActive: { width: 42, backgroundColor: colors.sun },
  title: { color: '#F8F8F6', fontSize: 40, lineHeight: 48, fontWeight: '700', letterSpacing: -0.4 },
  body: { color: '#F8F8F6', fontSize: 16, lineHeight: 24, marginTop: 14, opacity: 0.95 },
  actions: { gap: 12, paddingTop: 18 },
});
