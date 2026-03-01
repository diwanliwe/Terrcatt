import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Linking } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const CONTACT_EMAIL = 'marianne.cohen@sorbonne-universite.fr';

export default function SettingsScreen() {
  const handleContact = () => {
    Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=Projet TTERCAT – Prise de contact`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>À propos</Text>
        <Text style={styles.paragraph}>
          Cette application est un prototype numérique d'une méthode participative de tri de cartes
          développée dans le cadre du projet TTERCAT (Terrasses de culture et reconstruction d'un
          territoire post-catastrophe).
        </Text>
        <Text style={styles.paragraph}>
          Le projet étudie les ~23 000 terrasses agricoles de la vallée de la Roya (Alpes françaises),
          largement abandonnées mais jouant un rôle clé dans la résilience face aux événements
          climatiques extrêmes comme la tempête Alex (octobre 2020).
        </Text>
      </View>

      <View style={styles.ctaBox}>
        <FontAwesome name="map-marker" size={24} color="#C4956A" style={styles.ctaIcon} />
        <Text style={styles.ctaTitle}>Un projet similaire pour votre territoire ?</Text>
        <Text style={styles.ctaDescription}>
          Vous êtes confronté à des enjeux de réhabilitation paysagère, de gestion participative
          du territoire ou de résilience post-catastrophe ? Contactez-nous pour explorer comment
          cette méthodologie peut s'adapter à votre contexte.
        </Text>
        <Pressable
          style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}
          onPress={handleContact}
        >
          <FontAwesome name="envelope" size={16} color="#fff" />
          <Text style={styles.ctaButtonText}>Nous contacter</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Méthodologie</Text>
        <Text style={styles.paragraph}>
          L'application s'appuie sur des méthodes éprouvées d'aide à la décision participative :
          analyse multicritère (MCDA), SIG participatif (PGIS), Q-Méthodologie pour identifier
          les archétypes de points de vue, et comparaisons par paires (CrowdBT) pour agréger
          les classements collectifs.
        </Text>
      </View>

      <Text style={styles.version}>TTERCAT v1.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFCFA',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
    marginBottom: 10,
  },
  ctaBox: {
    borderWidth: 1.5,
    borderColor: '#C4956A',
    backgroundColor: '#FFF8F2',
    borderRadius: 14,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  ctaIcon: {
    marginBottom: 10,
  },
  ctaTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C4956A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  ctaButtonPressed: {
    opacity: 0.8,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    color: '#aaa',
    marginTop: 10,
  },
});
