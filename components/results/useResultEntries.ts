import { useMemo } from 'react';
import { useCards, CARDS } from '@/context/CardContext';
import { buildEntries, sortByInterest, normalizeCompareScores } from './resultsData';

/**
 * The user's scores for the active game mode turned into result entries.
 * Shared by the Résultats tab and the card detail page so both agree on
 * scores, ordering and completion.
 */
export function useResultEntries() {
  const { state } = useCards();
  const { gameMode } = state;

  const rawScores =
    gameMode === 'swipe' ? state.swipeScores :
    gameMode === 'compare' ? state.compareScores :
    state.ratingScores;

  const scores = useMemo(
    () => (gameMode === 'compare' ? normalizeCompareScores(rawScores) : rawScores),
    [rawScores, gameMode],
  );

  // Terrain truth is only revealed once every card has been rated,
  // so that seeing the reference can't bias the remaining answers.
  const ratedCount = Object.keys(scores).length;
  const isComplete =
    gameMode === 'rate' ? state.currentRatingIndex >= CARDS.length : ratedCount >= CARDS.length;

  const entries = useMemo(() => buildEntries(scores, state.comments), [scores, state.comments]);
  const byInterest = useMemo(() => sortByInterest(entries), [entries]);

  return { entries, byInterest, ratedCount, isComplete, total: CARDS.length };
}
