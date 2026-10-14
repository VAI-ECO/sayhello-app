/**
 * HOST MODE — WINDOW OPEN (attendee)
 * Uses myHostMode from GET /api/hootzas/:id
 * POST /api/hootzas/:id/host-mode-participation
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, AppState } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useIsFocused } from 'expo-router/react-navigation';
import { ScreenContainer, Button } from '../../../src/components';
import { t } from '../../../src/i18n';
import { Colors, FixedColors } from '../../../src/theme/tokens';
import {
  getHostModeConfig,
  getHootza,
  saveHostModeParticipation,
  type Hootza,
  type MyHostMode,
} from '../../../src/api/hootzas';
import { formatClock } from '../../../src/lib/hootza-format';
import {
  calculateServerOffset,
  calculateHostModeTimer,
  isWindowExpired,
} from '../../../src/lib/host-mode-display';

export default function HostModeWindowScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string | string[] }>();

  // Validate and normalize ID: must be single non-empty string
  const rawId = typeof params.id === 'string' && params.id.trim() !== '' ? params.id.trim() : null;

  const [currentId, setCurrentId] = useState<string | null>(rawId);
  const [hootza, setHootza] = useState<Hootza | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [serverOffset, setServerOffset] = useState(0);
  const [timerTick, setTimerTick] = useState(0);

  const focused = useIsFocused();
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  const mounted = useRef(true);
  const focusRef = useRef(focused);
  const eventGen = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const expiryWindowRef = useRef<string | null>(null);
  const saveInProgressRef = useRef(false);
  const refreshCountRef = useRef<Record<string, number>>({});

  focusRef.current = focused;

  // Clear all cached state when ID changes
  useEffect(() => {
    if (rawId !== currentId) {
      setCurrentId(rawId);
      setHootza(null);
      setError(null);
      setSaveError(null);
      setSaving(false);
      saveInProgressRef.current = false;
      setServerOffset(0);
      expiryWindowRef.current = null;
      refreshCountRef.current = {};
      eventGen.current++;
    }
  }, [rawId, currentId]);

  const load = useCallback(async () => {
    const id = currentId;
    if (!id) {
      setLoading(false);
      setError(t('error.notFound'));
      return;
    }

    // Guard BEFORE generation increment to prevent invalidating concurrent save
    if (saveInProgressRef.current) {
      return;
    }

    const gen = ++eventGen.current;
    setLoading(true);
    // Don't clear error here - keep fail-closed state until successful response

    let res;
    try {
      res = await getHootza(id);
    } catch (err) {
      if (!mounted.current || gen !== eventGen.current) return;
      setLoading(false);
      setError(err instanceof Error ? err.message : t('error.network'));
      return;
    }

    if (!mounted.current || gen !== eventGen.current) return;

    setLoading(false);

    if (res.error || !res.data?.hootza) {
      setError(res.error?.message ?? t('error.notFound'));
      return;
    }

    const hootzaData = res.data.hootza;
    setHootza(hootzaData);

    // Validate and calculate server offset
    if (hootzaData.myHostMode?.serverTime) {
      try {
        const serverTimeMs = new Date(hootzaData.myHostMode.serverTime).getTime();
        if (isFinite(serverTimeMs)) {
          const newOffset = calculateServerOffset(hootzaData.myHostMode.serverTime);
          if (isFinite(newOffset)) {
            setServerOffset(newOffset);
          }
        }
      } catch {
        // Invalid serverTime - retain previous offset
      }
    }

    // If refreshed due to expiry and window is still expired, mark it to prevent showing expired spinner again
    if (
      hootzaData.myHostMode?.state === 'open' &&
      hootzaData.myHostMode?.windowClosesAt &&
      refreshCountRef.current[hootzaData.myHostMode.windowClosesAt] > 0 &&
      isWindowExpired(hootzaData.myHostMode.windowClosesAt, serverOffset)
    ) {
      expiryWindowRef.current = hootzaData.myHostMode.windowClosesAt;
    }

    // Clear errors after successful refresh
    setError(null);
    setSaveError(null);
  }, [currentId]);

  // Initial load
  useEffect(() => {
    load();
  }, [load]);

  // Refresh on focus (not initial)
  useEffect(() => {
    if (focused && !loading && hootza) {
      load();
    }
  }, [focused]);

  // Refresh on foreground + cleanup
  useEffect(() => {
    mounted.current = true;
    const sub = AppState.addEventListener('change', state => {
      const isActive = state === 'active';
      setForeground(isActive);
      if (isActive && focusRef.current && !loading && hootza) {
        load();
      }
    });
    return () => {
      mounted.current = false;
      sub.remove();
    };
  }, [load, loading, hootza]);

  // Timer tick for progress bar
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const myHostMode = hootza?.myHostMode;
    if (!myHostMode || myHostMode.state !== 'open' || !myHostMode.windowClosesAt) {
      return;
    }

    // If this window identity was already recorded as expired, never display open for it
    if (expiryWindowRef.current === myHostMode.windowClosesAt) {
      return;
    }

    // Validate windowClosesAt is valid ISO string
    const closesAtMs = new Date(myHostMode.windowClosesAt).getTime();
    if (!isFinite(closesAtMs)) {
      return;
    }

    // Update immediately
    setTimerTick(Date.now());

    // Check if already expired
    if (isWindowExpired(myHostMode.windowClosesAt, serverOffset)) {
      // Trigger at most one refresh per window; expiryWindowRef will be set after load completes
      const windowId = myHostMode.windowClosesAt;
      const count = refreshCountRef.current[windowId] || 0;
      if (count === 0) {
        refreshCountRef.current[windowId] = 1;
        load();
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimerTick(Date.now());

      if (myHostMode.windowClosesAt && isWindowExpired(myHostMode.windowClosesAt, serverOffset)) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        // Trigger at most one refresh per window; expiryWindowRef will be set after load completes
        const windowId = myHostMode.windowClosesAt;
        const count = refreshCountRef.current[windowId] || 0;
        if (count === 0) {
          refreshCountRef.current[windowId] = 1;
          load();
        }
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [hootza?.myHostMode, serverOffset, load]);

  const handleToggle = async (accepted: boolean) => {
    const id = currentId;
    if (!id || !hootza?.myHostMode || saving || saveInProgressRef.current) return;

    const gen = ++eventGen.current;
    saveInProgressRef.current = true;
    setSaving(true);
    setSaveError(null);

    let res;
    try {
      res = await saveHostModeParticipation(id, accepted);
    } catch (err) {
      if (!mounted.current || gen !== eventGen.current) {
        // Stale save rejection - don't clear saveInProgressRef as it may belong to new event
        return;
      }
      saveInProgressRef.current = false;
      setSaving(false);
      setSaveError(t('hootzas.hostModeWindow.saveFailed'));
      return;
    }

    if (!mounted.current || gen !== eventGen.current) {
      // Stale save completion - don't clear saveInProgressRef as it may belong to new event
      return;
    }

    if (res.error) {
      saveInProgressRef.current = false;
      setSaving(false);
      setSaveError(t('hootzas.hostModeWindow.saveFailed'));
      return;
    }

    // POST succeeded - immediately update entire myHostMode state
    // true => waiting, false => off, clear windowClosesAt
    if (hootza.myHostMode) {
      setHootza({
        ...hootza,
        myHostMode: {
          ...hootza.myHostMode,
          state: accepted ? 'waiting' : 'off',
          accepted,
          windowClosesAt: null,
        },
      });
    }

    // Clear previous errors on successful save
    setSaveError(null);

    // Refresh to get updated state
    let refreshRes;
    try {
      refreshRes = await getHootza(id);
    } catch (err) {
      if (!mounted.current || gen !== eventGen.current) {
        // Stale reconciliation rejection - don't clear saveInProgressRef as it may belong to new event
        return;
      }
      saveInProgressRef.current = false;
      setSaving(false);
      setSaveError(t('hootzas.hostModeWindow.refreshFailed'));
      return;
    }

    if (!mounted.current || gen !== eventGen.current) {
      // Stale save completion - don't clear saveInProgressRef as it may belong to new event
      return;
    }

    saveInProgressRef.current = false;
    setSaving(false);

    if (refreshRes.error || !refreshRes.data?.hootza) {
      setSaveError(t('hootzas.hostModeWindow.refreshFailed'));
      return;
    }

    const hootzaData = refreshRes.data.hootza;
    setHootza(hootzaData);
    if (hootzaData.myHostMode?.serverTime) {
      try {
        const serverTimeMs = new Date(hootzaData.myHostMode.serverTime).getTime();
        if (isFinite(serverTimeMs)) {
          const newOffset = calculateServerOffset(hootzaData.myHostMode.serverTime);
          if (isFinite(newOffset)) {
            setServerOffset(newOffset);
          }
        }
      } catch {
        // Invalid serverTime
      }
    }

    // Clear errors after successful refresh
    setError(null);
    setSaveError(null);
  };

  if (loading && !hootza) {
    return (
      <ScreenContainer style={styles.ground}>
        <View style={styles.centered} testID="host-mode-loading">
          <ActivityIndicator color={FixedColors.hootza} />
        </View>
      </ScreenContainer>
    );
  }

  if (error && !hootza) {
    return (
      <ScreenContainer>
        <View style={styles.centered} testID="host-mode-error">
          <Text style={styles.errorText}>{error}</Text>
          <Button title={t('error.retry')} onPress={load} testID="host-mode-retry" />
        </View>
      </ScreenContainer>
    );
  }

  if (!currentId || !hootza) {
    return (
      <ScreenContainer>
        <View style={styles.centered} testID="host-mode-empty">
          <Text style={styles.errorText}>{t('error.notFound')}</Text>
          <Button title={t('common.done')} onPress={() => router.back()} />
        </View>
      </ScreenContainer>
    );
  }

  const hostMode = getHostModeConfig(hootza);
  const myHostMode = hootza.myHostMode;
  const hostName = hootza.host?.fullName ?? t('hootzas.common.host');
  const hasScheduledEnd = hootza.scheduledEndTime !== null;

  // Fail closed if myHostMode is missing
  if (!myHostMode) {
    return (
      <ScreenContainer style={styles.ground}>
        <View testID="host-mode-unavailable">
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('hootzas.hostModeWindow.unavailable')}</Text>
            <Text style={styles.cardBody}>{t('hootzas.hostModeWindow.unavailableBody')}</Text>
          </View>
          <Button title={t('common.done')} onPress={() => router.back()} testID="host-mode-done" />
        </View>
      </ScreenContainer>
    );
  }

  // Derive fail-closed display with visible refresh error
  const hasRefreshError = Boolean(error || saveError);
  const refreshErrorMessage = error || saveError;
  const state = myHostMode.state;

  // Fail closed: if refresh failed with cached open data, don't show open
  if (state === 'open' && error) {
    const displayState = myHostMode.accepted ? 'waiting' : 'off';
    return (
      <ScreenContainer style={styles.ground}>
        <View testID={displayState === 'waiting' ? 'host-mode-waiting' : 'host-mode-off'}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {displayState === 'waiting'
                ? t('hootzas.hostModeWindow.waiting')
                : t('hootzas.hostModeWindow.turnedOff')}
            </Text>
            <Text style={styles.cardBody}>
              {displayState === 'waiting'
                ? t('hootzas.hostModeWindow.waitingBody')
                : t('hootzas.hostModeWindow.turnedOffBody')}
            </Text>
            <Text style={styles.saveError}>{refreshErrorMessage}</Text>
            <View style={styles.optRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.optTitle}>
                  {displayState === 'waiting'
                    ? t('hootzas.hostModeWindow.sitOut')
                    : t('hootzas.hostModeWindow.turnOn')}
                </Text>
                <Text style={styles.optSub}>
                  {displayState === 'waiting'
                    ? t('hootzas.hostModeWindow.sitOutHint')
                    : t('hootzas.hostModeWindow.turnOnHint')}
                </Text>
              </View>
              <Button
                title={
                  displayState === 'waiting'
                    ? t('whatsHappening.header.toggleOff')
                    : t('whatsHappening.header.toggleOn')
                }
                onPress={() => handleToggle(displayState === 'off')}
                variant="secondary"
                loading={saving}
                disabled={saving}
                testID={displayState === 'waiting' ? 'host-mode-toggle-off' : 'host-mode-toggle-on'}
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.whenTitle}>{t('hootzas.hostModeWindow.whenItStops')}</Text>
            <Text style={styles.whenBody}>
              {hasScheduledEnd
                ? t('hootzas.hostModeWindow.whenItStopsBody', { host: hostName })
                : t('hootzas.hostModeWindow.whenItStopsBodyNoEnd')}
            </Text>
          </View>

          <Button
            title={t('error.retry')}
            onPress={load}
            variant="secondary"
            testID="host-mode-refresh-retry"
          />
          <Button title={t('common.done')} onPress={() => router.back()} testID="host-mode-done" />
        </View>
      </ScreenContainer>
    );
  }

  // Render state branches
  if (state === 'not-checked-in') {
    return (
      <ScreenContainer style={styles.ground}>
        <View testID="host-mode-not-checked-in">
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('hootzas.hostModeWindow.notCheckedIn')}</Text>
            <Text style={styles.cardBody}>{t('hootzas.hostModeWindow.notCheckedInBody')}</Text>
          </View>
          <Button title={t('common.done')} onPress={() => router.back()} testID="host-mode-done" />
        </View>
      </ScreenContainer>
    );
  }

  if (state === 'ended') {
    return (
      <ScreenContainer style={styles.ground}>
        <View testID="host-mode-ended">
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('hootzas.hostModeWindow.ended')}</Text>
            <Text style={styles.cardBody}>{t('hootzas.hostModeWindow.endedBody')}</Text>
          </View>
          <Button title={t('common.done')} onPress={() => router.back()} testID="host-mode-done" />
        </View>
      </ScreenContainer>
    );
  }

  if (state === 'unavailable') {
    return (
      <ScreenContainer style={styles.ground}>
        <View testID="host-mode-unavailable-state">
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('hootzas.hostModeWindow.unavailable')}</Text>
            <Text style={styles.cardBody}>{t('hootzas.hostModeWindow.unavailableBody')}</Text>
            {myHostMode.accepted && (
              <View style={styles.optRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optTitle}>{t('hootzas.hostModeWindow.sitOut')}</Text>
                  <Text style={styles.optSub}>{t('hootzas.hostModeWindow.sitOutHint')}</Text>
                </View>
                <Button
                  title={t('whatsHappening.header.toggleOff')}
                  onPress={() => handleToggle(false)}
                  variant="secondary"
                  loading={saving}
                  disabled={saving}
                  testID="host-mode-toggle-off"
                />
              </View>
            )}
          </View>
          <Button title={t('common.done')} onPress={() => router.back()} testID="host-mode-done" />
        </View>
      </ScreenContainer>
    );
  }

  if (state === 'off') {
    return (
      <ScreenContainer style={styles.ground}>
        <View testID="host-mode-off">
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('hootzas.hostModeWindow.turnedOff')}</Text>
            <Text style={styles.cardBody}>{t('hootzas.hostModeWindow.turnedOffBody')}</Text>
            {hasRefreshError && <Text style={styles.saveError}>{refreshErrorMessage}</Text>}
            <View style={styles.optRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.optTitle}>{t('hootzas.hostModeWindow.turnOn')}</Text>
                <Text style={styles.optSub}>{t('hootzas.hostModeWindow.turnOnHint')}</Text>
              </View>
              <Button
                title={t('whatsHappening.header.toggleOn')}
                onPress={() => handleToggle(true)}
                variant="secondary"
                loading={saving}
                disabled={saving}
                testID="host-mode-toggle-on"
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.whenTitle}>{t('hootzas.hostModeWindow.whenItStops')}</Text>
            <Text style={styles.whenBody}>
              {hasScheduledEnd
                ? t('hootzas.hostModeWindow.whenItStopsBody', { host: hostName })
                : t('hootzas.hostModeWindow.whenItStopsBodyNoEnd')}
            </Text>
          </View>

          {hasRefreshError && (
            <Button
              title={t('error.retry')}
              onPress={load}
              variant="secondary"
              testID="host-mode-refresh-retry"
            />
          )}

          <Button title={t('common.done')} onPress={() => router.back()} testID="host-mode-done" />
        </View>
      </ScreenContainer>
    );
  }

  if (state === 'waiting') {
    return (
      <ScreenContainer style={styles.ground}>
        <View testID="host-mode-waiting">
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('hootzas.hostModeWindow.waiting')}</Text>
            <Text style={styles.cardBody}>{t('hootzas.hostModeWindow.waitingBody')}</Text>
            {hasRefreshError && <Text style={styles.saveError}>{refreshErrorMessage}</Text>}
            <View style={styles.optRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.optTitle}>{t('hootzas.hostModeWindow.sitOut')}</Text>
                <Text style={styles.optSub}>{t('hootzas.hostModeWindow.sitOutHint')}</Text>
              </View>
              <Button
                title={t('whatsHappening.header.toggleOff')}
                onPress={() => handleToggle(false)}
                variant="secondary"
                loading={saving}
                disabled={saving}
                testID="host-mode-toggle-off"
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.whenTitle}>{t('hootzas.hostModeWindow.whenItStops')}</Text>
            <Text style={styles.whenBody}>
              {hasScheduledEnd
                ? t('hootzas.hostModeWindow.whenItStopsBody', { host: hostName })
                : t('hootzas.hostModeWindow.whenItStopsBodyNoEnd')}
            </Text>
          </View>

          {hasRefreshError && (
            <Button
              title={t('error.retry')}
              onPress={load}
              variant="secondary"
              testID="host-mode-refresh-retry"
            />
          )}

          <Button title={t('common.done')} onPress={() => router.back()} testID="host-mode-done" />
        </View>
      </ScreenContainer>
    );
  }

  // open state - validate config and timestamps
  const windowLengthMinutes = hostMode?.windowLengthMinutes;
  if (!windowLengthMinutes || !isFinite(windowLengthMinutes) || windowLengthMinutes <= 0) {
    // Invalid config - fail closed but allow manual opt-out for accepted users (RULES28.14)
    const displayState = myHostMode.accepted ? 'waiting' : 'off';
    return (
      <ScreenContainer style={styles.ground}>
        <View testID="host-mode-config-invalid">
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('hootzas.hostModeWindow.unavailable')}</Text>
            <Text style={styles.cardBody}>{t('hootzas.hostModeWindow.unavailableBody')}</Text>
          </View>

          {myHostMode.accepted && (
            <View style={styles.card}>
              <View style={styles.optRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optTitle}>{t('hootzas.hostModeWindow.sitOut')}</Text>
                  <Text style={styles.optSub}>{t('hootzas.hostModeWindow.sitOutHint')}</Text>
                </View>
                <Button
                  title={t('whatsHappening.header.toggleOff')}
                  onPress={() => handleToggle(false)}
                  variant="secondary"
                  loading={saving}
                  disabled={saving}
                  testID="host-mode-toggle-off"
                />
              </View>
            </View>
          )}

          <Button
            title={t('error.retry')}
            onPress={load}
            variant="secondary"
            testID="host-mode-refresh-retry"
          />
          <Button title={t('common.done')} onPress={() => router.back()} testID="host-mode-done" />
        </View>
      </ScreenContainer>
    );
  }

  // Validate serverTime before certifying open window - must have valid finite timestamp
  let validServerTime = false;
  if (myHostMode.serverTime !== null && myHostMode.serverTime !== undefined && myHostMode.serverTime !== '') {
    try {
      const serverTimeMs = new Date(myHostMode.serverTime).getTime();
      if (isFinite(serverTimeMs) && !isNaN(serverTimeMs)) {
        validServerTime = true;
      }
    } catch {
      // Invalid date string - validServerTime remains false
    }
  }

  if (!validServerTime) {
    const displayState = myHostMode.accepted ? 'waiting' : 'off';
    return (
      <ScreenContainer style={styles.ground}>
        <View testID={displayState === 'waiting' ? 'host-mode-waiting' : 'host-mode-off'}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {displayState === 'waiting'
                ? t('hootzas.hostModeWindow.waiting')
                : t('hootzas.hostModeWindow.turnedOff')}
            </Text>
            <Text style={styles.cardBody}>
              {displayState === 'waiting'
                ? t('hootzas.hostModeWindow.waitingBody')
                : t('hootzas.hostModeWindow.turnedOffBody')}
            </Text>
            <View style={styles.optRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.optTitle}>
                  {displayState === 'waiting'
                    ? t('hootzas.hostModeWindow.sitOut')
                    : t('hootzas.hostModeWindow.turnOn')}
                </Text>
                <Text style={styles.optSub}>
                  {displayState === 'waiting'
                    ? t('hootzas.hostModeWindow.sitOutHint')
                    : t('hootzas.hostModeWindow.turnOnHint')}
                </Text>
              </View>
              <Button
                title={
                  displayState === 'waiting'
                    ? t('whatsHappening.header.toggleOff')
                    : t('whatsHappening.header.toggleOn')
                }
                onPress={() => handleToggle(displayState === 'off')}
                variant="secondary"
                loading={saving}
                disabled={saving}
                testID={displayState === 'waiting' ? 'host-mode-toggle-off' : 'host-mode-toggle-on'}
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.whenTitle}>{t('hootzas.hostModeWindow.whenItStops')}</Text>
            <Text style={styles.whenBody}>
              {hasScheduledEnd
                ? t('hootzas.hostModeWindow.whenItStopsBody', { host: hostName })
                : t('hootzas.hostModeWindow.whenItStopsBodyNoEnd')}
            </Text>
          </View>

          <Button
            title={t('error.retry')}
            onPress={load}
            variant="secondary"
            testID="host-mode-refresh-retry"
          />
          <Button title={t('common.done')} onPress={() => router.back()} testID="host-mode-done" />
        </View>
      </ScreenContainer>
    );
  }

  // If window identity was recorded as expired, never display open - show waiting/off with retry
  if (myHostMode.windowClosesAt && expiryWindowRef.current === myHostMode.windowClosesAt) {
    const displayState = myHostMode.accepted ? 'waiting' : 'off';
    return (
      <ScreenContainer style={styles.ground}>
        <View testID={displayState === 'waiting' ? 'host-mode-waiting' : 'host-mode-off'}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {displayState === 'waiting'
                ? t('hootzas.hostModeWindow.waiting')
                : t('hootzas.hostModeWindow.turnedOff')}
            </Text>
            <Text style={styles.cardBody}>
              {displayState === 'waiting'
                ? t('hootzas.hostModeWindow.waitingBody')
                : t('hootzas.hostModeWindow.turnedOffBody')}
            </Text>
            <View style={styles.optRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.optTitle}>
                  {displayState === 'waiting'
                    ? t('hootzas.hostModeWindow.sitOut')
                    : t('hootzas.hostModeWindow.turnOn')}
                </Text>
                <Text style={styles.optSub}>
                  {displayState === 'waiting'
                    ? t('hootzas.hostModeWindow.sitOutHint')
                    : t('hootzas.hostModeWindow.turnOnHint')}
                </Text>
              </View>
              <Button
                title={
                  displayState === 'waiting'
                    ? t('whatsHappening.header.toggleOff')
                    : t('whatsHappening.header.toggleOn')
                }
                onPress={() => handleToggle(displayState === 'off')}
                variant="secondary"
                loading={saving}
                disabled={saving}
                testID={displayState === 'waiting' ? 'host-mode-toggle-off' : 'host-mode-toggle-on'}
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.whenTitle}>{t('hootzas.hostModeWindow.whenItStops')}</Text>
            <Text style={styles.whenBody}>
              {hasScheduledEnd
                ? t('hootzas.hostModeWindow.whenItStopsBody', { host: hostName })
                : t('hootzas.hostModeWindow.whenItStopsBodyNoEnd')}
            </Text>
          </View>

          <Button
            title={t('error.retry')}
            onPress={load}
            variant="secondary"
            testID="host-mode-refresh-retry"
          />
          <Button title={t('common.done')} onPress={() => router.back()} testID="host-mode-done" />
        </View>
      </ScreenContainer>
    );
  }

  const timer = calculateHostModeTimer(myHostMode.windowClosesAt, windowLengthMinutes, serverOffset);

  // If expired, keep Off available; only show spinner on first expiry trigger before refresh count is set
  if (!timer || timer.expired) {
    const windowId = myHostMode.windowClosesAt || '';
    const refreshTriggered = refreshCountRef.current[windowId] > 0;

    if (!refreshTriggered && loading) {
      return (
        <ScreenContainer style={styles.ground}>
          <View style={styles.centered} testID="host-mode-expired">
            <ActivityIndicator color={FixedColors.hootza} />
          </View>
        </ScreenContainer>
      );
    }

    // Expired with refresh triggered or not loading - keep Off available
    const displayState = myHostMode.accepted ? 'waiting' : 'off';
    return (
      <ScreenContainer style={styles.ground}>
        <View testID={displayState === 'waiting' ? 'host-mode-waiting' : 'host-mode-off'}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {displayState === 'waiting'
                ? t('hootzas.hostModeWindow.waiting')
                : t('hootzas.hostModeWindow.turnedOff')}
            </Text>
            <Text style={styles.cardBody}>
              {displayState === 'waiting'
                ? t('hootzas.hostModeWindow.waitingBody')
                : t('hootzas.hostModeWindow.turnedOffBody')}
            </Text>
            <View style={styles.optRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.optTitle}>
                  {displayState === 'waiting'
                    ? t('hootzas.hostModeWindow.sitOut')
                    : t('hootzas.hostModeWindow.turnOn')}
                </Text>
                <Text style={styles.optSub}>
                  {displayState === 'waiting'
                    ? t('hootzas.hostModeWindow.sitOutHint')
                    : t('hootzas.hostModeWindow.turnOnHint')}
                </Text>
              </View>
              <Button
                title={
                  displayState === 'waiting'
                    ? t('whatsHappening.header.toggleOff')
                    : t('whatsHappening.header.toggleOn')
                }
                onPress={() => handleToggle(displayState === 'off')}
                variant="secondary"
                loading={saving}
                disabled={saving}
                testID={displayState === 'waiting' ? 'host-mode-toggle-off' : 'host-mode-toggle-on'}
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.whenTitle}>{t('hootzas.hostModeWindow.whenItStops')}</Text>
            <Text style={styles.whenBody}>
              {hasScheduledEnd
                ? t('hootzas.hostModeWindow.whenItStopsBody', { host: hostName })
                : t('hootzas.hostModeWindow.whenItStopsBodyNoEnd')}
            </Text>
          </View>

          <Button title={t('common.done')} onPress={() => router.back()} testID="host-mode-done" />
        </View>
      </ScreenContainer>
    );
  }

  if (!isFinite(timer.minutesLeft) || !isFinite(timer.progress)) {
    // Invalid timer - fail closed but allow manual opt-out for accepted users (RULES28.14)
    return (
      <ScreenContainer style={styles.ground}>
        <View testID="host-mode-timer-invalid">
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('hootzas.hostModeWindow.unavailable')}</Text>
            <Text style={styles.cardBody}>{t('hootzas.hostModeWindow.unavailableBody')}</Text>
          </View>

          {myHostMode.accepted && (
            <View style={styles.card}>
              <View style={styles.optRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optTitle}>{t('hootzas.hostModeWindow.sitOut')}</Text>
                  <Text style={styles.optSub}>{t('hootzas.hostModeWindow.sitOutHint')}</Text>
                </View>
                <Button
                  title={t('whatsHappening.header.toggleOff')}
                  onPress={() => handleToggle(false)}
                  variant="secondary"
                  loading={saving}
                  disabled={saving}
                  testID="host-mode-toggle-off"
                />
              </View>
            </View>
          )}

          <Button
            title={t('error.retry')}
            onPress={load}
            variant="secondary"
            testID="host-mode-refresh-retry"
          />
          <Button title={t('common.done')} onPress={() => router.back()} testID="host-mode-done" />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.ground}>
      <View testID="host-mode-open">
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.openLabel}>{t('hootzas.hostModeWindow.youreOpen')}</Text>
            <Text style={styles.timePill}>
              {t('hootzas.hostModeWindow.timeLeft', { minutes: timer.minutesLeft })}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${timer.progress * 100}%` }]}
              testID="host-mode-progress"
            />
          </View>
          <Text style={styles.cardBody}>{t('hootzas.hostModeWindow.roomOpen', { host: hostName })}</Text>
          {hasRefreshError && <Text style={styles.saveError}>{saveError}</Text>}
          <View style={styles.optRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optTitle}>{t('hootzas.hostModeWindow.sitOut')}</Text>
              <Text style={styles.optSub}>{t('hootzas.hostModeWindow.sitOutHint')}</Text>
            </View>
            <Button
              title={t('whatsHappening.header.toggleOff')}
              onPress={() => handleToggle(false)}
              variant="secondary"
              loading={saving}
              disabled={saving}
              testID="host-mode-toggle-off"
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.whenTitle}>{t('hootzas.hostModeWindow.whenItStops')}</Text>
          <Text style={styles.whenBody}>
            {hasScheduledEnd
              ? t('hootzas.hostModeWindow.whenItStopsBody', { host: hostName })
              : t('hootzas.hostModeWindow.whenItStopsBodyNoEnd')}
          </Text>
        </View>

        {hasRefreshError && (
          <Button
            title={t('error.retry')}
            onPress={load}
            variant="secondary"
            testID="host-mode-refresh-retry"
          />
        )}

        <Button title={t('common.done')} onPress={() => router.back()} testID="host-mode-done" />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  ground: { backgroundColor: Colors.Canvas },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  errorText: { fontSize: 15, color: Colors.Ink, textAlign: 'center', marginBottom: 8 },
  card: {
    backgroundColor: Colors.Chalk,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    gap: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.Ink },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  openLabel: { fontSize: 16, fontWeight: '700', color: Colors.Ink },
  timePill: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.Muted,
    backgroundColor: Colors.Bone,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.Canvas,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Colors.Fern },
  cardBody: { fontSize: 15, lineHeight: 22, color: Colors.Muted },
  optRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderColor: Colors.Hairline,
    paddingTop: 13,
  },
  optTitle: { fontSize: 15, fontWeight: '700', color: Colors.Ink },
  optSub: { fontSize: 13, color: Colors.Muted, marginTop: 1 },
  whenTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.Faint,
  },
  whenBody: { fontSize: 15, lineHeight: 22, color: Colors.Ink },
  saveError: { fontSize: 13, color: Colors.SignalRed, marginTop: -4 },
});
