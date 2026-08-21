import React, { useCallback, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import { useCards, CARDS } from '@/context/CardContext';
import { Card } from '@/components/Card';

const RATING_OPTIONS = [
  { label: 'Très défavorable', score: -2, color: '#F44336' },
  { label: 'Défavorable', score: -1, color: '#FF9800' },
  { label: 'Neutre', score: 0, color: '#9E9E9E' },
  { label: 'Favorable', score: 1, color: '#8BC34A' },
  { label: 'Très favorable', score: 2, color: '#4CAF50' },
];

const EXIT_MS = 260;
const ENTER_MS = 200;

export function RateMode() {
  const { state, rateCard, nextRatingCard } = useCards();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const currentIndex = state.currentRatingIndex;
  const isComplete = currentIndex >= CARDS.length;
  const currentCard = CARDS[currentIndex];

  const animating = useRef(false);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const commitRating = useCallback(
    (cardId: number, score: number) => {
      rateCard(cardId, score);
      nextRatingCard();
      // Prepare and play the next card's entrance
      translateX.value = 0;
      scale.value = 0.92;
      opacity.value = 0;
      scale.value = withTiming(1, { duration: ENTER_MS });
      opacity.value = withTiming(1, { duration: ENTER_MS });
      animating.current = false;
    },
    [rateCard, nextRatingCard, translateX, scale, opacity]
  );

  const handleRate = useCallback(
    (score: number) => {
      if (animating.current || isComplete) {
        return;
      }
      animating.current = true;
      const cardId = currentCard.id;
      const direction = score === 0 ? 0 : score < 0 ? -1 : 1;

      if (direction === 0) {
        // Neutral: the card settles in place and fades out
        scale.value = withTiming(0.85, { duration: EXIT_MS });
        opacity.value = withTiming(0, { duration: EXIT_MS }, (finished) => {
          if (finished) {
            runOnJS(commitRating)(cardId, score);
          }
        });
      } else {
        // The card flies off toward the verdict side
        opacity.value = withTiming(0.4, { duration: EXIT_MS });
        translateX.value = withTiming(
          direction * width,
          { duration: EXIT_MS, easing: Easing.in(Easing.quad) },
          (finished) => {
            if (finished) {
              runOnJS(commitRating)(cardId, score);
            }
          }
        );
      }
    },
    [isComplete, currentCard, width, translateX, scale, opacity, commitRating]
  );

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { scale: scale.value },
      { rotate: `${(translateX.value / width) * 12}deg` },
    ],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {isComplete ? 'Terminé !' : `${currentIndex + 1}/${CARDS.length}`}
        </Text>
      </View>

      <View style={styles.cardContainer}>
        {isComplete ? (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.completeContainer}>
            <Text style={styles.completeEmoji}>🎉</Text>
            <Text style={styles.completeText}>Toutes les cartes sont notées !</Text>
            <Text style={styles.completeSubtext}>
              Découvrez votre classement et comparez votre regard à celui des scientifiques.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.resultsButton, pressed && styles.resultsButtonPressed]}
              onPress={() => router.push('/results')}
            >
              <Text style={styles.resultsButtonText}>Voir mes résultats</Text>
            </Pressable>
          </Animated.View>
        ) : (
          <Animated.View style={cardAnimatedStyle}>
            <Card card={currentCard} size="large" />
          </Animated.View>
        )}
      </View>

      {!isComplete && (
        <View style={styles.buttonsContainer}>
          <View style={styles.buttonsBlock}>
            <View style={styles.buttonsRow}>
              {RATING_OPTIONS.map((option) => (
                <Pressable
                  key={option.score}
                  style={({ pressed }) => [
                    styles.ratingButton,
                    { backgroundColor: option.color },
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() => handleRate(option.score)}
                >
                  <Text style={styles.buttonScore}>
                    {option.score > 0 ? `+${option.score}` : option.score}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.labelsRow}>
              <Text style={styles.labelLeft}>Très défavorable</Text>
              <Text style={styles.labelRight}>Très favorable</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFCFA',
    alignItems: 'center',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    maxWidth: 420,
  },
  completeEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  completeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  completeSubtext: {
    fontSize: 16,
    lineHeight: 23,
    color: '#666',
    textAlign: 'center',
    marginBottom: 28,
  },
  resultsButton: {
    backgroundColor: '#C4956A',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 10,
    minWidth: 220,
    alignItems: 'center',
  },
  resultsButtonPressed: {
    opacity: 0.8,
  },
  resultsButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  buttonsContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  // Width shrinks to the buttons row, so the labels below stay anchored to the
  // extreme buttons instead of the screen edges (visible on wide web layouts)
  buttonsBlock: {
    alignSelf: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  ratingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.9 }],
  },
  buttonScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  labelLeft: {
    fontSize: 12,
    color: '#666',
  },
  labelRight: {
    fontSize: 12,
    color: '#666',
  },
});
