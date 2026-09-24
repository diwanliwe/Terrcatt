import React from 'react';
import { StyleSheet, View, Text, Image, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { InstallGuide } from '@/components/InstallGuide';
import { MAX_LAYOUT_WIDTH } from '@/components/Card';

/** How to add Terrcatt to the home screen. Reached from « En savoir plus ». */
export default function InstallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.page, { paddingTop: insets.top + 10 }]}>
      <View style={styles.backRow}>
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
          <FontAwesome name="chevron-left" size={16} color="#2B2B2B" />
          <Text style={styles.backText}>En savoir plus</Text>
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.column}>
          <Image source={require('@/assets/images/icon.png')} style={styles.appIcon} />
          <Text style={styles.title}>Installer Terrcatt</Text>
          <InstallGuide />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FDFCFA' },
  backRow: { width: '100%', maxWidth: MAX_LAYOUT_WIDTH, alignSelf: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingVertical: 6 },
  backText: { fontSize: 15, fontWeight: '600', color: '#2B2B2B' },
  content: { paddingHorizontal: 20 },
  column: { width: '100%', maxWidth: MAX_LAYOUT_WIDTH, alignSelf: 'center', alignItems: 'center', gap: 16 },
  appIcon: { width: 96, height: 96, borderRadius: 22, marginTop: 8 },
  title: { fontSize: 24, fontWeight: '700', color: '#333', textAlign: 'center' },
});
