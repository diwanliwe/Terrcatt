import React from 'react';
import { StyleSheet, View, Text, Image, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useResultEntries } from '@/components/results/useResultEntries';
import {
  AGREEMENT_META,
  GROUND_TRUTH_EXPLANATIONS,
  scoreToColor,
  formatScore,
  scoreLabel,
  gapLabel,
} from '@/components/results/resultsData';
import { type, space, ink, muted, surface } from '@/components/results/theme';

const MAX_WIDTH = 560;

/**
 * Card detail: the user's perspective next to the study's, then what the
 * study observed. A full page (not a sheet) so it has room to grow once the
 * per-card content (definition, photo context, visuals) comes in.
 */
export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { byInterest, isComplete } = useResultEntries();

  const index = byInterest.findIndex((e) => e.card.id === Number(id));
  const entry = index >= 0 ? byInterest[index] : null;

  const goBack = () => (router.canGoBack() ? router.back() : router.navigate('/results'));

  // Deep link before completion or to an unknown card: don't leak the study's view.
  if (!entry || !isComplete) {
    return (
      <View style={[styles.page, { paddingTop: insets.top + 10 }]}>
        <BackRow onPress={goBack} />
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            {entry ? 'Terminez de noter les cartes pour voir le détail.' : 'Carte introuvable.'}
          </Text>
        </View>
      </View>
    );
  }

  const { card, userScore, gtScore, gap, agreement } = entry;
  const meta = AGREEMENT_META[agreement];
  const explanation = GROUND_TRUTH_EXPLANATIONS[card.id] ?? 'Aucune explication disponible.';
  const contentWidth = Math.min(width, MAX_WIDTH);
  const prev = index > 0 ? byInterest[index - 1] : null;
  const next = index < byInterest.length - 1 ? byInterest[index + 1] : null;
  const goTo = (cardId: number) => router.replace({ pathname: "/card/[id]", params: { id: String(cardId) } });

  return (
    <View style={[styles.page, { paddingTop: insets.top + 10 }]}>
      <BackRow onPress={goBack} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: contentWidth, alignSelf: 'center', gap: space.md }}>
          <Image
            source={card.image}
            style={[styles.hero, { height: contentWidth * 0.72, borderColor: meta.color }]}
            resizeMode="cover"
          />

          <View style={styles.heading}>
            <Text style={styles.title}>{card.name}</Text>
            <View style={[styles.badge, { backgroundColor: meta.color + '1F' }]}>
              <View style={[styles.badgeDot, { backgroundColor: meta.color }]} />
              <Text style={[styles.badgeText, { color: meta.color }]}>
                {meta.label} · {gapLabel(gap)}
              </Text>
            </View>
            <Text style={styles.lead}>{meta.description}</Text>
          </View>

          <View style={styles.scores}>
            <ScoreColumn label="Votre regard" score={userScore} />
            <View style={styles.divider} />
            <ScoreColumn label="Regard de l'étude" score={gtScore} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ce que l'étude a observé</Text>
            <Text style={styles.body}>{explanation}</Text>
          </View>

          <View style={styles.pager}>
            <PagerButton
              label={prev ? prev.card.name : ''}
              direction="prev"
              onPress={prev ? () => goTo(prev.card.id) : undefined}
            />
            <Text style={styles.pagerCount}>{index + 1} / {byInterest.length}</Text>
            <PagerButton
              label={next ? next.card.name : ''}
              direction="next"
              onPress={next ? () => goTo(next.card.id) : undefined}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function BackRow({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.backRow}>
      <Pressable onPress={onPress} hitSlop={8} style={({ pressed }) => [styles.back, pressed && { opacity: 0.6 }]}>
        <FontAwesome name="chevron-left" size={14} color={ink} />
        <Text style={styles.backText}>Résultats</Text>
      </Pressable>
    </View>
  );
}

function ScoreColumn({ label, score }: { label: string; score: number | undefined }) {
  const color = scoreToColor(score);
  return (
    <View style={styles.scoreCol}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <View style={[styles.scorePill, { backgroundColor: color }]}>
        <Text style={styles.scoreValue}>{formatScore(score)}</Text>
      </View>
      <Text style={styles.scoreName}>{scoreLabel(score)}</Text>
    </View>
  );
}

function PagerButton({ label, direction, onPress }: { label: string; direction: 'prev' | 'next'; onPress?: () => void }) {
  const isPrev = direction === 'prev';
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.pagerBtn, isPrev ? styles.pagerPrev : styles.pagerNext, !onPress && { opacity: 0 }, pressed && { opacity: 0.6 }]}
    >
      {isPrev && <FontAwesome name="chevron-left" size={12} color={muted} />}
      <Text style={styles.pagerLabel} numberOfLines={1}>{label}</Text>
      {!isPrev && <FontAwesome name="chevron-right" size={12} color={muted} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FDFCFA' },
  backRow: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', paddingHorizontal: space.sm, paddingBottom: space.xs },
  back: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingVertical: 6 },
  backText: { ...type.bodyStrong },
  content: { paddingHorizontal: space.sm },

  hero: { width: '100%', borderRadius: 16, borderWidth: 4, backgroundColor: '#000' },

  heading: { alignItems: 'center', gap: space.xs },
  title: { ...type.title, textAlign: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  badgeDot: { width: 8, height: 8, borderRadius: 4 },
  badgeText: { ...type.bodyStrong },
  lead: { ...type.body, textAlign: 'center' },

  scores: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: surface,
    borderRadius: 16,
    paddingVertical: space.sm,
    borderWidth: 1,
    borderColor: '#EFE8E0',
  },
  scoreCol: { flex: 1, alignItems: 'center', gap: 6 },
  scoreLabel: { ...type.caption, textTransform: 'uppercase', letterSpacing: 0.5 },
  scorePill: { minWidth: 64, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 18, alignItems: 'center' },
  scoreValue: { fontSize: 24, lineHeight: 30, fontWeight: '700', color: surface },
  scoreName: { ...type.bodyStrong },
  divider: { width: 1, height: 64, backgroundColor: '#EFE8E0' },

  section: { gap: space.xs },
  sectionTitle: { ...type.bodyStrong, fontSize: 17 },
  body: { ...type.body, color: ink },

  pager: { flexDirection: 'row', alignItems: 'center', gap: space.xs, marginTop: space.xs },
  pagerBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8 },
  pagerPrev: { justifyContent: 'flex-start' },
  pagerNext: { justifyContent: 'flex-end' },
  pagerLabel: { ...type.caption, flexShrink: 1 },
  pagerCount: { ...type.caption },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.lg },
  emptyText: { ...type.body, textAlign: 'center' },
});
