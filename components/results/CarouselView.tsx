import React, { useRef, useState, useCallback } from 'react';
import { StyleSheet, View, useWindowDimensions, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { ResultEntry } from './resultsData';
import { ResultCard } from './ResultCard';
import { Headline, AgreementDots, TapHint } from './SummaryHeader';
import { space } from './theme';
import { Reveal, TIMING } from './Reveal';

interface CarouselViewProps {
  entries: ResultEntry[];
  onSelect: (entry: ResultEntry) => void;
}

const GAP = 14;
const MAX_CARD = 380;
const MIN_CARD = 200;
const IMAGE_RATIO = 1; // image height / card width (artwork is square)
// Footer of a ResultCard (name + score chips + agreement label, with padding
// and border) before it is measured: 2*16 + 22 + 8 + (18 + 4 + 30) + 8 + 22 + 8.
const FOOTER_FALLBACK = 152;

/**
 * Snap carousel: the focused card is centred and full size, its neighbours
 * peek in from both sides, slightly smaller and faded — cards laid on a table.
 */
export function CarouselView({ entries, onSelect }: CarouselViewProps) {
  const { width } = useWindowDimensions();
  // The card fills whatever is left between the headline and the dots. That
  // space is measured (onLayout), not estimated: the headline wraps to two or
  // three lines and the legend to one or two depending on the phone, and a
  // wrong estimate clipped the card top and bottom on small screens.
  const [middleHeight, setMiddleHeight] = useState<number | null>(null);
  const [footerHeight, setFooterHeight] = useState(FOOTER_FALLBACK);
  const onMiddleLayout = useCallback((e: LayoutChangeEvent) => {
    const h = Math.round(e.nativeEvent.layout.height);
    setMiddleHeight((prev) => (prev === h ? prev : h));
  }, []);
  const onFooterHeight = useCallback((h: number) => {
    const r = Math.round(h);
    setFooterHeight((prev) => (prev === r ? prev : r));
  }, []);
  const maxByHeight = middleHeight === null
    ? Infinity
    : (middleHeight - 2 * space.md - footerHeight) / IMAGE_RATIO;
  const cardWidth = Math.max(MIN_CARD, Math.min(width * 0.76, MAX_CARD, maxByHeight));
  const interval = cardWidth + GAP;
  const sidePadding = (width - cardWidth) / 2;

  const scrollX = useSharedValue(0);
  const listRef = useRef<Animated.ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateIndex = useCallback((i: number) => {
    setActiveIndex((prev) => (prev === i ? prev : i));
  }, []);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
    const i = Math.round(e.contentOffset.x / interval);
    runOnJS(updateIndex)(Math.max(0, Math.min(entries.length - 1, i)));
  });

  const scrollTo = useCallback((i: number) => {
    listRef.current?.scrollTo({ x: i * interval, animated: true });
  }, [interval]);

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Reveal kind="down" delay={TIMING.title}><Headline entries={entries} /></Reveal>
        <Reveal kind="down" delay={TIMING.hint}><TapHint /></Reveal>
      </View>

      {/* ScrollView, not FlatList: with 18 cards virtualisation only causes
          remounts, and a remount replays the entrance mid-scroll (web breaks). */}
      <View style={styles.middle} onLayout={onMiddleLayout}>
      <Animated.ScrollView
        ref={listRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={interval}
        decelerationRate="fast"
        disableIntervalMomentum
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: sidePadding, gap: GAP, alignItems: 'center' }}
        style={styles.list}
      >
        {entries.map((item, index) => {
          const card = (
            <CarouselItem key={item.card.id} index={index} interval={interval} scrollX={scrollX}>
              <ResultCard
                entry={item}
                width={cardWidth}
                imageRatio={IMAGE_RATIO}
                onFooterHeight={index === 0 ? onFooterHeight : undefined}
                onPress={() => onSelect(item)}
              />
            </CarouselItem>
          );
          // Only the cards visible on arrival get an entrance; the rest are
          // simply there when you scroll to them.
          if (index > 2) return card;
          return (
            <Reveal
              key={item.card.id}
              kind={index === 0 ? 'hero' : 'heroSide'}
              side={1}
              delay={index === 0 ? TIMING.cards : TIMING.heroSides + (index - 1) * 120}
            >
              {card}
            </Reveal>
          );
        })}
      </Animated.ScrollView>
      </View>

      <AgreementDots entries={entries} activeIndex={activeIndex} onDotPress={scrollTo} animateFrom={TIMING.dots} />
    </View>
  );
}

interface CarouselItemProps {
  index: number;
  interval: number;
  scrollX: SharedValue<number>;
  children: React.ReactNode;
}

function CarouselItem({ index, interval, scrollX, children }: CarouselItemProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * interval, index * interval, (index + 1) * interval];
    return {
      transform: [
        { scale: interpolate(scrollX.value, inputRange, [0.88, 1, 0.88], Extrapolation.CLAMP) },
      ],
      opacity: interpolate(scrollX.value, inputRange, [0.55, 1, 0.55], Extrapolation.CLAMP),
    };
  });
  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  // Top / flexible middle / bottom: the headline replaces the tab header, the
  // dots + legend anchor above the tab bar, the card floats centred between.
  container: { flex: 1, paddingTop: space.xs, paddingBottom: space.sm },
  top: { gap: space.xs },
  middle: { flex: 1, justifyContent: 'center', paddingVertical: space.md },
  // Never let the list shrink to the middle box: a mismatch of a few px must
  // overflow, not clip the card.
  list: { flexGrow: 0, flexShrink: 0 },
});
