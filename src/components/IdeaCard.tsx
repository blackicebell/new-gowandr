import React from 'react';
import { ImageBackground, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import { TripIdea } from '../types';

export function IdeaCard({ idea }: { idea: TripIdea }) {
  const hasLink = !!idea.link?.trim();

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
    <TouchableOpacity activeOpacity={hasLink ? 0.82 : 1} disabled={!hasLink} onPress={openLink} style={[styles.card, hasLink && styles.linkedCard]}>
      <ImageBackground source={{ uri: idea.imageUrl ?? fallbackForCategory(idea.category) }} style={styles.image} imageStyle={styles.imageRadius}>
        <View style={styles.priority}>
          <Text style={styles.priorityText}>{idea.priority}</Text>
        </View>
      </ImageBackground>
      <View style={styles.body}>
        <View style={styles.metaRow}>
          <Text style={styles.category}>{idea.category}</Text>
          {hasLink && <Text style={styles.openCue}>Open link</Text>}
        </View>
        <Text style={styles.title}>{idea.title}</Text>
        {!!idea.note && <Text style={styles.note}>{idea.note}</Text>}
        {hasLink && <Text style={styles.linkText} numberOfLines={1}>{getPlatformLabel(idea.link ?? '')}</Text>}
      </View>
    </TouchableOpacity>
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
  card: { width: '48%', marginBottom: 14, borderRadius: 20, backgroundColor: colors.paper, overflow: 'hidden', borderWidth: 1, borderColor: colors.line },
  linkedCard: { borderColor: colors.mist },
  image: { height: 104, alignItems: 'flex-start', justifyContent: 'flex-start' },
  imageRadius: { borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  priority: { margin: 8, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.92)' },
  priorityText: { fontSize: 10, fontWeight: '900', color: colors.tealDark },
  body: { padding: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  category: { color: colors.coral, fontWeight: '900', fontSize: 10, textTransform: 'uppercase' },
  openCue: { color: colors.tealDark, fontWeight: '900', fontSize: 10 },
  title: { color: colors.charcoal, fontWeight: '900', fontSize: 15, marginTop: 4 },
  note: { color: colors.muted, fontSize: 12, marginTop: 4, lineHeight: 17 },
  linkText: { color: colors.tealDark, fontWeight: '800', fontSize: 11, marginTop: 7 },
});
