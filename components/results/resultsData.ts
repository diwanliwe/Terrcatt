import { CARDS, CardData, CardComment } from '@/context/CardContext';

// --- PLACEHOLDER: Replace with real terrain truth data ---
export const GROUND_TRUTH_SCORES: Record<number, number> = {
  1: 2, 2: -1, 3: -2, 4: 1, 5: -2, 6: 1, 7: 2, 8: 0,
  9: -1, 10: -1, 11: 0, 12: 2, 13: 0, 14: 2, 15: 1,
};

export const GROUND_TRUTH_EXPLANATIONS: Record<number, string> = {
  1: "Les oliviers en murette sont un indicateur fort de terrasses bien entretenues. Leur présence signale un système agricole traditionnel résilient et productif.",
  2: "Une pente forte augmente le risque d'érosion et rend la réhabilitation des terrasses plus difficile et coûteuse.",
  3: "La proximité d'une route facilite l'accès mais peut aussi fragmenter le paysage et augmenter les risques de ruissellement concentré.",
  4: "Un indice topographique d'humidité élevé indique une bonne rétention d'eau, favorable à la végétation et à la stabilité des terrasses.",
  5: "L'abandon prolongé des terrasses entraîne une dégradation rapide des murs de soutènement et une perte de la capacité de rétention d'eau.",
  6: "L'apiculture bénéficie de la biodiversité des terrasses fleuries et contribue à la pollinisation des cultures en terrasses.",
  7: "Un bon drainage est essentiel pour la stabilité des murs de terrasses et prévient les glissements de terrain lors de fortes pluies.",
  8: "La faune sauvage a un impact ambivalent : elle peut endommager les murs mais aussi contribuer à la dispersion des graines et à la biodiversité.",
  9: "L'hyper-pluviosité met à rude épreuve les terrasses, augmentant le risque d'effondrement des murs et de saturation des sols.",
  10: "L'irrégularité topographique complique la mécanisation et l'entretien régulier des terrasses.",
  11: "La pâture modérée peut aider à entretenir la végétation des terrasses, mais un surpâturage dégrade les sols et les murs.",
  12: "Le stockage d'eau est une fonction clé des terrasses, réduisant le ruissellement et augmentant la résilience face aux sécheresses.",
  13: "Le substrat géologique influence directement la stabilité des murs et la capacité de drainage naturel des terrasses.",
  14: "Les terrasses elles-mêmes sont le cœur du système : elles retiennent les sols, stockent l'eau et créent des microclimats favorables.",
  15: "L'utilisation agricole active des terrasses est le meilleur garant de leur entretien et de leur pérennité.",
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

export function hasComment(entry: ResultEntry): boolean {
  return !!(entry.comment && (entry.comment.text || entry.comment.audioUri));
}
