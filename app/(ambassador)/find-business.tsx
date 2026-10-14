/**
 * A8 FIND THE BUSINESS — CANON-RL-03-SN-01 (step 1 of 3).
 *
 * Search what is ALREADY in Say Hello (GET /ambassador/hangouts/lookup) so "Already signed"
 * is stated up front (§1.13 one Hello Hangout per location). Real distances are shown, from
 * the device's live reading — §8.12's no-distance rule is scoped to consumer surfaces.
 * "It isn't listed — add it" carries the typed name and address to the next step; the pin is
 * taken from the device at the door, not typed.
 *
 * Not built, recorded: the delivered design reads the Google Places list; no Places provider
 * is connected, so there are no "Not signed" candidates to pick from — an unlisted place is
 * added by hand (the design's own "add it" row).
 */

import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { lookupBusinesses, type LookupMatch } from '../../src/api/ambassador';
import { AmbassadorShell, Card, Eyebrow } from '../../src/components/ambassador/AmbassadorShell';
import { metresBetween, readDeviceFix, type DeviceFix } from '../../src/lib/device-fix';
import { distanceLabel } from '../../src/lib/ambassador-format';

const DEBOUNCE_MS = 350;

export default function FindBusinessScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<LookupMatch[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [fix, setFix] = useState<DeviceFix | null>(null);
  const [locating, setLocating] = useState(true);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const searchId = useRef(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    void (async () => {
      const result = await readDeviceFix();
      if (!mounted.current) return;
      if (result.ok) setFix(result.fix);
      setLocating(false);
    })();
    return () => { mounted.current = false; };
  }, []);

  async function runSearch(text: string) {
    const id = ++searchId.current;
    if (text.trim().length < 2) {
      setMatches([]);
      setSearching(false);
      setSearchError(false);
      return;
    }
    setSearching(true);
    setSearchError(false);
    const res = await lookupBusinesses(text.trim());
    if (id !== searchId.current || !mounted.current) return;
    setSearching(false);
    if (res.error || !res.data) {
      setSearchError(true);
      return;
    }
    setMatches(res.data.matches);
  }

  // Debounced search as the Ambassador types.
  useEffect(() => {
    const handle = setTimeout(() => { void runSearch(query); }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function openAdd() {
    setAdding(true);
    setName((prev) => prev || query.trim());
    setFormError(null);
  }

  function next() {
    if (!name.trim() || !address.trim()) {
      setFormError(t('ambassador.findBusiness.required'));
      return;
    }
    router.push({ pathname: '/(ambassador)/confirm-details', params: { name: name.trim(), address: address.trim() } });
  }

  const showEmpty = query.trim().length >= 2 && !searching && !searchError && matches.length === 0;

  return (
    <AmbassadorShell title={t('ambassador.findBusiness.title')} subtitle={t('ambassador.findBusiness.step')} testID="ambassador-find-business">
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={t('ambassador.findBusiness.searchPlaceholder')}
        placeholderTextColor={Colors.Faint}
        autoCorrect={false}
        accessibilityLabel={t('ambassador.findBusiness.searchPlaceholder')}
        style={styles.input}
        testID="find-business-search"
      />
      {locating ? <Text style={styles.small} testID="find-business-locating">{t('ambassador.findBusiness.locating')}</Text> : null}
      {!locating && !fix ? <Text style={styles.small} testID="find-business-no-location">{t('ambassador.findBusiness.noLocation')}</Text> : null}

      {searching ? <ActivityIndicator color={Colors.Ink} testID="find-business-searching" /> : null}
      {searchError ? (
        <Card tone="error" testID="find-business-error">
          <Text accessibilityRole="alert" style={styles.body}>{t('ambassador.findBusiness.loadFailed')}</Text>
          <TouchableOpacity onPress={() => void runSearch(query)} accessibilityRole="button" style={styles.outline} testID="find-business-retry">
            <Text style={styles.outlineText}>{t('ambassador.common.retry')}</Text>
          </TouchableOpacity>
        </Card>
      ) : null}

      {matches.length > 0 ? (
        <View style={{ gap: 8 }}>
          <Eyebrow>{t('ambassador.findBusiness.results')}</Eyebrow>
          <View style={styles.list} testID="find-business-results">
            {matches.map((m, index) => {
              const metres = fix && m.pinSet ? metresBetween(fix.lat, fix.lng, m.lat, m.lng) : null;
              const body = (
                <View style={[styles.row, index > 0 && styles.rowBorder]}>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={styles.rowTitle}>{m.name}</Text>
                    <Text style={styles.rowMeta}>{[m.address, metres !== null ? distanceLabel(metres) : null].filter(Boolean).join(' · ')}</Text>
                  </View>
                  <Text style={styles.signed}>{t('ambassador.findBusiness.signed')}</Text>
                </View>
              );
              return m.inBook ? (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => router.push({ pathname: '/(ambassador)/visit-check-in', params: { helloHangoutId: m.id } })}
                  accessibilityRole="button"
                  testID={`find-business-match-${m.id}`}
                >
                  {body}
                </TouchableOpacity>
              ) : (
                <View key={m.id} testID={`find-business-match-${m.id}`}>{body}</View>
              );
            })}
          </View>
        </View>
      ) : null}
      {showEmpty ? <Text style={styles.body} testID="find-business-no-matches">{t('ambassador.findBusiness.noMatches')}</Text> : null}

      {!adding ? (
        <TouchableOpacity onPress={openAdd} accessibilityRole="button" testID="find-business-add">
          <Text style={styles.addLink}>{t('ambassador.findBusiness.notFound')}</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ gap: 12 }} testID="find-business-add-form">
          <Text style={styles.addLink}>{t('ambassador.findBusiness.addTitle')}</Text>
          <Text style={styles.body}>{t('ambassador.findBusiness.addLead')}</Text>
          <TextInput
            value={name}
            onChangeText={(v) => { setName(v); setFormError(null); }}
            placeholder={t('ambassador.findBusiness.name')}
            placeholderTextColor={Colors.Faint}
            accessibilityLabel={t('ambassador.findBusiness.name')}
            style={styles.input}
            testID="find-business-name"
          />
          <TextInput
            value={address}
            onChangeText={(v) => { setAddress(v); setFormError(null); }}
            placeholder={t('ambassador.findBusiness.address')}
            placeholderTextColor={Colors.Faint}
            accessibilityLabel={t('ambassador.findBusiness.address')}
            style={styles.input}
            testID="find-business-address"
          />
          {formError ? <Text accessibilityRole="alert" style={styles.error}>{formError}</Text> : null}
          <TouchableOpacity onPress={next} accessibilityRole="button" style={styles.solid} testID="find-business-next">
            <Text style={styles.solidText}>{t('ambassador.findBusiness.continue')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.body}>{t('ambassador.findBusiness.lead')}</Text>
    </AmbassadorShell>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 15, lineHeight: 23, color: Colors.Muted },
  small: { fontSize: 14, color: Colors.Muted },
  error: { fontSize: 15, color: Colors.SignalRed },
  input: { backgroundColor: '#F2EFEB', borderRadius: 13, minHeight: 52, paddingHorizontal: 18, fontSize: 17, color: Colors.Ink },
  list: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, paddingHorizontal: 18, backgroundColor: Colors.Chalk },
  rowBorder: { borderTopWidth: 1, borderTopColor: '#F0EDE9' },
  rowTitle: { fontSize: 17, fontWeight: '700', color: Colors.Ink },
  rowMeta: { fontSize: 14.5, color: Colors.Muted },
  signed: { fontSize: 14, fontWeight: '700', color: Colors.Muted },
  addLink: { fontSize: 16, fontWeight: '700', color: Colors.Ink },
  solid: { backgroundColor: Colors.Ink, borderRadius: 29, minHeight: 56, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  solidText: { color: Colors.Chalk, fontSize: 17.5, fontWeight: '700' },
  outline: { borderWidth: 1.5, borderColor: Colors.Ink, borderRadius: 29, minHeight: 54, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  outlineText: { color: Colors.Ink, fontSize: 17, fontWeight: '700' },
});
