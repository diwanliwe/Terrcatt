import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { ResultEntry, AGREEMENT_META, AGREEMENT_ORDER } from './resultsData';
import { type, space, accent } from './theme';
import { Reveal, TIMING } from './Reveal';
import { useT, Rich } from '@/i18n';

function countAgreements(entries: ResultEntry[]) {
  const counts = { accord: 0, nuance: 0, desaccord: 0 };
  entries.forEach((e) => { counts[e.agreement] += 1; });
  return counts;
}

/** One-line verdict: "Vous partagez le regard de l'étude sur 11 cartes sur 15". */
export function Headline({ entries }: { entries: ResultEntry[] }) {
  const t = useT();
  const counts = countAgreements(entries);
  const shared = counts.accord + counts.nuance;
  return (
    <Rich
      text={t.results.headline(shared, entries.length)}
      style={styles.headline}
      strongStyle={styles.strong}
    />
  );
}

interface AgreementDotsProps {
  entries: ResultEntry[];
  /** Index of the card in focus (carousel). Dims the others and makes dots tappable. */
  activeIndex?: number;
  onDotPress?: (index: number) => void;
  /** If set, dots drop in one after another starting at this delay (ms). */
  animateFrom?: number;
}

/** One dot per card coloured by perspective, plus the legend. */
export function AgreementDots({ entries, activeIndex, onDotPress, animateFrom }: AgreementDotsProps) {
  const t = useT();
  const counts = countAgreements(entries);
  return (
    <View style={styles.dotsWrap}>
      <View style={styles.dots}>
        {entries.map((e, i) => {
          const active = activeIndex === i;
          const dot = (
            <Pressable
              onPress={onDotPress ? () => onDotPress(i) : undefined}
              hitSlop={6}
              style={[
                styles.dot,
                { backgroundColor: AGREEMENT_META[e.agreement].color },
                activeIndex !== undefined && !active && styles.dotDim,
                active && styles.dotActive,
              ]}
            />
          );
          if (animateFrom === undefined) return <React.Fragment key={e.card.id}>{dot}</React.Fragment>;
          return (
            <Reveal key={e.card.id} kind="drop" delay={animateFrom + i * TIMING.dotStagger}>
              {dot}
            </Reveal>
          );
        })}
      </View>
      <Reveal kind="up" delay={animateFrom === undefined ? 0 : animateFrom + entries.length * TIMING.dotStagger} style={styles.legend}>
        {AGREEMENT_ORDER.map((a) => (
          <View key={a} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: AGREEMENT_META[a].color }]} />
            <Text style={styles.legendText}>
              {counts[a]} {(counts[a] > 1 ? t.results.agreement[a].plural : t.results.agreement[a].label).toLowerCase()}
            </Text>
          </View>
        ))}
      </Reveal>
    </View>
  );
}

/** Call to action under the cards. */
export function TapHint({ text }: { text?: string }) {
  const t = useT();
  return <Text style={styles.hintText}>{text ?? t.results.tapHint}</Text>;
}

const styles = StyleSheet.create({
  headline: { ...type.title, textAlign: 'center', paddingHorizontal: space.md },
  strong: { color: accent },
  dotsWrap: { alignItems: 'center', gap: space.xs, paddingHorizontal: space.sm },
  dots: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotDim: { opacity: 0.3 },
  dotActive: { transform: [{ scale: 1.5 }] },
  legend: { flexDirection: 'row', gap: space.sm, flexWrap: 'wrap', justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { ...type.caption },
  hintText: { ...type.body, textAlign: 'center' },
});
