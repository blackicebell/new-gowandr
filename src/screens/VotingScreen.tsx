import React, { useState } from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const [reaction, setReaction] = useState<string | undefined>();
  const [dealbreaker, setDealbreaker] = useState<string | undefined>();
  const [commitment, setCommitment] = useState(3);
  const prompt = prompts[step];

  const chooseTrip = (tripId: string) => {
    const nextVotes = [...votes, { prompt: prompt.id, tripId, reaction, dealbreaker, commitment }];
    setReaction(undefined);
    setDealbreaker(undefined);
    setCommitment(3);
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

      <View style={styles.cards}>
        {trips.map((trip) => (
          <TouchableOpacity key={trip.id} onPress={() => chooseTrip(trip.id)} style={styles.voteCard}>
            <ImageBackground source={{ uri: trip.heroImage }} style={styles.image} imageStyle={styles.imageRadius}>
              <View style={styles.shade} />
              <Text style={styles.cardTitle}>{trip.title}</Text>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Reaction</Text>
      <View style={styles.wrap}>
        {reactions.map((item) => (
          <Chip key={item} label={item} active={reaction === item} onPress={() => setReaction(reaction === item ? undefined : item)} />
        ))}
      </View>

      <Text style={styles.label}>Dealbreaker, if any</Text>
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
  cardTitle: { color: colors.white, fontWeight: '900', fontSize: 27, padding: 18 },
  label: { color: colors.charcoal, fontWeight: '900', fontSize: 17, marginTop: 18, marginBottom: 10 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  meter: { gap: 8 },
  meterItem: { borderRadius: 16, padding: 13, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line },
  meterActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  meterText: { color: colors.charcoal, fontWeight: '800' },
  meterTextActive: { color: colors.white },
});
