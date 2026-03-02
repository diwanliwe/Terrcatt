import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Image, Dimensions } from 'react-native';
import { CardData } from '@/context/CardContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const LARGE_WIDTH = SCREEN_WIDTH * 0.7;
const LARGE_HEIGHT = LARGE_WIDTH * 1.1;

interface CardProps {
  card: CardData;
  style?: ViewStyle;
  size?: 'normal' | 'small' | 'medium' | 'large';
  rank?: number;
}

export function Card({ card, style, size = 'normal', rank }: CardProps) {
  const shadowStyle =
    size === 'small' ? styles.shadowSmall :
    size === 'medium' ? styles.shadowMedium :
    size === 'large' ? styles.shadowLarge : null;
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
    height: 280,
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
    backgroundColor: '#000',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#DEDDDA',
  },
  shadowSmall: {
    width: 80,
    height: 112,
    borderRadius: 8,
  },
  innerSmall: {
    borderRadius: 8,
  },
  shadowMedium: {
    width: 140,
    height: 196,
    borderRadius: 12,
  },
  innerMedium: {
    borderRadius: 12,
  },
  shadowLarge: {
    width: LARGE_WIDTH,
    height: LARGE_HEIGHT,
    borderRadius: 20,
  },
  innerLarge: {
    borderRadius: 20,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
    transform: [{ scale: 1.05 }],
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
