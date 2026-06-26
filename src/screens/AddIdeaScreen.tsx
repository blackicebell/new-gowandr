import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { Chip } from '../components/Chip';
import { colors, font, useThemeColors } from '../theme/colors';
import { IdeaCategory, IdeaPriority, TripDraft, TripIdea } from '../types';
import { PressableScale } from '../components/PressableScale';

const categories: IdeaCategory[] = ['Food', 'Stay', 'Beach', 'Nightlife', 'Culture', 'Adventure', 'Shopping', 'Photo Spot', 'Relax', 'Other'];
const tags = ['Must-do', 'Maybe', 'Chill', 'Active', 'Romantic', 'Friends', 'Family', 'Solo', 'Food', 'Nightlife', 'Beach', 'Culture', 'Luxury', 'Low-key'];

export function AddIdeaScreen({ trip, onBack, onSave }: { trip: TripDraft; onBack: () => void; onSave: (idea: TripIdea) => void }) {
  const theme = useThemeColors();
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [link, setLink] = useState('');
  const [category, setCategory] = useState<IdeaCategory>('Food');
  const [priority, setPriority] = useState<IdeaPriority>('Maybe');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [pasteMessage, setPasteMessage] = useState('');
  const canSave = !!link.trim() || !!title.trim() || !!note.trim();

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
      <Text style={[styles.back, { color: theme.teal, fontFamily: font.family }]} onPress={onBack}>Back to {trip.title}</Text>
      <Text style={[styles.title, { color: theme.charcoal, fontFamily: font.family }]}>Add inspiration</Text>
      <Text style={[styles.body, { color: theme.muted, fontFamily: font.family }]}>Start with the thing you found. You can organize it after, but you should not have to do all the work upfront.</Text>

      <StepHeader number={1} title="Paste or type the link" active={step === 1} done={!!link.trim()} onPress={() => setStep(1)} />
      {step === 1 && (
        <View style={styles.stepCard}>
          <Text style={styles.stepBody}>Copy a TikTok, Reel, YouTube, blog, restaurant, or destination link, then paste it here.</Text>
          <View style={styles.linkRow}>
            <Text style={[styles.inputLabel, { fontFamily: font.family }]}>Travel link</Text>
            <TextInput placeholder="Paste TikTok, Reel, YouTube, blog, or restaurant link" placeholderTextColor={theme.muted} value={link} onChangeText={setLink} style={[styles.input, styles.linkInput, { color: theme.charcoal, fontFamily: font.family }]} autoCapitalize="none" />
            <PrimaryLocalButton label="Paste here" onPress={pasteFromClipboard} />
          </View>
          {!!pasteMessage && <Text style={styles.detected}>{pasteMessage}</Text>}
          {!!link && <Text style={styles.detected}>{detectPlatform(link) ? `${detectPlatform(link)} detected. We will save the link even if a thumbnail is not available.` : 'Saved as a regular link with a polished fallback card.'}</Text>}
          <SecondaryLocalButton label="Next: Add a quick label" disabled={!link.trim()} onPress={() => setStep(2)} />
        </View>
      )}

      <StepHeader number={2} title="Add a quick label" active={step === 2} done={!!title.trim() || !!note.trim()} onPress={() => setStep(2)} />
      {step === 2 && (
        <View style={styles.stepCard}>
          <Text style={styles.stepBody}>Give it just enough context so future-you remembers why it mattered.</Text>
          <TextInput placeholder="Title, like Rooftop dinner or Beach club" placeholderTextColor={theme.muted} value={title} onChangeText={setTitle} style={[styles.input, { color: theme.charcoal, fontFamily: font.family }]} />
          <TextInput placeholder="Optional note" placeholderTextColor={theme.muted} value={note} onChangeText={setNote} style={[styles.input, styles.note, { color: theme.charcoal, fontFamily: font.family }]} multiline />
          <SecondaryLocalButton label="Next: Organize it" onPress={() => setStep(3)} />
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

      {canSave && (
        <View style={styles.save}>
          <PrimaryLocalButton label="Save Inspiration" onPress={save} muted={step === 1 && !title.trim() && !note.trim()} />
        </View>
      )}
    </View>
  );
}

function PrimaryLocalButton({ label, onPress, muted = false }: { label: string; onPress: () => void; muted?: boolean }) {
  return (
    <PressableScale onPress={onPress} style={[styles.localButtonShell, muted && styles.mutedAction]}>
      <LinearGradient colors={['#A8F0D4', '#6ED8B5', '#2FAF8A']} locations={[0, 0.4, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.localPrimary}>
        <View style={styles.innerHighlight} />
        <Text style={[styles.localPrimaryText, { fontFamily: font.family }]}>{label}</Text>
      </LinearGradient>
    </PressableScale>
  );
}

function SecondaryLocalButton({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <PressableScale disabled={disabled} onPress={onPress} style={[styles.localSecondary, disabled && styles.disabledButton]}>
      <Text style={[styles.localSecondaryText, { fontFamily: font.family }]}>{label}</Text>
    </PressableScale>
  );
}

function StepHeader({ number, title, active, done, onPress }: { number: number; title: string; active: boolean; done: boolean; onPress: () => void }) {
  const theme = useThemeColors();
  return (
    <TouchableOpacity style={[styles.stepHeader, active && styles.stepHeaderActive]} onPress={onPress}>
      <View style={[styles.stepNumber, done && styles.stepNumberDone, active && !done && styles.stepNumberActive]}>
        <Text style={[styles.stepNumberText, { fontFamily: font.family }]}>{done ? 'OK' : number}</Text>
      </View>
      <Text style={[styles.stepTitle, { fontFamily: font.family }]}>{title}</Text>
      {active ? <Text style={[styles.activePill, { fontFamily: font.family }]}>Active</Text> : done ? <Text style={[styles.stepAction, { fontFamily: font.family }]}>Edit</Text> : null}
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
  back: { fontWeight: '800', paddingVertical: 10 },
  title: { fontWeight: '700', fontSize: 38, lineHeight: 46, letterSpacing: -0.4 },
  body: { fontSize: 16, lineHeight: 24, marginTop: 8, marginBottom: 22, fontWeight: '500' },
  stepHeader: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.42)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)', marginBottom: 8 },
  stepHeaderActive: { backgroundColor: 'rgba(255,255,255,0.62)', borderColor: 'rgba(255,255,255,0.34)' },
  stepNumber: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.48)' },
  stepNumberActive: { backgroundColor: 'rgba(168,240,212,0.42)' },
  stepNumberDone: { backgroundColor: '#6ED8B5' },
  stepNumberText: { color: '#0F1115', fontWeight: '700', fontSize: 12 },
  stepTitle: { flex: 1, color: '#0F1115', fontWeight: '700', fontSize: 15.5 },
  stepAction: { color: 'rgba(0,0,0,0.55)', fontWeight: '700', fontSize: 12 },
  activePill: { color: '#0F1115', fontWeight: '700', fontSize: 11, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(168,240,212,0.46)', overflow: 'hidden' },
  stepCard: { backgroundColor: 'rgba(255,255,255,0.62)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', borderRadius: 24, padding: 16, marginTop: -2, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 22, shadowOffset: { width: 0, height: 8 }, elevation: 5 },
  stepBody: { color: 'rgba(0,0,0,0.65)', fontSize: 14.5, lineHeight: 21, marginBottom: 14, fontWeight: '500' },
  linkRow: { gap: 10 },
  inputLabel: { color: 'rgba(0,0,0,0.62)', fontSize: 12, fontWeight: '700', marginBottom: -2 },
  input: { minHeight: 54, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 16, color: colors.charcoal, fontSize: 15, marginBottom: 10 },
  linkInput: { marginBottom: 0 },
  note: { minHeight: 96, paddingTop: 14, textAlignVertical: 'top' },
  detected: { color: '#2FAF8A', fontWeight: '700', marginBottom: 10, fontSize: 13, lineHeight: 18 },
  label: { color: '#0F1115', fontWeight: '700', fontSize: 15.5, marginTop: 14, marginBottom: 10 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  save: { marginTop: 18 },
  localButtonShell: { borderRadius: 18 },
  localPrimary: { minHeight: 50, borderRadius: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22, overflow: 'hidden' },
  innerHighlight: { position: 'absolute', top: 1, left: 1, right: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.35)' },
  localPrimaryText: { color: '#0F1115', fontWeight: '800', fontSize: 15 },
  localSecondary: { minHeight: 48, borderRadius: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22, marginTop: 12, backgroundColor: 'rgba(255,255,255,0.34)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)' },
  localSecondaryText: { color: '#0F1115', fontWeight: '700', fontSize: 14.5 },
  disabledButton: { opacity: 0.42 },
  mutedAction: { opacity: 0.78 },
});
