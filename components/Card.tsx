import React, { useState } from 'react';
import { View, Text, StyleSheet, ViewStyle, Image, useWindowDimensions, Platform } from 'react-native';
import { CardData } from '@/context/CardContext';
import { useLanguage, useT, cardName, cardArtwork } from '@/i18n';

// Cap the reference width so cards stay phone-sized on desktop browsers
export const MAX_LAYOUT_WIDTH = 500;
// Background colour of the card artwork, shown behind the image while it loads
export const CARD_BG = '#E3ECFF';

export function useCardSize() {
  const { width, height } = useWindowDimensions();
  // Fill the available space, but never so tall that the card collides with the
  // progress header and rating buttons (relevant on short/landscape web windows)
  const maxWidth = Math.min(width, MAX_LAYOUT_WIDTH) * 0.85;
  const maxHeight = height * 0.55;
  // Card artwork is square: the title is baked into the image, so the frame
  // must never crop it.
  const cardWidth = Math.min(maxWidth, maxHeight);
  return { cardWidth, cardHeight: cardWidth };
}

interface CardProps {
  card: CardData;
  style?: ViewStyle;
  size?: 'normal' | 'small' | 'medium' | 'large';
  rank?: number;
  /** Show the artwork without its title (expert mode). */
  untitled?: boolean;
}

export function Card({ card, style, size = 'normal', rank, untitled = false }: CardProps) {
  const { cardWidth, cardHeight } = useCardSize();
  const language = useLanguage();
  const t = useT();
  // Measured, because the card's size comes from its props, its size variant or its parent.
  const [width, setWidth] = useState(0);
  // French artwork has the title baked in. Other languages draw it on the
  // title-less artwork; expert mode shows no title at all.
  const drawTitle = !untitled && language !== 'fr';
  const shadowStyle =
    size === 'small' ? styles.shadowSmall :
    size === 'medium' ? styles.shadowMedium :
    size === 'large' ? [styles.shadowLarge, { width: cardWidth, height: cardHeight }] : null;
  const innerStyle =
    size === 'small' ? styles.innerSmall :
    size === 'medium' ? styles.innerMedium :
    size === 'large' ? styles.innerLarge : null;

  return (
    <View style={[styles.shadow, shadowStyle, style]}>
      <View style={[styles.inner, innerStyle]} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        <Image
          source={untitled ? card.imageUntitled : cardArtwork(card, language)}
          style={styles.image}
          resizeMode="cover"
        />
        {drawTitle && width > 0 && (
          <View style={[styles.titleBox, titleBox(width)]}>
            <Text style={[styles.title, titleFont(cardName(card, t), width)]} numberOfLines={3}>
              {cardName(card, t)}
            </Text>
          </View>
        )}
        {rank !== undefined && (
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>#{rank}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

/**
 * Anchored to the top like the designer's titles: some artwork (steep slope,
 * olive tree) reaches high up the card, so the title must stay in the top band.
 */
function titleBox(width: number) {
  return { top: width * 0.055, paddingHorizontal: width * 0.05 };
}

/** Same size as the designer's titles; long translated titles get smaller so they never get cut off. */
function titleFont(title: string, width: number) {
  const ratio = title.length <= 30 ? 0.068 : title.length <= 45 ? 0.058 : 0.052;
  return { fontSize: width * ratio, lineHeight: width * ratio * 1.18 };
}

const styles = StyleSheet.create({
  shadow: {
    width: 200,
    height: 200,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  inner: {
    width: '100%',
    height: '100%',
    backgroundColor: CARD_BG,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#DEDDDA',
  },
  shadowSmall: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  innerSmall: {
    borderRadius: 8,
  },
  shadowMedium: {
    width: 140,
    height: 140,
    borderRadius: 12,
  },
  innerMedium: {
    borderRadius: 12,
  },
  shadowLarge: {
    borderRadius: 20,
  },
  innerLarge: {
    borderRadius: 20,
  },
  image: {
    // Explicit size: RN-web renders the asset at its natural size when the
    // style has no width/height, which crops the square artwork.
    width: '100%',
    height: '100%',
  },
  // Drawn title (non-French cards): placed where the designer's title sits on the
  // French artwork, one or two centred lines in a bold sans-serif.
  titleBox: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  title: {
    color: '#111',
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: Platform.OS === 'web' ? 'Arial, Helvetica, sans-serif' : undefined,
  },
  rankBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#C4956A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rankText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
