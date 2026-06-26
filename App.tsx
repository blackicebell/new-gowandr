import React, { useMemo, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Button } from './src/components/Button';
import { colors } from './src/theme/colors';
import { TripDraft, TripIdea, VoteAnswer } from './src/types';
import { demoTrips } from './src/data/demoTrips';
import { HomeScreen } from './src/screens/HomeScreen';
import { EchoScreen } from './src/screens/EchoScreen';
import { EchoDetailScreen } from './src/screens/EchoDetailScreen';
import { AddIdeaScreen } from './src/screens/AddIdeaScreen';
import { CreateMatchupScreen } from './src/screens/CreateMatchupScreen';
import { VotingScreen } from './src/screens/VotingScreen';
import { ResultsScreen } from './src/screens/ResultsScreen';
import { TripLabScreen } from './src/screens/TripLabScreen';

type Tab = 'home' | 'echo' | 'matchup' | 'lab';
type Route =
  | { name: 'home' }
  | { name: 'echo' }
  | { name: 'detail'; tripId: string }
  | { name: 'addIdea'; tripId: string }
  | { name: 'createMatchup' }
  | { name: 'voting'; tripIds: string[]; matchupName: string }
  | { name: 'results'; tripIds: string[]; votes: VoteAnswer[]; matchupName: string }
  | { name: 'lab'; tripId?: string };

export default function App() {
  const [route, setRoute] = useState<Route>({ name: 'home' });
  const [trips, setTrips] = useState<TripDraft[]>(demoTrips);

  const selectedTrip = useMemo(() => {
    if (route.name !== 'detail' && route.name !== 'addIdea') return undefined;
    return trips.find((trip) => trip.id === route.tripId);
  }, [route, trips]);

  const addIdea = (tripId: string, idea: TripIdea) => {
    setTrips((current) =>
      current.map((trip) => (trip.id === tripId ? { ...trip, ideas: [idea, ...trip.ideas] } : trip)),
    );
    setRoute({ name: 'detail', tripId });
  };

  const renderRoute = () => {
    if (route.name === 'home') {
      return <HomeScreen trips={trips} onOpenTrip={(tripId) => setRoute({ name: 'detail', tripId })} onStartDraft={() => setRoute({ name: 'echo' })} onStartMatchup={() => setRoute({ name: 'createMatchup' })} onTryDemo={() => setRoute({ name: 'voting', tripIds: ['miami', 'new-orleans', 'jamaica'], matchupName: 'Weekend Escape' })} />;
    }

    if (route.name === 'echo') {
      return <EchoScreen trips={trips} onOpenTrip={(tripId) => setRoute({ name: 'detail', tripId })} onCreateMatchup={() => setRoute({ name: 'createMatchup' })} />;
    }

    if (route.name === 'detail' && selectedTrip) {
      return <EchoDetailScreen trip={selectedTrip} onBack={() => setRoute({ name: 'echo' })} onAddIdea={() => setRoute({ name: 'addIdea', tripId: selectedTrip.id })} onCompare={() => setRoute({ name: 'createMatchup' })} onOpenLab={() => setRoute({ name: 'lab', tripId: selectedTrip.id })} />;
    }

    if (route.name === 'addIdea' && selectedTrip) {
      return <AddIdeaScreen trip={selectedTrip} onBack={() => setRoute({ name: 'detail', tripId: selectedTrip.id })} onSave={(idea) => addIdea(selectedTrip.id, idea)} />;
    }

    if (route.name === 'createMatchup') {
      return <CreateMatchupScreen trips={trips} onBack={() => setRoute({ name: 'home' })} onStart={(tripIds, matchupName) => setRoute({ name: 'voting', tripIds, matchupName })} />;
    }

    if (route.name === 'voting') {
      return <VotingScreen trips={trips.filter((trip) => route.tripIds.includes(trip.id))} matchupName={route.matchupName} onCancel={() => setRoute({ name: 'createMatchup' })} onComplete={(votes) => setRoute({ name: 'results', tripIds: route.tripIds, votes, matchupName: route.matchupName })} />;
    }

    if (route.name === 'results') {
      return <ResultsScreen trips={trips.filter((trip) => route.tripIds.includes(trip.id))} votes={route.votes} matchupName={route.matchupName} onRestart={() => setRoute({ name: 'createMatchup' })} onOpenLab={(tripId) => setRoute({ name: 'lab', tripId })} />;
    }

    if (route.name === 'lab') {
      const labTrip = trips.find((trip) => trip.id === route.tripId) ?? trips[0];
      return <TripLabScreen trip={labTrip} onBack={() => setRoute({ name: 'home' })} />;
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="dark" />
      <StatusBar barStyle="dark-content" />
      <View style={styles.shell}>
        <View style={styles.header}>
          <Image source={require('./assets/brand/gowandr-logo-full-color.png')} style={styles.logo} resizeMode="contain" />
          <TouchableOpacity style={styles.profilePill} onPress={() => setRoute({ name: 'home' })}>
            <Text style={styles.profileText}>Demo</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
          {renderRoute()}
        </ScrollView>
        <View style={styles.bottomNav}>
          <NavItem label="Home" active={route.name === 'home'} onPress={() => setRoute({ name: 'home' })} />
          <NavItem label="Echo" active={route.name === 'echo' || route.name === 'detail' || route.name === 'addIdea'} onPress={() => setRoute({ name: 'echo' })} />
          <NavItem label="Matchup" active={route.name === 'createMatchup' || route.name === 'voting' || route.name === 'results'} onPress={() => setRoute({ name: 'createMatchup' })} />
          <NavItem label="Lab" active={route.name === 'lab'} onPress={() => setRoute({ name: 'lab' })} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function NavItem({ label, active, onPress }: { label: Tab | string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.navItem, active && styles.navItemActive]}>
      <Text style={[styles.navText, active && styles.navTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.canvas },
  shell: { flex: 1, width: '100%', maxWidth: 680, alignSelf: 'center', backgroundColor: colors.canvas },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10 },
  logo: { width: 142, height: 34 },
  profilePill: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: colors.cloud },
  profileText: { color: colors.charcoal, fontWeight: '700', fontSize: 12 },
  content: { flex: 1 },
  contentInner: { paddingHorizontal: 20, paddingBottom: 112 },
  bottomNav: { position: 'absolute', left: 16, right: 16, bottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 8, borderRadius: 28, backgroundColor: colors.charcoal, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 20 },
  navItemActive: { backgroundColor: colors.teal },
  navText: { color: colors.mist, fontWeight: '700', fontSize: 12 },
  navTextActive: { color: colors.white },
});
