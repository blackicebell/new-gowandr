import React, { useEffect, useMemo, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { font, ThemeName, ThemeProvider, themes, useThemeColors } from './src/theme/colors';
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
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { NewTripScreen } from './src/screens/NewTripScreen';
import { loadTrips, saveTrips } from './src/storage/tripsStorage';
import { loadHasSeenOnboarding, saveHasSeenOnboarding } from './src/storage/onboardingStorage';
import { loadThemeName, saveThemeName } from './src/storage/themeStorage';

type Tab = 'home' | 'ideas' | 'matchup' | 'lab';
type Route =
  | { name: 'home' }
  | { name: 'echo' }
  | { name: 'newTrip' }
  | { name: 'detail'; tripId: string }
  | { name: 'addIdea'; tripId: string }
  | { name: 'createMatchup' }
  | { name: 'voting'; tripIds: string[]; matchupName: string }
  | { name: 'results'; tripIds: string[]; votes: VoteAnswer[]; matchupName: string }
  | { name: 'lab'; tripId?: string };

export default function App() {
  const [route, setRoute] = useState<Route>({ name: 'home' });
  const [trips, setTrips] = useState<TripDraft[]>(demoTrips);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | undefined>();
  const [hasLoadedTrips, setHasLoadedTrips] = useState(false);
  const [themeName, setThemeName] = useState<ThemeName>('green');
  const theme = themes[themeName];

  useEffect(() => {
    let isMounted = true;
    async function hydrate() {
      const [savedTrips, seenOnboarding, savedThemeName] = await Promise.all([loadTrips(), loadHasSeenOnboarding(), loadThemeName()]);
      if (!isMounted) return;
      if (savedTrips?.length) setTrips(savedTrips);
      setThemeName(savedThemeName);
      setHasSeenOnboarding(seenOnboarding);
      setHasLoadedTrips(true);
    }
    hydrate();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (hasLoadedTrips) {
      saveTrips(trips).catch(() => undefined);
    }
  }, [hasLoadedTrips, trips]);

  const selectedTrip = useMemo(() => {
    if (route.name !== 'detail' && route.name !== 'addIdea') return undefined;
    return trips.find((trip) => trip.id === route.tripId);
  }, [route, trips]);

  const createTrip = (trip: TripDraft) => {
    setTrips((current) => [trip, ...current]);
    setRoute({ name: 'detail', tripId: trip.id });
  };

  const addIdea = (tripId: string, idea: TripIdea) => {
    setTrips((current) =>
      current.map((trip) => (trip.id === tripId ? { ...trip, ideas: [idea, ...trip.ideas] } : trip)),
    );
    setRoute({ name: 'detail', tripId });
  };

  const openFastAdd = () => {
    if (trips.length) setRoute({ name: 'addIdea', tripId: trips[0].id });
    else setRoute({ name: 'newTrip' });
  };

  const renderRoute = () => {
    if (route.name === 'home') {
      return <HomeScreen trips={trips} onOpenTrip={(tripId) => setRoute({ name: 'detail', tripId })} onStartDraft={() => setRoute({ name: 'newTrip' })} onStartMatchup={() => setRoute({ name: 'createMatchup' })} onAddIdea={openFastAdd} onTryDemo={() => setRoute({ name: 'voting', tripIds: ['miami', 'new-orleans', 'jamaica'], matchupName: 'Weekend Escape' })} />;
    }

    if (route.name === 'echo') {
      return <EchoScreen trips={trips} onOpenTrip={(tripId) => setRoute({ name: 'detail', tripId })} onCreateTrip={() => setRoute({ name: 'newTrip' })} onCreateMatchup={() => setRoute({ name: 'createMatchup' })} />;
    }

    if (route.name === 'newTrip') {
      return <NewTripScreen onBack={() => setRoute({ name: 'echo' })} onCreate={createTrip} />;
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

  const finishOnboarding = async () => {
    setHasSeenOnboarding(true);
    await saveHasSeenOnboarding();
    setRoute({ name: 'newTrip' });
  };

  const tryDemoFromOnboarding = async () => {
    setHasSeenOnboarding(true);
    await saveHasSeenOnboarding();
    setRoute({ name: 'voting', tripIds: ['miami', 'new-orleans', 'jamaica'], matchupName: 'Weekend Escape' });
  };

  const changeTheme = (nextTheme: ThemeName) => {
    setThemeName(nextTheme);
    saveThemeName(nextTheme).catch(() => undefined);
  };

  if (hasSeenOnboarding === undefined) {
    return <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.canvasDeep }]} />;
  }

  if (hasSeenOnboarding === false) {
    return (
      <ThemeProvider value={theme}>
        <OnboardingScreen onFinish={finishOnboarding} onTryDemo={tryDemoFromOnboarding} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={theme}>
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.canvasDeep }]}>
      <ExpoStatusBar style="light" />
      <StatusBar barStyle="light-content" />
      <View style={[styles.shell, { backgroundColor: theme.canvas }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setRoute({ name: 'home' })}>
            <Image source={require('./assets/brand/gowandr-logo-full-white.png')} style={styles.logo} resizeMode="contain" />
          </TouchableOpacity>
          <ThemePicker activeTheme={themeName} onChange={changeTheme} />
        </View>
        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
          {renderRoute()}
        </ScrollView>
        <View style={[styles.bottomNav, { backgroundColor: theme.paper, borderColor: theme.line }]}>
          <NavItem label="Home" active={route.name === 'home'} onPress={() => setRoute({ name: 'home' })} />
          <NavItem label="Ideas" active={route.name === 'echo' || route.name === 'detail' || route.name === 'addIdea' || route.name === 'newTrip'} onPress={() => setRoute({ name: 'echo' })} />
          <NavItem label="Matchup" active={route.name === 'createMatchup' || route.name === 'voting' || route.name === 'results'} onPress={() => setRoute({ name: 'createMatchup' })} />
          <NavItem label="Lab" active={route.name === 'lab'} onPress={() => setRoute({ name: 'lab' })} />
        </View>
      </View>
    </SafeAreaView>
    </ThemeProvider>
  );
}

function NavItem({ label, active, onPress }: { label: Tab | string; active: boolean; onPress: () => void }) {
  const theme = useThemeColors();
  return (
    <TouchableOpacity onPress={onPress} style={[styles.navItem, active && { backgroundColor: theme.teal }]}>
      <Text style={[styles.navText, { color: active ? theme.canvasDeep : theme.muted, fontFamily: font.family }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function ThemePicker({ activeTheme, onChange }: { activeTheme: ThemeName; onChange: (themeName: ThemeName) => void }) {
  return (
    <View style={styles.themePicker}>
      {(['green', 'pink', 'blue'] as ThemeName[]).map((name) => {
        const theme = themes[name];
        return (
          <TouchableOpacity key={name} onPress={() => onChange(name)} style={[styles.themeDot, { backgroundColor: theme.teal, borderColor: activeTheme === name ? theme.white : 'transparent' }]}>
            <Text style={[styles.themeDotText, { fontFamily: font.family }]}>{name.charAt(0).toUpperCase()}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  shell: { flex: 1, width: '100%', maxWidth: 680, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10 },
  logo: { width: 142, height: 34 },
  themePicker: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 5, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)' },
  themeDot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  themeDotText: { color: '#06110D', fontSize: 11, fontWeight: '900' },
  content: { flex: 1 },
  contentInner: { paddingHorizontal: 20, paddingBottom: 112 },
  bottomNav: { position: 'absolute', left: 16, right: 16, bottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 8, borderRadius: 28, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.28, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 20 },
  navText: { fontWeight: '900', fontSize: 12, letterSpacing: 0 },
});
