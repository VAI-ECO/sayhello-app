/**
 * HOST MODE (Settings → The app → Host Mode)
 * Lists the live Hootzas where the host asked to open this person up to Hellos (§28.15) and lets
 * them sit out or turn it back on (§28.14). The choice is written by
 * POST /hootzas/:id/host-mode-participation; nothing is suppressed on the device (§28.11).
 */
import { useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { t } from '../../../src/i18n';
import { SubScreen, subStyles } from '../../../src/components/account/SubScreen';
import { useLoader } from '../../../src/lib/use-loader';
import { getMyHostMode, setHostModeParticipation, type HostModeEntry } from '../../../src/api/account';

export default function HostModeScreen() {
  const loader = useLoader<{ hootzas: HostModeEntry[] }>(getMyHostMode);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function change(entry: HostModeEntry, accepted: boolean) {
    if (pending) return;
    setPending(entry.hootzaId);
    setError(null);
    const res = await setHostModeParticipation(entry.hootzaId, accepted);
    setPending(null);
    if (res.error) {
      setError(res.error.code === 'host_mode_choice_failed' && /ended|live/i.test(res.error.message)
        ? t('account.hostMode.ended')
        : t('account.hostMode.saveFailed'));
    }
    loader.reload();
  }

  const entries = loader.data?.hootzas ?? [];
  return (
    <SubScreen title={t('account.hostMode.title')} state={loader.state} onRetry={loader.retry}>
      <Text style={subStyles.intro}>{t('account.hostMode.intro')}</Text>
      {entries.length === 0 ? (
        <Text style={subStyles.note} testID="host-mode-empty">{t('account.hostMode.empty')}</Text>
      ) : (
        <View style={subStyles.card}>
          {entries.map(entry => (
            <View key={entry.hootzaId} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 }}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={subStyles.rowLabel}>{entry.title}</Text>
                <Text style={subStyles.rowHint}>{entry.accepted ? t('account.hostMode.on') : t('account.hostMode.off')}</Text>
              </View>
              <Switch
                value={entry.accepted}
                disabled={pending !== null}
                onValueChange={next => void change(entry, next)}
                accessibilityLabel={entry.accepted ? t('account.hostMode.sitOut') : t('account.hostMode.turnOn')}
                testID={`host-mode-${entry.hootzaId}`}
              />
            </View>
          ))}
        </View>
      )}
      {error ? <Text style={subStyles.error} accessibilityRole="alert">{error}</Text> : null}
    </SubScreen>
  );
}
