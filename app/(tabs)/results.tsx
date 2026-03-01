import React, { useMemo } from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { useCards, CARDS, CardData } from '@/context/CardContext';
import { Card } from '@/components/Card';

const MODE_CONFIG = {
  swipe: {
    title: 'Classement Glisser',
    emptyLabel: 'Glisser',
  },
  compare: {
    title: 'Classement Comparaison',
    emptyLabel: 'Comparer',
  },
  rate: {
    title: 'Classement Notation',
    emptyLabel: 'Noter',
  },
} as const;

export default function ResultsScreen() {
  const { state } = useCards();
  const { gameMode } = state;
  const config = MODE_CONFIG[gameMode];

  const scores =
    gameMode === 'swipe' ? state.swipeScores :
    gameMode === 'compare' ? state.compareScores :
    state.ratingScores;

  const hasData = Object.keys(scores).length > 0;

  const ranking = useMemo(() => {
    const fallback = gameMode === 'rate' ? -999 : 0;
    return [...CARDS].sort((a, b) => {
      const scoreA = scores[a.id] ?? fallback;
      const scoreB = scores[b.id] ?? fallback;
      return scoreB - scoreA;
    });
  }, [scores, gameMode]);

  const formatScore = (card: CardData) => {
    const score = scores[card.id];
    if (score === undefined) {
      return gameMode === 'rate' ? '-' : '0';
    }
    return score > 0 ? `+${score}` : `${score}`;
  };

  const renderItem = ({ item, index }: { item: CardData; index: number }) => (
    <View style={styles.cardRow}>
      <Text style={styles.rankText}>#{index + 1}</Text>
      <Card card={item} size="small" />
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.scoreText}>{formatScore(item)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{config.title}</Text>

      {hasData ? (
        <FlatList
          data={ranking}
          keyExtractor={(card) => `result-${card.id}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucune donnée</Text>
          <Text style={styles.emptySubtext}>
            Jouez en mode {config.emptyLabel} pour commencer
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFCFA',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginLeft: 20,
    marginTop: 16,
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C4956A',
    width: 32,
    textAlign: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 4,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  scoreText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#999',
  },
});
