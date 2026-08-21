import React, { useState, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, useWindowDimensions, LayoutChangeEvent } from 'react-native';
import { ResultEntry, AGREEMENT_ORDER, AGREEMENT_META } from './resultsData';
import { ResultCard } from './ResultCard';
import { Headline, TapHint } from './SummaryHeader';
import { type, space, accent } from './theme';
import { Reveal, TIMING } from './Reveal';

interface GroupsViewProps {
  entries: ResultEntry[];
  onSelect: (entry: ResultEntry) => void;
}

const GAP = space.sm;
const MIN_CARD = 200; // wide enough for "Vous / L'étude" chips side by side
const MAX_CONTENT = 1100;

/** Cards grouped by perspective, different ones first; grid reflows with width. */
export function GroupsView({ entries, onSelect }: GroupsViewProps) {
  const { width, height } = useWindowDimensions();
  const contentWidth = Math.min(width, MAX_CONTENT) - space.sm * 2;
  const columns = Math.max(1, Math.floor((contentWidth + GAP) / (MIN_CARD + GAP)));
  const cardWidth = Math.min((contentWidth - GAP * (columns - 1)) / columns, 300);

  // Scroll-triggered reveal: a card animates in the first time it enters the viewport.
  const [scrollY, setScrollY] = useState(0);
  const viewportBottom = scrollY + height;
  const sectionY = useRef<Record<string, number>>({});
  const [, bump] = useState(0);
  const onSectionLayout = useCallback((key: string) => (e: LayoutChangeEvent) => {
    sectionY.current[key] = e.nativeEvent.layout.y;
    bump((n) => n + 1);
  }, []);

  let globalIndex = 0;

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      scrollEventThrottle={50}
      onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
    >
      <View style={styles.top}>
        <Reveal kind="down" delay={TIMING.title}><Headline entries={entries} /></Reveal>
        <Reveal kind="down" delay={TIMING.hint}><TapHint /></Reveal>
      </View>
      <View style={[styles.inner, { width: contentWidth }]}>
        {AGREEMENT_ORDER.map((agreement) => {
          const group = entries.filter((e) => e.agreement === agreement);
          if (group.length === 0) return null;
          const meta = AGREEMENT_META[agreement];
          const headerIndex = globalIndex;
          return (
            <View key={agreement} style={styles.section} onLayout={onSectionLayout(agreement)}>
              <Reveal kind="up" delay={TIMING.cards + Math.min(headerIndex, 6) * TIMING.cardStagger}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionDot, { backgroundColor: meta.color }]} />
                  <Text style={styles.sectionTitle}>{meta.plural}</Text>
                  <Text style={styles.sectionCount}>{group.length}</Text>
                </View>
              </Reveal>
              <View style={styles.grid}>
                {group.map((entry, i) => {
                  const index = globalIndex++;
                  const row = Math.floor(i / columns);
                  return (
                    <LazyCard
                      key={entry.card.id}
                      approxTop={(sectionY.current[agreement] ?? 0) + 40 + row * (cardWidth * 0.78 + 120)}
                      viewportBottom={viewportBottom}
                      initialDelay={TIMING.cards + Math.min(index, 8) * TIMING.cardStagger}
                      width={cardWidth}
                    >
                      <ResultCard entry={entry} width={cardWidth} onPress={() => onSelect(entry)} />
                    </LazyCard>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

interface LazyCardProps {
  approxTop: number;      // estimated y of the card within the scroll content
  viewportBottom: number; // scrollY + window height
  initialDelay: number;   // stagger used if visible on first paint
  width: number;
  children: React.ReactNode;
}

/** Holds an empty slot until the card scrolls into view, then plays its entrance once. */
function LazyCard({ approxTop, viewportBottom, initialDelay, width, children }: LazyCardProps) {
  const visible = approxTop < viewportBottom - 40;
  const [revealed, setRevealed] = useState(false);
  // Cards on screen at load stagger in with the page; cards scrolled into view later come in at once.
  const delayRef = useRef(initialDelay);
  useEffect(() => {
    const t = setTimeout(() => { delayRef.current = 0; }, 400);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (visible && !revealed) setRevealed(true);
  }, [visible, revealed]);
  const delay = delayRef.current;

  if (!revealed) {
    return <View style={{ width, height: width * 0.78 + 110 }} />;
  }
  return <Reveal kind="up" delay={delay}>{children}</Reveal>;
}

const styles = StyleSheet.create({
  content: { paddingTop: space.sm, paddingBottom: space.lg, alignItems: 'center' },
  top: { gap: space.xs, marginBottom: space.md, alignItems: 'center' },
  inner: { gap: space.md },
  section: { gap: space.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  sectionDot: { width: 10, height: 10, borderRadius: 5 },
  sectionTitle: { ...type.bodyStrong },
  sectionCount: { ...type.bodyStrong, color: accent },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
});
