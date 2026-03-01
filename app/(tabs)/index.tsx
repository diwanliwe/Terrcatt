import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useCards } from '@/context/CardContext';
import { SwipeMode } from '@/components/SwipeMode';
import { CompareMode } from '@/components/CompareMode';
import { RateMode } from '@/components/RateMode';
import { GameModeModal, GameMode } from '@/components/GameModeModal';

const MODE_LABELS: Record<GameMode, string> = {
  swipe: 'Glisser',
  compare: 'Comparer',
  rate: 'Noter',
};

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const { state, setGameMode } = useCards();
  const [modalVisible, setModalVisible] = useState(false);

  const gameMode = state.gameMode;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.modePill, pressed && styles.modePillPressed]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.modePillText}>{MODE_LABELS[gameMode]}</Text>
          <FontAwesome name="chevron-down" size={12} color="#C4956A" />
        </Pressable>
      </View>

      <View style={styles.content}>
        {gameMode === 'swipe' && <SwipeMode />}
        {gameMode === 'compare' && <CompareMode />}
        {gameMode === 'rate' && <RateMode />}
      </View>

      <GameModeModal
        visible={modalVisible}
        currentMode={gameMode}
        onSelect={setGameMode}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFCFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F2',
    borderWidth: 1,
    borderColor: '#C4956A',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  modePillPressed: {
    opacity: 0.7,
  },
  modePillText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#C4956A',
  },
  content: {
    flex: 1,
  },
});
