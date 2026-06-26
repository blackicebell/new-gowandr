import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
import { PremiumBackground } from './src/components/PremiumBackground';

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
        <PremiumBackground />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setRoute({ name: 'home' })} style={[styles.logoShell, { borderColor: 'rgba(255,255,255,0.18)' }]}>
            <Image source={require('./assets/brand/gowandr-logo-full-white.png')} style={styles.logo} resizeMode="contain" />
            <LogoShimmer />
          </TouchableOpacity>
          <ThemePicker activeTheme={themeName} onChange={changeTheme} />
        </View>
        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
          {renderRoute()}
        </ScrollView>
        <View style={[styles.bottomNav, { backgroundColor: 'rgba(20,20,20,0.35)', borderColor: 'rgba(255,255,255,0.18)' }]}>
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
    <TouchableOpacity onPress={onPress} style={styles.navItem}>
      <Text style={[styles.navText, { color: active ? theme.charcoal : theme.muted, fontFamily: font.family }]}>{label}</Text>
      <View style={[styles.navIndicator, { backgroundColor: active ? theme.teal : 'transparent' }]} />
    </TouchableOpacity>
  );
}

function ThemePicker({ activeTheme, onChange }: { activeTheme: ThemeName; onChange: (themeName: ThemeName) => void }) {
  return (
    <View style={styles.themePicker}>
      {(['green', 'pink', 'blue'] as ThemeName[]).map((name) => {
        const theme = themes[name];
        return (
          <TouchableOpacity key={name} onPress={() => onChange(name)} style={styles.themeDotOuter}>
            <LinearGradient colors={[theme.teal, theme.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.themeDotRing, activeTheme === name && styles.themeDotRingActive]}>
              <View style={[styles.themeDot, { backgroundColor: theme.canvasDeep }]}>
                <Text style={[styles.themeDotText, { color: theme.charcoal, fontFamily: font.family }]}>{name.charAt(0).toUpperCase()}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        );
      })}
    </View>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 14, paddingBottom: 14 },
  logoShell: { borderRadius: 22, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, overflow: 'hidden' },
  logo: { width: 142, height: 34 },
  logoShimmer: { position: 'absolute', top: 0, bottom: 0, width: 42, left: 28, backgroundColor: '#FFFFFF', transform: [{ skewX: '-18deg' }] },
  themePicker: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  themeDotOuter: { shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  themeDotRing: { width: 32, height: 32, borderRadius: 16, padding: 2 },
  themeDotRingActive: { padding: 3 },
  themeDot: { flex: 1, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  themeDotText: { fontSize: 11, fontWeight: '900' },
  content: { flex: 1 },
  contentInner: { paddingHorizontal: 24, paddingBottom: 124 },
  bottomNav: { position: 'absolute', left: 18, right: 18, bottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingTop: 9, paddingBottom: 7, borderRadius: 30, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.28, shadowRadius: 22, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 20 },
  navText: { fontWeight: '900', fontSize: 12, letterSpacing: 0 },
  navIndicator: { width: 24, height: 4, borderRadius: 999, marginTop: 6 },
});
