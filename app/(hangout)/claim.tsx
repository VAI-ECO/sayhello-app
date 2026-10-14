/**
 * CLAIM YOUR HELLO HANGOUT (S3 stage 07; API 081 POST /hello-hangouts/claim).
 * The Ambassador who signed the venue at the door sends a one-time link. Opened signed in (or
 * pasted here), it makes this account the owner. Ownership is decided by the server from the token;
 * a used, retired or expired link is refused with the same plain words, so nothing is learned from it.
 */
import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { claimHelloHangout } from '../../src/api/ambassador-s3';
import { api } from '../../src/api/client';
import { rememberPendingClaim, takePendingClaim } from '../../src/lib/pending-claim';

function tokenFrom(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/[?&]token=([A-Za-z0-9_-]+)/);
  return match ? match[1] : trimmed;
}

export default function ClaimHangoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string; resume?: string }>();
  const [value, setValue] = useState(typeof params.token === 'string' ? params.token : '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [claimed, setClaimed] = useState<string | null>(null);
  // Signed out: the claim needs an account to own the place. The link is untouched, so it still works after sign-in.
  const [signedOut, setSignedOut] = useState(false);

  async function claim(token: string) {
    if (token.length < 16 || busy) { setMessage(t('ambassadorS3.claim.invalid')); return; }
    if (!api.hasSession()) {
      // Remember the link in memory so the sign-in success path can bring the owner straight back here (resume=1).
      rememberPendingClaim(token);
      setSignedOut(true);
      setMessage(null);
      return;
    }
    setSignedOut(false);
    setBusy(true);
    setMessage(null);
    const res = await claimHelloHangout(token);
    setBusy(false);
    if (res.error || !res.data) {
      const code = res.error?.code;
      setMessage(t(code === 'already_claimed' ? 'ambassadorS3.claim.alreadyClaimed' : code === 'invalid_claim' || res.error?.status === 404 ? 'ambassadorS3.claim.invalid' : 'ambassadorS3.claim.failed'));
      return;
    }
    takePendingClaim();
    setClaimed(res.data.helloHangout.name);
  }

  const submit = () => claim(tokenFrom(value));

  // Back from sign-in with the same link (resume=1): the owner already asked to claim it, so finish it once, here.
  const resumed = useRef(false);
  useEffect(() => {
    if (resumed.current || params.resume !== '1' || typeof params.token !== 'string' || !api.hasSession()) return;
    resumed.current = true;
    void claim(tokenFrom(params.token));
  }, [params.resume, params.token]);

  return (
    <ScreenContainer style={styles.screen}>
      <View style={styles.pad}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" testID="claim-back">
          <Text style={styles.back}>{t('hangoutBiz.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('ambassadorS3.claim.title')}</Text>
        {claimed ? (
          <>
            <Text style={styles.body} testID="claim-done">{t('ambassadorS3.claim.done', { name: claimed })}</Text>
            <TouchableOpacity onPress={() => router.replace('/(hangout)/dashboard')} accessibilityRole="button" style={styles.solid} testID="claim-to-dashboard">
              <Text style={styles.solidText}>{t('ambassadorS3.claim.toDashboard')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.body}>{t('ambassadorS3.claim.body')}</Text>
            <TextInput
              value={value}
              onChangeText={setValue}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder={t('ambassadorS3.claim.placeholder')}
              placeholderTextColor={Colors.Faint}
              accessibilityLabel={t('ambassadorS3.claim.placeholder')}
              style={styles.input}
              testID="claim-input"
            />
            <TouchableOpacity onPress={() => void submit()} disabled={busy} accessibilityRole="button" accessibilityState={{ disabled: busy, busy }} style={[styles.solid, busy && styles.disabled]} testID="claim-submit">
              {busy ? <ActivityIndicator color={Colors.Chalk} /> : <Text style={styles.solidText}>{t('ambassadorS3.claim.submit')}</Text>}
            </TouchableOpacity>
            {message ? <Text accessibilityRole="alert" style={styles.body} testID="claim-message">{message}</Text> : null}
            {signedOut ? (
              <>
                <Text accessibilityRole="alert" style={styles.body} testID="claim-signed-out">{t('ambassadorS3.claim.signedOut')}</Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/sign-in-phone')} accessibilityRole="button" style={styles.solid} testID="claim-sign-in">
                  <Text style={styles.solidText}>{t('ambassadorS3.claim.signIn')}</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  pad: { padding: 22, gap: 14 },
  back: { fontSize: 17, fontWeight: '600', color: Colors.Ink },
  title: { fontSize: 26, fontWeight: '800', color: Colors.Ink },
  body: { fontSize: 15.5, lineHeight: 23, color: Colors.Muted },
  input: { borderWidth: 1.5, borderColor: Colors.Line, borderRadius: 12, minHeight: 54, paddingHorizontal: 14, fontSize: 16, color: Colors.Ink },
  solid: { backgroundColor: Colors.Ink, borderRadius: 29, minHeight: 54, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  solidText: { color: Colors.Chalk, fontSize: 17, fontWeight: '700' },
  disabled: { opacity: 0.5 },
});
