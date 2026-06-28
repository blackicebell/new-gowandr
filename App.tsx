import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Image, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useFonts, InterTight_400Regular, InterTight_500Medium, InterTight_600SemiBold, InterTight_700Bold } from '@expo-google-fonts/inter-tight';
import { font, ThemeProvider, themes, useThemeColors } from './src/theme/colors';
import { MatchupResultSummary, MatchupSession, PlanChecklistItem, TripDraft, TripIdea, VoteAnswer } from './src/types';
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
import { loadMatchupSession, submitMatchupVotes } from './src/backend/matchupSessions';
import { loadOwnedMatchupSessionIds, saveOwnedMatchupSessionIds } from './src/storage/matchupSessionStorage';
import { PremiumBackground } from './src/components/PremiumBackground';
import { PressableScale } from './src/components/PressableScale';

type Tab = 'home' | 'ideas' | 'matchup' | 'lab';
type Route =
  | { name: 'home' }
  | { name: 'echo' }
  | { name: 'newTrip' }
  | { name: 'editTrip'; tripId: string }
  | { name: 'detail'; tripId: string }
  | { name: 'addIdea'; tripId: string }
  | { name: 'editIdea'; tripId: string; ideaId: string }
  | { name: 'createMatchup' }
  | { name: 'voting'; tripIds: string[]; matchupName: string }
  | { name: 'sharedVoting'; sessionId: string }
  | { name: 'sessionResults'; sessionId: string }
  | { name: 'results'; tripIds: string[]; votes: VoteAnswer[]; matchupName: string }
  | { name: 'lab'; tripId?: string };

export default function App() {
  const [fontsLoaded] = useFonts({
    InterTight_400Regular,
    InterTight_500Medium,
    InterTight_600SemiBold,
    InterTight_700Bold,
  });
  const [route, setRoute] = useState<Route>({ name: 'home' });
  const [trips, setTrips] = useState<TripDraft[]>(demoTrips);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | undefined>();
  const [hasLoadedTrips, setHasLoadedTrips] = useState(false);
  const [momentumMessage, setMomentumMessage] = useState<string | undefined>();
  const [sharedSession, setSharedSession] = useState<MatchupSession | undefined>();
  const [sharedSessionLoading, setSharedSessionLoading] = useState(false);
  const [sharedSessionMessage, setSharedSessionMessage] = useState<string | undefined>();
  const [ownedSessionIds, setOwnedSessionIds] = useState<string[]>([]);
  const [ownedSessions, setOwnedSessions] = useState<MatchupSession[]>([]);
  const [ownedSessionsLoading, setOwnedSessionsLoading] = useState(false);
  const theme = themes.green;
  const routeProgress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let isMounted = true;
    async function hydrate() {
      const [savedTrips, seenOnboarding, savedSessionIds] = await Promise.all([loadTrips(), loadHasSeenOnboarding(), loadOwnedMatchupSessionIds()]);
      if (!isMounted) return;
      if (savedTrips?.length) setTrips(applySeedSourceLinks(savedTrips));
      setOwnedSessionIds(savedSessionIds);
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
    if (hasLoadedTrips) {
      saveOwnedMatchupSessionIds(ownedSessionIds).catch(() => undefined);
    }
  }, [hasLoadedTrips, ownedSessionIds]);

  useEffect(() => {
    if (!hasLoadedTrips || !ownedSessionIds.length) {
      setOwnedSessions([]);
      return;
    }

    let isMounted = true;
    async function loadSessions() {
      setOwnedSessionsLoading(true);
      const sessions = await Promise.all(ownedSessionIds.map((sessionId) => loadMatchupSession(sessionId)));
      if (!isMounted) return;
      setOwnedSessions(sessions.filter(Boolean) as MatchupSession[]);
      setOwnedSessionsLoading(false);
    }

    loadSessions();
    return () => {
      isMounted = false;
    };
  }, [hasLoadedTrips, ownedSessionIds]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const matchupId = getWebMatchupId();
    if (matchupId) setRoute({ name: 'sharedVoting', sessionId: matchupId });
  }, []);

  useEffect(() => {
    if (!hasLoadedTrips) return;
    const today = getTodayDateString();
    let changed = false;
    const cleanedTrips = trips.map((trip) => {
      if (trip.finalPlan && trip.planEndDate && trip.planEndDate < today) {
        changed = true;
        return { ...trip, finalPlan: false, planCompletedAt: today };
      }
      return trip;
    });
    if (changed) setTrips(cleanedTrips);
  }, [hasLoadedTrips, trips]);

  useEffect(() => {
    routeProgress.setValue(0);
    Animated.timing(routeProgress, {
      toValue: 1,
      duration: 140,
      useNativeDriver: true,
    }).start();
  }, [route, routeProgress]);

  useEffect(() => {
    if (!momentumMessage) return undefined;
    const timer = setTimeout(() => setMomentumMessage(undefined), 3200);
    return () => clearTimeout(timer);
  }, [momentumMessage]);

  const selectedTrip = useMemo(() => {
    if (route.name !== 'detail' && route.name !== 'addIdea' && route.name !== 'editTrip' && route.name !== 'editIdea') return undefined;
    return trips.find((trip) => trip.id === route.tripId);
  }, [route, trips]);

  const selectedIdea = useMemo(() => {
    if (route.name !== 'editIdea') return undefined;
    return selectedTrip?.ideas.find((idea) => idea.id === route.ideaId);
  }, [route, selectedTrip]);

  const finalPlanTrip = useMemo(() => trips.find((trip) => trip.finalPlan) ?? undefined, [trips]);

  useEffect(() => {
    if (route.name !== 'sharedVoting') return;
    let isMounted = true;
    const sessionId = route.sessionId;

    async function loadSession() {
      setSharedSessionLoading(true);
      setSharedSessionMessage(undefined);
      const session = await loadMatchupSession(sessionId);
      if (!isMounted) return;
      setSharedSession(session);
      setSharedSessionLoading(false);
      if (!session) setSharedSessionMessage('This voting link could not be found. Ask the trip owner to send a fresh link.');
    }

    loadSession();
    return () => {
      isMounted = false;
    };
  }, [route]);

  const createTrip = (trip: TripDraft) => {
    setTrips((current) => [trip, ...current]);
    setRoute({ name: 'detail', tripId: trip.id });
  };

  const updateTrip = (trip: TripDraft) => {
    setTrips((current) => current.map((item) => (item.id === trip.id ? trip : item)));
    setRoute({ name: 'detail', tripId: trip.id });
  };

  const confirmDeleteTrip = (trip: TripDraft) => {
    Alert.alert('Delete trip?', `${trip.title} and its saved ideas will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setTrips((current) => current.filter((item) => item.id !== trip.id));
          setRoute({ name: 'echo' });
        },
      },
    ]);
  };

  const addIdea = (tripId: string, idea: TripIdea) => {
    setTrips((current) =>
      current.map((trip) => (trip.id === tripId ? { ...trip, ideas: [idea, ...trip.ideas] } : trip)),
    );
    const targetTrip = trips.find((trip) => trip.id === tripId);
    if (targetTrip && targetTrip.ideas.length === 0) setMomentumMessage('Nice. This idea is taking shape.');
    setRoute({ name: 'detail', tripId });
  };

  const updateIdea = (tripId: string, idea: TripIdea) => {
    setTrips((current) =>
      current.map((trip) => (trip.id === tripId ? { ...trip, ideas: trip.ideas.map((item) => (item.id === idea.id ? idea : item)) } : trip)),
    );
    setRoute({ name: 'detail', tripId });
  };

  const confirmDeleteIdea = (tripId: string, idea: TripIdea) => {
    Alert.alert('Delete inspiration?', `${idea.title} will be removed from this trip.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setTrips((current) =>
            current.map((trip) => (trip.id === tripId ? { ...trip, ideas: trip.ideas.filter((item) => item.id !== idea.id) } : trip)),
          );
          setRoute({ name: 'detail', tripId });
        },
      },
    ]);
  };

  const moveTripToPlan = (tripId: string, result?: MatchupResultSummary) => {
    const tripTitle = trips.find((trip) => trip.id === tripId)?.title;
    setTrips((current) =>
      current.map((trip) => ({
        ...trip,
        finalPlan: trip.id === tripId,
        latestMatchupResult: trip.id === tripId && result ? result : trip.latestMatchupResult,
        planChecklist: trip.id === tripId ? trip.planChecklist ?? buildDefaultChecklist(trip) : trip.planChecklist,
      })),
    );
    if (tripTitle) setMomentumMessage(`Decision made. ${tripTitle} is your trip.`);
    setRoute({ name: 'lab', tripId });
  };

  const undoFinalPlan = (tripId: string) => {
    Alert.alert('Change committed trip?', 'This trip will go back to your trip ideas. Your checklist and dates will stay saved.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Change Trip',
        onPress: () => {
          setTrips((current) => current.map((trip) => (trip.id === tripId ? { ...trip, finalPlan: false } : trip)));
          setRoute({ name: 'lab' });
        },
      },
    ]);
  };

  const updatePlanChecklist = (tripId: string, checklist: PlanChecklistItem[]) => {
    const previous = trips.find((trip) => trip.id === tripId)?.planChecklist ?? [];
    const previousDone = previous.filter((item) => item.done).length;
    const nextDone = checklist.filter((item) => item.done).length;
    setTrips((current) => current.map((trip) => (trip.id === tripId ? { ...trip, planChecklist: checklist } : trip)));
    if (previousDone === 0 && nextDone > 0) setMomentumMessage('Good. The plan has its first real step done.');
  };

  const updatePlanDates = (tripId: string, dates: { startDate?: string; endDate?: string }) => {
    const today = getTodayDateString();
    const hasEnded = Boolean(dates.endDate && dates.endDate < today);
    setTrips((current) =>
      current.map((trip) =>
        trip.id === tripId
          ? {
              ...trip,
              planStartDate: dates.startDate,
              planEndDate: dates.endDate,
              planCompletedAt: hasEnded ? today : trip.planCompletedAt,
              finalPlan: hasEnded ? false : trip.finalPlan,
            }
          : trip,
      ),
    );
    if (hasEnded) setRoute({ name: 'lab' });
  };

  const openFastAdd = () => {
    if (trips.length) setRoute({ name: 'addIdea', tripId: trips[0].id });
    else setRoute({ name: 'newTrip' });
  };

  const rememberMatchupSession = async (sessionId: string) => {
    setOwnedSessionIds((current) => [sessionId, ...current.filter((item) => item !== sessionId)]);
    const session = await loadMatchupSession(sessionId);
    if (session) setOwnedSessions((current) => [session, ...current.filter((item) => item.id !== session.id)]);
  };

  const refreshOwnedSessions = async () => {
    if (!ownedSessionIds.length) return;
    setOwnedSessionsLoading(true);
    const sessions = await Promise.all(ownedSessionIds.map((sessionId) => loadMatchupSession(sessionId)));
    setOwnedSessions(sessions.filter(Boolean) as MatchupSession[]);
    setOwnedSessionsLoading(false);
  };

  const renderRoute = () => {
    if (route.name === 'home') {
      return <HomeScreen trips={trips} onOpenTrip={(tripId) => setRoute({ name: 'detail', tripId })} onStartDraft={() => setRoute({ name: 'newTrip' })} onStartMatchup={() => setRoute({ name: 'createMatchup' })} onAddIdea={openFastAdd} onOpenPlan={() => setRoute({ name: 'lab' })} />;
    }

    if (route.name === 'echo') {
      return <EchoScreen trips={trips} onOpenTrip={(tripId) => setRoute({ name: 'detail', tripId })} onCreateTrip={() => setRoute({ name: 'newTrip' })} onCreateMatchup={() => setRoute({ name: 'createMatchup' })} />;
    }

    if (route.name === 'newTrip') {
      return <NewTripScreen onBack={() => setRoute({ name: 'echo' })} onCreate={createTrip} />;
    }

    if (route.name === 'editTrip' && selectedTrip) {
      return <NewTripScreen initialTrip={selectedTrip} onBack={() => setRoute({ name: 'detail', tripId: selectedTrip.id })} onCreate={createTrip} onUpdate={updateTrip} onDelete={() => confirmDeleteTrip(selectedTrip)} />;
    }

    if (route.name === 'detail' && selectedTrip) {
      return <EchoDetailScreen trip={selectedTrip} onBack={() => setRoute({ name: 'echo' })} onAddIdea={() => setRoute({ name: 'addIdea', tripId: selectedTrip.id })} onEditTrip={() => setRoute({ name: 'editTrip', tripId: selectedTrip.id })} onDeleteTrip={() => confirmDeleteTrip(selectedTrip)} onEditIdea={(ideaId) => setRoute({ name: 'editIdea', tripId: selectedTrip.id, ideaId })} onDeleteIdea={(idea) => confirmDeleteIdea(selectedTrip.id, idea)} onCompare={() => setRoute({ name: 'createMatchup' })} onMoveToPlan={() => moveTripToPlan(selectedTrip.id)} />;
    }

    if (route.name === 'addIdea' && selectedTrip) {
      return <AddIdeaScreen trip={selectedTrip} onBack={() => setRoute({ name: 'detail', tripId: selectedTrip.id })} onSave={(idea) => addIdea(selectedTrip.id, idea)} />;
    }

    if (route.name === 'editIdea' && selectedTrip && selectedIdea) {
      return <AddIdeaScreen trip={selectedTrip} initialIdea={selectedIdea} onBack={() => setRoute({ name: 'detail', tripId: selectedTrip.id })} onSave={(idea) => updateIdea(selectedTrip.id, idea)} onDelete={() => confirmDeleteIdea(selectedTrip.id, selectedIdea)} />;
    }

    if (route.name === 'createMatchup') {
      return (
        <CreateMatchupScreen
          trips={trips}
          ownedSessions={ownedSessions}
          ownedSessionsLoading={ownedSessionsLoading}
          onBack={() => setRoute({ name: 'home' })}
          onStart={(tripIds, matchupName) => setRoute({ name: 'voting', tripIds, matchupName })}
          onSessionCreated={rememberMatchupSession}
          onRefreshSessions={refreshOwnedSessions}
          onOpenSessionResults={(sessionId) => setRoute({ name: 'sessionResults', sessionId })}
        />
      );
    }

    if (route.name === 'voting') {
      return <VotingScreen trips={trips.filter((trip) => route.tripIds.includes(trip.id))} matchupName={route.matchupName} onCancel={() => setRoute({ name: 'createMatchup' })} onComplete={(votes) => setRoute({ name: 'results', tripIds: route.tripIds, votes, matchupName: route.matchupName })} />;
    }

    if (route.name === 'sharedVoting') {
      if (sharedSessionLoading) return <SharedVotingStatus title="Loading voting link" body="Opening the trip comparison..." />;
      if (sharedSessionMessage || !sharedSession) return <SharedVotingStatus title="Voting link unavailable" body={sharedSessionMessage ?? 'This comparison is not available right now.'} />;
      return (
        <VotingScreen
          trips={sharedSession.trips}
          matchupName={sharedSession.matchupName}
          onCancel={() => setSharedSessionMessage('You can close this tab. Your vote was not submitted.')}
          onComplete={async (votes) => {
            const saved = await submitMatchupVotes(sharedSession.id, votes);
            setSharedSessionMessage(saved ? 'Thanks. Your vote was saved and sent back to the trip owner.' : 'Your vote could not be saved. Please try the link again.');
          }}
        />
      );
    }

    if (route.name === 'results') {
      return <ResultsScreen trips={trips.filter((trip) => route.tripIds.includes(trip.id))} votes={route.votes} matchupName={route.matchupName} onRestart={() => setRoute({ name: 'createMatchup' })} onMoveToPlan={moveTripToPlan} />;
    }

    if (route.name === 'sessionResults') {
      const session = ownedSessions.find((item) => item.id === route.sessionId);
      if (!session) return <SharedVotingStatus title="Results not loaded" body="Refresh the voting inbox and try again." />;
      return <ResultsScreen trips={session.trips} votes={session.votes.flat()} matchupName={session.matchupName} onRestart={() => setRoute({ name: 'createMatchup' })} onMoveToPlan={moveTripToPlan} />;
    }

    if (route.name === 'lab') {
      const labTrip = trips.find((trip) => trip.id === route.tripId && trip.finalPlan) ?? finalPlanTrip;
      return <TripLabScreen trip={labTrip} trips={trips} onBack={() => setRoute({ name: 'home' })} onSelectTrip={(tripId) => moveTripToPlan(tripId)} onUndoFinalPlan={undoFinalPlan} onUpdateChecklist={updatePlanChecklist} onUpdateDates={updatePlanDates} />;
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

  if (!fontsLoaded || hasSeenOnboarding === undefined) {
    return <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.canvasDeep }]} />;
  }

  if (hasSeenOnboarding === false && route.name !== 'sharedVoting') {
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
          <TouchableOpacity onPress={() => setRoute({ name: 'home' })} style={[styles.logoShell, { borderColor: 'rgba(255,255,255,0.78)' }]}>
            <Image source={require('./assets/brand/gowandr-logo-full-color.png')} style={styles.logo} resizeMode="contain" />
            <LogoShimmer />
          </TouchableOpacity>
        </View>
        {!!momentumMessage && (
          <View style={styles.momentumBanner}>
            <Text style={styles.momentumBannerText}>{momentumMessage}</Text>
          </View>
        )}
        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: routeProgress, transform: [{ translateY: routeProgress.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }}>
          {renderRoute()}
          </Animated.View>
        </ScrollView>
        <View style={[styles.bottomNav, { backgroundColor: 'rgba(255,255,255,0.88)', borderColor: 'rgba(32,38,35,0.06)' }]}>
          <NavItem label="Home" active={route.name === 'home'} onPress={() => setRoute({ name: 'home' })} />
          <NavItem label="Ideas" active={route.name === 'echo' || route.name === 'detail' || route.name === 'addIdea' || route.name === 'editIdea' || route.name === 'newTrip' || route.name === 'editTrip'} onPress={() => setRoute({ name: 'echo' })} />
          <NavItem label="Compare" active={route.name === 'createMatchup' || route.name === 'voting' || route.name === 'sharedVoting' || route.name === 'sessionResults' || route.name === 'results'} onPress={() => setRoute({ name: 'createMatchup' })} />
          <NavItem label="Plan" active={route.name === 'lab'} onPress={() => setRoute({ name: 'lab' })} />
        </View>
      </View>
    </SafeAreaView>
    </ThemeProvider>
  );
}

function buildDefaultChecklist(trip: TripDraft): PlanChecklistItem[] {
  const base = [
    { title: 'Confirm dates', category: 'Logistics' },
    { title: 'Set budget range', category: 'Logistics' },
    { title: 'Book flights or transport', category: 'Logistics' },
    { title: 'Book stay', category: 'Reservations' },
    { title: 'Save anchor reservations', category: 'Reservations' },
    { title: 'Check passport / visa needs', category: 'Documents' },
    { title: 'Check health, shots, or travel advisories', category: 'Documents' },
    { title: 'Plan airport / arrival transport', category: 'Logistics' },
    { title: 'Pack essentials', category: 'Packing' },
    {
      title: trip.companionType === 'Solo' ? 'Share plan with a trusted person' : 'Share committed plan with the people going',
      category: trip.companionType === 'Solo' ? 'Safety share' : 'Group coordination',
    },
  ];

  return base.map((item, index) => ({ id: `check-${Date.now()}-${index}`, title: item.title, done: false, category: item.category }));
}

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getWebMatchupId() {
  if (typeof window === 'undefined') return undefined;
  const params = new URLSearchParams(window.location.search);
  return params.get('matchup') ?? undefined;
}

function applySeedSourceLinks(savedTrips: TripDraft[]) {
  const demoIdeaLinks = new Map(
    demoTrips.flatMap((trip) => trip.ideas.filter((idea) => idea.link).map((idea) => [idea.id, idea.link])),
  );

  return savedTrips.map((trip) => ({
    ...trip,
    ideas: trip.ideas.map((idea) => {
      const demoLink = demoIdeaLinks.get(idea.id);
      if (!demoLink || idea.link) return idea;
      return { ...idea, link: demoLink };
    }),
  }));
}

function SharedVotingStatus({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.sharedStatus}>
      <Text style={styles.sharedStatusTitle}>{title}</Text>
      <Text style={styles.sharedStatusBody}>{body}</Text>
    </View>
  );
}

function NavItem({ label, active, onPress }: { label: Tab | string; active: boolean; onPress: () => void }) {
  const theme = useThemeColors();
  return (
    <PressableScale onPress={onPress} containerStyle={styles.navItemShell} style={[styles.navItem, active && styles.navItemActive]}>
      <Text style={[styles.navText, { color: active ? '#0F1115' : 'rgba(15,17,21,0.58)', fontFamily: font.semibold }]}>{label}</Text>
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

  return <Animated.View pointerEvents="none" style={[styles.logoShimmer, { opacity: shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.01, 0.05] }) }]} />;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  shell: { flex: 1, width: '100%', maxWidth: 680, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, paddingTop: 10, paddingBottom: 12 },
  logoShell: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.86)', borderWidth: 1, overflow: 'hidden', shadowColor: '#6ED8B5', shadowOpacity: 0.24, shadowRadius: 13, shadowOffset: { width: 0, height: 0 } },
  logo: { width: 118, height: 29 },
  logoShimmer: { position: 'absolute', top: 0, bottom: 0, width: 42, left: 28, backgroundColor: '#A8F0D4', transform: [{ skewX: '-18deg' }] },
  momentumBanner: { marginHorizontal: 28, marginBottom: 10, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 11, backgroundColor: 'rgba(168,240,212,0.64)', borderWidth: 1, borderColor: 'rgba(47,175,138,0.18)' },
  momentumBannerText: { color: '#173A33', fontFamily: font.semibold, fontWeight: '700', fontSize: 13.5, lineHeight: 18, textAlign: 'center' },
  sharedStatus: { borderRadius: 26, padding: 22, backgroundColor: 'rgba(255,255,255,0.82)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)', marginTop: 24 },
  sharedStatusTitle: { color: '#202623', fontFamily: font.heading, fontWeight: '700', fontSize: 26, lineHeight: 32, letterSpacing: -0.26 },
  sharedStatusBody: { color: 'rgba(32,38,35,0.66)', fontFamily: font.body, fontWeight: '400', fontSize: 15, lineHeight: 22, marginTop: 8 },
  content: { flex: 1 },
  contentInner: { paddingHorizontal: 28, paddingBottom: 280 },
  bottomNav: { position: 'absolute', width: '74%', maxWidth: 340, alignSelf: 'center', bottom: 10, minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 24, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.09, shadowRadius: 18, shadowOffset: { width: 0, height: 7 }, elevation: 8 },
  navItemShell: { flex: 1, alignItems: 'center' },
  navItem: { width: 62, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 16, paddingHorizontal: 4 },
  navItemActive: { backgroundColor: 'rgba(168,240,212,0.54)' },
  navText: { fontWeight: '600', fontSize: 12, lineHeight: 14, letterSpacing: 0, textAlign: 'center' },
  navIndicator: { width: 22, height: 4, borderRadius: 999, marginTop: 4 },
});
