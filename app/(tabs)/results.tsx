import React, { useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, ScrollView } from 'react-native';
import { useCards, CARDS, CardData } from '@/context/CardContext';
import { Card } from '@/components/Card';

export default function ResultsScreen() {
  const { state } = useCards();

  const swipeRanking = useMemo(() => {
    return [...CARDS].sort((a, b) => {
      const scoreA = state.swipeScores[a.id] || 0;
      const scoreB = state.swipeScores[b.id] || 0;
      return scoreB - scoreA;
    });
  }, [state.swipeScores]);

  const compareRanking = useMemo(() => {
    return [...CARDS].sort((a, b) => {
      const scoreA = state.compareScores[a.id] || 0;
      const scoreB = state.compareScores[b.id] || 0;
      return scoreB - scoreA;
    });
  }, [state.compareScores]);

  const ratingRanking = useMemo(() => {
    return [...CARDS].sort((a, b) => {
      const scoreA = state.ratingScores[a.id] ?? -999;
      const scoreB = state.ratingScores[b.id] ?? -999;
      return scoreB - scoreA;
    });
  }, [state.ratingScores]);

  const hasSwipeData = Object.keys(state.swipeScores).length > 0;
  const hasCompareData = Object.keys(state.compareScores).length > 0;
  const hasRatingData = Object.keys(state.ratingScores).length > 0;

  const renderCard = (card: CardData, index: number, scores: Record<number, number>) => (
    <View style={styles.cardItem}>
      <Card card={card} size="small" rank={index + 1} />
      <Text style={styles.scoreText}>
        {scores[card.id] !== undefined ? (scores[card.id] > 0 ? `+${scores[card.id]}` : scores[card.id]) : '0'}
      </Text>
    </View>
  );

  const renderRatingCard = (card: CardData, index: number) => (
    <View style={styles.cardItem}>
      <Card card={card} size="small" rank={index + 1} />
      <Text style={styles.scoreText}>
        {state.ratingScores[card.id] !== undefined
          ? (state.ratingScores[card.id] > 0 ? `+${state.ratingScores[card.id]}` : state.ratingScores[card.id])
          : '-'}
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Classement Swipe</Text>
        {hasSwipeData ? (
          <FlatList
            data={swipeRanking}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(card) => `swipe-${card.id}`}
            renderItem={({ item, index }) => renderCard(item, index, state.swipeScores)}
            contentContainerStyle={styles.listContent}
            scrollEnabled={true}
            nestedScrollEnabled={true}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune donnée de swipe</Text>
            <Text style={styles.emptySubtext}>Allez dans l'onglet Swipe pour commencer</Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Classement Comparaison</Text>
        {hasCompareData ? (
          <FlatList
            data={compareRanking}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(card) => `compare-${card.id}`}
            renderItem={({ item, index }) => renderCard(item, index, state.compareScores)}
            contentContainerStyle={styles.listContent}
            scrollEnabled={true}
            nestedScrollEnabled={true}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune donnée de comparaison</Text>
            <Text style={styles.emptySubtext}>Allez dans l'onglet Comparer pour commencer</Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Classement Notation</Text>
        {hasRatingData ? (
          <FlatList
            data={ratingRanking}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(card) => `rating-${card.id}`}
            renderItem={({ item, index }) => renderRatingCard(item, index)}
            contentContainerStyle={styles.listContent}
            scrollEnabled={true}
            nestedScrollEnabled={true}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune donnée de notation</Text>
            <Text style={styles.emptySubtext}>Allez dans l'onglet Noter pour commencer</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFCFA',
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  section: {
    minHeight: 180,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginLeft: 20,
    marginBottom: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  cardItem: {
    alignItems: 'center',
    marginHorizontal: 4,
  },
  scoreText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 16,
    marginHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});
