import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Image } from 'react-native';
import { CardData } from '@/context/CardContext';

interface CardProps {
  card: CardData;
  style?: ViewStyle;
  size?: 'normal' | 'small' | 'medium';
  rank?: number;
}

export function Card({ card, style, size = 'normal', rank }: CardProps) {
  const sizeStyle = size === 'small' ? styles.cardSmall : size === 'medium' ? styles.cardMedium : null;
  const imageStyle = size === 'small' ? styles.imageSmall : size === 'medium' ? styles.imageMedium : styles.image;

  return (
    <View style={[styles.card, sizeStyle, style]}>
      <Image source={card.image} style={imageStyle} resizeMode="cover" />
      {rank !== undefined && (
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>#{rank}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    height: 280,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cardSmall: {
    width: 80,
    height: 112,
    borderRadius: 8,
  },
  cardMedium: {
    width: 140,
    height: 196,
    borderRadius: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageSmall: {
    width: '100%',
    height: '100%',
  },
  imageMedium: {
    width: '100%',
    height: '100%',
  },
  rankBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#007AFF',
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
