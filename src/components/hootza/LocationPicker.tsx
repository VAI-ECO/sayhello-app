/**
 * HOOTZA LOCATION SELECTION. A place name the host types plus an optional pin set from where the host is standing.
 * Address search goes through the map provider seam (GET /map/geocode); with no key it says so instead of faking a result.
 * The device position is read only when the host taps the button (permission asked then), and is the Hootza's
 * own pin, never a user-discovery position (RULES §8.2-8.3). A private residence's pin is withheld by the server.
 */
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { TextInput } from '../TextInput';
import { t } from '../../i18n';
import { Colors, FixedColors } from '../../theme/tokens';
import { geocodeAddress, type PlaceResult } from '../../api/map';

interface Props {
  name: string;
  onName: (v: string) => void;
  lat: number | null;
  lng: number | null;
  onPin: (lat: number | null, lng: number | null) => void;
  placeholder?: string;
  testID?: string;
}

export function LocationPicker({ name, onName, lat, lng, onPin, placeholder, testID = 'location' }: Props) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [found, setFound] = useState<PlaceResult[] | null>(null);
  const [searchOff, setSearchOff] = useState(false);

  async function searchAddress() {
    setMessage(null);
    const res = await geocodeAddress(name.trim());
    if (res.error || !res.data) { setMessage(t('hootzas.location.failed')); return; }
    if (!res.data.configured) { setSearchOff(true); setFound(null); return; }
    if (res.data.error) { setMessage(t('hootzas.location.failed')); return; }
    setFound(res.data.results);
  }

  async function pinHere() {
    setBusy(true);
    setMessage(null);
    try {
      let perm = await Location.getForegroundPermissionsAsync();
      if (!perm.granted && perm.canAskAgain) perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) { setMessage(t('hootzas.location.denied')); return; }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      onPin(pos.coords.latitude, pos.coords.longitude);
    } catch {
      setMessage(t('hootzas.location.failed'));
    } finally {
      setBusy(false);
    }
  }

  const pinned = lat != null && lng != null;
  return (
    <View style={styles.wrap}>
      <TextInput value={name} onChangeText={onName} placeholder={placeholder} testID={`${testID}-name`} />
      <View style={styles.row}>
        <TouchableOpacity onPress={pinHere} disabled={busy} accessibilityRole="button" testID={`${testID}-pin`}>
          <Text style={styles.link}>{busy ? t('hootzas.location.finding') : pinned ? t('hootzas.location.repin') : t('hootzas.location.pinHere')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={searchAddress} disabled={name.trim().length < 3} accessibilityRole="button" testID={`${testID}-search`}>
          <Text style={styles.link}>{t('hootzas.location.search')}</Text>
        </TouchableOpacity>
        {pinned ? (
          <TouchableOpacity onPress={() => onPin(null, null)} accessibilityRole="button" testID={`${testID}-clear`}>
            <Text style={styles.link}>{t('hootzas.location.clear')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {found && found.length === 0 ? <Text style={styles.hint}>{t('hootzas.location.noMatch')}</Text> : null}
      {found?.map((r, i) => (
        <TouchableOpacity key={`${r.lat}-${r.lng}-${i}`} onPress={() => { onName(r.name || r.address); onPin(r.lat, r.lng); setFound(null); }} accessibilityRole="button" testID={`${testID}-result-${i}`}>
          <Text style={styles.link}>{r.name}{r.address ? `, ${r.address}` : ''}</Text>
        </TouchableOpacity>
      ))}
      <Text style={styles.hint} testID={`${testID}-status`}>{pinned ? t('hootzas.location.pinned') : searchOff ? t('hootzas.location.noSearch') : t('hootzas.location.searchHint')}</Text>
      {message ? <Text style={styles.err} accessibilityRole="alert">{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  row: { flexDirection: 'row', gap: 20 },
  link: { fontSize: 15, color: FixedColors.hootza, textDecorationLine: 'underline' },
  hint: { fontSize: 13, color: Colors.Muted },
  err: { fontSize: 13, color: FixedColors.error },
});
