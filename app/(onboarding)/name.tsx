/**
 * ONBOARDING SCREEN 4: NAME + DATE OF BIRTH
 *
 * ⚠️ 18+ only - block anyone not 18+
 */

import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button, TextInput } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme';
import { api } from '../../src/api/client';
import { getPublicConfig } from '../../src/api/account';

/** A real calendar date that is not in the future (rejects 02/31, 13/01). */
function isRealPastDate(year: number, month: number, day: number): boolean {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false;
  if (year < 1000) return false;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return false;
  return date.getTime() <= Date.now();
}

export default function NameScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // True once a birthday has been below the minimum: the screen then reads "Have another go" (NEW-ONB-06).
  const [corrected, setCorrected] = useState(false);
  const busy = useRef(false);
  // The minimum age is the server's setting (RULES §24.1), never a constant here. Until it loads
  // the server alone decides (PATCH /users/me → age_requirement_not_met).
  const [minimumAge, setMinimumAge] = useState<number | null>(null);
  useEffect(() => {
    let live = true;
    void getPublicConfig().then(res => {
      if (live && res.data && Number.isInteger(res.data.minimumAge)) setMinimumAge(res.data.minimumAge);
    });
    return () => { live = false; };
  }, []);

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
    if (busy.current) return;
    if (!name.trim()) {
      setError(t('onboarding.name.error'));
      return;
    }

    const birthMonth = parseInt(month, 10);
    const birthDay = parseInt(day, 10);
    const birthYear = parseInt(year, 10);

    if (!isRealPastDate(birthYear, birthMonth, birthDay)) {
      setError(t('onboarding.birthday.invalid'));
      return;
    }

    // Fast path from the live minimum_age setting; the server checks the same birthday below.
    const age = calculateAge(birthYear, birthMonth, birthDay);

    if (minimumAge !== null && age < minimumAge) {
      setCorrected(true);
      router.push('/(onboarding)/under-18');
      return;
    }

    setError('');
    busy.current = true;
    setLoading(true);

    // The birthday is checked server-side against minimum_age and never
    // stored (RULES §24.4). Nothing is saved if it is below the minimum.
    const result = await api.user.updateProfile({
      displayName: name.trim(),
      dateOfBirth: `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`,
    });

    busy.current = false;
    setLoading(false);

    if (result.error) {
      if (result.error.code === 'age_requirement_not_met') {
        setCorrected(true);
        router.push('/(onboarding)/under-18');
        return;
      }
      setError(result.error.message || t('onboarding.name.saveFailed'));
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

          <Text style={styles.title}>{corrected ? t('onboarding.birthday.againTitle') : t('onboarding.birthday.title')}</Text>
          <Text style={styles.subtitle}>{corrected ? t('onboarding.birthday.againBody') : t('onboarding.birthday.subtitle')}</Text>

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

          {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title={corrected ? t('onboarding.birthday.againContinue') : t('onboarding.birthday.continue')}
          onPress={handleContinue}
          loading={loading}
          disabled={!name.trim() || !month || !day || !year}
        />
        {corrected ? <Button title={t('onboarding.birthday.goBack')} variant="secondary" onPress={() => router.back()} testID="birthday-go-back" /> : null}
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
