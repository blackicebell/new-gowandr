import React, { useState } from 'react';
import { ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { colors } from '../theme/colors';
import { TripDraft, VoteAnswer, VotePrompt } from '../types';

type PromptConfig = {
  id: VotePrompt;
  text: string;
  helper: string;
  reasons: string[];
  concerns: string[];
};

const prompts: PromptConfig[] = [
  {
    id: 'exciting',
    text: 'Which trip feels more exciting?',
    helper: 'Pick the one that has the strongest pull.',
    reasons: ["I'm in", 'Best energy', 'Dream trip', 'Looks fun', 'Biggest memory', 'Maybe'],
    concerns: ['Too expensive', 'Too much partying', 'Not relaxing enough', 'Safety concern', 'Dates unclear'],
  },
  {
    id: 'easy',
    text: 'Which trip feels easier to actually pull off?',
    helper: 'Think budget, timing, travel friction, and who can realistically go.',
    reasons: ['Easy yes', 'Dates work', 'Shorter travel', 'Lower lift', 'Fits budget', 'Everyone can go'],
    concerns: ['Dates unclear', 'Travel hassle', 'Needs budget check', 'Group schedules', 'Too much planning'],
  },
  {
    id: 'commit',
    text: 'Which trip would you actually commit to?',
    helper: 'This is the trip you would help book, plan, and protect on the calendar.',
    reasons: ['Ready to plan', 'Ready to book', 'Dates work', "I'm in", 'Need dates', 'Need details'],
    concerns: ['Budget check', 'PTO needed', 'No passport', 'Group buy-in', 'Timing risk'],
  },
  {
    id: 'memorable',
    text: 'Which trip would people talk about later?',
    helper: 'Choose the option that feels like the better story.',
    reasons: ['Best story', 'Dream trip', 'Bucket-list', 'Unique food', 'Big group memory', 'Looks special'],
    concerns: ['Too expensive', 'Too packed', 'Too far', 'Weather risk', 'Not enough anchors'],
  },
  {
    id: 'groupFit',
    text: 'Which trip fits the group better?',
    helper: 'Pick the one that feels easiest for the actual people going.',
    reasons: ['Everyone can go', 'Good mix', 'Easy yes', 'Fits the vibe', 'Low drama', 'Need dates'],
    concerns: ['Split interests', 'Too much partying', 'Not relaxing enough', 'Budget mismatch', 'Safety concern'],
  },
  {
    id: 'regret',
    text: 'Which one would you regret skipping?',
    helper: 'This helps separate nice ideas from the trip people really want.',
    reasons: ['Would regret it', 'Once-in-a-while', 'Dream trip', 'Best memory', "I'm in", 'Feels worth it'],
    concerns: ['Too expensive', 'Hard to plan', 'Too far', 'Needs more clarity', 'Timing risk'],
  },
];

const commitments = ['Browsing', 'Interested', 'Dates work', 'Ready to plan', 'Ready elsewhere'];

export function VotingScreen({ trips, matchupName, onCancel, onComplete }: { trips: TripDraft[]; matchupName: string; onCancel: () => void; onComplete: (votes: VoteAnswer[]) => void }) {
  const [step, setStep] = useState(0);
  const [votes, setVotes] = useState<VoteAnswer[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | undefined>();
  const [phase, setPhase] = useState<'choose' | 'explain'>('choose');
  const [reaction, setReaction] = useState<string | undefined>();
  const [dealbreaker, setDealbreaker] = useState<string | undefined>();
  const [commitment, setCommitment] = useState(3);
  const [reason, setReason] = useState('');
  const prompt = prompts[step];
  const selectedTrip = trips.find((trip) => trip.id === selectedTripId);

  const chooseTrip = (tripId: string) => {
    setSelectedTripId(tripId);
    setPhase('explain');
  };

  const changePick = () => {
    setSelectedTripId(undefined);
    setPhase('choose');
    setReaction(undefined);
    setDealbreaker(undefined);
    setCommitment(3);
    setReason('');
  };

  const submitWhy = () => {
    if (!selectedTripId) return;
    const nextVotes = [...votes, { prompt: prompt.id, tripId: selectedTripId, reaction, dealbreaker, commitment, reason: reason.trim() || reaction }];
    setSelectedTripId(undefined);
    setPhase('choose');
    setReaction(undefined);
    setDealbreaker(undefined);
    setCommitment(3);
    setReason('');
    if (step >= prompts.length - 1) onComplete(nextVotes);
    else {
      setVotes(nextVotes);
      setStep((current) => current + 1);
    }
  };

  return (
    <View>
      <Text style={styles.kicker}>{matchupName}</Text>
      <Text style={styles.title}>{prompt.text}</Text>
      <Text style={styles.helper}>{prompt.helper}</Text>
      <Text style={styles.progress}>Question {step + 1} of {prompts.length}</Text>

      {phase === 'choose' ? (
        <View>
          <View style={styles.cards}>
            {trips.map((trip) => (
              <TouchableOpacity key={trip.id} onPress={() => chooseTrip(trip.id)} style={styles.voteCard}>
                <ImageBackground source={{ uri: trip.heroImage }} style={styles.image} imageStyle={styles.imageRadius}>
                  <View style={styles.shade} />
                  <View style={styles.cardCopy}>
                    <Text style={styles.cardTitle}>{trip.title}</Text>
                    <Text style={styles.cardMeta}>{trip.tags.slice(0, 3).join(' • ')}</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.bottomActions}>
            <Button label="Cancel Matchup" variant="ghost" onPress={onCancel} />
          </View>
        </View>
      ) : (
        <View>
          <View style={styles.whyCard}>
            <Text style={styles.whyLabel}>You picked</Text>
            <Text style={styles.whyTitle}>{selectedTrip?.title}</Text>
            <Text style={styles.whyBody}>What made this one win for you?</Text>
            <TextInput value={reason} onChangeText={setReason} placeholder="Example: easier for everyone, better food, dates work..." placeholderTextColor="rgba(32,38,35,0.48)" style={styles.reasonInput} multiline />
          </View>

          <View style={styles.choiceSection}>
            <Text style={styles.label}>Quick reason</Text>
            <Text style={styles.sectionHint}>Tap one if it explains your pick.</Text>
            <View style={styles.wrap}>
              {prompt.reasons.map((item) => (
                <Chip key={item} label={item} active={reaction === item} onPress={() => setReaction(reaction === item ? undefined : item)} />
              ))}
            </View>
          </View>

          <View style={styles.choiceSection}>
            <Text style={styles.label}>Concern, if any</Text>
            <Text style={styles.sectionHint}>Optional. Leave blank if there is no blocker.</Text>
            <View style={styles.wrap}>
              {prompt.concerns.map((item) => (
                <Chip key={item} label={item} active={dealbreaker === item} onPress={() => setDealbreaker(dealbreaker === item ? undefined : item)} />
              ))}
            </View>
          </View>

          <View style={styles.choiceSection}>
            <Text style={styles.label}>Commitment</Text>
            <View style={styles.meter}>
              {commitments.map((item, index) => (
                <TouchableOpacity key={item} onPress={() => setCommitment(index + 1)} style={[styles.meterItem, commitment === index + 1 && styles.meterActive]}>
                  <Text style={[styles.meterText, commitment === index + 1 && styles.meterTextActive]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.whyActions}>
            <TouchableOpacity onPress={changePick} style={styles.changePick}>
              <Text style={styles.changePickText}>Back to trip choices</Text>
            </TouchableOpacity>
            <Button label={step >= prompts.length - 1 ? 'See Results' : 'Next Question'} disabled={!reason.trim() && !reaction} onPress={submitWhy} />
            <Button label="Cancel Matchup" variant="ghost" onPress={onCancel} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  kicker: { color: colors.tealDark, fontWeight: '800', textTransform: 'uppercase', fontSize: 12, marginTop: 10 },
  title: { color: colors.charcoal, fontWeight: '800', fontSize: 31, lineHeight: 37, marginTop: 6, letterSpacing: -0.4 },
  helper: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 8 },
  progress: { color: colors.muted, fontWeight: '700', marginTop: 10, marginBottom: 18 },
  cards: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  voteCard: { width: '48%', borderRadius: 24, overflow: 'hidden', backgroundColor: colors.charcoal, shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 16, shadowOffset: { width: 0, height: 7 }, elevation: 4 },
  image: { minHeight: 216, justifyContent: 'flex-end' },
  imageRadius: { borderRadius: 24 },
  shade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.24)' },
  cardCopy: { padding: 16 },
  cardTitle: { color: colors.white, fontWeight: '800', fontSize: 23, lineHeight: 27 },
  cardMeta: { color: colors.white, opacity: 0.92, fontWeight: '700', marginTop: 5, textTransform: 'capitalize', fontSize: 12 },
  whyCard: { borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.82)', padding: 18, borderWidth: 1, borderColor: 'rgba(32,38,35,0.06)', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 2 },
  whyLabel: { color: colors.tealDark, fontWeight: '800', textTransform: 'uppercase', fontSize: 11 },
  whyTitle: { color: colors.charcoal, fontWeight: '800', fontSize: 27, marginTop: 4, letterSpacing: -0.25 },
  whyBody: { color: colors.muted, fontSize: 15, lineHeight: 21, marginTop: 6, marginBottom: 12 },
  reasonInput: { minHeight: 104, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(32,38,35,0.08)', backgroundColor: 'rgba(255,255,255,0.68)', color: colors.charcoal, padding: 14, fontSize: 15, textAlignVertical: 'top' },
  choiceSection: { marginTop: 24 },
  label: { color: colors.charcoal, fontWeight: '800', fontSize: 18, marginBottom: 5, letterSpacing: -0.12 },
  sectionHint: { color: colors.muted, fontSize: 13, lineHeight: 18, marginBottom: 12 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 10, rowGap: 10 },
  meter: { gap: 9 },
  meterItem: { minHeight: 48, borderRadius: 16, paddingHorizontal: 14, justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.78)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)' },
  meterActive: { backgroundColor: colors.teal, borderColor: colors.tealDark },
  meterText: { color: colors.charcoal, fontWeight: '700' },
  meterTextActive: { color: colors.charcoal, fontWeight: '800' },
  whyActions: { gap: 11, marginTop: 22 },
  changePick: { minHeight: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.68)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)' },
  changePickText: { color: colors.tealDark, fontWeight: '800', fontSize: 14 },
  bottomActions: { marginTop: 18 },
});
