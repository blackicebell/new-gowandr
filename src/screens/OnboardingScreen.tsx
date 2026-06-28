import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../components/Button';
import { onboardingImageUris } from '../data/imageAssets';
import { font, useThemeColors } from '../theme/colors';

const slides = [
  {
    eyebrow: 'Collect. Shape. Decide.',
    title: 'Stop collecting ideas. Start taking trips.',
    body: 'Save what inspires you, turn it into real options, and move toward the trip that feels worth doing.',
    image: onboardingImageUris.flightWindow,
    proof: 'Built for real travel decisions',
  },
  {
    eyebrow: 'Collect',
    title: 'Save anything that makes you want to travel.',
    body: 'TikToks. Restaurants. Videos. Photos. Random ideas. Keep the spark before it disappears.',
    image: onboardingImageUris.saveInspiration,
    proof: 'TikTok + Instagram + YouTube',
  },
  {
    eyebrow: 'Shape',
    title: 'Every great trip starts as a rough idea.',
    body: 'Shape scattered saves into trip drafts with a mood, pace, cover photo, and the highlights that make each one worth considering.',
    image: onboardingImageUris.shapeTrip,
    proof: 'No heavy itinerary required',
  },
  {
    eyebrow: 'Decide',
    title: 'Stop guessing. See which trip actually pulls you.',
    body: 'Preview the highlights first. Answer four quick questions. Choose with confidence, solo or with people.',
    image: onboardingImageUris.decideAirport,
    proof: 'Works solo or together',
  },
  {
    eyebrow: 'Commit',
    title: 'Where do you want to go first?',
    body: 'Commit to one trip. Keep the next steps simple. Take one small step at a time until you are ready to go.',
    image: onboardingImageUris.commitBeach,
    proof: 'Share cards when it feels real',
  },
];

export function OnboardingScreen({ onFinish }: { onFinish: () => void }) {
  const theme = useThemeColors();
  const [index, setIndex] = useState(0);
  const slideMotion = useRef(new Animated.Value(1)).current;
  const slide = slides[index];
  const isLast = index === slides.length - 1;

  useEffect(() => {
    slideMotion.setValue(0);
    Animated.timing(slideMotion, { toValue: 1, duration: 180, useNativeDriver: true }).start();
  }, [index, slideMotion]);

  return (
    <View style={[styles.screen, { backgroundColor: theme.canvas }]}>
      <View style={styles.brandRow}>
        <Image source={require('../../assets/brand/gowandr-logo-full-color.png')} style={styles.logo} resizeMode="contain" />
        <TouchableOpacity onPress={onFinish} style={styles.skipButton}>
          <Text style={[styles.skipText, { fontFamily: font.semibold }]}>Skip</Text>
        </TouchableOpacity>
      </View>
      <ImageBackground source={{ uri: slide.image }} style={styles.hero} imageStyle={styles.heroImage}>
        <LinearGradient colors={['rgba(4,12,10,0.10)', 'rgba(4,12,10,0.30)', 'rgba(4,12,10,0.86)']} locations={[0, 0.46, 1]} style={StyleSheet.absoluteFill} />
        <View style={styles.edgeShade} />
        <Animated.View style={[styles.copy, { opacity: slideMotion, transform: [{ translateY: slideMotion.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }]}>
          <View style={styles.dots}>
            {slides.map((item, dotIndex) => (
              <View key={item.title} style={[styles.dot, dotIndex === index && { width: 42, backgroundColor: theme.accent }]} />
            ))}
          </View>
          <Text style={[styles.eyebrow, { color: theme.accent, fontFamily: font.semibold }]}>{slide.eyebrow}</Text>
          <Text style={[styles.title, { fontFamily: font.heading }]}>{slide.title}</Text>
          <Text style={[styles.body, { fontFamily: font.body }]}>{slide.body}</Text>
          <View style={styles.proofPill}>
            <Text style={[styles.proofText, { fontFamily: font.semibold }]}>{slide.proof}</Text>
          </View>
        </Animated.View>
      </ImageBackground>
      <View style={styles.actions}>
        <Button label={isLast ? 'Create My First Trip' : 'Next'} onPress={() => (isLast ? onFinish() : setIndex((current) => current + 1))} />
        {!isLast && <Button label="Start now" variant="secondary" onPress={onFinish} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 24, paddingTop: 14, paddingBottom: 24 },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  logo: { width: 142, height: 36 },
  skipButton: { minHeight: 40, minWidth: 58, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.64)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.06)' },
  skipText: { color: '#137D68', fontWeight: '700', fontSize: 13 },
  hero: { flex: 1, minHeight: 518, borderRadius: 34, overflow: 'hidden', justifyContent: 'flex-end', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 28, shadowOffset: { width: 0, height: 10 }, elevation: 8 },
  heroImage: { borderRadius: 32 },
  edgeShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.10)' },
  copy: { padding: 24 },
  dots: { flexDirection: 'row', gap: 7, marginBottom: 16 },
  dot: { width: 24, height: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.45)' },
  eyebrow: { fontWeight: '800', fontSize: 12, lineHeight: 16, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 9, textShadowColor: 'rgba(0,0,0,0.42)', textShadowRadius: 5, textShadowOffset: { width: 0, height: 2 } },
  title: { color: '#F8F8F6', fontSize: 34, lineHeight: 40, fontWeight: '700', letterSpacing: -0.34, textShadowColor: 'rgba(0,0,0,0.50)', textShadowRadius: 8, textShadowOffset: { width: 0, height: 3 } },
  body: { color: '#F8F8F6', fontSize: 15.5, lineHeight: 23, marginTop: 12, opacity: 0.98, fontWeight: '400', textShadowColor: 'rgba(0,0,0,0.46)', textShadowRadius: 5, textShadowOffset: { width: 0, height: 2 } },
  proofPill: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8, marginTop: 18, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)' },
  proofText: { color: '#F8F8F6', fontSize: 11.5, fontWeight: '700' },
  actions: { gap: 10, paddingTop: 16 },
});
