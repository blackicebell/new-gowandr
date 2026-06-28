import React, { useState } from 'react';
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../components/Button';
import { starterImageUris } from '../data/imageAssets';
import { font, useThemeColors } from '../theme/colors';

const slides = [
  {
    eyebrow: 'Save inspiration',
    title: 'Catch the trip ideas before they disappear.',
    body: 'Drop in TikToks, Reels, YouTube videos, restaurant links, notes, and random “we should go here” moments.',
    image: starterImageUris.coast,
    chips: ['Links', 'Notes', 'Videos'],
  },
  {
    eyebrow: 'Build notebooks',
    title: 'Turn loose saves into trip notebooks.',
    body: 'Give each possible trip a name, cover photo, mood, pace, and the highlights that make it worth considering.',
    image: starterImageUris.city,
    chips: ['Trip mood', 'Pace', 'Highlights'],
  },
  {
    eyebrow: 'Decide together',
    title: 'Compare the feeling, not just the place.',
    body: 'Preview the saved highlights first, then answer a few quick questions to see which trip actually pulls you.',
    image: starterImageUris.food,
    chips: ['Highlights first', '4 questions', 'Clear winner'],
  },
  {
    eyebrow: 'Invite friends',
    title: 'Share a voting link when the group needs input.',
    body: 'Friends can open the comparison, add their name, vote, and send feedback back to you. No login needed.',
    image: starterImageUris.nightOut,
    chips: ['No login', 'Friend votes', 'Reasons'],
  },
  {
    eyebrow: 'Share the trip',
    title: 'Make the decision feel real.',
    body: 'Share a polished trip card, commit to one plan, and keep the next steps simple so the trip keeps moving.',
    image: starterImageUris.island,
    chips: ['Share cards', 'Final plan', 'Checklist'],
  },
];

export function OnboardingScreen({ onFinish }: { onFinish: () => void }) {
  const theme = useThemeColors();
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const isLast = index === slides.length - 1;

  return (
    <View style={[styles.screen, { backgroundColor: theme.canvas }]}>
      <View style={styles.brandRow}>
        <Image source={require('../../assets/brand/gowandr-logo-full-color.png')} style={styles.logo} resizeMode="contain" />
        <TouchableOpacity onPress={onFinish} style={styles.skipButton}>
          <Text style={[styles.skipText, { fontFamily: font.semibold }]}>Skip</Text>
        </TouchableOpacity>
      </View>
      <ImageBackground source={{ uri: slide.image }} style={styles.hero} imageStyle={styles.heroImage}>
        <View style={styles.shade} />
        <View style={styles.copy}>
          <View style={styles.dots}>
            {slides.map((item, dotIndex) => (
              <View key={item.title} style={[styles.dot, dotIndex === index && { width: 42, backgroundColor: theme.accent }]} />
            ))}
          </View>
          <Text style={[styles.eyebrow, { color: theme.accent, fontFamily: font.semibold }]}>{slide.eyebrow}</Text>
          <Text style={[styles.title, { fontFamily: font.heading }]}>{slide.title}</Text>
          <Text style={[styles.body, { fontFamily: font.body }]}>{slide.body}</Text>
          <View style={styles.chips}>
            {slide.chips.map((chip) => (
              <View key={chip} style={styles.chip}>
                <Text style={[styles.chipText, { fontFamily: font.semibold }]}>{chip}</Text>
              </View>
            ))}
          </View>
        </View>
      </ImageBackground>
      <View style={styles.actions}>
        <Button label={isLast ? 'Create Your First Trip Notebook' : 'Next'} onPress={() => (isLast ? onFinish() : setIndex((current) => current + 1))} />
        {!isLast && (
          <TouchableOpacity onPress={onFinish} style={styles.secondaryAction}>
            <Text style={[styles.secondaryActionText, { fontFamily: font.semibold }]}>Start now</Text>
          </TouchableOpacity>
        )}
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
  shade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.38)' },
  copy: { padding: 24 },
  dots: { flexDirection: 'row', gap: 7, marginBottom: 16 },
  dot: { width: 24, height: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.45)' },
  eyebrow: { fontWeight: '800', fontSize: 12, lineHeight: 16, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 9 },
  title: { color: '#F8F8F6', fontSize: 34, lineHeight: 40, fontWeight: '700', letterSpacing: -0.34 },
  body: { color: '#F8F8F6', fontSize: 15.5, lineHeight: 23, marginTop: 12, opacity: 0.95, fontWeight: '400' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18 },
  chip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.26)' },
  chipText: { color: '#F8F8F6', fontSize: 11.5, fontWeight: '700' },
  actions: { gap: 10, paddingTop: 16 },
  secondaryAction: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  secondaryActionText: { color: '#137D68', fontWeight: '700', fontSize: 14 },
});
