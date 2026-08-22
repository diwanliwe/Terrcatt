import React, { useRef, useState, useCallback } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
const IMAGE_RATIO = 1.05; // image height / card width
const CARD_FOOTER_RATIO = 0.55; // score strip under the image, as a fraction of card width
// Vertical room the chrome around the card takes (measured, not tuned):
// top block = 2-line title (64) + hint (22) + gap (8)  ≈ 94
// bottom block = dots (15, scaled) + legend (18) + gap (8) ≈ 41
// + the gaps above/below the card and the container padding.
const TOP_BLOCK = 94;
const BOTTOM_BLOCK = 41;
const SCREEN_TOP = 10; // must match the paddingTop in results.tsx
const TAB_BAR = 50;    // default bottom tab bar height (safe-area inset added separately)

/**
 * Snap carousel: the focused card is centred and full size, its neighbours
 * peek in from both sides, slightly smaller and faded — cards laid on a table.
 */
export function CarouselView({ entries, onSelect }: CarouselViewProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  // The page has no header: the headline is pinned to the top and the dots to
  // the bottom, and the card fills whatever is left in between. As wide as the
  // viewport allows (keeping a peek on each side), but never so tall that it
  // pushes the dots onto the tab bar.
  const usableHeight =
    height - insets.top - SCREEN_TOP - insets.bottom - TAB_BAR
    - space.xs - space.sm            // container padding
    - TOP_BLOCK - BOTTOM_BLOCK
    - 2 * space.md;                  // breathing room above and below the card
  const maxByHeight = usableHeight / (IMAGE_RATIO + CARD_FOOTER_RATIO);
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
      <View style={styles.middle}>
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
  list: { flexGrow: 0 },
});
