import React, { useCallback } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useCards, CARDS } from '@/context/CardContext';
import { Card } from '@/components/Card';

const RATING_OPTIONS = [
  { label: 'Very favorable', score: 2, color: '#4CAF50' },
  { label: 'Favorable', score: 1, color: '#8BC34A' },
  { label: 'Neutral', score: 0, color: '#9E9E9E' },
  { label: 'Unfavorable', score: -1, color: '#FF9800' },
  { label: 'Very unfavorable', score: -2, color: '#F44336' },
];

export default function RateScreen() {
  const { state, rateCard, nextRatingCard, resetRating } = useCards();
  const currentIndex = state.currentRatingIndex;
  const isComplete = currentIndex >= CARDS.length;
  const currentCard = CARDS[currentIndex];

  const handleRate = useCallback((score: number) => {
    rateCard(currentCard.id, score);
    nextRatingCard();
  }, [currentCard, rateCard, nextRatingCard]);

  const handleReset = useCallback(() => {
    resetRating();
  }, [resetRating]);

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {isComplete ? 'Complete!' : `${currentIndex + 1}/${CARDS.length}`}
        </Text>
      </View>

      <View style={styles.cardContainer}>
        {isComplete ? (
          <View style={styles.completeContainer}>
            <Text style={styles.completeText}>All cards rated!</Text>
            <Text style={styles.completeSubtext}>
              Check the Results tab to see your rankings
            </Text>
          </View>
        ) : (
          <Card card={currentCard} />
        )}
      </View>

      {!isComplete && (
        <View style={styles.buttonsContainer}>
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
            <Text style={styles.labelLeft}>Very favorable</Text>
            <Text style={styles.labelRight}>Very unfavorable</Text>
          </View>
        </View>
      )}

      <Pressable style={styles.resetButton} onPress={handleReset}>
        <Text style={styles.resetButtonText}>Reset</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    paddingTop: 20,
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
  },
  completeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  completeSubtext: {
    fontSize: 16,
    color: '#666',
  },
  buttonsContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
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
    paddingHorizontal: 8,
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
  resetButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 30,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
