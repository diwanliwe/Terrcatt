import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Image, useWindowDimensions } from 'react-native';
import { CardData } from '@/context/CardContext';

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
}

export function Card({ card, style, size = 'normal', rank }: CardProps) {
  const { cardWidth, cardHeight } = useCardSize();
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
      <View style={[styles.inner, innerStyle]}>
        <Image source={card.image} style={styles.image} resizeMode="cover" />
        {rank !== undefined && (
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>#{rank}</Text>
          </View>
        )}
      </View>
    </View>
  );
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
