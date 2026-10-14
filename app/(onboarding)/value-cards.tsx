/**
 * ONBOARDING SCREEN 1: VALUE CARDS
 *
 * Shows 3 value proposition cards with placeholder copy
 */

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button, Waverly } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme';

export default function ValueCardsScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Waverly size={100} />
        </View>

        <View style={styles.cards}>
          <ValueCard
            title={t('onboarding.value1.title')}
            body={t('onboarding.value1.body')}
          />
          <ValueCard
            title={t('onboarding.value2.title')}
            body={t('onboarding.value2.body')}
          />
          <ValueCard
            title={t('onboarding.value3.title')}
            body={t('onboarding.value3.body')}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={t('common.continue')}
          onPress={() => router.push('/(onboarding)/phone')}
        />
      </View>
    </ScreenContainer>
  );
}

function ValueCard({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardBody}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  cards: {
    gap: 20,
  },
  card: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: Colors.Chalk,
    borderWidth: 2,
    borderColor: Colors.Ink,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.Ink,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  cardBody: {
    fontSize: 16,
    color: Colors.Ink,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
});
