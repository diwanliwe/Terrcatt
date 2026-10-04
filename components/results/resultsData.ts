import { CARDS, CardData, CardComment } from '@/context/CardContext';

// Terrain truth: "Ranking des 18 cartes du jeu Terrcatt" (M. Cohen, 15 Sept 2026)
export const GROUND_TRUTH_SCORES: Record<number, number> = {
  1: -1, 2: -1, 3: 2, 4: 1, 5: 1, 6: -1, 7: 2, 8: 0, 9: 1,
  10: 2, 11: 0, 12: -2, 13: -1, 14: -1, 15: 0, 16: 1, 17: -2, 18: 2,
};

// The study's one-line explanation of each card is translated: see `cards` in i18n/fr.ts.

// --- Score colors / labels ---

export const SCORE_COLORS: Record<string, string> = {
  '-2': '#D9534F',
  '-1': '#E8943A',
  '0': '#A0A0A0',
  '1': '#8BC34A',
  '2': '#4CAF50',
};

// Score names (« Très favorable »…) are translated: see `scale` in i18n/fr.ts.

function lerpColor(a: string, b: string, t: number): string {
  const parseHex = (hex: string) => {
    const h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };
  const [r1, g1, b1] = parseHex(a);
  const [r2, g2, b2] = parseHex(b);
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${toHex(r1 + (r2 - r1) * t)}${toHex(g1 + (g2 - g1) * t)}${toHex(b1 + (b2 - b1) * t)}`;
}

export function scoreToColor(score: number | undefined): string {
  if (score === undefined) return '#A0A0A0';
  const clamped = Math.max(-2, Math.min(2, score));
  if (Number.isInteger(clamped)) return SCORE_COLORS[`${clamped}`];
  const lower = Math.floor(clamped);
  const upper = Math.ceil(clamped);
  return lerpColor(SCORE_COLORS[`${lower}`], SCORE_COLORS[`${upper}`], clamped - lower);
}

export function formatScore(score: number | undefined): string {
  if (score === undefined) return '–';
  const rounded = Math.round(score);
  return rounded > 0 ? `+${rounded}` : `${rounded}`;
}

export function normalizeCompareScores(scores: Record<number, number>): Record<number, number> {
  const values = Object.values(scores);
  if (values.length === 0) return {};
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const normalized: Record<number, number> = {};
  for (const [id, val] of Object.entries(scores)) {
    normalized[Number(id)] = range === 0 ? 0 : ((val - min) / range) * 4 - 2;
  }
  return normalized;
}

// --- Agreement model (score gap, not rank gap) ---

export type Agreement = 'accord' | 'nuance' | 'desaccord';

// Labels and descriptions are translated: see `results.agreement` in i18n/fr.ts.
export const AGREEMENT_META: Record<Agreement, { color: string }> = {
  // Neutral palette on purpose: a different perspective is not a wrong answer.
  desaccord: { color: '#7E57C2' },
  nuance: { color: '#42A5F5' },
  accord: { color: '#26A69A' },
};

export const AGREEMENT_ORDER: Agreement[] = ['desaccord', 'nuance', 'accord'];

export function agreementOf(gap: number): Agreement {
  if (gap >= 2) return 'desaccord';
  if (gap >= 1) return 'nuance';
  return 'accord';
}

// --- Result entries ---

export interface ResultEntry {
  card: CardData;
  userScore: number | undefined;
  gtScore: number;
  gap: number;
  agreement: Agreement;
  rank: number; // 1-based position in the user's own ranking
  comment: CardComment | undefined;
}

export function buildEntries(
  scores: Record<number, number>,
  comments: Record<number, CardComment>,
): ResultEntry[] {
  const ranked = [...CARDS].sort((a, b) => (scores[b.id] ?? -999) - (scores[a.id] ?? -999));
  return ranked.map((card, i) => {
    const userScore = scores[card.id];
    const gtScore = GROUND_TRUTH_SCORES[card.id] ?? 0;
    const gap = userScore === undefined ? 0 : Math.abs(Math.round(userScore) - gtScore);
    return {
      card,
      userScore,
      gtScore,
      gap,
      agreement: agreementOf(gap),
      rank: i + 1,
      comment: comments[card.id],
    };
  });
}

/** Disagreements first, biggest gap first — the cards worth reacting to. */
export function sortByInterest(entries: ResultEntry[]): ResultEntry[] {
  return [...entries].sort((a, b) => b.gap - a.gap || a.rank - b.rank);
}
