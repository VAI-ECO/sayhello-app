/**
 * OWNER LINK (S3 stage 07; API 081 POST /ambassador/hangouts/:id/owner-claim).
 * A venue signed at the door has no owner account, so nobody can show its printed venue code and the
 * first visit cannot be proven. The Ambassador who services it makes a one-time link; the owner opens
 * it signed in and becomes the owner. The server stores only a hash — the link is shown once, here.
 * Making a new link retires the old one. A venue that already has an owner needs none.
 */
import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Share } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { createOwnerClaim, getOwnerClaim } from '../../src/api/ambassador-s3';
import { AmbassadorShell, Card } from '../../src/components/ambassador/AmbassadorShell';

export default function OwnerClaimScreen() {
  const router = useRouter();
  const { helloHangoutId, name } = useLocalSearchParams<{ helloHangoutId?: string; name?: string }>();
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [hasOwner, setHasOwner] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!helloHangoutId) { setState('error'); return; }
    const res = await getOwnerClaim(helloHangoutId);
    if (res.error || !res.data) { setState('error'); return; }
    setHasOwner(res.data.hasOwner);
    setOpenLink(Boolean(res.data.openLink));
    setState('ready');
  }, [helloHangoutId]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  async function make() {
    if (!helloHangoutId || busy) return;
    setBusy(true);
    setMessage(null);
    const res = await createOwnerClaim(helloHangoutId);
    setBusy(false);
    if (res.error || !res.data) {
      setMessage(t(res.error?.code === 'already_claimed' ? 'ambassadorS3.ownerClaim.alreadyOwned' : 'ambassadorS3.ownerClaim.failed'));
      return;
    }
    setLink(res.data.claim.url);
    setOpenLink(true);
  }

  return (
    <AmbassadorShell title={t('ambassadorS3.ownerClaim.title')} subtitle={name ?? undefined} onBack={() => router.back()} testID="owner-claim">
      {state === 'loading' ? (
        <ActivityIndicator color={Colors.Ink} testID="owner-claim-loading" />
      ) : state === 'error' ? (
        <Card tone="error" testID="owner-claim-error">
          <Text accessibilityRole="alert" style={styles.body}>{t('ambassadorS3.ownerClaim.loadFailed')}</Text>
          <TouchableOpacity onPress={() => { setState('loading'); void load(); }} accessibilityRole="button" style={styles.outline} testID="owner-claim-retry">
            <Text style={styles.outlineText}>{t('ambassadorS3.retry')}</Text>
          </TouchableOpacity>
        </Card>
      ) : hasOwner ? (
        <Card testID="owner-claim-has-owner"><Text style={styles.body}>{t('ambassadorS3.ownerClaim.hasOwner')}</Text></Card>
      ) : (
        <>
          <Card>
            <Text style={styles.body}>{t('ambassadorS3.ownerClaim.why')}</Text>
            {openLink && !link ? <Text style={styles.small} testID="owner-claim-open">{t('ambassadorS3.ownerClaim.openExists')}</Text> : null}
          </Card>
          {link ? (
            <Card testID="owner-claim-link-card">
              <Text style={styles.link} selectable testID="owner-claim-link">{link}</Text>
              <Text style={styles.small}>{t('ambassadorS3.ownerClaim.shownOnce')}</Text>
              <TouchableOpacity onPress={() => { void Share.share({ message: link }).catch(() => undefined); }} accessibilityRole="button" style={styles.solid} testID="owner-claim-share">
                <Text style={styles.solidText}>{t('ambassadorS3.ownerClaim.share')}</Text>
              </TouchableOpacity>
            </Card>
          ) : null}
          <TouchableOpacity onPress={() => void make()} disabled={busy} accessibilityRole="button" accessibilityState={{ disabled: busy, busy }} style={[link ? styles.outline : styles.solid, busy && styles.disabled]} testID="owner-claim-make">
            <Text style={link ? styles.outlineText : styles.solidText}>{t(openLink || link ? 'ambassadorS3.ownerClaim.makeNew' : 'ambassadorS3.ownerClaim.make')}</Text>
          </TouchableOpacity>
          {message ? <Text accessibilityRole="alert" style={styles.small} testID="owner-claim-message">{message}</Text> : null}
        </>
      )}
    </AmbassadorShell>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 15.5, lineHeight: 23, color: Colors.Muted },
  small: { fontSize: 14, lineHeight: 20, color: Colors.Muted },
  link: { fontSize: 15, fontWeight: '700', color: Colors.Ink },
  solid: { backgroundColor: Colors.Ink, borderRadius: 29, minHeight: 54, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  solidText: { color: Colors.Chalk, fontSize: 17, fontWeight: '700' },
  outline: { borderWidth: 1.5, borderColor: Colors.Ink, borderRadius: 29, minHeight: 54, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  outlineText: { color: Colors.Ink, fontSize: 17, fontWeight: '700' },
  disabled: { opacity: 0.5 },
});
