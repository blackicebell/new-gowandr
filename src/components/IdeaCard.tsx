import React, { useRef } from 'react';
import { Animated, ImageBackground, Linking, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { font, useThemeColors } from '../theme/colors';
import { TripIdea } from '../types';
import { PressableScale } from './PressableScale';

export function IdeaCard({ idea }: { idea: TripIdea }) {
  const colors = useThemeColors();
  const hasLink = !!idea.link?.trim();
  const imageOpacity = useRef(new Animated.Value(0)).current;

  const fadeInImage = () => {
    Animated.timing(imageOpacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
  };

  const openLink = async () => {
    if (!idea.link?.trim()) return;
    const url = normalizeUrl(idea.link);

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) await Linking.openURL(url);
    } catch {
      // Keep the card quiet if the device cannot open the saved link.
    }
  };

  return (
    <PressableScale disabled={!hasLink} onPress={openLink} style={[styles.card, { borderColor: hasLink ? '#6ED8B5' : 'rgba(255,255,255,0.22)' }]}>
      <Animated.View style={{ opacity: imageOpacity }}>
      <ImageBackground source={{ uri: idea.imageUrl ?? fallbackForCategory(idea.category) }} onLoad={fadeInImage} style={styles.image} imageStyle={styles.imageRadius}>
        <LinearGradient colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.55)']} style={StyleSheet.absoluteFill} />
        <View style={styles.priority}>
          <Text style={[styles.priorityText, { fontFamily: font.family }]}>{idea.priority}</Text>
        </View>
      </ImageBackground>
      </Animated.View>
      <View style={styles.body}>
        <View style={styles.metaRow}>
          <Text style={[styles.category, { fontFamily: font.family }]}>{idea.category}</Text>
          {hasLink && (
            <View style={styles.openPill}>
              <Text style={[styles.openCue, { fontFamily: font.family }]}>Open link</Text>
            </View>
          )}
        </View>
        <Text style={[styles.title, { fontFamily: font.family }]}>{idea.title}</Text>
        {!!idea.note && <Text style={[styles.note, { fontFamily: font.family }]}>{idea.note}</Text>}
        {hasLink && <Text style={[styles.linkText, { fontFamily: font.family }]} numberOfLines={1}>{getPlatformLabel(idea.link ?? '')}</Text>}
      </View>
    </PressableScale>
  );
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function getPlatformLabel(value: string) {
  const link = value.toLowerCase();
  if (link.includes('instagram.com')) return 'Instagram post';
  if (link.includes('tiktok.com')) return 'TikTok post';
  if (link.includes('youtube.com') || link.includes('youtu.be')) return 'YouTube video';
  return 'Saved website';
}

function fallbackForCategory(category: string) {
  if (category === 'Food') return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=700&q=80';
  if (category === 'Beach') return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80';
  if (category === 'Nightlife') return 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=80';
  return 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=80';
}

const styles = StyleSheet.create({
  card: { width: '48%', marginBottom: 18, borderRadius: 24, overflow: 'hidden', borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.06)', shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 28, shadowOffset: { width: 0, height: 10 }, elevation: 8 },
  image: { height: 124, alignItems: 'flex-start', justifyContent: 'flex-start' },
  imageRadius: { borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  priority: { margin: 10, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.45)' },
  priorityText: { color: '#F8F8F6', fontSize: 10, fontWeight: '700', letterSpacing: 0 },
  body: { padding: 14 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  category: { color: '#F4D06F', fontWeight: '900', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0 },
  openPill: { backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12 },
  openCue: { color: '#A8F0D4', fontWeight: '700', fontSize: 10, letterSpacing: 0 },
  title: { color: '#F8F8F6', fontWeight: '700', fontSize: 16, marginTop: 7, letterSpacing: -0.16 },
  note: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 5, lineHeight: 17 },
  linkText: { color: '#6ED8B5', fontWeight: '800', fontSize: 11, marginTop: 8, letterSpacing: 0 },
});
