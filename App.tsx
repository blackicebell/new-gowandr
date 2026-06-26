import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { font, ThemeProvider, themes, useThemeColors } from './src/theme/colors';
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
import { PremiumBackground } from './src/components/PremiumBackground';
import { PressableScale } from './src/components/PressableScale';

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
  const theme = themes.green;
  const routeProgress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let isMounted = true;
    async function hydrate() {
      const [savedTrips, seenOnboarding] = await Promise.all([loadTrips(), loadHasSeenOnboarding()]);
      if (!isMounted) return;
      if (savedTrips?.length) setTrips(savedTrips);
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

  useEffect(() => {
    routeProgress.setValue(0);
    Animated.timing(routeProgress, {
      toValue: 1,
      duration: 140,
      useNativeDriver: true,
    }).start();
  }, [route, routeProgress]);

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
      <ExpoStatusBar style="dark" />
      <StatusBar barStyle="dark-content" />
      <View style={[styles.shell, { backgroundColor: theme.canvas }]}>
        <PremiumBackground />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setRoute({ name: 'home' })} style={[styles.logoShell, { borderColor: 'rgba(255,255,255,0.22)' }]}>
            <Image source={require('./assets/brand/gowandr-logo-full-white.png')} style={styles.logo} resizeMode="contain" />
            <LogoShimmer />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: routeProgress, transform: [{ translateY: routeProgress.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }}>
          {renderRoute()}
          </Animated.View>
        </ScrollView>
        <View style={styles.navScrim} pointerEvents="none" />
        <View style={[styles.bottomNav, { backgroundColor: 'rgba(255,255,255,0.74)', borderColor: 'rgba(255,255,255,0.42)' }]}>
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
    <PressableScale onPress={onPress} style={[styles.navItem, active && styles.navItemActive]}>
      <Text style={[styles.navText, { color: active ? '#0F1115' : 'rgba(15,17,21,0.58)', fontFamily: font.family }]}>{label}</Text>
      <View style={[styles.navIndicator, { backgroundColor: active ? theme.teal : 'transparent' }]} />
    </PressableScale>
  );
}

function LogoShimmer() {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  return <Animated.View pointerEvents="none" style={[styles.logoShimmer, { opacity: shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.03, 0.14] }) }]} />;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  shell: { flex: 1, width: '100%', maxWidth: 680, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, paddingTop: 16, paddingBottom: 16 },
  logoShell: { borderRadius: 22, paddingHorizontal: 14, paddingVertical: 9, backgroundColor: 'rgba(255,255,255,0.34)', borderWidth: 1, overflow: 'hidden', shadowColor: '#6ED8B5', shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 0 } },
  logo: { width: 128, height: 31 },
  logoShimmer: { position: 'absolute', top: 0, bottom: 0, width: 42, left: 28, backgroundColor: '#A8F0D4', transform: [{ skewX: '-18deg' }] },
  content: { flex: 1 },
  contentInner: { paddingHorizontal: 28, paddingBottom: 178 },
  navScrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 146, backgroundColor: 'rgba(238,248,244,0.58)' },
  bottomNav: { position: 'absolute', left: 16, right: 16, bottom: 18, minHeight: 72, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6, paddingHorizontal: 10, paddingVertical: 10, borderRadius: 34, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 10 },
  navItem: { flex: 1, minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 24, paddingHorizontal: 4 },
  navItemActive: { backgroundColor: 'rgba(168,240,212,0.42)' },
  navText: { fontWeight: '700', fontSize: 12, lineHeight: 14, letterSpacing: -0.1, textAlign: 'center' },
  navIndicator: { width: 24, height: 4, borderRadius: 999, marginTop: 6 },
});
