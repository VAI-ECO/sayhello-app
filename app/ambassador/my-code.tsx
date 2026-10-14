/**
 * MY CODE — CANON-RL-03-SN-31. The "held-up-to-someone" screen: dark, high contrast, the code large enough to read
 * across a table, with the QR. The code is the Ambassador's own (GET /ambassador/me); a code gives credit and never
 * changes a price (§2.10). The QR encodes the share link and is drawn on the device, never sent to a QR service.
 */
import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Share, ScrollView, useWindowDimensions } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { t } from '../../src/i18n';
import { getAmbassadorMe } from '../../src/api/ambassador';
import { ScannableCode } from '../../src/components/qr-code';
import { creatorLinkUrl } from '../../src/lib/creator-link';
import { StatusBarSpacer } from '../../src/components/StatusBarSpacer';

export default function MyCodeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 700;
  const [code, setCode] = useState<string | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  const load = useCallback(async () => {
    const r = await getAmbassadorMe();
    if (r?.error || !r?.data) { setState('error'); return; }
    setCode(r.data.me.ambassadorCode ?? null);
    setState('ready');
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const url = code ? creatorLinkUrl(code) : null;
  return (
    <View style={s.screen} testID="ambassador-my-code">
      {/* This screen draws no status-bar area of its own (design height 0): it only clears the real top inset. */}
      <StatusBarSpacer height={0} testID="my-code-status-spacer" />
      <ScrollView contentContainerStyle={s.scroll}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" hitSlop={12}><Text style={s.back}>{t('ambRole.back')}</Text></TouchableOpacity>
        {state === 'loading' ? <ActivityIndicator color="#FFFFFF" /> : null}
        {state === 'error' ? (
          <TouchableOpacity onPress={() => { setState('loading'); void load(); }} accessibilityRole="button" testID="my-code-retry">
            <Text accessibilityRole="alert" style={s.muted}>{t('ambRole.loadFailed')} {t('ambRole.retry')}</Text>
          </TouchableOpacity>
        ) : null}
        {state === 'ready' && !code ? <Text style={s.muted} testID="my-code-none">{t('ambRole.myCode.noCode')}</Text> : null}
        {state === 'ready' && code && url ? (
          <View style={[s.body, wide && s.bodyWide]}>
            <View style={s.center}>
              <Text style={s.kicker}>{t('ambRole.myCode.show')}</Text>
              <ScannableCode value={url} size={wide ? 260 : 230} label={t('ambRole.myCode.show')} fallback={code} />
              <Text style={s.brand}>{t('ambRole.myCode.brand')}</Text>
            </View>
            <View style={s.center}>
              <Text style={s.kicker}>{t('ambRole.myCode.readOut')}</Text>
              <Text style={s.code} selectable testID="my-code-value" accessibilityLabel={code}>{code}</Text>
              <TouchableOpacity onPress={() => { void Share.share({ message: url }).catch(() => undefined); }} accessibilityRole="button" style={s.share} testID="my-code-share">
                <Text style={s.shareText}>{t('ambRole.myCode.share')}</Text>
              </TouchableOpacity>
              <Text style={s.muted}>{t('ambRole.myCode.credit')}</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#111111' },
  scroll: { padding: 22, gap: 22, flexGrow: 1 },
  back: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
  body: { gap: 28, alignItems: 'center' },
  bodyWide: { flexDirection: 'row', justifyContent: 'center', gap: 56 },
  center: { alignItems: 'center', gap: 14 },
  kicker: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
  brand: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  code: { color: '#FFFFFF', fontSize: 54, fontWeight: '900', letterSpacing: 3, textAlign: 'center' },
  share: { borderWidth: 1.5, borderColor: '#FFFFFF', borderRadius: 26, minHeight: 48, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' },
  shareText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  muted: { color: '#CFCFCF', fontSize: 14, lineHeight: 20, textAlign: 'center' },
});
