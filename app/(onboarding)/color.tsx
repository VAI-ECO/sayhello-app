/**
 * ONBOARDING SCREEN 6: IDENTITY COLOR PICKER
 *
 * ⚠️ ONE SCREEN, all ten shown as Waverly already wearing each color
 * ⚠️ Tap fills the large preview and re-themes the app instantly
 * ⚠️ Then a confirmation: Waverly waves ONCE in their color
 */

import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button, Waverly } from '../../src/components';
import { t } from '../../src/i18n';
import { useTheme, Colors, PickableColors, ColorNames, type IdentityColor } from '../../src/theme';
import { api } from '../../src/api/client';

export default function ColorScreen() {
  const router = useRouter();
  const { identityColor, setIdentityColor } = useTheme();
  const [selectedColor, setSelectedColor] = useState<IdentityColor>(identityColor);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleColorSelect = (color: IdentityColor) => {
    setSelectedColor(color);
    setIdentityColor(color);
    setConfirmed(false);
    setError(null);
  };

  const handleConfirm = async () => {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }

    setLoading(true);
    setError(null);
    const result = await api.user.updateProfile({ identityColor: selectedColor });
    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    router.push('/(onboarding)/gender');
  };

  const colorName = ColorNames[selectedColor];

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('onboarding.color.title')}</Text>
          <Text style={styles.subtitle}>{t('onboarding.color.subtitle')}</Text>

          <View style={styles.previewContainer}>
            <Waverly size={160} color={selectedColor} wave={confirmed} />
          </View>

          {confirmed && (
            <Text style={styles.confirmation}>
              {t('onboarding.color.confirm', { color: colorName })}
            </Text>
          )}

          <View style={styles.colorGrid}>
            {PickableColors.map((color) => (
              <TouchableOpacity
                key={color}
                accessibilityRole="button"
                accessibilityLabel={`Choose ${ColorNames[color]}`}
                accessibilityState={{ selected: selectedColor === color, disabled: loading }}
                disabled={loading}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColor,
                ]}
                onPress={() => handleColorSelect(color)}
                activeOpacity={0.8}
              >
                {selectedColor === color && (
                  <View style={styles.selectedIndicator}>
                    <Text style={styles.checkmark}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {error && <Text accessibilityRole="alert" style={{ color: Colors.SignalRed }}>{error}</Text>}
        <Button
          title={confirmed ? t('onboarding.color.continue') : t('common.continue')}
          onPress={handleConfirm}
          loading={loading}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.Ink,
    marginBottom: 8,
    letterSpacing: -0.7,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.Ink,
    opacity: 0.7,
    marginBottom: 32,
    letterSpacing: -0.3,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  confirmation: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.Ink,
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: -0.4,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  colorButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColor: {
    borderWidth: 4,
    borderColor: Colors.Ink,
  },
  selectedIndicator: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  checkmark: {
    fontSize: 32,
    color: Colors.Chalk,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
});
