import { CARDS, CardData, CardComment } from '@/context/CardContext';

// Terrain truth: "Ranking des 18 cartes du jeu Terrcatt" (M. Cohen, 15 Sept 2026)
export const GROUND_TRUTH_SCORES: Record<number, number> = {
  1: -1, 2: -1, 3: 2, 4: 1, 5: 1, 6: -1, 7: 2, 8: 0, 9: 1,
  10: 2, 11: 0, 12: -2, 13: -1, 14: -1, 15: 0, 16: 1, 17: -2, 18: 2,
};

export const GROUND_TRUTH_EXPLANATIONS: Record<number, string> = {
  1: "L'abandon agricole favorise la dégradation des terrasses et la perte de biodiversité.",
  2: "L'accumulation d'eau en amont de la murette est observée dans certaines terrasses ayant connu des glissements de terrain.",
  3: "L'apiculture est favorable dans les terrasses où les plantes sont pollinisées par les insectes.",
  4: "Le drainage des sols, avec la présence d'une sous-couche drainante en arrière de la couche de grosses pierres, est favorable à la stabilité des terrasses.",
  5: "La moyenne montagne connaît une pluviosité modérée, mais une tendance à l'assèchement des sols.",
  6: "Des murs mal entretenus jouent un rôle probable dans la fragilisation des terrasses.",
  7: "L'oliveraie fleurie abrite une biodiversité et des interactions avec les pollinisateurs observées dans les oliveraies entretenues avec des pratiques peu intensives.",
  8: "Un olivier planté au bord des murettes peut contribuer à dégrader les murs, mais il est favorable aux cultures associées.",
  9: "Le passé agricole est favorable à la conservation des sols, et donc à une moindre vulnérabilité aux glissements.",
  10: "Le patrimoine paysager est reconnu par l'Unesco, avec une dimension esthétique.",
  11: "Une pente très forte peut favoriser la survenue de glissements sur les terrasses.",
  12: "Une pluie très forte favorise les glissements de terrain sur les terrasses.",
  13: "La proximité de la route modifie l'écoulement de l'eau.",
  14: "La faune sauvage combinée à l'abandon agricole joue un rôle probable dans la dégradation des terrasses.",
  15: "Le rôle de la faune sauvage est ambigu.",
  16: "Les terrasses contiennent un peu plus d'eau que les versants non aménagés pendant les évènements extrêmes (crue, sécheresse).",
  17: "Une roche peu cohésive (éboulis) est un facteur de fragilité aux glissements.",
  18: "Une terrasse fleurie apporte un agrément esthétique et de la biodiversité.",
};

// --- Score colors / labels ---

export const SCORE_COLORS: Record<string, string> = {
  '-2': '#D9534F',
  '-1': '#E8943A',
  '0': '#A0A0A0',
  '1': '#8BC34A',
  '2': '#4CAF50',
};

export const SCORE_LABELS: Record<string, string> = {
  '-2': 'Très défavorable',
  '-1': 'Défavorable',
  '0': 'Neutre',
  '1': 'Favorable',
  '2': 'Très favorable',
};

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

export const STUDY_LABEL = "L'étude";

export function scoreLabel(score: number | undefined): string {
  if (score === undefined) return 'Non noté';
  return SCORE_LABELS[`${Math.round(Math.max(-2, Math.min(2, score)))}`];
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

export const AGREEMENT_META: Record<Agreement, { label: string; plural: string; color: string; description: string }> = {
  // Neutral palette on purpose: a different perspective is not a wrong answer.
  desaccord: {
    label: 'Regard différent',
    plural: 'Regards différents',
    color: '#7E57C2',
    description: "Vous voyez cette carte autrement que l'étude",
  },
  nuance: {
    label: 'Regard proche',
    plural: 'Regards proches',
    color: '#42A5F5',
    description: 'Même tendance, intensité différente',
  },
  accord: {
    label: 'Même regard',
    plural: 'Mêmes regards',
    color: '#26A69A',
    description: "Vous voyez cette carte comme l'étude",
  },
};

export const AGREEMENT_ORDER: Agreement[] = ['desaccord', 'nuance', 'accord'];

export function agreementOf(gap: number): Agreement {
  if (gap >= 2) return 'desaccord';
  if (gap >= 1) return 'nuance';
  return 'accord';
}

export function gapLabel(gap: number): string {
  if (gap === 0) return 'Même note';
  return `Écart : ${gap} point${gap > 1 ? 's' : ''}`;
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
