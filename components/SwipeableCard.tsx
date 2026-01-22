import React from 'react';
import { StyleSheet, Dimensions, View, Text } from 'react-native';
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
import { Card } from './Card';
import { CardData } from '@/context/CardContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD_X = SCREEN_WIDTH * 0.25;
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
}

export function SwipeableCard({
  card,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  labels = { right: 'Favorable', left: 'Unfavorable', up: 'Neutral' }
}: SwipeableCardProps) {
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
        translateY.value = withTiming(-SCREEN_HEIGHT, { duration: 300 });
        runOnJS(onSwipeUp)();
      } else if (event.translationX > SWIPE_THRESHOLD_X) {
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 300 });
        runOnJS(onSwipeRight)();
      } else if (event.translationX < -SWIPE_THRESHOLD_X) {
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 300 });
        runOnJS(onSwipeLeft)();
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
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

  const rightOpacity = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD_X],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const leftOpacity = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD_X, 0],
      [1, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const upOpacity = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [-SWIPE_THRESHOLD_Y, 0],
      [1, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, cardStyle]}>
        <Card card={card} />
        <Animated.View style={[styles.label, styles.rightLabel, rightOpacity]}>
          <Text style={[styles.labelText, styles.rightLabelText]}>{labels.right}</Text>
        </Animated.View>
        <Animated.View style={[styles.label, styles.leftLabel, leftOpacity]}>
          <Text style={[styles.labelText, styles.leftLabelText]}>{labels.left}</Text>
        </Animated.View>
        {onSwipeUp && labels.up && (
          <Animated.View style={[styles.label, styles.upLabel, upOpacity]}>
            <Text style={[styles.labelText, styles.upLabelText]}>{labels.up}</Text>
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
  label: {
    position: 'absolute',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 3,
  },
  rightLabel: {
    top: 30,
    right: 10,
    borderColor: '#4CAF50',
  },
  leftLabel: {
    top: 30,
    left: 10,
    borderColor: '#F44336',
  },
  upLabel: {
    top: 10,
    left: '50%',
    marginLeft: -40,
    borderColor: '#9E9E9E',
  },
  labelText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rightLabelText: {
    color: '#4CAF50',
  },
  leftLabelText: {
    color: '#F44336',
  },
  upLabelText: {
    color: '#9E9E9E',
  },
});
