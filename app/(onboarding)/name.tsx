/**
 * ONBOARDING SCREEN 4: NAME + DATE OF BIRTH
 *
 * ⚠️ 18+ only - block anyone not 18+
 */

import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button, TextInput } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme';
import { api } from '../../src/api/client';

export default function NameScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateAge = (birthYear: number, birthMonth: number, birthDay: number): number => {
    const today = new Date();
    const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const handleContinue = async () => {
    if (!name.trim()) {
      setError(t('onboarding.name.error'));
      return;
    }

    const birthMonth = parseInt(month, 10);
    const birthDay = parseInt(day, 10);
    const birthYear = parseInt(year, 10);

    if (!birthMonth || !birthDay || !birthYear || birthMonth < 1 || birthMonth > 12 || birthDay < 1 || birthDay > 31) {
      setError('Enter a valid date');
      return;
    }

    const age = calculateAge(birthYear, birthMonth, birthDay);

    if (age < 18) {
      Alert.alert('Age Requirement', t('onboarding.birthday.error'));
      return;
    }

    setError('');
    setLoading(true);

    const result = await api.user.updateProfile({
      name: name.trim(),
      dateOfBirth: `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`,
    });

    setLoading(false);

    if (result.error) {
      Alert.alert('Error', result.error.message);
      return;
    }

    router.push('/(onboarding)/photo');
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <View>
          <Text style={styles.title}>{t('onboarding.name.title')}</Text>

          <TextInput
            value={name}
            onChangeText={(text) => {
              setName(text);
              setError('');
            }}
            placeholder={t('onboarding.name.placeholder')}
            textContentType="name"
            autoFocus
            error={!!error && !name.trim()}
          />

          <Text style={styles.title}>{t('onboarding.birthday.title')}</Text>
          <Text style={styles.subtitle}>{t('onboarding.birthday.subtitle')}</Text>

          <View style={styles.dateRow}>
            <View style={styles.dateInput}>
              <Text style={styles.dateLabel}>{t('onboarding.birthday.month')}</Text>
              <TextInput
                value={month}
                onChangeText={(text) => {
                  setMonth(text.slice(0, 2));
                  setError('');
                }}
                placeholder="MM"
                keyboardType="number-pad"
                maxLength={2}
                error={!!error}
              />
            </View>

            <View style={styles.dateInput}>
              <Text style={styles.dateLabel}>{t('onboarding.birthday.day')}</Text>
              <TextInput
                value={day}
                onChangeText={(text) => {
                  setDay(text.slice(0, 2));
                  setError('');
                }}
                placeholder="DD"
                keyboardType="number-pad"
                maxLength={2}
                error={!!error}
              />
            </View>

            <View style={[styles.dateInput, { flex: 1.5 }]}>
              <Text style={styles.dateLabel}>{t('onboarding.birthday.year')}</Text>
              <TextInput
                value={year}
                onChangeText={(text) => {
                  setYear(text.slice(0, 4));
                  setError('');
                }}
                placeholder="YYYY"
                keyboardType="number-pad"
                maxLength={4}
                error={!!error}
              />
            </View>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title={t('onboarding.birthday.continue')}
          onPress={handleContinue}
          loading={loading}
          disabled={!name.trim() || !month || !day || !year}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.Ink,
    marginBottom: 16,
    letterSpacing: -0.7,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.Ink,
    opacity: 0.7,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInput: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    color: Colors.Ink,
    marginBottom: 8,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
    color: Colors.SignalRed,
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
});
