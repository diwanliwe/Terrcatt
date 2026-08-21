import React, { useCallback } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useCards, CARDS } from '@/context/CardContext';
import { Card } from '@/components/Card';

const RATING_OPTIONS = [
  { label: 'Très défavorable', score: -2, color: '#F44336' },
  { label: 'Défavorable', score: -1, color: '#FF9800' },
  { label: 'Neutre', score: 0, color: '#9E9E9E' },
  { label: 'Favorable', score: 1, color: '#8BC34A' },
  { label: 'Très favorable', score: 2, color: '#4CAF50' },
];

export function RateMode() {
  const { state, rateCard, nextRatingCard } = useCards();
  const currentIndex = state.currentRatingIndex;
  const isComplete = currentIndex >= CARDS.length;
  const currentCard = CARDS[currentIndex];

  const handleRate = useCallback((score: number) => {
    rateCard(currentCard.id, score);
    nextRatingCard();
  }, [currentCard, rateCard, nextRatingCard]);

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {isComplete ? 'Terminé !' : `${currentIndex + 1}/${CARDS.length}`}
        </Text>
      </View>

      <View style={styles.cardContainer}>
        {isComplete ? (
          <View style={styles.completeContainer}>
            <Text style={styles.completeText}>Toutes les cartes sont notées !</Text>
            <Text style={styles.completeSubtext}>
              Consultez l'onglet Résultats pour voir vos classements
            </Text>
          </View>
        ) : (
          <Card card={currentCard} size="large" />
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
