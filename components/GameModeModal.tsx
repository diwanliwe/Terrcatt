import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, Modal, Animated, Dimensions } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export type GameMode = 'swipe' | 'compare' | 'rate';

interface GameModeOption {
  mode: GameMode;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  description: string;
}

const MODES: GameModeOption[] = [
  {
    mode: 'swipe',
    icon: 'hand-pointer-o',
    label: 'Glisser',
    description: 'Classez les cartes en glissant à droite, gauche ou vers le haut',
  },
  {
    mode: 'compare',
    icon: 'balance-scale',
    label: 'Comparer',
    description: 'Choisissez la carte la plus favorable entre deux options',
  },
  {
    mode: 'rate',
    icon: 'star',
    label: 'Noter',
    description: 'Attribuez une note de -2 à +2 à chaque carte',
  },
];

interface GameModeModalProps {
  visible: boolean;
  currentMode: GameMode;
  onSelect: (mode: GameMode) => void;
  onClose: () => void;
}

export function GameModeModal({ visible, currentMode, onSelect, onClose }: GameModeModalProps) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }).start();
    } else {
      slideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <Pressable onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>Choisir un mode de jeu</Text>

          {MODES.map((option) => {
            const isActive = option.mode === currentMode;
            return (
              <Pressable
                key={option.mode}
                style={({ pressed }) => [
                  styles.row,
                  isActive && styles.rowActive,
                  pressed && styles.rowPressed,
                ]}
                onPress={() => {
                  onSelect(option.mode);
                  handleClose();
                }}
              >
                <FontAwesome
                  name={option.icon}
                  size={22}
                  color={isActive ? '#C4956A' : '#666'}
                  style={styles.icon}
                />
                <View style={styles.textContainer}>
                  <Text style={[styles.label, isActive && styles.labelActive]}>
                    {option.label}
                  </Text>
                  <Text style={styles.description}>{option.description}</Text>
                </View>
                {isActive && (
                  <FontAwesome name="check" size={18} color="#C4956A" />
                )}
              </Pressable>
            );
          })}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  rowActive: {
    backgroundColor: '#FFF8F2',
    borderWidth: 1,
    borderColor: '#C4956A',
  },
  rowPressed: {
    opacity: 0.7,
  },
  icon: {
    width: 30,
    textAlign: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 14,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  labelActive: {
    color: '#C4956A',
  },
  description: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
});
