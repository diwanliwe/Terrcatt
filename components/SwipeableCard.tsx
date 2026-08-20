import React from 'react';
import { StyleSheet, View, Text, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Card, MAX_LAYOUT_WIDTH, useCardSize } from './Card';
import { CardData } from '@/context/CardContext';

const SWIPE_THRESHOLD_Y = 100;

interface SwipeableCardProps {
  card: CardData;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp?: () => void;
  labels?: {
    right: string;
    left: string;
    up?: string;
  };
  colors?: {
    right: string;
    left: string;
    up?: string;
  };
}

export function SwipeableCard({
  card,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  labels = { right: 'Favorable', left: 'Défavorable', up: 'Neutre' },
  colors,
}: SwipeableCardProps) {
  const rightColor = colors?.right ?? '#4CAF50';
  const leftColor = colors?.left ?? '#F44336';
  const upColor = colors?.up ?? '#9E9E9E';
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { cardWidth } = useCardSize();
  const SWIPE_THRESHOLD_X = Math.min(screenWidth, MAX_LAYOUT_WIDTH) * 0.25;
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      // Check for swipe up first (if enabled)
      if (onSwipeUp && event.translationY < -SWIPE_THRESHOLD_Y && Math.abs(event.translationX) < SWIPE_THRESHOLD_X) {
        translateY.value = withTiming(-screenHeight, { duration: 300 });
        runOnJS(onSwipeUp)();
      } else if (event.translationX > SWIPE_THRESHOLD_X) {
        translateX.value = withTiming(screenWidth * 1.5, { duration: 300 });
        runOnJS(onSwipeRight)();
      } else if (event.translationX < -SWIPE_THRESHOLD_X) {
        translateX.value = withTiming(-screenWidth * 1.5, { duration: 300 });
        runOnJS(onSwipeLeft)();
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-screenWidth / 2, 0, screenWidth / 2],
      [-15, 0, 15],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const rightOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD_X],
      [0, 0.45],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const leftOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD_X, 0],
      [0.45, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const upOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [-SWIPE_THRESHOLD_Y, 0],
      [0.45, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const rightStampStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD_X * 0.5, SWIPE_THRESHOLD_X],
      [0, 0.5, 1],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD_X],
      [0.6, 1],
      Extrapolation.CLAMP
    );
    return { opacity, transform: [{ scale }, { rotate: '-15deg' }] };
  });

  const leftStampStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD_X, -SWIPE_THRESHOLD_X * 0.5, 0],
      [1, 0.5, 0],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD_X, 0],
      [1, 0.6],
      Extrapolation.CLAMP
    );
    return { opacity, transform: [{ scale }, { rotate: '15deg' }] };
  });

  const upStampStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [-SWIPE_THRESHOLD_Y, -SWIPE_THRESHOLD_Y * 0.5, 0],
      [1, 0.5, 0],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      translateY.value,
      [-SWIPE_THRESHOLD_Y, 0],
      [1, 0.6],
      Extrapolation.CLAMP
    );
    return { opacity, transform: [{ scale }] };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, cardStyle]}>
        <Card card={card} size="large" />

        {/* Color overlays on the card */}
        <Animated.View style={[styles.overlay, { backgroundColor: rightColor }, rightOverlayStyle]} />
        <Animated.View style={[styles.overlay, { backgroundColor: leftColor }, leftOverlayStyle]} />
        {onSwipeUp && (
          <Animated.View style={[styles.overlay, { backgroundColor: upColor }, upOverlayStyle]} />
        )}

        {/* Centered stamps */}
        <Animated.View style={[styles.stampContainer, rightStampStyle]}>
          <View style={[styles.stampBorder, { maxWidth: cardWidth * 0.85, borderColor: '#fff', backgroundColor: rightColor + '80' }]}>
            <Text style={[styles.stampText, { color: '#fff' }]} numberOfLines={1} adjustsFontSizeToFit>{labels.right}</Text>
          </View>
        </Animated.View>
        <Animated.View style={[styles.stampContainer, leftStampStyle]}>
          <View style={[styles.stampBorder, { maxWidth: cardWidth * 0.85, borderColor: '#fff', backgroundColor: leftColor + '80' }]}>
            <Text style={[styles.stampText, { color: '#fff' }]} numberOfLines={1} adjustsFontSizeToFit>{labels.left}</Text>
          </View>
        </Animated.View>
        {onSwipeUp && labels.up && (
          <Animated.View style={[styles.stampContainer, upStampStyle]}>
            <View style={[styles.stampBorder, { maxWidth: cardWidth * 0.85, borderColor: '#fff', backgroundColor: upColor + '80' }]}>
              <Text style={[styles.stampText, { color: '#fff' }]} numberOfLines={1} adjustsFontSizeToFit>{labels.up}</Text>
            </View>
          </Animated.View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  // Overlay colors are now applied inline via the colors prop
  stampContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stampBorder: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 4,
    borderRadius: 8,
  },
  // Stamp border colors are now applied inline via the colors prop
  stampText: {
    fontSize: 32,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  // Stamp text colors are now applied inline
});
