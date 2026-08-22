import React, { useState, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useResultEntries } from '@/components/results/useResultEntries';
import { CarouselView } from '@/components/results/CarouselView';
import { type, space } from '@/components/results/theme';

export default function ResultsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { byInterest, ratedCount, isComplete, total } = useResultEntries();

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

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      {isComplete ? (
        <CarouselView key={`carousel-${visit}`} entries={byInterest} onSelect={(e) => router.push({ pathname: "/card/[id]", params: { id: String(e.card.id) } })} />
      ) : (
        <LockedState
          rated={ratedCount}
          total={total}
          onContinue={() => router.navigate('/')}
        />
      )}
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
