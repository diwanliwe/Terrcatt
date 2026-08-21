import React, { useEffect } from 'react';
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import type { ViewStyle } from 'react-native';
import { useCards } from '@/context/CardContext';

type Kind = 'down' | 'up' | 'zoom' | 'drop' | 'hero' | 'heroSide';

interface RevealProps {
  /** Delay in ms before this element starts animating. */
  delay?: number;
  kind?: Kind;
  /** For 'heroSide': -1 comes from the left, +1 from the right. */
  side?: -1 | 1;
  style?: ViewStyle | ViewStyle[];
  children: React.ReactNode;
}

const soft = Easing.out(Easing.cubic);
const slow = Easing.bezier(0.16, 1, 0.3, 1); // long, decelerating tail — "settling" rather than "popping"

interface HeroProps {
  delay: number;
  side?: -1 | 1;
  style?: ViewStyle | ViewStyle[];
  children: React.ReactNode;
}

/**
 * The hero card rises slowly from just below its resting place, growing from
 * 94% to full size. No bounce: the card should feel like it is being set down
 * on the table, not thrown.
 *
 * Driven by shared values rather than an `entering` layout animation on
 * purpose: on web, Reanimated's custom-keyframe entering path later rewrites
 * the element to `position: absolute` from a stale snapshot (and throws if the
 * snapshot is missing), which breaks anything living inside a scroll view.
 */
function Hero({ delay, style, children }: HeroProps) {
  const progress = useSharedValue(0);
  const fade = useSharedValue(0);
  useEffect(() => {
    fade.value = withDelay(delay, withTiming(1, { duration: 700, easing: soft }));
    progress.value = withDelay(delay, withTiming(1, { duration: 1300, easing: slow }));
  }, []);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [
      { translateY: 36 * (1 - progress.value) },
      { scale: 0.94 + 0.06 * progress.value },
    ],
  }));
  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}

/** Neighbours glide in from their own side, slightly after the hero. */
function HeroSide({ delay, side = 1, style, children }: HeroProps) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration: 1000, easing: slow }));
  }, []);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateX: side * 48 * (1 - progress.value) }],
  }));
  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}

/**
 * Entrance animation wrapper. Every element on the results page comes in
 * through this, so the whole page shares one motion vocabulary.
 * Disabled globally via Paramètres → Animations.
 */
export function Reveal({ delay = 0, kind = 'up', side = 1, style, children }: RevealProps) {
  const { state } = useCards();
  if (!state.animationsEnabled) {
    return <Animated.View style={style}>{children}</Animated.View>;
  }
  if (kind === 'hero') return <Hero delay={delay} style={style}>{children}</Hero>;
  if (kind === 'heroSide') return <HeroSide delay={delay} side={side} style={style}>{children}</HeroSide>;
  // Presets only below: custom Keyframes are unsafe on web (see Hero).
  const entering =
    kind === 'down' ? FadeInDown.delay(delay).duration(500)
    : kind === 'zoom' ? ZoomIn.delay(delay).springify().damping(16).stiffness(140)
    : kind === 'drop' ? FadeInDown.delay(delay).springify().damping(12).stiffness(180)
    : FadeInUp.delay(delay).duration(550);
  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}

/** Shared timings so both views feel like one sequence. */
export const TIMING = {
  title: 0,
  hint: 250,
  cards: 450,
  cardStagger: 90,
  heroSides: 750,
  dots: 1200,
  dotStagger: 45,
};
