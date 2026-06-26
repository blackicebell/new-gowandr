import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
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
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [pasteMessage, setPasteMessage] = useState('');

  const pasteFromClipboard = async () => {
    const pastedText = await Clipboard.getStringAsync();
    const cleanText = pastedText.trim();
    if (!cleanText) {
      setPasteMessage('Nothing copied yet. Copy a travel link first, then tap Paste here.');
      return;
    }

    setLink(cleanText);
    setPasteMessage(detectPlatform(cleanText) ? `${detectPlatform(cleanText)} link pasted.` : 'Link pasted.');
    if (!title.trim() && detectPlatform(cleanText)) setTitle(`${detectPlatform(cleanText)} save`);
    setStep(2);
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
      imageUrl: youtubeThumbnail(link),
    });
  };

  return (
    <View>
      <Text style={styles.back} onPress={onBack}>Back to {trip.title}</Text>
      <Text style={styles.title}>Add inspiration</Text>
      <Text style={styles.body}>Start with the thing you found. You can organize it after, but you should not have to do all the work upfront.</Text>

      <StepHeader number={1} title="Paste or type the link" active={step === 1} done={!!link.trim()} onPress={() => setStep(1)} />
      {step === 1 && (
        <View style={styles.stepCard}>
          <Text style={styles.stepBody}>Copy a TikTok, Reel, YouTube, blog, restaurant, or destination link, then paste it here.</Text>
          <View style={styles.linkRow}>
            <TextInput placeholder="Paste travel link here" placeholderTextColor={colors.muted} value={link} onChangeText={setLink} style={[styles.input, styles.linkInput]} autoCapitalize="none" />
            <TouchableOpacity style={styles.pasteButton} onPress={pasteFromClipboard}>
              <Text style={styles.pasteText}>Paste here</Text>
            </TouchableOpacity>
          </View>
          {!!pasteMessage && <Text style={styles.detected}>{pasteMessage}</Text>}
          {!!link && <Text style={styles.detected}>{detectPlatform(link) ? `${detectPlatform(link)} detected. We will save the link even if a thumbnail is not available.` : 'Saved as a regular link with a polished fallback card.'}</Text>}
          <Button label="Next: Add a quick label" disabled={!link.trim()} onPress={() => setStep(2)} />
        </View>
      )}

      <StepHeader number={2} title="Add a quick label" active={step === 2} done={!!title.trim() || !!note.trim()} onPress={() => setStep(2)} />
      {step === 2 && (
        <View style={styles.stepCard}>
          <Text style={styles.stepBody}>Give it just enough context so future-you remembers why it mattered.</Text>
          <TextInput placeholder="Title, like Rooftop dinner or Beach club" placeholderTextColor={colors.muted} value={title} onChangeText={setTitle} style={styles.input} />
          <TextInput placeholder="Optional note" placeholderTextColor={colors.muted} value={note} onChangeText={setNote} style={[styles.input, styles.note]} multiline />
          <Button label="Next: Organize it" onPress={() => setStep(3)} />
        </View>
      )}

      <StepHeader number={3} title="Organize it, optional" active={step === 3} done={selectedTags.length > 0 || priority !== 'Maybe' || category !== 'Food'} onPress={() => setStep(3)} />
      {step === 3 && (
        <View style={styles.stepCard}>
          <Text style={styles.stepBody}>These help GoWandr sort your ideas later. Skip anything you are not sure about.</Text>

          <Text style={styles.label}>What kind of idea is it?</Text>
          <View style={styles.wrap}>
            {categories.map((item) => (
              <Chip key={item} label={item} active={category === item} onPress={() => setCategory(item)} />
            ))}
          </View>

          <Text style={styles.label}>How important is it?</Text>
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
        </View>
      )}

      <View style={styles.save}>
        <Button label="Save Inspiration" disabled={!link.trim() && !title.trim() && !note.trim()} onPress={save} />
      </View>
    </View>
  );
}

function StepHeader({ number, title, active, done, onPress }: { number: number; title: string; active: boolean; done: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.stepHeader, active && styles.stepHeaderActive]} onPress={onPress}>
      <View style={[styles.stepNumber, done && styles.stepNumberDone]}>
        <Text style={styles.stepNumberText}>{done ? '✓' : number}</Text>
      </View>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepAction}>{active ? 'Open' : 'Edit'}</Text>
    </TouchableOpacity>
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

const styles = StyleSheet.create({
  back: { color: colors.tealDark, fontWeight: '900', paddingVertical: 10 },
  title: { color: colors.charcoal, fontWeight: '900', fontSize: 36 },
  body: { color: colors.muted, fontSize: 16, lineHeight: 23, marginTop: 8, marginBottom: 18 },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 18, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, marginBottom: 8 },
  stepHeaderActive: { borderColor: colors.teal, backgroundColor: colors.cloud },
  stepNumber: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.mist },
  stepNumberDone: { backgroundColor: colors.teal },
  stepNumberText: { color: colors.white, fontWeight: '900', fontSize: 13 },
  stepTitle: { flex: 1, color: colors.charcoal, fontWeight: '900', fontSize: 16 },
  stepAction: { color: colors.tealDark, fontWeight: '900', fontSize: 12 },
  stepCard: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, borderRadius: 22, padding: 14, marginTop: -2, marginBottom: 10 },
  stepBody: { color: colors.muted, fontSize: 14, lineHeight: 20, marginBottom: 12 },
  linkRow: { gap: 10 },
  input: { minHeight: 52, borderRadius: 18, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.canvas, paddingHorizontal: 16, color: colors.charcoal, fontSize: 15, marginBottom: 10 },
  linkInput: { marginBottom: 0 },
  pasteButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: colors.teal },
  pasteText: { color: colors.white, fontWeight: '900', fontSize: 15 },
  note: { minHeight: 96, paddingTop: 14, textAlignVertical: 'top' },
  detected: { color: colors.tealDark, fontWeight: '800', marginBottom: 10 },
  label: { color: colors.charcoal, fontWeight: '900', fontSize: 16, marginTop: 14, marginBottom: 10 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  save: { marginTop: 22 },
});
