import React, { useState } from 'react';
import { ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { colors } from '../theme/colors';
import { TripDraft, VoteAnswer, VotePrompt } from '../types';

const prompts: { id: VotePrompt; text: string }[] = [
  { id: 'exciting', text: 'Which trip feels more exciting?' },
  { id: 'easy', text: 'Which trip feels easier to actually pull off?' },
  { id: 'commit', text: 'Which trip would you be most ready to commit to?' },
  { id: 'memorable', text: 'Which trip feels more memorable?' },
  { id: 'groupFit', text: 'Which trip fits the group better?' },
  { id: 'regret', text: 'Which one would you regret skipping?' },
];

const reactions = ["I'm in", 'Maybe', 'Too pricey', 'Dream trip', 'Easy yes', 'Need dates'];
const dealbreakers = ['Too expensive', 'Too far', 'No passport', 'Too much partying', 'Not relaxing enough', 'Safety concern'];

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
      <Text style={styles.back} onPress={onCancel}>Cancel matchup</Text>
      <Text style={styles.kicker}>{matchupName}</Text>
      <Text style={styles.title}>{prompt.text}</Text>
      <Text style={styles.progress}>Question {step + 1} of {prompts.length}</Text>

      {phase === 'choose' ? (
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
      ) : (
        <View>
          <View style={styles.whyCard}>
            <Text style={styles.whyLabel}>You picked</Text>
            <Text style={styles.whyTitle}>{selectedTrip?.title}</Text>
            <Text style={styles.whyBody}>What made this one win for you?</Text>
            <TextInput value={reason} onChangeText={setReason} placeholder="Example: easiest for everyone, better food, less expensive..." placeholderTextColor={colors.muted} style={styles.reasonInput} multiline />
          </View>

          <Text style={styles.label}>Quick reason</Text>
          <View style={styles.wrap}>
            {reactions.map((item) => (
              <Chip key={item} label={item} active={reaction === item} onPress={() => setReaction(reaction === item ? undefined : item)} />
            ))}
          </View>

          <Text style={styles.label}>Concern, if any</Text>
          <View style={styles.wrap}>
            {dealbreakers.map((item) => (
              <Chip key={item} label={item} active={dealbreaker === item} onPress={() => setDealbreaker(dealbreaker === item ? undefined : item)} />
            ))}
          </View>

          <Text style={styles.label}>Commitment</Text>
          <View style={styles.meter}>
            {['Browsing', 'Interested', 'Dates work', 'Ready to plan', 'Ready elsewhere'].map((item, index) => (
              <TouchableOpacity key={item} onPress={() => setCommitment(index + 1)} style={[styles.meterItem, commitment === index + 1 && styles.meterActive]}>
                <Text style={[styles.meterText, commitment === index + 1 && styles.meterTextActive]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.whyActions}>
            <Button label="Choose Different Trip" variant="ghost" onPress={() => setPhase('choose')} />
            <Button label={step >= prompts.length - 1 ? 'See Results' : 'Next Question'} disabled={!reason.trim() && !reaction} onPress={submitWhy} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  back: { color: colors.tealDark, fontWeight: '900', paddingVertical: 10 },
  kicker: { color: colors.coral, fontWeight: '900', textTransform: 'uppercase', fontSize: 12 },
  title: { color: colors.charcoal, fontWeight: '900', fontSize: 31, lineHeight: 36, marginTop: 4 },
  progress: { color: colors.muted, fontWeight: '800', marginTop: 8, marginBottom: 18 },
  cards: { gap: 12 },
  voteCard: { borderRadius: 24, overflow: 'hidden', backgroundColor: colors.charcoal },
  image: { minHeight: 168, justifyContent: 'flex-end' },
  imageRadius: { borderRadius: 24 },
  shade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.24)' },
  cardCopy: { padding: 18 },
  cardTitle: { color: colors.white, fontWeight: '900', fontSize: 27 },
  cardMeta: { color: colors.white, opacity: 0.92, fontWeight: '700', marginTop: 4, textTransform: 'capitalize' },
  whyCard: { borderRadius: 24, backgroundColor: colors.paper, padding: 18, borderWidth: 1, borderColor: colors.line },
  whyLabel: { color: colors.coral, fontWeight: '900', textTransform: 'uppercase', fontSize: 11 },
  whyTitle: { color: colors.charcoal, fontWeight: '900', fontSize: 27, marginTop: 4 },
  whyBody: { color: colors.muted, fontSize: 15, lineHeight: 21, marginTop: 6, marginBottom: 12 },
  reasonInput: { minHeight: 92, borderRadius: 18, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.canvas, color: colors.charcoal, padding: 14, fontSize: 15, textAlignVertical: 'top' },
  label: { color: colors.charcoal, fontWeight: '900', fontSize: 17, marginTop: 18, marginBottom: 10 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  meter: { gap: 8 },
  meterItem: { borderRadius: 16, padding: 13, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line },
  meterActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  meterText: { color: colors.charcoal, fontWeight: '800' },
  meterTextActive: { color: colors.white },
  whyActions: { gap: 10, marginTop: 18 },
});
