/**
 * Languages of the game. French is the reference (the research method, the card
 * artwork and the study texts are French); English and Italian are translations.
 * Kept free of React and of the app state so the store can import it.
 */

export type Language = 'fr' | 'en' | 'it';

export const LANGUAGES: { code: Language; short: string; name: string }[] = [
  { code: 'fr', short: 'FR', name: 'Français' },
  { code: 'en', short: 'EN', name: 'English' },
  { code: 'it', short: 'IT', name: 'Italiano' },
];

/** Numeric code for the event log (`events.value`), which only stores numbers. */
export const LANGUAGE_CODES: Record<Language, number> = { fr: 0, en: 1, it: 2 };

export function isLanguage(value: unknown): value is Language {
  return value === 'fr' || value === 'en' || value === 'it';
}

/**
 * First supported language in the visitor's preferences (browser or device),
 * French otherwise. Only used for a brand-new participant; after that the
 * choice is stored with the rest of the state.
 */
export function detectLanguage(): Language {
  const tags: string[] = [];
  if (typeof navigator !== 'undefined') {
    if (Array.isArray(navigator.languages)) tags.push(...navigator.languages);
    if (typeof navigator.language === 'string') tags.push(navigator.language);
  }
  try {
    tags.push(Intl.DateTimeFormat().resolvedOptions().locale);
  } catch {
    // Intl unavailable: fall through to French.
  }
  for (const tag of tags) {
    const code = tag.slice(0, 2).toLowerCase();
    if (isLanguage(code)) return code;
  }
  return 'fr';
}
