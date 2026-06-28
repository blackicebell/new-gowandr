import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, ImageBackground, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button } from '../components/Button';
import { getMomentumStages, getNextBestStep } from '../logic/momentum';
import { paceGuidance } from '../logic/tripPace';
import { colors, font } from '../theme/colors';
import { PlanChecklistItem, TripDraft } from '../types';
import { shareTripPlan } from '../utils/shareCards';

type ChecklistGroup = {
  title: string;
  helper: string;
  items: PlanChecklistItem[];
};

type ChecklistStatus = 'empty' | 'active' | 'complete';

export function TripLabScreen({
  trip,
  trips,
  onBack,
  onSelectTrip,
  onUndoFinalPlan,
  onUpdateChecklist,
  onUpdateDates,
}: {
  trip?: TripDraft;
  trips: TripDraft[];
  onBack: () => void;
  onSelectTrip: (tripId: string) => void;
  onUndoFinalPlan: (tripId: string) => void;
  onUpdateChecklist: (tripId: string, checklist: PlanChecklistItem[]) => void;
  onUpdateDates: (tripId: string, dates: { startDate?: string; endDate?: string }) => void;
}) {
  const [openGroups, setOpenGroups] = useState<string[]>(['Logistics']);

  if (!trip) {
    return <PlanEmptyState trips={trips} onBack={onBack} onSelectTrip={onSelectTrip} />;
  }

  const checklist = trip.planChecklist?.length ? trip.planChecklist : buildFallbackChecklist(trip);
  const guidance = paceGuidance[trip.pace];
  const topIdeas = trip.ideas.filter((idea) => idea.priority === 'Must-do').slice(0, guidance.idealMustDos);
  const backupIdeas = trip.ideas.filter((idea) => idea.priority !== 'Must-do').slice(0, 3);
  const doneCount = checklist.filter((item) => item.done).length;
  const progress = checklist.length ? Math.round((doneCount / checklist.length) * 100) : 0;
  const checklistGroups = buildChecklistGroups(checklist, trip.companionType);
  const nextItem = checklist.find((item) => !item.done);
  const focus = getNextBestStep({ ...trip, planChecklist: checklist });
  const timeline = getMomentumStages({ ...trip, planChecklist: checklist });
  const whyReasons = buildWhyReasons(trip, topIdeas);
  const readinessMessage = getReadinessMessage(progress);
  const dateSummary = getDateSummary(trip.planStartDate, trip.planEndDate);

  const updateChecklist = (items: PlanChecklistItem[]) => onUpdateChecklist(trip.id, items);

  const toggleTask = (taskId: string) => {
    updateChecklist(checklist.map((item) => (item.id === taskId ? { ...item, done: !item.done } : item)));
  };

  const deleteTask = (taskId: string) => {
    updateChecklist(checklist.filter((item) => item.id !== taskId));
  };

  const addTaskToGroup = (category: string, title: string) => {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    updateChecklist([...checklist, { id: `custom-${Date.now()}`, title: cleanTitle, done: false, category }]);
  };

  const toggleGroup = (title: string) => {
    setOpenGroups((current) => (current.includes(title) ? current.filter((item) => item !== title) : [...current, title]));
  };

  const completeNextTask = () => {
    if (focus.intent === 'checklist' && nextItem) toggleTask(nextItem.id);
  };

  return (
    <View>
      <Text style={styles.back} onPress={onBack}>Back home</Text>
      <Text style={styles.kicker}>Your next trip</Text>
      <Text style={styles.title}>{trip.title}</Text>
      <Text style={styles.body}>You chose it. Now GoWandr keeps the next step clear so the trip keeps moving.</Text>

      <ImageBackground source={{ uri: trip.heroImage }} style={styles.hero} imageStyle={styles.heroImage}>
        <View style={styles.shade} />
        <View style={styles.committedBadge}>
          <Text style={styles.committedBadgeText}>Committed</Text>
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.heroLabel}>You're going to</Text>
          <Text style={styles.heroTitle}>{trip.title}</Text>
          <Text style={styles.heroBody}>{dateSummary} / {trip.companionType} / {trip.pace} pace</Text>
        </View>
      </ImageBackground>

      <MomentumTimeline stages={timeline} />

      <View style={styles.whyCard}>
        <Text style={styles.whyKicker}>Why this trip?</Text>
        <Text style={styles.whyHelper}>{trip.companionType === 'Solo' ? 'Remind yourself why this trip is worth doing.' : 'Remind everyone why this trip won.'}</Text>
        {whyReasons.map((reason) => (
          <View key={reason} style={styles.whyRow}>
            <Text style={styles.whyCheck}>OK</Text>
            <Text style={styles.whyText}>{reason}</Text>
          </View>
        ))}
      </View>

      <View style={styles.todayCard}>
        <View style={styles.readinessHeader}>
          <View style={styles.readinessCopy}>
            <Text style={styles.readinessKicker}>Today's Focus</Text>
            <Text style={styles.readinessTitle}>{focus.title}</Text>
            <Text style={styles.todayReason}>{focus.reason}</Text>
            <Text style={styles.todayTime}>{focus.effort}</Text>
          </View>
          <TouchableOpacity onPress={completeNextTask} style={styles.todayButton}>
            <Text style={styles.todayButtonText}>{focus.intent === 'dates' ? 'Set below' : focus.cta}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.readinessBody}>{doneCount} of {checklist.length} complete. {readinessMessage}</Text>
      </View>

      {trip.latestMatchupResult && (
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>{trip.latestMatchupResult.matchupName} decision</Text>
          <Text style={styles.resultTitle}>{trip.latestMatchupResult.groupMatch}% decision confidence</Text>
          <Text style={styles.resultBody}>{trip.latestMatchupResult.summary}</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Trip anchors</Text>
      <Text style={styles.sectionHelper}>Pick the highlights that make this trip feel worth committing to.</Text>
      <View style={styles.ideaList}>
        {topIdeas.map((idea, index) => (
          <View key={idea.id} style={styles.ideaRow}>
            <Text style={styles.ideaNumber}>{index + 1}</Text>
            <View style={styles.ideaCopy}>
              <Text style={styles.ideaTitle}>{idea.title}</Text>
              <Text style={styles.ideaReason}>This is one of the reasons this trip is worth taking.</Text>
              <Text style={styles.ideaMeta}>{idea.category}</Text>
            </View>
          </View>
        ))}
        {!topIdeas.length && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Choose a few highlights</Text>
            <Text style={styles.emptyBody}>Mark the ideas that would make this trip feel worth it. The plan gets clearer once there are a few anchors.</Text>
          </View>
        )}
      </View>
      {!!backupIdeas.length && (
        <View style={styles.backupStrip}>
          <Text style={styles.backupLabel}>Backup ideas</Text>
          <Text style={styles.backupText}>{backupIdeas.map((idea) => idea.title).join(' / ')}</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Make-it-happen checklist</Text>
      <Text style={styles.sectionHelper}>Open a category when you are ready to handle it.</Text>
      <View style={styles.checklist}>
        {checklistGroups.map((group) => (
          <ChecklistAccordion
            key={group.title}
            group={group}
            open={openGroups.includes(group.title)}
            onToggle={() => toggleGroup(group.title)}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onAddTask={addTaskToGroup}
          />
        ))}
      </View>

      <Text style={styles.sectionTitle}>Trip dates</Text>
      <View style={styles.dateCard}>
        <View style={styles.dateHeader}>
          <View style={styles.dateHeaderCopy}>
            <Text style={styles.dateKicker}>Dates</Text>
            <Text style={styles.dateTitle}>{dateSummary}</Text>
          </View>
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>Leaves Plan after trip</Text>
          </View>
        </View>
        <View style={styles.dateFields}>
          <DateField label="Start" value={trip.planStartDate ?? ''} onChange={(startDate) => onUpdateDates(trip.id, { startDate, endDate: trip.planEndDate })} />
          <DateField label="End" value={trip.planEndDate ?? ''} onChange={(endDate) => onUpdateDates(trip.id, { startDate: trip.planStartDate, endDate })} />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Share Plan</Text>
      <View style={styles.shareCard}>
        <ImageBackground source={{ uri: trip.heroImage }} style={styles.sharePreview} imageStyle={styles.sharePreviewImage}>
          <View style={styles.shareShade} />
          <Text style={styles.sharePreviewLabel}>GoWandr committed trip</Text>
          <Text style={styles.sharePreviewTitle}>{trip.title}</Text>
          <Text style={styles.sharePreviewMeta}>{topIdeas.length || trip.tags.length} anchors / Plan in progress</Text>
        </ImageBackground>
        <Text style={styles.shareTitle}>{trip.companionType === 'Solo' ? 'Share with someone trusted' : 'Share with the group'}</Text>
        <Text style={styles.shareBody}>{trip.companionType === 'Solo' ? 'Send the plan so someone knows the direction, rough dates, and main ideas.' : 'Send the committed plan and checklist so everyone knows what is decided and what still needs doing.'}</Text>
      </View>
      <View style={styles.shareActionWrap}>
        <Button label={trip.companionType === 'Solo' ? 'Share with someone trusted' : 'Share with the group'} onPress={() => shareTripPlan(trip, trip.pace, topIdeas)} />
      </View>

      <Text style={styles.sectionTitle}>Helpful reminders</Text>
      <View style={styles.moduleGrid}>
        <PlanModule label="Timeline" title="Before / during" body="Keep prep separate from the actual trip flow." />
        <PlanModule label="Budget" title="Range first" body="Agree on a comfortable range before booking anything." />
        <PlanModule label="Reservations" title="Track holds" body="Flights, stays, restaurants, and anchor activities." />
        <PlanModule label="Safety" title="Manual check" body="Save emergency contacts and key document notes." />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onUndoFinalPlan(trip.id)} style={styles.reconsiderLink}>
          <Text style={styles.reconsiderText}>Need to reconsider this trip?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.dateField}>
        <Text style={styles.dateFieldLabel}>{label}</Text>
        {React.createElement('input', {
          type: 'date',
          value,
          onChange: (event: { target: { value: string } }) => onChange(event.target.value),
          style: webDateInputStyle,
          'aria-label': `${label} trip date`,
        })}
      </View>
    );
  }

  return (
    <View style={styles.dateField}>
      <Text style={styles.dateFieldLabel}>{label}</Text>
      <TextInput value={value} onChangeText={onChange} placeholder="YYYY-MM-DD" placeholderTextColor="rgba(32,38,35,0.46)" style={styles.nativeDateInput} />
    </View>
  );
}

function PlanModule({ label, title, body }: { label: string; title: string; body: string }) {
  return (
    <View style={styles.moduleCard}>
      <Text style={styles.moduleLabel}>{label}</Text>
      <Text style={styles.moduleTitle}>{title}</Text>
      <Text style={styles.moduleBody}>{body}</Text>
    </View>
  );
}

function MomentumTimeline({ stages }: { stages: ReturnType<typeof getMomentumStages> }) {
  return (
    <View style={styles.timelineCard}>
      <Text style={styles.timelineKicker}>Trip momentum</Text>
      <View style={styles.timelineRow}>
        {stages.map((stage, index) => (
          <View key={stage.label} style={styles.timelineStep}>
            <View style={[styles.timelineDot, stage.complete && styles.timelineDotDone, stage.current && styles.timelineDotCurrent]}>
              <Text style={[styles.timelineDotText, (stage.complete || stage.current) && styles.timelineDotTextActive]}>{stage.complete ? '✓' : stage.current ? '→' : ''}</Text>
            </View>
            {index < stages.length - 1 && <View style={[styles.timelineLine, stages[index + 1].complete && styles.timelineLineDone]} />}
            <Text style={[styles.timelineLabel, stage.current && styles.timelineLabelCurrent]}>{stage.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ChecklistAccordion({
  group,
  open,
  onToggle,
  onToggleTask,
  onDeleteTask,
  onAddTask,
}: {
  group: ChecklistGroup;
  open: boolean;
  onToggle: () => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (category: string, title: string) => void;
}) {
  const [newTask, setNewTask] = useState('');
  const animation = useRef(new Animated.Value(open ? 1 : 0)).current;
  const doneCount = group.items.filter((item) => item.done).length;
  const totalCount = group.items.length;
  const progress = totalCount ? doneCount / totalCount : 0;
  const status = getChecklistStatus(doneCount, totalCount);
  const meta = getChecklistGroupMeta(group.title);
  const nextItem = group.items.find((item) => !item.done);

  useEffect(() => {
    Animated.timing(animation, {
      toValue: open ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [animation, open]);

  const addTask = () => {
    const title = newTask.trim();
    if (!title) return;
    onAddTask(group.title, title);
    setNewTask('');
  };

  return (
    <Animated.View style={[styles.checkGroup, open && styles.checkGroupOpen, status === 'active' && styles.checkGroupActive, status === 'complete' && styles.checkGroupComplete]}>
      <TouchableOpacity onPress={onToggle} activeOpacity={0.78} style={styles.checkGroupHeader}>
        <View style={[styles.checkIcon, status === 'active' && styles.checkIconActive, status === 'complete' && styles.checkIconComplete]}>
          <Text style={[styles.checkIconText, status === 'complete' && styles.checkIconTextComplete]}>{meta.icon}</Text>
        </View>
        <View style={styles.checkGroupTitleWrap}>
          <Text style={styles.checkGroupTitle}>{group.title}</Text>
          <Text style={styles.checkGroupHint}>{meta.preview}</Text>
          {!!nextItem && <Text style={styles.checkGroupNext}>Next: {nextItem.title}</Text>}
        </View>
        <View style={styles.checkGroupRight}>
          <Text style={[styles.checkGroupStatus, status === 'complete' && styles.checkGroupStatusComplete]}>
            {status === 'complete' ? '✓ Complete' : `${doneCount} of ${totalCount} complete`}
          </Text>
          <Animated.Text
            style={[
              styles.checkChevron,
              status === 'complete' && styles.checkChevronComplete,
              {
                transform: [
                  {
                    rotate: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '180deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            v
          </Animated.Text>
        </View>
      </TouchableOpacity>

      <View style={styles.miniProgressTrack}>
        <View style={[styles.miniProgressFill, status === 'complete' && styles.miniProgressFillComplete, { width: `${Math.round(progress * 100)}%` }]} />
      </View>

      <Animated.View
        style={{
          maxHeight: animation.interpolate({ inputRange: [0, 1], outputRange: [0, 720] }),
          opacity: animation,
          overflow: 'hidden',
        }}
      >
        <View style={styles.taskList}>
          {group.items.map((item) => (
            <View key={item.id} style={styles.taskRow}>
              <TouchableOpacity onPress={() => onToggleTask(item.id)} style={[styles.checkBox, item.done && styles.checkBoxDone]}>
                <Text style={styles.checkText}>{item.done ? 'OK' : ''}</Text>
              </TouchableOpacity>
              <Text style={[styles.taskTitle, item.done && styles.taskTitleDone]}>{item.title}</Text>
              <TouchableOpacity onPress={() => onDeleteTask(item.id)} style={styles.taskDelete}>
                <Text style={styles.taskDeleteText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
          <View style={styles.groupAddRow}>
            <TextInput value={newTask} onChangeText={setNewTask} placeholder={`Add to ${group.title.toLowerCase()}`} placeholderTextColor="rgba(32,38,35,0.48)" style={styles.taskInput} />
            <TouchableOpacity onPress={addTask} style={styles.addTaskButton}>
              <Text style={styles.addTaskText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

function PlanEmptyState({ trips, onBack, onSelectTrip }: { trips: TripDraft[]; onBack: () => void; onSelectTrip: (tripId: string) => void }) {
  const candidates = useMemo(() => trips.slice(0, 6), [trips]);

  return (
    <View>
      <Text style={styles.back} onPress={onBack}>Back home</Text>
      <Text style={styles.kicker}>Plan</Text>
      <Text style={styles.title}>No final trip yet</Text>
      <Text style={styles.body}>Commit to one trip when it feels like the one to make happen. You can change it later.</Text>

      <View style={styles.emptyHero}>
        <Text style={styles.emptyHeroTitle}>How Plan starts</Text>
        <Text style={styles.emptyHeroBody}>Compare a few trip ideas, then commit to one. Or choose a draft yourself and start preparing.</Text>
      </View>

      <Text style={styles.sectionTitle}>Choose a trip to plan</Text>
      <View style={styles.candidateList}>
        {candidates.map((item) => (
          <TouchableOpacity key={item.id} onPress={() => onSelectTrip(item.id)} style={styles.candidateRow}>
            <ImageBackground source={{ uri: item.heroImage }} style={styles.candidateThumb} imageStyle={styles.candidateThumbImage} />
            <View style={styles.candidateCopy}>
              <Text style={styles.candidateTitle}>{item.title}</Text>
              <Text style={styles.candidateMeta}>{item.pace} pace / {item.companionType}</Text>
            </View>
            <View style={styles.candidateActionPill}>
              <Text style={styles.candidateActionText}>Plan</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function buildFallbackChecklist(trip: TripDraft): PlanChecklistItem[] {
  const items = [
    { title: 'Confirm dates', category: 'Logistics' },
    { title: 'Set budget range', category: 'Logistics' },
    { title: 'Book flights or transport', category: 'Logistics' },
    { title: 'Book stay', category: 'Reservations' },
    { title: 'Save anchor reservations', category: 'Reservations' },
    { title: 'Plan arrival transport', category: 'Logistics' },
    { title: 'Check passport / visa needs', category: 'Documents' },
    { title: 'Check health, shots, or travel advisories', category: 'Documents' },
    { title: 'Pack essentials', category: 'Packing' },
    {
      title: trip.companionType === 'Solo' ? 'Share plan with a trusted person' : 'Share committed plan with the people going',
      category: trip.companionType === 'Solo' ? 'Safety share' : 'Group coordination',
    },
  ];

  return items.map((item, index) => ({ id: `fallback-${index}`, title: item.title, done: false, category: item.category }));
}

function buildChecklistGroups(checklist: PlanChecklistItem[], companionType: TripDraft['companionType']): ChecklistGroup[] {
  const groups: ChecklistGroup[] = [
    { title: 'Logistics', helper: 'Dates, transport, stay, and arrival basics.', items: [] },
    { title: 'Reservations', helper: 'Anything that needs a confirmed spot.', items: [] },
    { title: 'Documents', helper: 'Passport, visa, health, and safety prep.', items: [] },
    { title: 'Packing', helper: 'The stuff future-you will thank you for.', items: [] },
    { title: companionType === 'Solo' ? 'Safety share' : 'Group coordination', helper: companionType === 'Solo' ? 'Keep someone trusted in the loop.' : 'Make sure the group knows what is decided.', items: [] },
  ];

  checklist.forEach((item) => {
    const assignedIndex = groups.findIndex((group) => group.title.toLowerCase() === item.category?.toLowerCase());
    if (assignedIndex >= 0) {
      groups[assignedIndex].items.push(item);
      return;
    }

    const title = item.title.toLowerCase();
    let groupIndex = 0;
    if (title.includes('reservation') || title.includes('restaurant') || title.includes('activity') || title.includes('book stay') || title.includes('hotel') || title.includes('lodging')) groupIndex = 1;
    if (title.includes('passport') || title.includes('visa') || title.includes('health') || title.includes('shot') || title.includes('advisories') || title.includes('safety')) groupIndex = 2;
    if (title.includes('pack')) groupIndex = 3;
    if (title.includes('share') || title.includes('group') || title.includes('trusted') || title.includes('member')) groupIndex = 4;
    groups[groupIndex].items.push(item);
  });

  return groups.filter((group) => group.items.length);
}

function getChecklistStatus(doneCount: number, totalCount: number): ChecklistStatus {
  if (totalCount > 0 && doneCount === totalCount) return 'complete';
  if (doneCount > 0) return 'active';
  return 'empty';
}

function getChecklistGroupMeta(title: string) {
  const normalized = title.toLowerCase();
  if (normalized.includes('reservation')) return { icon: 'ST', preview: 'Hotel, flights, restaurants' };
  if (normalized.includes('document')) return { icon: 'ID', preview: 'Passport, visa, insurance' };
  if (normalized.includes('packing')) return { icon: 'BP', preview: 'Clothing and essentials' };
  if (normalized.includes('group')) return { icon: 'PP', preview: 'Confirm attendees and share plans' };
  if (normalized.includes('safety')) return { icon: 'SH', preview: 'Share plans with someone trusted' };
  return { icon: 'PL', preview: 'Dates, transport, and arrival basics' };
}

function buildWhyReasons(trip: TripDraft, topIdeas: TripDraft['ideas']) {
  const reasons: string[] = [];
  if (trip.latestMatchupResult?.summary) reasons.push(trip.latestMatchupResult.summary);
  topIdeas.slice(0, 2).forEach((idea) => {
    reasons.push(`${idea.title} is one of the anchors.`);
  });
  if (trip.tags.length) reasons.push(`${capitalize(trip.tags[0])} is the mood you chose.`);
  if (trip.pace) reasons.push(`${trip.pace} pace fits how this trip should feel.`);
  return reasons.slice(0, 4);
}

function buildSuggestedTasks(trip: TripDraft, checklist: PlanChecklistItem[]) {
  const existing = new Set(checklist.map((item) => item.title.toLowerCase()));
  const suggestions = [
    trip.companionType === 'Solo' ? 'Send stay details to a trusted person' : 'Assign one person to lodging research',
    trip.companionType === 'Solo' ? 'Save local emergency numbers' : 'Confirm who is actually in',
    'Check weather before packing',
    'Save confirmation numbers in one place',
    'List non-negotiable budget limits',
    trip.pace === 'Packed' ? 'Mark one flexible recovery block' : 'Pick one anchor reservation',
  ];

  return suggestions.filter((task) => !existing.has(task.toLowerCase())).slice(0, 4);
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getReadinessMessage(progress: number) {
  if (progress >= 80) return 'This is feeling real. Keep the plan lightweight and confirm the last details.';
  if (progress >= 45) return 'You have momentum. Knock out the next practical step before adding more ideas.';
  return 'Start with the basics: dates, budget, transport, stay, and the first anchor.';
}

function getDateSummary(startDate?: string, endDate?: string) {
  if (startDate && endDate) return `${formatDate(startDate)} to ${formatDate(endDate)}`;
  if (startDate) return `Starts ${formatDate(startDate)}`;
  if (endDate) return `Ends ${formatDate(endDate)}`;
  return 'Dates not set yet';
}

function formatDate(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return dateString;
  return new Date(year, month - 1, day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const webDateInputStyle = {
  width: '100%',
  minHeight: 46,
  border: '0',
  outline: 'none',
  backgroundColor: 'transparent',
  color: '#202623',
  fontSize: 15,
  fontFamily: 'InterTight_500Medium',
} as const;

const styles = StyleSheet.create({
  back: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '600', paddingVertical: 10 },
  kicker: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '600', textTransform: 'uppercase', fontSize: 12 },
  title: { color: colors.charcoal, fontFamily: font.heading, fontWeight: '700', fontSize: 36, lineHeight: 43, marginTop: 4, letterSpacing: -0.36 },
  body: { color: colors.muted, fontFamily: font.body, fontWeight: '400', fontSize: 16, lineHeight: 23, marginTop: 8, marginBottom: 18 },
  hero: { minHeight: 250, borderRadius: 28, overflow: 'hidden', justifyContent: 'flex-end', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.13, shadowRadius: 22, shadowOffset: { width: 0, height: 8 }, elevation: 5 },
  heroImage: { borderRadius: 28 },
  shade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.36)' },
  heroCopy: { padding: 20, paddingRight: 96 },
  heroLabel: { color: '#A8F0D4', fontFamily: font.semibold, fontWeight: '600', textTransform: 'uppercase', fontSize: 11 },
  heroTitle: { color: colors.white, fontFamily: font.heading, fontWeight: '700', fontSize: 31, lineHeight: 36, marginTop: 6, letterSpacing: -0.31 },
  heroBody: { color: 'rgba(255,255,255,0.88)', fontFamily: font.body, fontSize: 14, marginTop: 6 },
  committedBadge: { position: 'absolute', right: 16, top: 16, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8, backgroundColor: 'rgba(168,240,212,0.88)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.42)' },
  committedBadgeText: { color: '#173A33', fontFamily: font.semibold, fontWeight: '700', fontSize: 12 },
  readinessRing: { position: 'absolute', right: 16, top: 16, width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(168,240,212,0.86)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.42)' },
  readinessValue: { color: '#173A33', fontFamily: font.heading, fontWeight: '700', fontSize: 18 },
  readinessLabel: { color: 'rgba(23,58,51,0.72)', fontFamily: font.semibold, fontWeight: '600', fontSize: 10, marginTop: -2 },
  dateCard: { borderRadius: 24, padding: 16, backgroundColor: 'rgba(255,255,255,0.82)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.08)', shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 3, marginBottom: 12 },
  dateHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  dateHeaderCopy: { flex: 1 },
  dateKicker: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '600', fontSize: 11, textTransform: 'uppercase' },
  dateTitle: { color: colors.charcoal, fontFamily: font.heading, fontWeight: '700', fontSize: 19, lineHeight: 24, marginTop: 4 },
  dateBadge: { maxWidth: 126, borderRadius: 16, backgroundColor: 'rgba(168,240,212,0.44)', borderWidth: 1, borderColor: 'rgba(47,175,138,0.18)', paddingHorizontal: 10, paddingVertical: 8 },
  dateBadgeText: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '600', fontSize: 11, lineHeight: 14, textAlign: 'center' },
  dateFields: { flexDirection: 'row', gap: 10 },
  dateField: { flex: 1, minHeight: 74, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.76)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.08)', paddingHorizontal: 13, paddingTop: 9, justifyContent: 'center' },
  dateFieldLabel: { color: colors.muted, fontFamily: font.semibold, fontWeight: '600', fontSize: 11, marginBottom: 2 },
  nativeDateInput: { minHeight: 46, color: colors.charcoal, fontFamily: font.body, fontSize: 15, paddingVertical: 0 },
  dateHelper: { color: colors.muted, fontFamily: font.body, fontSize: 13, lineHeight: 18, marginTop: 11 },
  whyCard: { borderRadius: 24, padding: 18, backgroundColor: 'rgba(255,255,255,0.82)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.08)', shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 3, gap: 10, marginBottom: 12 },
  whyKicker: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '700', fontSize: 11, textTransform: 'uppercase' },
  whyHelper: { color: colors.muted, fontFamily: font.body, fontSize: 13.5, lineHeight: 19, marginTop: -4 },
  whyRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  whyCheck: { width: 24, height: 24, borderRadius: 12, lineHeight: 24, textAlign: 'center', overflow: 'hidden', backgroundColor: '#A8F0D4', color: '#173A33', fontFamily: font.semibold, fontWeight: '700', fontSize: 9 },
  whyText: { flex: 1, color: colors.charcoal, fontFamily: font.body, fontSize: 14.5, lineHeight: 20 },
  timelineCard: { borderRadius: 24, padding: 17, backgroundColor: 'rgba(255,255,255,0.82)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 3, marginBottom: 12 },
  timelineKicker: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '700', fontSize: 11, textTransform: 'uppercase', marginBottom: 13 },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start' },
  timelineStep: { flex: 1, alignItems: 'center', minHeight: 58 },
  timelineDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(32,38,35,0.06)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.08)', zIndex: 2 },
  timelineDotDone: { backgroundColor: '#2FAF8A', borderColor: '#2FAF8A' },
  timelineDotCurrent: { backgroundColor: 'rgba(168,240,212,0.78)', borderColor: 'rgba(47,175,138,0.28)' },
  timelineDotText: { color: 'rgba(32,38,35,0.4)', fontFamily: font.semibold, fontWeight: '700', fontSize: 12 },
  timelineDotTextActive: { color: '#173A33' },
  timelineLine: { position: 'absolute', top: 14, left: '50%', right: '-50%', height: 2, backgroundColor: 'rgba(32,38,35,0.08)', zIndex: 1 },
  timelineLineDone: { backgroundColor: 'rgba(47,175,138,0.38)' },
  timelineLabel: { color: 'rgba(32,38,35,0.48)', fontFamily: font.semibold, fontWeight: '600', fontSize: 10.5, marginTop: 8, textAlign: 'center' },
  timelineLabelCurrent: { color: colors.tealDark },
  todayCard: { borderRadius: 26, padding: 20, backgroundColor: 'rgba(255,255,255,0.9)', borderWidth: 1, borderColor: 'rgba(47,175,138,0.16)', shadowColor: '#2FAF8A', shadowOpacity: 0.12, shadowRadius: 22, shadowOffset: { width: 0, height: 8 }, elevation: 5, marginBottom: 12 },
  readinessCard: { borderRadius: 24, padding: 18, backgroundColor: 'rgba(255,255,255,0.82)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.08)', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: 7 }, elevation: 4, marginBottom: 12 },
  readinessHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  readinessCopy: { flex: 1 },
  readinessKicker: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '600', fontSize: 11, textTransform: 'uppercase' },
  readinessTitle: { color: colors.charcoal, fontFamily: font.heading, fontWeight: '700', fontSize: 20, lineHeight: 24, marginTop: 4 },
  readinessPercent: { color: colors.tealDark, fontFamily: font.heading, fontWeight: '700', fontSize: 26 },
  readinessBody: { color: colors.muted, fontFamily: font.body, fontSize: 14, lineHeight: 20, marginTop: 12 },
  todayReason: { color: colors.muted, fontFamily: font.body, fontSize: 14, lineHeight: 20, marginTop: 7 },
  todayTime: { color: colors.muted, fontFamily: font.body, fontSize: 13, lineHeight: 18, marginTop: 6 },
  todayButton: { minHeight: 44, borderRadius: 16, paddingHorizontal: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#A8F0D4', borderWidth: 1, borderColor: 'rgba(47,175,138,0.18)' },
  todayButtonText: { color: '#173A33', fontFamily: font.semibold, fontWeight: '700', fontSize: 13 },
  nextStepPill: { marginTop: 13, borderRadius: 18, backgroundColor: 'rgba(168,240,212,0.44)', borderWidth: 1, borderColor: 'rgba(47,175,138,0.24)', padding: 12, gap: 3 },
  nextStepLabel: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '600', fontSize: 11, textTransform: 'uppercase' },
  nextStepText: { color: colors.charcoal, fontFamily: font.semibold, fontWeight: '600', fontSize: 14 },
  resultCard: { borderRadius: 22, padding: 16, backgroundColor: 'rgba(255,255,255,0.78)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)', marginBottom: 4 },
  resultLabel: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '600', fontSize: 11, textTransform: 'uppercase' },
  resultTitle: { color: colors.charcoal, fontFamily: font.heading, fontWeight: '700', fontSize: 20, marginTop: 5 },
  resultBody: { color: colors.muted, fontFamily: font.body, fontSize: 14, lineHeight: 20, marginTop: 6 },
  sectionTitle: { color: colors.charcoal, fontFamily: font.heading, fontWeight: '700', fontSize: 21, marginTop: 20, marginBottom: 9, letterSpacing: -0.2 },
  sectionHelper: { color: colors.muted, fontFamily: font.body, fontWeight: '400', fontSize: 14, lineHeight: 20, marginTop: -4, marginBottom: 10 },
  ideaList: { gap: 10 },
  ideaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 20, backgroundColor: colors.paper, padding: 14, borderWidth: 1, borderColor: colors.line },
  ideaNumber: { width: 34, height: 34, borderRadius: 17, textAlign: 'center', textAlignVertical: 'center', lineHeight: 34, backgroundColor: colors.teal, color: colors.white, fontFamily: font.semibold, fontWeight: '600' },
  ideaCopy: { flex: 1 },
  ideaTitle: { color: colors.charcoal, fontFamily: font.heading, fontWeight: '700', fontSize: 16 },
  ideaReason: { color: colors.muted, fontFamily: font.body, fontSize: 13.5, lineHeight: 18, marginTop: 3 },
  ideaMeta: { color: colors.muted, fontFamily: font.semibold, fontWeight: '600', marginTop: 2 },
  emptyState: { borderRadius: 20, backgroundColor: colors.paper, padding: 16, borderWidth: 1, borderColor: colors.line },
  emptyTitle: { color: colors.charcoal, fontFamily: font.heading, fontWeight: '700', fontSize: 16 },
  emptyBody: { color: colors.muted, fontFamily: font.body, fontWeight: '400', fontSize: 14, lineHeight: 20, marginTop: 5 },
  backupStrip: { marginTop: 10, borderRadius: 18, padding: 13, backgroundColor: 'rgba(255,255,255,0.64)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)' },
  backupLabel: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '600', fontSize: 11, textTransform: 'uppercase' },
  backupText: { color: colors.muted, fontFamily: font.body, fontSize: 13.5, lineHeight: 19, marginTop: 4 },
  paceNote: { backgroundColor: colors.cloud, borderRadius: 20, padding: 14, marginTop: 14, borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)' },
  paceNoteTitle: { color: colors.charcoal, fontFamily: font.heading, fontWeight: '700', fontSize: 15 },
  paceNoteBody: { color: colors.muted, fontFamily: font.body, fontWeight: '400', fontSize: 14, lineHeight: 20, marginTop: 5 },
  progressTrack: { height: 8, borderRadius: 999, backgroundColor: 'rgba(32,38,35,0.08)', overflow: 'hidden', marginTop: 14 },
  progressFill: { height: 8, borderRadius: 999, backgroundColor: '#2FAF8A' },
  checklist: { gap: 12 },
  checkGroup: { borderRadius: 24, padding: 18, backgroundColor: 'rgba(255,255,255,0.78)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.08)', gap: 13 },
  checkGroupOpen: { backgroundColor: 'rgba(255,255,255,0.9)', shadowColor: '#173A33', shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 5 },
  checkGroupActive: { borderColor: 'rgba(47,175,138,0.24)' },
  checkGroupComplete: { borderColor: 'rgba(35,151,110,0.34)', backgroundColor: 'rgba(240,255,249,0.92)' },
  checkGroupHeader: { minHeight: 66, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, borderRadius: 18 },
  checkIcon: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(32,38,35,0.06)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.08)' },
  checkIconActive: { backgroundColor: 'rgba(168,240,212,0.5)', borderColor: 'rgba(47,175,138,0.18)' },
  checkIconComplete: { backgroundColor: '#2FAF8A', borderColor: '#2FAF8A' },
  checkIconText: { color: 'rgba(32,38,35,0.62)', fontFamily: font.semibold, fontWeight: '700', fontSize: 11, letterSpacing: 0.2 },
  checkIconTextComplete: { color: colors.white },
  checkGroupTitleWrap: { flex: 1 },
  checkGroupTitle: { color: colors.charcoal, fontFamily: font.heading, fontWeight: '700', fontSize: 17 },
  checkGroupHint: { color: 'rgba(32,38,35,0.52)', fontFamily: font.body, fontSize: 13, lineHeight: 18, marginTop: 4 },
  checkGroupNext: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '600', fontSize: 12, lineHeight: 17, marginTop: 3 },
  checkGroupRight: { alignItems: 'flex-end', gap: 7 },
  checkGroupCount: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '600', fontSize: 12 },
  checkGroupStatus: { color: 'rgba(32,38,35,0.52)', fontFamily: font.semibold, fontWeight: '600', fontSize: 11 },
  checkGroupStatusComplete: { color: '#23976E' },
  checkChevron: { width: 30, height: 30, borderRadius: 15, lineHeight: 29, textAlign: 'center', overflow: 'hidden', color: colors.tealDark, fontFamily: font.semibold, fontWeight: '700', fontSize: 13, backgroundColor: 'rgba(168,240,212,0.38)', borderWidth: 1, borderColor: 'rgba(47,175,138,0.14)' },
  checkChevronComplete: { backgroundColor: 'rgba(47,175,138,0.18)', borderColor: 'rgba(47,175,138,0.24)' },
  miniProgressTrack: { height: 4, borderRadius: 999, backgroundColor: 'rgba(32,38,35,0.08)', overflow: 'hidden' },
  miniProgressFill: { height: 4, borderRadius: 999, backgroundColor: '#A8F0D4' },
  miniProgressFillComplete: { backgroundColor: '#2FAF8A' },
  taskList: { gap: 9, paddingTop: 3 },
  checkGroupHelper: { color: colors.muted, fontFamily: font.body, fontSize: 13, lineHeight: 19, marginBottom: 2 },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 54, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.74)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)', paddingHorizontal: 12, paddingVertical: 8 },
  checkBox: { width: 30, height: 30, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(32,38,35,0.16)', backgroundColor: 'rgba(255,255,255,0.68)' },
  checkBoxDone: { backgroundColor: '#2FAF8A', borderColor: '#2FAF8A' },
  checkText: { color: colors.white, fontFamily: font.semibold, fontSize: 10, fontWeight: '600' },
  taskTitle: { flex: 1, color: colors.charcoal, fontFamily: font.body, fontSize: 14.5, lineHeight: 20 },
  taskTitleDone: { color: 'rgba(32,38,35,0.46)', textDecorationLine: 'line-through' },
  taskDelete: { minHeight: 34, justifyContent: 'center', paddingHorizontal: 6 },
  taskDeleteText: { color: 'rgba(184,74,63,0.82)', fontFamily: font.semibold, fontSize: 12, fontWeight: '600' },
  groupAddRow: { flexDirection: 'row', gap: 9, paddingTop: 3 },
  addTaskRow: { flexDirection: 'row', gap: 9, marginTop: 10 },
  taskInput: { flex: 1, minHeight: 50, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(32,38,35,0.08)', backgroundColor: 'rgba(255,255,255,0.76)', color: colors.charcoal, fontFamily: font.body, paddingHorizontal: 14, fontSize: 14 },
  addTaskButton: { minWidth: 72, minHeight: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#A8F0D4' },
  addTaskText: { color: '#173A33', fontFamily: font.semibold, fontWeight: '600' },
  suggestionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  suggestionCard: { width: '48%', minHeight: 86, borderRadius: 20, padding: 13, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)' },
  suggestionPlus: { width: 28, height: 28, borderRadius: 14, lineHeight: 28, textAlign: 'center', backgroundColor: '#A8F0D4', color: '#173A33', fontFamily: font.semibold, fontWeight: '700', marginBottom: 8 },
  suggestionText: { color: colors.charcoal, fontFamily: font.semibold, fontWeight: '600', fontSize: 13.5, lineHeight: 18 },
  moduleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  moduleCard: { width: '48%', minHeight: 128, borderRadius: 22, padding: 14, backgroundColor: 'rgba(255,255,255,0.75)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)' },
  moduleLabel: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '600', fontSize: 11, textTransform: 'uppercase' },
  moduleTitle: { color: colors.charcoal, fontFamily: font.heading, fontWeight: '700', fontSize: 17, marginTop: 8 },
  moduleBody: { color: colors.muted, fontFamily: font.body, fontSize: 13.5, lineHeight: 19, marginTop: 6 },
  shareCard: { borderRadius: 26, padding: 16, backgroundColor: '#14231F', marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.13, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 5 },
  sharePreview: { minHeight: 176, justifyContent: 'flex-end', borderRadius: 22, overflow: 'hidden', padding: 16, marginBottom: 16 },
  sharePreviewImage: { borderRadius: 20 },
  shareShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.36)' },
  sharePreviewLabel: { color: '#A8F0D4', fontFamily: font.semibold, fontWeight: '600', fontSize: 11, textTransform: 'uppercase' },
  sharePreviewTitle: { color: colors.white, fontFamily: font.heading, fontWeight: '700', fontSize: 25, lineHeight: 30, marginTop: 6 },
  sharePreviewMeta: { color: 'rgba(255,255,255,0.84)', fontFamily: font.body, fontSize: 13.5, marginTop: 4 },
  shareTitle: { color: colors.white, fontFamily: font.heading, fontWeight: '700', fontSize: 18 },
  shareBody: { color: 'rgba(248,248,246,0.74)', fontFamily: font.body, fontSize: 14, lineHeight: 20, marginTop: 6 },
  shareActionWrap: { marginBottom: 22 },
  actions: { gap: 10, marginTop: 8 },
  reconsiderLink: { minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  reconsiderText: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '600', fontSize: 14 },
  emptyHero: { borderRadius: 24, padding: 18, backgroundColor: 'rgba(255,255,255,0.78)', borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)', marginBottom: 4 },
  emptyHeroTitle: { color: colors.charcoal, fontFamily: font.heading, fontWeight: '700', fontSize: 20 },
  emptyHeroBody: { color: colors.muted, fontFamily: font.body, fontSize: 14.5, lineHeight: 21, marginTop: 8 },
  candidateList: { gap: 10 },
  candidateRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.78)', paddingVertical: 10, paddingLeft: 10, paddingRight: 14, borderWidth: 1, borderColor: 'rgba(32,38,35,0.07)' },
  candidateThumb: { width: 64, height: 64, borderRadius: 16, overflow: 'hidden' },
  candidateThumbImage: { borderRadius: 16 },
  candidateCopy: { flex: 1 },
  candidateTitle: { color: colors.charcoal, fontFamily: font.heading, fontWeight: '700', fontSize: 16 },
  candidateMeta: { color: colors.muted, fontFamily: font.semibold, fontWeight: '600', fontSize: 12, marginTop: 3 },
  candidateActionPill: { minHeight: 38, minWidth: 58, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(168,240,212,0.48)', borderWidth: 1, borderColor: 'rgba(47,175,138,0.2)', paddingHorizontal: 14 },
  candidateActionText: { color: colors.tealDark, fontFamily: font.semibold, fontWeight: '600', fontSize: 13 },
});
