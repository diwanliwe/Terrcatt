import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, Pressable, Image } from 'react-native';
import { useCards, CARDS, CardData } from '@/context/CardContext';
import { SwipeableCard } from '@/components/SwipeableCard';
import { useCardSize } from '@/components/Card';

export function SwipeMode() {
  const { cardWidth, cardHeight } = useCardSize();
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

  // Step 2 handlers - swipe-based refinement
  const handleStep2SwipeRight = useCallback(() => {
    if (!currentStep2Card) return;
    const firstScore = state.swipeFirstPass[currentStep2Card.id];
    if (firstScore === 1) {
      // Favorable card: right = Très favorable (+2)
      swipeSecondPass(currentStep2Card.id, 2);
    } else {
      // Unfavorable card: right = Défavorable (-1, less extreme)
      swipeSecondPass(currentStep2Card.id, -1);
    }
    nextSwipeStep2Card();
  }, [currentStep2Card, state.swipeFirstPass, swipeSecondPass, nextSwipeStep2Card]);

  const handleStep2SwipeLeft = useCallback(() => {
    if (!currentStep2Card) return;
    const firstScore = state.swipeFirstPass[currentStep2Card.id];
    if (firstScore === 1) {
      // Favorable card: left = Favorable (+1, less extreme)
      swipeSecondPass(currentStep2Card.id, 1);
    } else {
      // Unfavorable card: left = Très défavorable (-2)
      swipeSecondPass(currentStep2Card.id, -2);
    }
    nextSwipeStep2Card();
  }, [currentStep2Card, state.swipeFirstPass, swipeSecondPass, nextSwipeStep2Card]);

  const handleStep2SwipeUp = useCallback(() => {
    if (!currentStep2Card) return;
    swipeSecondPass(currentStep2Card.id, 0); // Neutre
    nextSwipeStep2Card();
  }, [currentStep2Card, swipeSecondPass, nextSwipeStep2Card]);

  const handleStartStep2 = useCallback(() => {
    startSwipeStep2();
  }, [startSwipeStep2]);

  const handleReset = useCallback(() => {
    resetSwipe();
  }, [resetSwipe]);

  // Get swipe config for step 2 based on first pass score
  const getStep2SwipeConfig = (card: CardData) => {
    const firstScore = state.swipeFirstPass[card.id];
    if (firstScore === 1) {
      // Favorable card: deep green right, light green left
      return {
        labels: { right: 'Très favorable', left: 'Favorable', up: 'Neutre' },
        colors: { right: '#2E7D32', left: '#8BC34A', up: '#9E9E9E' },
      };
    } else {
      // Unfavorable card: light red right, deep red left
      return {
        labels: { right: 'Défavorable', left: 'Très défavorable', up: 'Neutre' },
        colors: { right: '#FF9800', left: '#C62828', up: '#9E9E9E' },
      };
    }
  };

  // Render Step 1
  if (isStep1) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.stepText}>Étape 1 sur 2</Text>
          <Text style={styles.progressText}>
            {isStep1Complete ? 'Terminé !' : `${currentIndex + 1}/${CARDS.length}`}
          </Text>
        </View>

        <View style={styles.cardContainer}>
          {isStep1Complete ? (
            <View style={styles.completeContainer}>
              <Text style={styles.completeText}>Étape 1 terminée !</Text>
              <Text style={styles.completeSubtext}>
                {step2Cards.length > 0
                  ? `${step2Cards.length} cartes à affiner à l'étape 2`
                  : 'Toutes les cartes sont neutres'}
              </Text>
              {step2Cards.length > 0 && (
                <Pressable style={styles.nextStepButton} onPress={handleStartStep2}>
                  <Text style={styles.nextStepButtonText}>Passer à l'étape 2</Text>
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
                        labels={{ right: 'Favorable', left: 'Défavorable', up: 'Neutre' }}
                      />
                    );
                  }
                  return (
                    <View key={card.id} style={styles.nextCard}>
                      <View style={[styles.cardPreview, { width: cardWidth, height: cardHeight }]}>
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
            {isStep1Complete ? '' : 'Glisser : Droite=Favorable, Gauche=Défavorable, Haut=Neutre'}
          </Text>
        </View>

        <Pressable style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Réinitialiser</Text>
        </Pressable>
      </View>
    );
  }

  // Render Step 2
  const step2Config = currentStep2Card ? getStep2SwipeConfig(currentStep2Card) : null;
  const nextStep2Card = step2Cards[step2Index + 1];

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.stepText}>Étape 2 sur 2 — Affiner</Text>
        <Text style={styles.progressText}>
          {isStep2Complete ? 'Terminé !' : `${step2Index + 1}/${step2Cards.length}`}
        </Text>
      </View>

      <View style={styles.cardContainer}>
        {isStep2Complete ? (
          <View style={styles.completeContainer}>
            <Text style={styles.completeText}>Terminé !</Text>
            <Text style={styles.completeSubtext}>
              Consultez l'onglet Résultats pour voir vos classements
            </Text>
          </View>
        ) : (
          <>
            {nextStep2Card && (
              <View style={styles.nextCard}>
                <View style={[styles.cardPreview, { width: cardWidth, height: cardHeight }]}>
                  <Image source={nextStep2Card.image} style={styles.previewImage} resizeMode="cover" />
                </View>
              </View>
            )}
            {currentStep2Card && step2Config && (
              <SwipeableCard
                key={currentStep2Card.id}
                card={currentStep2Card}
                onSwipeRight={handleStep2SwipeRight}
                onSwipeLeft={handleStep2SwipeLeft}
                onSwipeUp={handleStep2SwipeUp}
                labels={step2Config.labels}
                colors={step2Config.colors}
              />
            )}
          </>
        )}
      </View>

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionText}>
          {isStep2Complete ? '' : currentStep2Card && state.swipeFirstPass[currentStep2Card.id] === 1
            ? 'Droite = Très favorable, Gauche = Favorable, Haut = Neutre'
            : 'Droite = Défavorable, Gauche = Très défavorable, Haut = Neutre'}
        </Text>
      </View>

      <Pressable style={styles.resetButton} onPress={handleReset}>
        <Text style={styles.resetButtonText}>Réinitialiser</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFCFA',
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  stepText: {
    fontSize: 14,
    color: '#C4956A',
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
    backgroundColor: '#000',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#DEDDDA',
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
    transform: [{ scale: 1.05 }],
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
    backgroundColor: '#C4956A',
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
  resetButton: {
    backgroundColor: '#C4956A',
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
