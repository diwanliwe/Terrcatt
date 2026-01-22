import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useCards, CARDS, CardData } from '@/context/CardContext';
import { Card } from '@/components/Card';

function getRandomPair(exclude: [CardData, CardData] | null): [CardData, CardData] {
  let card1 = CARDS[Math.floor(Math.random() * CARDS.length)];
  let card2 = CARDS[Math.floor(Math.random() * CARDS.length)];

  while (card2.id === card1.id) {
    card2 = CARDS[Math.floor(Math.random() * CARDS.length)];
  }

  if (exclude && ((card1.id === exclude[0].id && card2.id === exclude[1].id) || (card1.id === exclude[1].id && card2.id === exclude[0].id))) {
    return getRandomPair(exclude);
  }

  return [card1, card2];
}

export default function CompareScreen() {
  const { state, compareWin, compareTie, resetCompare } = useCards();
  const [currentPair, setCurrentPair] = useState<[CardData, CardData]>(() => getRandomPair(null));

  const handleSelect = useCallback((selectedIndex: 0 | 1) => {
    const winnerId = currentPair[selectedIndex].id;
    const loserId = currentPair[selectedIndex === 0 ? 1 : 0].id;
    compareWin(winnerId, loserId);
    setCurrentPair(getRandomPair(currentPair));
  }, [currentPair, compareWin]);

  const handleTie = useCallback(() => {
    compareTie();
    setCurrentPair(getRandomPair(currentPair));
  }, [currentPair, compareTie]);

  const handleReset = useCallback(() => {
    resetCompare();
    setCurrentPair(getRandomPair(null));
  }, [resetCompare]);

  return (
    <View style={styles.container}>
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          Comparisons: {state.comparisonCount}
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.cardWrapper,
            pressed && styles.cardPressed,
          ]}
          onPress={() => handleSelect(0)}
        >
          <Card card={currentPair[0]} size="medium" />
        </Pressable>

        <View style={styles.middleContainer}>
          <Text style={styles.vsText}>VS</Text>
          <Pressable
            style={({ pressed }) => [
              styles.equalButton,
              pressed && styles.equalButtonPressed,
            ]}
            onPress={handleTie}
          >
            <Text style={styles.equalButtonText}>=</Text>
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.cardWrapper,
            pressed && styles.cardPressed,
          ]}
          onPress={() => handleSelect(1)}
        >
          <Card card={currentPair[1]} size="medium" />
        </Pressable>
      </View>

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionText}>
          Tap the more favorable card, or = if equal
        </Text>
      </View>

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
  countContainer: {
    marginBottom: 20,
  },
  countText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cardsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 20,
  },
  cardWrapper: {
    transform: [{ scale: 1 }],
  },
  cardPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  middleContainer: {
    alignItems: 'center',
    gap: 12,
  },
  vsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
  },
  equalButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#9E9E9E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  equalButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  equalButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  instructionsContainer: {
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 14,
    color: '#888',
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
