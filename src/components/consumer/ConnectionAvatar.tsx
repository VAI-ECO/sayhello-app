/**
 * The picture on a Connections row: the Hello selfie when there is one, otherwise a circle in the person's identity
 * colour with their initial. A missing selfie is never an error state (it can be removed on request; the pin survives,
 * DESIGN-BRIEF-11 req. 17). A selfie URL that fails to load falls back the same way.
 */
import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../theme';
import { connectionInitial } from '../../lib/connection-meta';

const SIZE = 52;

export function ConnectionAvatar({
  selfieUrl,
  displayName,
  identityColor,
  size = SIZE,
}: {
  selfieUrl?: string | null;
  displayName?: string | null;
  identityColor?: string | null;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const circle = { width: size, height: size, borderRadius: size / 2 };
  if (selfieUrl && !failed) {
    return (
      <Image
        source={{ uri: selfieUrl }}
        style={circle}
        onError={() => setFailed(true)}
        accessibilityIgnoresInvertColors
        testID="connection-avatar-selfie"
      />
    );
  }
  const initial = connectionInitial(displayName);
  return (
    <View style={[circle, styles.fallback, { backgroundColor: identityColor || Colors.Bone }]} testID="connection-avatar-fallback">
      {initial ? <Text style={[styles.initial, { fontSize: Math.round(size * 0.38) }]}>{initial}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
  initial: { fontWeight: '700', color: Colors.Chalk },
});
