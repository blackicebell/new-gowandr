import React, { useState } from 'react';
import { ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { starterPhotos } from '../data/starterPhotos';
import { paceGuidance } from '../logic/tripPace';
import { colors, font, useThemeColors } from '../theme/colors';
import { TripDraft } from '../types';

const vibeTags = ['beach', 'food', 'culture', 'nightlife', 'relax', 'romantic', 'friends', 'family', 'solo', 'luxury', 'low-key', 'adventure'];
const companionTypes: TripDraft['companionType'][] = ['Solo', 'Couple', 'Friends', 'Family', 'Group'];
const paces: TripDraft['pace'][] = ['Relaxed', 'Balanced', 'Packed'];

export function NewTripScreen({ onBack, onCreate }: { onBack: () => void; onCreate: (trip: TripDraft) => void }) {
  const theme = useThemeColors();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(starterPhotos[0]);
  const [selectedTags, setSelectedTags] = useState<string[]>(['food', 'relax']);
  const [pace, setPace] = useState<TripDraft['pace']>('Balanced');
  const [companionType, setCompanionType] = useState<TripDraft['companionType']>('Friends');

  const createTrip = () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    onCreate({
      id: `trip-${Date.now()}`,
      title: cleanTitle,
      subtitle: subtitle.trim() || buildSubtitle(selectedTags, companionType),
      heroImage: selectedPhoto.uri,
      tags: selectedTags,
      pace,
      companionType,
      ideas: [],
    });
  };

  return (
    <View>
      <Text style={[styles.back, { color: theme.teal, fontFamily: font.family }]} onPress={onBack}>Back to Trip Ideas</Text>
      <Text style={[styles.title, { color: theme.charcoal, fontFamily: font.family }]}>Start a trip idea</Text>
      <Text style={[styles.body, { color: theme.muted, fontFamily: font.family }]}>Name the trip, pick a mood, and GoWandr gives you a clean place to save everything you find later.</Text>

      <TextInput value={title} onChangeText={setTitle} placeholder="Example: Paris Girls Trip" placeholderTextColor={theme.muted} style={[styles.input, { backgroundColor: theme.paper, borderColor: theme.line, color: theme.charcoal, fontFamily: font.family }]} />
      <TextInput value={subtitle} onChangeText={setSubtitle} placeholder="Optional short note" placeholderTextColor={theme.muted} style={[styles.input, { backgroundColor: theme.paper, borderColor: theme.line, color: theme.charcoal, fontFamily: font.family }]} />

      <Text style={[styles.label, { color: theme.charcoal, fontFamily: font.family }]}>Starter photo</Text>
      <View style={styles.photoGrid}>
        {starterPhotos.map((photo) => (
          <TouchableOpacity key={photo.id} onPress={() => setSelectedPhoto(photo)} style={[styles.photoChoice, { borderColor: selectedPhoto.id === photo.id ? theme.teal : 'transparent' }]}>
            <ImageBackground source={{ uri: photo.uri }} style={styles.photo} imageStyle={styles.photoImage}>
              <View style={styles.photoShade} />
              <Text style={[styles.photoLabel, { fontFamily: font.family }]}>{photo.label}</Text>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { color: theme.charcoal, fontFamily: font.family }]}>Vibe</Text>
      <View style={styles.wrap}>
        {vibeTags.map((tag) => (
          <Chip key={tag} label={tag} active={selectedTags.includes(tag)} onPress={() => setSelectedTags((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag])} />
        ))}
      </View>

      <Text style={[styles.label, { color: theme.charcoal, fontFamily: font.family }]}>Who is this for?</Text>
      <View style={styles.wrap}>
        {companionTypes.map((item) => (
          <Chip key={item} label={item} active={companionType === item} onPress={() => setCompanionType(item)} />
        ))}
      </View>

      <Text style={[styles.label, { color: theme.charcoal, fontFamily: font.family }]}>Trip pace</Text>
      <Text style={[styles.helper, { color: theme.muted, fontFamily: font.family }]}>How full should this trip feel? This helps GoWandr flag when a plan is getting too empty or too packed.</Text>
      <View style={styles.wrap}>
        {paces.map((item) => (
          <Chip key={item} label={item} active={pace === item} onPress={() => setPace(item)} />
        ))}
      </View>
      <View style={[styles.paceCard, { backgroundColor: theme.paper, borderColor: theme.line }]}>
        <Text style={[styles.paceTitle, { color: theme.charcoal, fontFamily: font.family }]}>{paceGuidance[pace].label}: {paceGuidance[pace].short}</Text>
        <Text style={[styles.paceBody, { color: theme.muted, fontFamily: font.family }]}>{paceGuidance[pace].detail}</Text>
        <Text style={[styles.paceMeta, { color: theme.teal, fontFamily: font.family }]}>Best target: {paceGuidance[pace].dailyAnchors}</Text>
      </View>

      <View style={styles.actions}>
        <Button label="Create Trip Idea" disabled={!title.trim()} onPress={createTrip} />
      </View>
    </View>
  );
}

function buildSubtitle(tags: string[], companionType: TripDraft['companionType']) {
  const topTags = tags.slice(0, 3);
  if (!topTags.length) return `A ${companionType.toLowerCase()} trip idea ready for saved inspiration.`;
  return `${capitalize(topTags.join(', '))} ideas for a ${companionType.toLowerCase()} trip.`;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const styles = StyleSheet.create({
  back: { fontWeight: '900', paddingVertical: 10 },
  title: { fontWeight: '900', fontSize: 38, letterSpacing: 0 },
  body: { fontSize: 16, lineHeight: 23, marginTop: 8, marginBottom: 18 },
  input: { minHeight: 54, borderRadius: 18, borderWidth: 1, paddingHorizontal: 16, fontSize: 15, marginBottom: 10 },
  label: { fontWeight: '900', fontSize: 17, marginTop: 16, marginBottom: 10 },
  helper: { fontSize: 14, lineHeight: 20, marginTop: -4, marginBottom: 10 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  photoChoice: { width: '48%', borderRadius: 20, borderWidth: 2, borderColor: 'transparent', overflow: 'hidden' },
  photo: { height: 112, justifyContent: 'flex-end' },
  photoImage: { borderRadius: 18 },
  photoShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.22)' },
  photoLabel: { color: colors.white, fontWeight: '900', fontSize: 15, padding: 12 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  paceCard: { borderRadius: 20, borderWidth: 1, padding: 14, marginTop: 10 },
  paceTitle: { fontWeight: '900', fontSize: 16 },
  paceBody: { fontSize: 14, lineHeight: 20, marginTop: 5 },
  paceMeta: { fontWeight: '900', fontSize: 12, marginTop: 9 },
  actions: { marginTop: 22 },
});
