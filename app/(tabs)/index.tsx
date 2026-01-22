import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, Pressable, Image } from 'react-native';
import { useCards, CARDS, CardData } from '@/context/CardContext';
import { SwipeableCard } from '@/components/SwipeableCard';
import { Card } from '@/components/Card';

export default function SwipeScreen() {
  const {
    state,
    swipeFirstPass,
    swipeSecondPass,
    nextSwipeCard,
    nextSwipeStep2Card,
    startSwipeStep2,
    resetSwipe
  } = useCards();

  const currentIndex = state.currentSwipeIndex;
  const step2Index = state.currentSwipeStep2Index;
  const isStep1 = state.swipeStep === 1;
  const isStep1Complete = currentIndex >= CARDS.length;

  // Cards that need refinement in step 2 (favorable or unfavorable, not neutral)
  const step2Cards = useMemo(() => {
    return CARDS.filter(card => {
      const score = state.swipeFirstPass[card.id];
      return score === 1 || score === -1;
    });
  }, [state.swipeFirstPass]);

  const isStep2Complete = step2Index >= step2Cards.length;
  const currentStep2Card = step2Cards[step2Index];

  // Step 1 handlers
  const handleSwipeRight = useCallback(() => {
    const card = CARDS[currentIndex];
    swipeFirstPass(card.id, 1); // Favorable
    nextSwipeCard();
  }, [currentIndex, swipeFirstPass, nextSwipeCard]);

  const handleSwipeLeft = useCallback(() => {
    const card = CARDS[currentIndex];
    swipeFirstPass(card.id, -1); // Unfavorable
    nextSwipeCard();
  }, [currentIndex, swipeFirstPass, nextSwipeCard]);

  const handleSwipeUp = useCallback(() => {
    const card = CARDS[currentIndex];
    swipeFirstPass(card.id, 0); // Neutral
    nextSwipeCard();
  }, [currentIndex, swipeFirstPass, nextSwipeCard]);

  // Step 2 handlers
  const handleStep2Choice = useCallback((value: number) => {
    swipeSecondPass(currentStep2Card.id, value);
    nextSwipeStep2Card();
  }, [currentStep2Card, swipeSecondPass, nextSwipeStep2Card]);

  const handleStartStep2 = useCallback(() => {
    startSwipeStep2();
  }, [startSwipeStep2]);

  const handleReset = useCallback(() => {
    resetSwipe();
  }, [resetSwipe]);

  // Get the refinement options based on first pass score
  const getStep2Options = (card: CardData) => {
    const firstPassScore = state.swipeFirstPass[card.id];
    if (firstPassScore === 1) {
      // Was favorable, choose: very favorable (+2) or keep favorable (+1) or neutral (0)
      return [
        { label: 'Very favorable', value: 2, color: '#4CAF50' },
        { label: 'Favorable', value: 1, color: '#8BC34A' },
        { label: 'Neutral', value: 0, color: '#9E9E9E' },
      ];
    } else {
      // Was unfavorable, choose: very unfavorable (-2) or keep unfavorable (-1) or neutral (0)
      return [
        { label: 'Very unfavorable', value: -2, color: '#F44336' },
        { label: 'Unfavorable', value: -1, color: '#FF9800' },
        { label: 'Neutral', value: 0, color: '#9E9E9E' },
      ];
    }
  };

  // Render Step 1
  if (isStep1) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.stepText}>Step 1 of 2</Text>
          <Text style={styles.progressText}>
            {isStep1Complete ? 'Complete!' : `${currentIndex + 1}/${CARDS.length}`}
          </Text>
        </View>

        <View style={styles.cardContainer}>
          {isStep1Complete ? (
            <View style={styles.completeContainer}>
              <Text style={styles.completeText}>Step 1 Complete!</Text>
              <Text style={styles.completeSubtext}>
                {step2Cards.length > 0
                  ? `${step2Cards.length} cards to refine in Step 2`
                  : 'All cards marked as neutral'}
              </Text>
              {step2Cards.length > 0 && (
                <Pressable style={styles.nextStepButton} onPress={handleStartStep2}>
                  <Text style={styles.nextStepButtonText}>Continue to Step 2</Text>
                </Pressable>
              )}
            </View>
          ) : (
            <>
              {CARDS.slice(currentIndex, currentIndex + 2)
                .reverse()
                .map((card, index) => {
                  const isTopCard = index === CARDS.slice(currentIndex, currentIndex + 2).length - 1;
                  if (isTopCard) {
                    return (
                      <SwipeableCard
                        key={card.id}
                        card={card}
                        onSwipeLeft={handleSwipeLeft}
                        onSwipeRight={handleSwipeRight}
                        onSwipeUp={handleSwipeUp}
                        labels={{ right: 'Favorable', left: 'Unfavorable', up: 'Neutral' }}
                      />
                    );
                  }
                  return (
                    <View key={card.id} style={styles.nextCard}>
                      <View style={styles.cardPreview}>
                        <Image source={card.image} style={styles.previewImage} resizeMode="cover" />
                      </View>
                    </View>
                  );
                })}
            </>
          )}
        </View>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionText}>
            {isStep1Complete ? '' : 'Swipe: Right=Favorable, Left=Unfavorable, Up=Neutral'}
          </Text>
        </View>

        <Pressable style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </Pressable>
      </View>
    );
  }

  // Render Step 2
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.stepText}>Step 2 of 2</Text>
        <Text style={styles.progressText}>
          {isStep2Complete ? 'Complete!' : `${step2Index + 1}/${step2Cards.length}`}
        </Text>
      </View>

      <View style={styles.cardContainer}>
        {isStep2Complete ? (
          <View style={styles.completeContainer}>
            <Text style={styles.completeText}>All done!</Text>
            <Text style={styles.completeSubtext}>
              Check the Results tab to see your rankings
            </Text>
          </View>
        ) : (
          <Card card={currentStep2Card} />
        )}
      </View>

      {!isStep2Complete && currentStep2Card && (
        <View style={styles.step2ButtonsContainer}>
          <View style={styles.step2ButtonsRow}>
            {getStep2Options(currentStep2Card).map((option) => (
              <Pressable
                key={option.value}
                style={({ pressed }) => [
                  styles.step2Button,
                  { backgroundColor: option.color },
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => handleStep2Choice(option.value)}
              >
                <Text style={styles.step2ButtonText}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.step2Hint}>
            Previously marked as: {state.swipeFirstPass[currentStep2Card.id] === 1 ? 'Favorable' : 'Unfavorable'}
          </Text>
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
  headerContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  stepText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
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
    width: '100%',
  },
  nextCard: {
    position: 'absolute',
    transform: [{ scale: 0.95 }],
    opacity: 0.7,
  },
  cardPreview: {
    width: 200,
    height: 280,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  previewImage: {
    width: '100%',
    height: '100%',
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
    textAlign: 'center',
    marginBottom: 20,
  },
  nextStepButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  nextStepButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  instructionsContainer: {
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
  },
  step2ButtonsContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  step2ButtonsRow: {
    flexDirection: 'column',
    gap: 10,
  },
  step2Button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  step2ButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  step2Hint: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
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
