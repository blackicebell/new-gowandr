import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { colors } from '../theme/colors';
import { IdeaCategory, IdeaPriority, TripDraft, TripIdea } from '../types';

const categories: IdeaCategory[] = ['Food', 'Stay', 'Beach', 'Nightlife', 'Culture', 'Adventure', 'Shopping', 'Photo Spot', 'Relax', 'Other'];
const tags = ['Must-do', 'Maybe', 'Chill', 'Active', 'Romantic', 'Friends', 'Family', 'Solo', 'Food', 'Nightlife', 'Beach', 'Culture', 'Luxury', 'Low-key'];

export function AddIdeaScreen({ trip, onBack, onSave }: { trip: TripDraft; onBack: () => void; onSave: (idea: TripIdea) => void }) {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [link, setLink] = useState('');
  const [category, setCategory] = useState<IdeaCategory>('Food');
  const [priority, setPriority] = useState<IdeaPriority>('Maybe');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [imageUri, setImageUri] = useState<string | undefined>();

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setImageUri(await persistPickedImage(result.assets[0].uri));
    }
  };

  const save = () => {
    const fallbackTitle = detectPlatform(link) ? `${detectPlatform(link)} save` : 'New travel idea';
    onSave({
      id: `idea-${Date.now()}`,
      title: title.trim() || fallbackTitle,
      note,
      link,
      category,
      priority,
      tags: selectedTags,
      imageUrl: imageUri ?? youtubeThumbnail(link),
    });
  };

  return (
    <View>
      <Text style={styles.back} onPress={onBack}>Back to {trip.title}</Text>
      <Text style={styles.title}>Add inspiration</Text>
      <Text style={styles.body}>Paste a link, write a note, or save a quick idea. Only the title is useful, and even that can be fixed later.</Text>

      <TextInput placeholder="Title" placeholderTextColor={colors.muted} value={title} onChangeText={setTitle} style={styles.input} />
      <TextInput placeholder="Paste TikTok, Reel, YouTube, blog, or site link" placeholderTextColor={colors.muted} value={link} onChangeText={setLink} style={styles.input} autoCapitalize="none" />
      {!!link && <Text style={styles.detected}>{detectPlatform(link) ? `${detectPlatform(link)} detected` : 'Saved as a regular link with a polished fallback card'}</Text>}
      <TextInput placeholder="Quick note" placeholderTextColor={colors.muted} value={note} onChangeText={setNote} style={[styles.input, styles.note]} multiline />

      <View style={styles.photoBox}>
        {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} /> : <View style={styles.emptyPreview}><Text style={styles.emptyPreviewText}>Optional photo</Text></View>}
        <View style={styles.photoCopy}>
          <Text style={styles.photoTitle}>Add your own photo</Text>
          <Text style={styles.photoBody}>Use a screenshot, saved inspo photo, or anything already on the device.</Text>
          <Button label={imageUri ? 'Change Photo' : 'Choose Photo'} variant="secondary" onPress={pickImage} />
        </View>
      </View>

      <Text style={styles.label}>Category</Text>
      <View style={styles.wrap}>
        {categories.map((item) => (
          <Chip key={item} label={item} active={category === item} onPress={() => setCategory(item)} />
        ))}
      </View>

      <Text style={styles.label}>Priority</Text>
      <View style={styles.wrap}>
        {(['Must-do', 'Maybe', 'Skip'] as IdeaPriority[]).map((item) => (
          <Chip key={item} label={item} active={priority === item} onPress={() => setPriority(item)} />
        ))}
      </View>

      <Text style={styles.label}>Quick tags</Text>
      <View style={styles.wrap}>
        {tags.map((item) => (
          <Chip key={item} label={item} active={selectedTags.includes(item)} onPress={() => setSelectedTags((current) => current.includes(item) ? current.filter((tag) => tag !== item) : [...current, item])} />
        ))}
      </View>

      <View style={styles.save}>
        <Button label="Save Idea" onPress={save} />
      </View>
    </View>
  );
}

function detectPlatform(link: string) {
  const value = link.toLowerCase();
  if (value.includes('youtube.com') || value.includes('youtu.be')) return 'YouTube';
  if (value.includes('tiktok.com')) return 'TikTok';
  if (value.includes('instagram.com')) return 'Instagram';
  if (value.startsWith('http')) return 'Website';
  return undefined;
}

function youtubeThumbnail(link: string) {
  const match = link.match(/(?:v=|youtu\.be\/|shorts\/)([A-Za-z0-9_-]{6,})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : undefined;
}

async function persistPickedImage(uri: string) {
  if (!FileSystem.documentDirectory) return uri;

  try {
    const extension = uri.split('.').pop()?.split('?')[0] || 'jpg';
    const destination = `${FileSystem.documentDirectory}gowandr-idea-${Date.now()}.${extension}`;
    await FileSystem.copyAsync({ from: uri, to: destination });
    return destination;
  } catch {
    return uri;
  }
}

const styles = StyleSheet.create({
  back: { color: colors.tealDark, fontWeight: '900', paddingVertical: 10 },
  title: { color: colors.charcoal, fontWeight: '900', fontSize: 36 },
  body: { color: colors.muted, fontSize: 16, lineHeight: 23, marginTop: 8, marginBottom: 18 },
  input: { minHeight: 52, borderRadius: 18, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, paddingHorizontal: 16, color: colors.charcoal, fontSize: 15, marginBottom: 10 },
  note: { minHeight: 96, paddingTop: 14, textAlignVertical: 'top' },
  detected: { color: colors.tealDark, fontWeight: '800', marginBottom: 10 },
  photoBox: { flexDirection: 'row', gap: 12, padding: 12, borderRadius: 22, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, marginBottom: 8 },
  preview: { width: 104, height: 116, borderRadius: 16, backgroundColor: colors.cloud },
  emptyPreview: { width: 104, height: 116, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cloud },
  emptyPreviewText: { color: colors.tealDark, fontWeight: '900', fontSize: 12 },
  photoCopy: { flex: 1, gap: 8 },
  photoTitle: { color: colors.charcoal, fontWeight: '900', fontSize: 16 },
  photoBody: { color: colors.muted, lineHeight: 19, fontSize: 13 },
  label: { color: colors.charcoal, fontWeight: '900', fontSize: 17, marginTop: 14, marginBottom: 10 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  save: { marginTop: 22 },
});
