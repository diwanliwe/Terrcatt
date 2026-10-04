import React, { useCallback, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useT } from '@/i18n';
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

// Score names are translated (t.scale); only the ends of the scale are labelled on screen.
const RATING_OPTIONS = [
  { score: -2, color: '#F44336' },
  { score: -1, color: '#FF9800' },
  { score: 0, color: '#9E9E9E' },
  { score: 1, color: '#8BC34A' },
  { score: 2, color: '#4CAF50' },
];

const EXIT_MS = 260;
const ENTER_MS = 200;

export function RateMode() {
  const { state, rateCard, nextRatingCard, startNewRun, setCardTitle } = useCards();
  const t = useT();
  // Expert mode (test option, « En savoir plus »): the card has no title and the
  // player may write what they think it illustrates before voting.
  const expert = state.expertMode;
  const [proposedTitle, setProposedTitle] = useState('');
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
      if (expert && proposedTitle.trim()) setCardTitle(cardId, proposedTitle);
      setProposedTitle('');
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
    [expert, proposedTitle, setCardTitle, rateCard, nextRatingCard, translateX, scale, opacity]
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {isComplete ? t.rate.done : `${currentIndex + 1}/${CARDS.length}`}
        </Text>
        {expert && !isComplete && (
          <View style={styles.expertBadge}>
            <Text style={styles.expertBadgeText}>{t.rate.expertBadge}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardContainer}>
        {isComplete ? (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.completeContainer}>
            <Text style={styles.completeEmoji}>🎉</Text>
            <Text style={styles.completeText}>{t.rate.allRated}</Text>
            <Text style={styles.completeSubtext}>
              {t.rate.allRatedSub}
            </Text>
            <Pressable
              style={({ pressed }) => [styles.resultsButton, pressed && styles.resultsButtonPressed]}
              onPress={() => router.push('/results')}
            >
              <Text style={styles.resultsButtonText}>{t.rate.seeResults}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.replayButton, pressed && { opacity: 0.6 }]}
              onPress={startNewRun}
            >
              <Text style={styles.replayButtonText}>{t.rate.replay}</Text>
            </Pressable>
          </Animated.View>
        ) : (
          <Animated.View style={cardAnimatedStyle}>
            <Card card={currentCard} size="large" untitled={expert} />
          </Animated.View>
        )}
      </View>

      {!isComplete && (
        <View style={styles.buttonsContainer}>
          {expert && (
            <TextInput
              style={styles.titleInput}
              value={proposedTitle}
              onChangeText={setProposedTitle}
              placeholder={t.rate.titlePlaceholder}
              placeholderTextColor="#A39E98"
              maxLength={80}
              returnKeyType="done"
              autoCorrect
            />
          )}
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
              <Text style={styles.labelLeft}>{t.scale['-2']}</Text>
              <Text style={styles.labelRight}>{t.scale['2']}</Text>
            </View>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  expertBadge: {
    backgroundColor: '#FAF3EC',
    borderWidth: 1,
    borderColor: '#E8D9C8',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  expertBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A6240',
  },
  titleInput: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DEDDDA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
    marginBottom: 14,
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
  replayButton: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  replayButtonText: {
    color: '#8A8580',
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
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
