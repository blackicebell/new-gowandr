import React, { useEffect, useMemo, useState } from 'react';
import { ImageBackground, Linking, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { SourceThumbnail, getSourceLabel } from '../components/SourceThumbnail';
import { getComparisonBrowserId } from '../storage/identityStorage';
import { colors, font } from '../theme/colors';
import { ComparisonResponse, MatchupSession } from '../types';

const concernChips = ['Too expensive', 'Hard to coordinate', 'Flights may be annoying', 'Not my vibe', 'Dates may be tricky', 'Too packed', 'Too slow'];

export function SharedComparisonScreen({
  session,
  onSubmit,
}: {
  session: MatchupSession;
  onSubmit: (response: ComparisonResponse) => Promise<boolean>;
}) {
  const [browserId, setBrowserId] = useState<string | undefined>();
  const [voterName, setVoterName] = useState('');
  const [selectedTripId, setSelectedTripId] = useState<string | undefined>();
  const [reason, setReason] = useState('');
  const [concerns, setConcerns] = useState<string[]>([]);
  const [likedHighlightIds, setLikedHighlightIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const trips = session.comparisonTrips ?? [];
  const existingResponse = useMemo(() => session.responses?.find((response) => response.browserId === browserId), [browserId, session.responses]);
  const closedReason = getClosedReason(session);

  useEffect(() => {
    getComparisonBrowserId().then(setBrowserId).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!existingResponse) return;
    setVoterName(existingResponse.voterName);
    setSelectedTripId(existingResponse.selectedTripId);
    setReason(existingResponse.reason ?? '');
    setConcerns(existingResponse.concernChips ?? []);
    setLikedHighlightIds(existingResponse.likedHighlightIds ?? []);
  }, [existingResponse]);

  const toggleConcern = (chip: string) => {
    setConcerns((current) => (current.includes(chip) ? current.filter((item) => item !== chip) : [...current, chip]));
  };

  const toggleHighlight = (highlightId: string) => {
    setLikedHighlightIds((current) => (current.includes(highlightId) ? current.filter((item) => item !== highlightId) : [...current, highlightId]));
  };

  const submit = async () => {
    if (!browserId) return;
    if (!voterName.trim()) {
      setError('Add your name or nickname so the trip owner knows who responded.');
      return;
    }
    if (!selectedTripId) {
      setError('Choose the trip that pulls you most.');
      return;
    }

    setSubmitting(true);
    setError(undefined);
    const now = new Date().toISOString();
    const saved = await onSubmit({
      id: browserId,
      browserId,
      voterName: voterName.trim(),
      selectedTripId,
      reason: reason.trim(),
      concernChips: concerns,
      likedHighlightIds,
      createdAt: existingResponse?.createdAt ?? now,
      updatedAt: now,
    });
    setSubmitting(false);
    if (!saved) {
      setError('Your input could not be saved. Check your connection and try again.');
      return;
    }
    setSubmitted(true);
  };

  if (closedReason) {
    return (
      <View style={styles.closedCard}>
        <Text style={styles.kicker}>Get a read</Text>
        <Text style={styles.title}>This comparison is closed.</Text>
        <Text style={styles.body}>{closedReason}</Text>
      </View>
    );
  }

  if (submitted) {
    return (
      <View style={styles.closedCard}>
        <Text style={styles.kicker}>Thanks</Text>
        <Text style={styles.title}>Your input was added.</Text>
        <Text style={styles.body}>The trip owner will see which option has the strongest momentum.</Text>
        <Button label="Edit your input" variant="secondary" onPress={() => setSubmitted(false)} />
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.kicker}>Get a read</Text>
      <Text style={styles.title}>Your friend wants your input.</Text>
      <Text style={styles.body}>Review the highlights, then pick the trip that pulls you most. No login needed.</Text>

      <TextInput value={voterName} onChangeText={setVoterName} placeholder="Name or nickname" placeholderTextColor="rgba(32,38,35,0.48)" style={styles.input} />

      <View style={styles.tripList}>
        {trips.map((trip) => (
          <View key={trip.id} style={[styles.tripCard, selectedTripId === trip.id && styles.tripCardSelected]}>
            <TouchableOpacity onPress={() => setSelectedTripId(trip.id)} activeOpacity={0.86}>
              <ImageBackground source={{ uri: trip.coverImageUrl }} style={styles.hero} imageStyle={styles.heroImage}>
                <View style={styles.shade} />
                <View style={styles.heroCopy}>
                  <Text style={styles.tripMeta}>{trip.mood} / {trip.pace}</Text>
                  <Text style={styles.tripTitle}>{trip.title}</Text>
                  <Text numberOfLines={2} style={styles.tripSubtitle}>{trip.subtitle}</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
            <View style={styles.highlightGrid}>
              {trip.highlights.map((highlight) => (
                <TouchableOpacity key={highlight.id} onPress={() => toggleHighlight(highlight.id)} style={[styles.highlightCard, likedHighlightIds.includes(highlight.id) && styles.highlightCardLiked]}>
                  <SourceThumbnail link={highlight.link} priority={highlight.priority} />
                  <Text numberOfLines={2} style={styles.highlightTitle}>{highlight.title}</Text>
                  <Text numberOfLines={1} style={styles.highlightSource} onPress={() => openLink(highlight.link)}>
                    {highlight.link ? `Open ${getSourceLabel(highlight.link)}` : highlight.category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button label={selectedTripId === trip.id ? 'This is my pick' : 'Pick this trip'} variant={selectedTripId === trip.id ? 'primary' : 'secondary'} onPress={() => setSelectedTripId(trip.id)} />
          </View>
        ))}
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Why this one?</Text>
        <TextInput value={reason} onChangeText={setReason} placeholder="Optional reason, like best food, easiest plan, better vibe..." placeholderTextColor="rgba(32,38,35,0.48)" style={styles.reasonInput} multiline />
        <Text style={styles.formTitle}>Any concern?</Text>
        <Text style={styles.formHint}>Optional. Choose anything that could block the trip.</Text>
        <View style={styles.chipWrap}>
          {concernChips.map((chip) => (
            <Chip key={chip} label={chip} active={concerns.includes(chip)} onPress={() => toggleConcern(chip)} />
          ))}
        </View>
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}
      <View style={styles.actions}>
        <Button label={submitting ? 'Saving...' : existingResponse ? 'Update Input' : 'Share Input'} disabled={submitting} onPress={submit} />
      </View>
    </View>
  );
}

function getClosedReason(session: MatchupSession) {
  if (session.status === 'closed') return 'The trip owner has already closed this link.';
  if (session.expiresAt && new Date(session.expiresAt).getTime() < Date.now()) return 'This shared link expired after 7 days.';
  return undefined;
}

function openLink(link?: string) {
  if (!link) return;
  const normalized = /^https?:\/\//i.test(link) ? link : `https://${link}`;
  Linking.openURL(normalized).catch(() => undefined);
}

const styles = StyleSheet.create({
  kicker: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '700', textTransform: 'uppercase', fontSize: 12, marginTop: 8 },
  title: { color: colors.charcoal, fontFamily: font.heading, fontWeight: '700', fontSize: 34, lineHeight: 40, letterSpacing: -0.4, marginTop: 6 },
  body: { color: colors.muted, fontFamily: font.body, fontSize: 16, lineHeight: 23, marginTop: 8, marginBottom: 18 },
  input: { minHeight: 52, borderRadius: 18, paddingHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.86)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.08)', color: colors.charcoal, fontFamily: font.body, fontSize: 15, marginBottom: 16 },
  tripList: { gap: 16 },
  tripCard: { borderRadius: 28, padding: 12, backgroundColor: 'rgba(255,255,255,0.86)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)', shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  tripCardSelected: { borderColor: '#2FAF8A', shadowColor: '#2FAF8A', shadowOpacity: 0.14 },
  hero: { minHeight: 184, justifyContent: 'flex-end', overflow: 'hidden', borderRadius: 22 },
  heroImage: { borderRadius: 22 },
  shade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.30)' },
  heroCopy: { padding: 16 },
  tripMeta: { color: '#A8F0D4', fontFamily: font.semibold, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  tripTitle: { color: colors.white, fontFamily: font.heading, fontWeight: '700', fontSize: 26, lineHeight: 31, marginTop: 4 },
  tripSubtitle: { color: 'rgba(255,255,255,0.88)', fontFamily: font.body, fontSize: 13.5, lineHeight: 19, marginTop: 4 },
  highlightGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 12, marginBottom: 12 },
  highlightCard: { width: '31%', minHeight: 132, borderRadius: 18, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.88)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.06)' },
  highlightCardLiked: { backgroundColor: 'rgba(168,240,212,0.35)', borderColor: 'rgba(47,175,138,0.28)' },
  highlightTitle: { color: colors.charcoal, fontFamily: font.semibold, fontWeight: '700', fontSize: 12, lineHeight: 16, marginHorizontal: 9, marginTop: 8 },
  highlightSource: { color: colors.tealDark, fontFamily: font.body, fontWeight: '500', fontSize: 10.5, marginHorizontal: 9, marginTop: 3, marginBottom: 9 },
  formCard: { borderRadius: 26, padding: 18, backgroundColor: 'rgba(255,255,255,0.84)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)', marginTop: 18 },
  formTitle: { color: colors.charcoal, fontFamily: font.heading, fontWeight: '700', fontSize: 19, letterSpacing: -0.15, marginTop: 4 },
  formHint: { color: colors.muted, fontFamily: font.body, fontSize: 13.5, lineHeight: 19, marginTop: 4, marginBottom: 12 },
  reasonInput: { minHeight: 104, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(32,38,35,0.08)', backgroundColor: 'rgba(255,255,255,0.68)', color: colors.charcoal, fontFamily: font.body, padding: 14, fontSize: 15, textAlignVertical: 'top', marginVertical: 12 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  error: { color: '#B84A3F', fontFamily: font.semibold, fontWeight: '600', fontSize: 13, lineHeight: 18, textAlign: 'center', marginTop: 14 },
  actions: { marginTop: 16, marginBottom: 120 },
  closedCard: { borderRadius: 28, padding: 22, backgroundColor: 'rgba(255,255,255,0.86)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)', marginTop: 18, gap: 12 },
});
