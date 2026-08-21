import React, { useRef, useState, useCallback } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
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
// Space the headline / dots / legend / hint need around the card
const CHROME_HEIGHT = 260;
const IMAGE_RATIO = 1.05; // image height / card width

/**
 * Snap carousel: the focused card is centred and full size, its neighbours
 * peek in from both sides, slightly smaller and faded — cards laid on a table.
 */
export function CarouselView({ entries, onSelect }: CarouselViewProps) {
  const { width, height } = useWindowDimensions();
  // As wide as the viewport allows (keeping a peek on each side), but never
  // so tall that the card pushes the dots and hint off-screen.
  const maxByHeight = (height - CHROME_HEIGHT - 120) / (IMAGE_RATIO + 0.55);
  const cardWidth = Math.max(220, Math.min(width * 0.76, MAX_CARD, maxByHeight));
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

      {/* ScrollView, not FlatList: with 15 cards virtualisation only causes
          remounts, and a remount replays the entrance mid-scroll (web breaks). */}
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
  container: { flex: 1, justifyContent: 'center', gap: space.md, paddingVertical: space.sm },
  list: { flexGrow: 0 },
  top: { gap: space.xs },
});
