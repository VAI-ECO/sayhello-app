/**
 * AT THE COUNTER — the price step after A10 ("Price comes next, at the counter, and there are
 * only two options": A9). RULES §1.11: ONE price and a coupon, never two prices; two ways in,
 * never three (§1.1–1.3): Regular, or the Founding coupon while the Founding window is open.
 * The deferred coupon is NOT offered here — it is earned by the second verified visit (§1.3).
 *
 * Every figure is the server's own (GET /ambassador/hangouts/pricing → live settings); this
 * screen sends only the CHOICE of coupon, never a price or tier. POST /ambassador/hangouts
 * sets originator and servicer to the signed-in Ambassador and the price from the settings.
 * The owner is not linked (no owner account exists yet): the listing starts unowned and awaiting
 * payment — nothing is earned until they pay and the Ambassador has visited.
 *
 * DESIGN GAP, recorded: no delivered frame draws this step or the signed confirmation; this
 * is a plain derivation of the delivered A9 line and needs a design review.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { getSignupPricing, signBusiness, type PricingOption, type SignBusinessResult, type SignupCoupon } from '../../src/api/ambassador';
import { AmbassadorShell, Card } from '../../src/components/ambassador/AmbassadorShell';
import { formatCents } from '../../src/lib/money-format';
import { uploadStorefront } from '../../src/api/ambassador-s3';
import { takeStorefrontShot } from '../../src/lib/storefront-shot';
import { toArrayBuffer } from '../../src/lib/photo-bytes';

type Pricing = { regular: PricingOption; founding: PricingOption | null; foundingWindowOpen: boolean };

export default function CounterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    name?: string; address?: string; lat?: string; lng?: string; contactName?: string; contactPhone?: string;
  }>();
  const name = typeof params.name === 'string' ? params.name : '';
  const address = typeof params.address === 'string' ? params.address : '';
  const lat = Number(params.lat);
  const lng = Number(params.lng);
  const hasDetails = Boolean(name && address) && Number.isFinite(lat) && Number.isFinite(lng) && params.lat !== '' && params.lng !== '';

  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [choice, setChoice] = useState<SignupCoupon>('none');
  const [signing, setSigning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState<SignBusinessResult | null>(null);
  // 'none' = no photo was taken; 'stored' | 'failed' = the result of the upload at signing.
  const [storefront, setStorefront] = useState<'none' | 'stored' | 'failed'>('none');
  const mounted = useRef(true);
  const signedOnce = useRef(false);

  const load = useCallback(async () => {
    const res = await getSignupPricing();
    if (!mounted.current) return;
    if (res.error || !res.data) {
      setState('error');
      return;
    }
    setPricing(res.data.pricing);
    // Founding is the one coupon at signup; default to it only when it is on offer.
    setChoice(res.data.pricing.founding ? 'founding' : 'none');
    setState('ready');
  }, []);

  useEffect(() => {
    mounted.current = true;
    if (hasDetails) void load();
    return () => { mounted.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sign() {
    if (signing || signedOnce.current) return;
    setSigning(true);
    setMessage(null);
    const res = await signBusiness({
      name,
      address,
      lat,
      lng,
      coupon: choice,
      contactName: params.contactName ? String(params.contactName) : undefined,
      contactPhone: params.contactPhone ? String(params.contactPhone) : undefined,
    });
    if (!mounted.current) return;
    setSigning(false);
    if (res.error || !res.data) {
      const code = res.error?.code ?? '';
      const known = ['founding_window_closed', 'coupon_not_eligible', 'coupon_below_commission', 'pin_required', 'already_listed'];
      setMessage(known.includes(code) ? t(`ambassador.counter.errors.${code}`) : t('ambassador.counter.signFailed'));
      // The Founding window may have closed since the price loaded: reload what is on offer.
      if (code === 'founding_window_closed') void load();
      return;
    }
    signedOnce.current = true;
    // The storefront photo taken at step 3 goes up now that the Hello Hangout has an id.
    const shot = takeStorefrontShot();
    if (shot) {
      const up = await uploadStorefront(res.data.helloHangout.id, toArrayBuffer(shot.bytes), shot.mime);
      if (mounted.current) setStorefront(up.error ? 'failed' : 'stored');
    }
    if (!mounted.current) return;
    setDone(res.data);
  }

  if (!hasDetails) {
    return (
      <AmbassadorShell title={t('ambassador.counter.title')}>
        <Card testID="counter-needs-details">
          <Text style={styles.body}>{t('ambassador.photo.needsDetails')}</Text>
        </Card>
        <TouchableOpacity onPress={() => router.replace('/ambassador/find-business')} accessibilityRole="button" style={styles.outline} testID="counter-restart">
          <Text style={styles.outlineText}>{t('ambassador.findBusiness.title')}</Text>
        </TouchableOpacity>
      </AmbassadorShell>
    );
  }

  if (done) {
    return (
      <AmbassadorShell title={t('ambassador.counter.doneTitle', { name: done.helloHangout.name })} onBack={() => router.replace('/ambassador/hangouts')} testID="counter-done">
        <Card>
          <Text style={styles.body}>{t('ambassador.counter.doneBody')}</Text>
          <Text style={styles.cardTitle} testID="counter-done-price">{t('ambassador.counter.donePrice', { amount: formatCents(done.pricing.priceCents) })}</Text>
          {storefront !== 'none' ? (
            <Text style={styles.body} testID="counter-storefront-result">{t(storefront === 'stored' ? 'ambassadorS3.counter.storefrontStored' : 'ambassadorS3.counter.storefrontFailed')}</Text>
          ) : null}
          {!done.contactSaved && (params.contactName || params.contactPhone) ? <Text style={styles.body}>{t('ambassador.counter.doneContactNote')}</Text> : null}
        </Card>
        <TouchableOpacity
          onPress={() => router.replace({ pathname: '/ambassador/visit-check-in', params: { helloHangoutId: done.helloHangout.id } })}
          accessibilityRole="button"
          style={styles.solid}
          testID="counter-visit-now"
        >
          <Text style={styles.solidText}>{t('ambassador.counter.doneVisit')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.replace({ pathname: '/ambassador/owner-claim', params: { helloHangoutId: done.helloHangout.id, name: done.helloHangout.name } })}
          accessibilityRole="button"
          style={styles.outline}
          testID="counter-owner-link"
        >
          <Text style={styles.outlineText}>{t('ambassadorS3.ownerClaim.cta')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace('/ambassador/hangouts')} accessibilityRole="button" style={styles.outline} testID="counter-done-list">
          <Text style={styles.outlineText}>{t('ambassador.counter.doneList')}</Text>
        </TouchableOpacity>
      </AmbassadorShell>
    );
  }

  const option = (which: SignupCoupon, p: PricingOption, title: string, body: string) => {
    const selected = choice === which;
    return (
      <TouchableOpacity
        key={which}
        onPress={() => setChoice(which)}
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        style={[styles.option, selected && styles.optionSelected]}
        testID={`counter-option-${which}`}
      >
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
        <Text style={styles.figure}>{t('ambassador.counter.listPrice')} {formatCents(p.listPriceCents)}</Text>
        {p.couponOffCents > 0 ? <Text style={styles.figure}>{t('ambassador.counter.couponOff')} −{formatCents(p.couponOffCents)}</Text> : null}
        <Text style={styles.figureStrong}>{t('ambassador.counter.due')} {formatCents(p.priceCents)}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <AmbassadorShell title={t('ambassador.counter.title')} subtitle={`${name} · ${t('ambassador.counter.lead')}`} testID="ambassador-counter">
      {state === 'loading' ? (
        <ActivityIndicator color={Colors.Ink} testID="counter-loading" />
      ) : state === 'error' || !pricing ? (
        <Card tone="error" testID="counter-error">
          <Text accessibilityRole="alert" style={styles.body}>{t('ambassador.counter.pricingFailed')}</Text>
          <TouchableOpacity onPress={() => { setState('loading'); void load(); }} accessibilityRole="button" style={styles.outline} testID="counter-retry">
            <Text style={styles.outlineText}>{t('ambassador.common.retry')}</Text>
          </TouchableOpacity>
        </Card>
      ) : (
        <>
          <View accessibilityRole="radiogroup" style={{ gap: 12 }}>
            {pricing.founding ? option('founding', pricing.founding, t('ambassador.counter.foundingTitle'), t('ambassador.counter.foundingBody')) : null}
            {option('none', pricing.regular, t('ambassador.counter.regularTitle'), t('ambassador.counter.regularBody'))}
          </View>
          {!pricing.founding ? (
            <Text style={styles.body} testID="counter-founding-closed">{t('ambassador.counter.foundingClosed')} {t('ambassador.counter.foundingClosedNote')}</Text>
          ) : null}
          <Text style={styles.body}>{t('ambassador.counter.signingNote')}</Text>
          {message ? <Text accessibilityRole="alert" style={styles.error} testID="counter-message">{message}</Text> : null}
          <TouchableOpacity
            onPress={() => void sign()}
            disabled={signing}
            accessibilityRole="button"
            accessibilityState={{ disabled: signing, busy: signing }}
            style={[styles.solid, signing && styles.disabled]}
            testID="counter-sign"
          >
            <Text style={styles.solidText}>{signing ? t('ambassador.counter.signing') : t('ambassador.counter.sign', { name })}</Text>
          </TouchableOpacity>
        </>
      )}
    </AmbassadorShell>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 15.5, lineHeight: 23, color: Colors.Muted },
  error: { fontSize: 15, lineHeight: 22, color: Colors.SignalRed },
  cardTitle: { fontSize: 17, fontWeight: '700', color: Colors.Ink },
  figure: { fontSize: 15.5, color: Colors.Ink },
  figureStrong: { fontSize: 17, fontWeight: '700', color: Colors.Ink },
  option: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 16, padding: 19, gap: 6 },
  optionSelected: { borderWidth: 2, borderColor: Colors.Ink },
  solid: { backgroundColor: Colors.Ink, borderRadius: 29, minHeight: 56, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  solidText: { color: Colors.Chalk, fontSize: 17.5, fontWeight: '700' },
  outline: { borderWidth: 1.5, borderColor: Colors.Ink, borderRadius: 29, minHeight: 56, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  outlineText: { color: Colors.Ink, fontSize: 17.5, fontWeight: '700' },
  disabled: { opacity: 0.5 },
});
