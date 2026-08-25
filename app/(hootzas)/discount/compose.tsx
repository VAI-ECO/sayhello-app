/**
 * DISCOUNT COMPOSER
 * POST /api/feed/posts — needs hangoutId route param
 * No GET slots endpoint — banner uses generic copy
 */

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer, Button, TextInput } from '../../../src/components';
import { t } from '../../../src/i18n';
import { Colors, FixedColors } from '../../../src/theme/tokens';
import { createFeedPost, getHangoutPostSlots } from '../../../src/api/feed';

export default function DiscountComposeScreen() {
  const router = useRouter();
  const { hangoutId, helloHangoutId } = useLocalSearchParams<{
    hangoutId?: string;
    helloHangoutId?: string;
  }>();
  const postTargetId = helloHangoutId ?? hangoutId;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [postToFeed, setPostToFeed] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!postTargetId) return;
    getHangoutPostSlots(postTargetId).then((res) => {
      if (res.data) setRemaining(res.data.remaining);
    });
  }, [postTargetId]);

  if (!postTargetId) {
    return (
      <ScreenContainer>
        <View style={styles.centered} testID="discount-missing-hangout">
          <Text style={styles.error}>{t('hootzas.discount.missingHangout')}</Text>
          <Button title={t('common.done')} onPress={() => router.back()} />
        </View>
      </ScreenContainer>
    );
  }

  async function submit() {
    if (!postTargetId || !title.trim()) return;
    setPosting(true);
    setError(null);

    const res = await createFeedPost({
      hangoutId: helloHangoutId ? undefined : hangoutId,
      helloHangoutId,
      postType: 'special',
      title: title.trim(),
      description: description.trim() || undefined,
      discountType: 'description_only',
      isAllDay: true,
    });

    setPosting(false);

    if (res.error) {
      if (res.error.status === 402) {
        router.push({
          pathname: '/(hootzas)/discount/out-of-posts',
          params: { hangoutId: postTargetId },
        });
        return;
      }
      setError(res.error.message);
      return;
    }

    router.back();
  }

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>{t('hootzas.common.back')}</Text>
          <Text style={styles.header}>{t('hootzas.discount.title')}</Text>
        </TouchableOpacity>

        <Text style={styles.banner} testID="discount-slots-banner">
          {remaining == null
            ? t('hootzas.discount.slotsBannerGeneric')
            : remaining > 0
              ? `${remaining} free post${remaining === 1 ? '' : 's'} left this month`
              : t('hootzas.discount.outOfPostsTitle')}
        </Text>

        <Text style={styles.label}>{t('hootzas.discount.offerLabel')}</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder={t('hootzas.discount.offerLabel')}
          testID="discount-title"
        />
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder={t('hootzas.discount.preview')}
          testID="discount-description"
        />

        <Text style={styles.section}>{t('hootzas.discount.twoClocks')}</Text>
        <Text style={styles.hint}>{t('hootzas.discount.dealHint')}</Text>

        <View style={styles.optionRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.optionTitle}>{t('hootzas.discount.feedOption')}</Text>
            <Text style={styles.optionHint}>{t('hootzas.discount.feedOptionHint')}</Text>
          </View>
          <Switch value={postToFeed} onValueChange={setPostToFeed} testID="discount-feed-toggle" />
        </View>

        {!postToFeed && (
          <Text style={styles.pageOnly}>{t('hootzas.discount.pageOptionHint')}</Text>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          title={postToFeed ? t('hootzas.discount.postFree') : t('hootzas.discount.pageOption')}
          onPress={submit}
          loading={posting}
          disabled={!title.trim()}
          testID="discount-submit"
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  scroll: { paddingHorizontal: 22, paddingBottom: 32, gap: 12 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
  back: { paddingVertical: 12, marginHorizontal: -22, paddingHorizontal: 22 },
  backText: { fontSize: 17, color: Colors.Ink, fontWeight: '600' },
  header: { fontSize: 17, fontWeight: '800', color: Colors.Ink, marginTop: 8 },
  banner: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.Muted,
    backgroundColor: Colors.Bone,
    borderRadius: 14,
    padding: 13,
  },
  label: { fontSize: 15, fontWeight: '700', color: Colors.Ink, marginTop: 8 },
  section: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.Faint,
    marginTop: 8,
  },
  hint: { fontSize: 13, lineHeight: 18, color: Colors.Muted },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: Colors.Hairline,
  },
  optionTitle: { fontSize: 15, fontWeight: '700', color: Colors.Ink },
  optionHint: { fontSize: 13, color: Colors.Muted, marginTop: 2 },
  pageOnly: { fontSize: 14, color: Colors.Muted },
  error: { fontSize: 15, color: Colors.Ink, textAlign: 'center' },
});
