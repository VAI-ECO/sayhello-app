/** Business photos on the Hello Hangout page (S3/080). Renders nothing when there are none. */
import { ScrollView, Image, StyleSheet } from 'react-native';
import { Colors } from '../../theme';

export function PhotoStrip({ photos }: { photos: Array<{ id: string; url: string | null; altText: string | null }> }) {
  const shown = photos.filter((p) => p.url);
  if (shown.length === 0) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip} testID="page-photos">
      {shown.map((p) => (
        <Image key={p.id} source={{ uri: p.url as string }} style={styles.image} accessibilityLabel={p.altText ?? undefined} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  strip: { gap: 10, paddingBottom: 12 },
  image: { width: 260, height: 180, borderRadius: 12, backgroundColor: Colors.Bone },
});
