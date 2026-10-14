/**
 * ONBOARDING — ONE ICEBREAKER PER SCREEN (CANON-RL-01-SN-22; RULES §13.10-13.11)
 *
 * The server's signup subset, one question at a time; choices are tappable cards. Skip is always
 * available and never a no (§13.11). Every answer is saved the moment Next is pressed
 * (POST /icebreakers/answers) so leaving loses nothing (§26.7). Types: single / multiple choice
 * (+ optional text), short answer, and slider shown as numbered cards when the range is small;
 * a slider with a wide range is skipped here and stays answerable in Settings → Icebreakers.
 */
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer, Button, TextInput } from '../../src/components';
import { api } from '../../src/api/client';
import { deviceLocale } from '../../src/lib/phone';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme';

type Q = { id: string; questionText: string; questionType: string; sliderMin?: number | null; sliderMax?: number | null; isShownAtSignup?: boolean; displayOrder?: number };
type Opt = { id: string; optionText: string };

const SLIDER_CARD_LIMIT = 11;

export default function IcebreakerQuestion() {
  const router = useRouter();
  const { i } = useLocalSearchParams<{ i?: string }>();
  const index = Math.max(0, parseInt(i ?? '0', 10) || 0);
  const [questions, setQuestions] = useState<Q[] | null>(null);
  const [options, setOptions] = useState<Opt[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [slider, setSlider] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const busy = useRef(false);

  useEffect(() => {
    let live = true;
    void api.icebreakers.getQuestions().then(res => {
      if (!live) return;
      const list = (res.data as { questions?: Q[] } | undefined)?.questions;
      const subset = Array.isArray(list)
        ? list.filter(q => q.isShownAtSignup).filter(q => q.questionType !== 'slider' || (q.sliderMin != null && q.sliderMax != null && q.sliderMax - q.sliderMin < SLIDER_CARD_LIMIT))
        : [];
      setQuestions(subset);
    });
    return () => { live = false; };
  }, []);

  const q = questions?.[index];
  useEffect(() => {
    setPicked([]); setText(''); setSlider(null); setOptions([]); setError('');
    if (!q || !['single_choice', 'multiple_choice', 'choice_plus_text'].includes(q.questionType)) return;
    let live = true;
    void api.get<{ options?: Opt[] }>(`/icebreakers/questions/${q.id}/options`).then(res => {
      if (live) setOptions(res.data?.options ?? []);
    });
    return () => { live = false; };
  }, [q?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const goNext = () => {
    if (questions && index + 1 < questions.length) router.replace(`/(onboarding)/icebreaker-question?i=${index + 1}` as never);
    else router.replace('/(onboarding)/done');
  };

  if (questions === null) {
    return <ScreenContainer><View style={styles.center}><ActivityIndicator size="large" color={Colors.Ink} /></View></ScreenContainer>;
  }
  if (!q) {
    // Ran off the end (or nothing to ask): carry on.
    setTimeout(() => router.replace('/(onboarding)/done'), 0);
    return <ScreenContainer><View style={styles.center}><ActivityIndicator size="large" color={Colors.Ink} /></View></ScreenContainer>;
  }

  const multi = q.questionType === 'multiple_choice';
  const hasText = q.questionType === 'short_answer' || q.questionType === 'choice_plus_text';
  const answered = picked.length > 0 || text.trim().length > 0 || slider !== null;

  const toggle = (id: string) => setPicked(prev => multi ? (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]) : [id]);

  const save = async () => {
    if (busy.current) return;
    if (!answered) { goNext(); return; }
    busy.current = true;
    setSaving(true);
    setError('');
    const body: { selectedOptionIds?: string[]; freeTextAnswer?: string; sliderValue?: number; contentLanguage?: string } = { contentLanguage: deviceLocale() };
    if (picked.length) body.selectedOptionIds = picked;
    if (text.trim()) body.freeTextAnswer = text.trim();
    if (slider !== null) body.sliderValue = slider;
    const res = await api.icebreakers.saveAnswer(q.id, body);
    busy.current = false;
    setSaving(false);
    if (res.error) { setError(t('s2c.onboardingIce.saveFailed')); return; }
    goNext();
  };

  const sliderValues = q.questionType === 'slider' && q.sliderMin != null && q.sliderMax != null
    ? Array.from({ length: q.sliderMax - q.sliderMin + 1 }, (_, k) => (q.sliderMin as number) + k) : [];

  return (
    <ScreenContainer>
      <View style={styles.top}>
        <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/(onboarding)/icebreakers'))} accessibilityRole="button" accessibilityLabel={t('s2c.common.back')} testID="ice-back">
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goNext} accessibilityRole="button" testID="ice-skip">
          <Text style={styles.skip}>{t('s2c.onboardingIce.skip')}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.column}>
          <Text style={styles.title} accessibilityRole="header">{q.questionText}</Text>
          {options.map(o => {
            const on = picked.includes(o.id);
            return (
              <TouchableOpacity key={o.id} style={[styles.card, on && styles.cardOn]} onPress={() => toggle(o.id)} accessibilityRole={multi ? 'checkbox' : 'radio'} accessibilityState={{ selected: on, checked: on }} testID={`ice-option-${o.id}`}>
                <Text style={[styles.cardText, on && styles.cardTextOn]}>{o.optionText}</Text>
              </TouchableOpacity>
            );
          })}
          {sliderValues.length > 0 ? (
            <View style={styles.numbers}>
              {sliderValues.map(v => (
                <TouchableOpacity key={v} style={[styles.num, slider === v && styles.cardOn]} onPress={() => setSlider(v)} accessibilityRole="radio" accessibilityState={{ selected: slider === v }}>
                  <Text style={[styles.cardText, slider === v && styles.cardTextOn]}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
          {hasText ? (
            <TextInput value={text} onChangeText={setText} placeholder={t('s2c.onboardingIce.typeHere')} multiline maxLength={500} testID="ice-text" />
          ) : null}
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button title={index + 1 < (questions?.length ?? 0) ? t('s2c.onboardingIce.next') : t('s2c.onboardingIce.finish')} onPress={() => void save()} loading={saving} testID="ice-next" />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  top: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  back: { fontSize: 22, color: Colors.Ink },
  skip: { fontSize: 16, fontWeight: '700', color: Colors.HelloBlue },
  scroll: { paddingBottom: 130 },
  column: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: 12 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.Ink, letterSpacing: -0.7, marginVertical: 18 },
  card: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 16, backgroundColor: Colors.Chalk },
  cardOn: { backgroundColor: Colors.Ink, borderColor: Colors.Ink },
  cardText: { fontSize: 17, color: Colors.Ink, fontWeight: '600' },
  cardTextOn: { color: Colors.Chalk },
  numbers: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  num: { minWidth: 52, alignItems: 'center', borderWidth: 1, borderColor: Colors.Line, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 12, backgroundColor: Colors.Chalk },
  error: { fontSize: 14, color: Colors.SignalRed },
  footer: { position: 'absolute', bottom: 24, left: 24, right: 24, alignItems: 'center' },
});
