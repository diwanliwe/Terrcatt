import React, { useMemo, useState, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useCards, CARDS } from '@/context/CardContext';
import {
  buildEntries,
  sortByInterest,
  normalizeCompareScores,
  ResultEntry,
} from '@/components/results/resultsData';
import { GroundTruthModal } from '@/components/results/GroundTruthModal';
import { CarouselView } from '@/components/results/CarouselView';
import { type, space } from '@/components/results/theme';

export default function ResultsScreen() {
  const { state, setComment } = useCards();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { gameMode } = state;

  const [selected, setSelected] = useState<ResultEntry | null>(null);

  // Replay the entrance choreography when the user comes back to this tab.
  // Skip the initial mount (the first render already animates) and ignore
  // re-focus within a few seconds: remounting an element while its entering
  // animation is still running crashes Reanimated's web cleanup.
  const [visit, setVisit] = useState(0);
  const lastVisitAt = useRef(0);
  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      if (lastVisitAt.current === 0) { lastVisitAt.current = now; return; }
      if (now - lastVisitAt.current < 4000) return;
      lastVisitAt.current = now;
      setVisit((v) => v + 1);
    }, []),
  );

  const rawScores =
    gameMode === 'swipe' ? state.swipeScores :
    gameMode === 'compare' ? state.compareScores :
    state.ratingScores;

  const scores = useMemo(
    () => (gameMode === 'compare' ? normalizeCompareScores(rawScores) : rawScores),
    [rawScores, gameMode],
  );

  // Terrain truth is only revealed once every card has been rated,
  // so that seeing the reference can't bias the remaining answers.
  const ratedCount = Object.keys(scores).length;
  const isComplete =
    gameMode === 'rate' ? state.currentRatingIndex >= CARDS.length : ratedCount >= CARDS.length;

  const entries = useMemo(() => buildEntries(scores, state.comments), [scores, state.comments]);
  const byInterest = useMemo(() => sortByInterest(entries), [entries]);

  // Keep the open modal in sync if a comment is saved while it's open
  const selectedEntry = selected ? entries.find((e) => e.card.id === selected.card.id) ?? null : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      {isComplete ? (
        <CarouselView key={`carousel-${visit}`} entries={byInterest} onSelect={setSelected} />
      ) : (
        <LockedState
          rated={ratedCount}
          total={CARDS.length}
          onContinue={() => router.navigate('/')}
        />
      )}

      <GroundTruthModal
        visible={selectedEntry !== null}
        entry={selectedEntry}
        comment={selectedEntry?.comment}
        onComment={(c) => { if (selectedEntry) setComment(selectedEntry.card.id, c); }}
        onClose={() => setSelected(null)}
      />
    </View>
  );
}

// --- Pre-completion state ---

function LockedState({ rated, total, onContinue }: { rated: number; total: number; onContinue: () => void }) {
  const progress = total === 0 ? 0 : rated / total;
  return (
    <View style={styles.locked}>
      <FontAwesome name="lock" size={36} color="#D8C4B0" />
      <Text style={styles.lockedTitle}>
        {rated === 0 ? 'Aucune carte notée' : `${rated} carte${rated > 1 ? 's' : ''} sur ${total} notée${rated > 1 ? 's' : ''}`}
      </Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>
      <Text style={styles.lockedText}>
        Terminez de noter les {total} cartes pour comparer votre regard avec celui de l'étude.
      </Text>
      <Pressable style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]} onPress={onContinue}>
        <Text style={styles.ctaText}>{rated === 0 ? 'Commencer' : 'Continuer à noter'}</Text>
        <FontAwesome name="arrow-right" size={14} color="#fff" />
      </Pressable>
    </View>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFCFA' },
  locked: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
    gap: space.sm,
    maxWidth: 420,
    alignSelf: 'center',
  },
  lockedTitle: { ...type.title, textAlign: 'center' },
  progressTrack: { width: '100%', height: 8, borderRadius: 4, backgroundColor: '#EFE8E0', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#C4956A', borderRadius: 4 },
  lockedText: { ...type.body, textAlign: 'center' },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#C4956A',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 6,
  },
  ctaPressed: { opacity: 0.8 },
  ctaText: { ...type.bodyStrong, color: '#fff' },
});
