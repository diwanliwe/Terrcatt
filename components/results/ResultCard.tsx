import React from 'react';
import { StyleSheet, View, Text, Image, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  ResultEntry,
  AGREEMENT_META,
  scoreToColor,
  formatScore,
  hasComment,
} from './resultsData';
import { type, space, surface } from './theme';

interface ScoreChipProps {
  label: string;
  score: number | undefined;
  compact?: boolean;
}

export function ScoreChip({ label, score, compact }: ScoreChipProps) {
  const color = scoreToColor(score);
  return (
    <View style={[chip.wrap, compact && chip.wrapCompact]}>
      <Text style={[chip.label, compact && chip.labelCompact]}>{label}</Text>
      <View style={[chip.pill, { backgroundColor: color }, compact && chip.pillCompact]}>
        <Text style={[chip.value, compact && chip.valueCompact]}>{formatScore(score)}</Text>
      </View>
    </View>
  );
}

const chip = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 4 },
  wrapCompact: { flexDirection: 'row', gap: 6 },
  label: { ...type.caption },
  labelCompact: {},
  pill: {
    minWidth: 48,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    alignItems: 'center',
  },
  pillCompact: { minWidth: 36, paddingHorizontal: 8, paddingVertical: 2 },
  value: { ...type.bodyStrong, color: surface },
  valueCompact: { ...type.caption, color: surface, fontWeight: '700' },
});

interface ResultCardProps {
  entry: ResultEntry;
  width: number;
  onPress: () => void;
  /** Show the full "Vous / L'étude" strip + perspective line under the image. */
  detailed?: boolean;
  /** Image height as a fraction of the card width. */
  imageRatio?: number;
}

/**
 * Image-first card with the user's vote and terrain truth underneath.
 * Used by the Groupes grid and the Carrousel; width drives everything.
 */
export function ResultCard({ entry, width, onPress, detailed = true, imageRatio = 0.78 }: ResultCardProps) {
  const meta = AGREEMENT_META[entry.agreement];
  const imageHeight = width * imageRatio;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { width, borderColor: meta.color },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.imageWrap, { height: imageHeight }]}>
        <Image source={entry.card.image} style={styles.image} resizeMode="cover" />
        {hasComment(entry) && (
          <View style={styles.commentTag}>
            <FontAwesome name="comment" size={12} color="#fff" />
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{entry.card.name}</Text>
        {detailed ? (
          <>
            <View style={styles.scoresRow}>
              <ScoreChip label="Vous" score={entry.userScore} />
              <ScoreChip label="L'étude" score={entry.gtScore} />
            </View>
            <Text style={[styles.agreementLabel, { color: meta.color }]}>{meta.label}</Text>
          </>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  pressed: { opacity: 0.85 },
  imageWrap: { width: '100%', backgroundColor: '#000' },
  image: { width: '100%', height: '100%' },
  commentTag: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#C4956A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { paddingHorizontal: space.sm, paddingVertical: space.sm, gap: space.xs },
  name: { ...type.bodyStrong, textAlign: 'center' },
  scoresRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 20,
  },
  agreementLabel: { ...type.bodyStrong, textAlign: 'center' },
});
