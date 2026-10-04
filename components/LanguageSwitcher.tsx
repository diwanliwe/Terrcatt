import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useCards } from '@/context/CardContext';
import { LANGUAGES } from '@/i18n';

/**
 * FR / EN / IT segmented switch. `onPhoto` is the translucent dark variant used
 * over the welcome photograph; the default suits the light pages.
 */
export function LanguageSwitcher({ onPhoto = false }: { onPhoto?: boolean }) {
  const { state, setLanguage } = useCards();

  return (
    <View style={[styles.group, onPhoto ? styles.groupOnPhoto : styles.groupOnLight]} accessibilityRole="radiogroup">
      {LANGUAGES.map((lang) => {
        const active = state.language === lang.code;
        return (
          <Pressable
            key={lang.code}
            onPress={() => setLanguage(lang.code)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={lang.name}
            hitSlop={4}
            style={({ pressed }) => [
              styles.option,
              active && (onPhoto ? styles.optionActiveOnPhoto : styles.optionActiveOnLight),
              pressed && !active && { opacity: 0.6 },
            ]}
          >
            <Text
              style={[
                styles.label,
                onPhoto ? styles.labelOnPhoto : styles.labelOnLight,
                active && (onPhoto ? styles.labelActiveOnPhoto : styles.labelActiveOnLight),
              ]}
            >
              {lang.short}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    borderRadius: 999,
    padding: 3,
    gap: 2,
  },
  groupOnPhoto: {
    backgroundColor: 'rgba(20,14,8,0.45)',
  },
  groupOnLight: {
    backgroundColor: '#F1ECE6',
  },
  option: {
    minWidth: 38,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    alignItems: 'center',
  },
  optionActiveOnPhoto: {
    backgroundColor: '#FFFFFF',
  },
  optionActiveOnLight: {
    backgroundColor: '#C4956A',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  labelOnPhoto: {
    color: 'rgba(255,255,255,0.85)',
  },
  labelOnLight: {
    color: '#8A6240',
  },
  labelActiveOnPhoto: {
    color: '#2B2620',
  },
  labelActiveOnLight: {
    color: '#FFFFFF',
  },
});
