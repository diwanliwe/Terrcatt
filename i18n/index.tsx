import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import { useCards, CardData } from '@/context/CardContext';
import fr, { Strings } from './fr';
import en from './en';
import it from './it';
import { Language } from './language';

export * from './language';
export type { Strings };

const STRINGS: Record<Language, Strings> = { fr, en, it };

/** Texts of the player's current language. */
export function useT(): Strings {
  const { state } = useCards();
  return STRINGS[state.language] ?? fr;
}

export function useLanguage(): Language {
  return useCards().state.language;
}

/** Card title in the given language (French title as fallback). */
export function cardName(card: CardData, t: Strings): string {
  return t.cards[card.id]?.name ?? card.name;
}

/** Name of a -2…+2 score (« Très favorable »…), rounded and clamped. */
export function scoreName(score: number | undefined, t: Strings): string {
  if (score === undefined) return t.scale.notRated;
  const key = String(Math.round(Math.max(-2, Math.min(2, score)))) as '-2' | '-1' | '0' | '1' | '2';
  return t.scale[key];
}

/**
 * The French artwork has its title baked in; other languages use the title-less
 * artwork and draw the title themselves (see `Card`).
 */
export function cardArtwork(card: CardData, language: Language) {
  return language === 'fr' ? card.image : card.imageUntitled;
}

/**
 * Renders a translated string, turning `**…**` into bold key words so the text
 * can be skimmed. `strongStyle` styles the bold parts (e.g. a darker colour).
 */
export function Rich({
  text,
  style,
  strongStyle,
}: {
  text: string;
  style?: StyleProp<TextStyle>;
  strongStyle?: StyleProp<TextStyle>;
}) {
  const parts = text.split('**');
  return (
    <Text style={style}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <Text key={i} style={[{ fontWeight: '800' }, strongStyle]}>
            {part}
          </Text>
        ) : (
          part
        ),
      )}
    </Text>
  );
}
