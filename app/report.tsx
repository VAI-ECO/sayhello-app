/**
 * REPORT SCREEN
 *
 * One flow for a Hello (connection record), a Hootza comment or a Hello Hangout post. The six
 * canonical reasons (RULES §35.19) apply to every target; payloads match POST /safety/report.
 *
 * ⚠️ The reported person is NEVER told who reported them (privacy notice stated clearly).
 * ⚠️ Emergency line is the last thing before the button (§design note: safety product can't pretend to be fastest help).
 */

import { useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { t } from '../src/i18n';
import { Colors } from '../src/theme';
import { REPORT_REASONS, sendReport, type ReportReason, type ReportTarget } from '../src/api/account';

/**
 * Targets the server accepts at POST /safety/report (RULES §35.18, §24.10):
 *   hello           — a person/connection record; `id` is the hello id (+ optional `userId`)
 *   hootza_comment  — one Hootza comment; `id` is the comment id
 *   hootza_chat     — one message in a Hootza's group chat; `id` is the message id
 *   hangout_post    — one Hello Hangout post (special or Holla); `id` is the post id
 * A private chat message is reported from the chat's own sheet (it names the message, §35.18).
 * The reason is always one of the six canonical categories (§35.19).
 */
const TARGETS: ReportTarget[] = ['hello', 'hootza_comment', 'hootza_chat', 'hangout_post'];

export default function ReportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string; id?: string; name?: string; context?: string; userId?: string }>();

  const reportType = TARGETS.includes(params.type as ReportTarget) ? (params.type as ReportTarget) : null;
  const reportedId = typeof params.id === 'string' ? params.id : '';
  const reportedName = typeof params.name === 'string' ? params.name : '';
  const reportedContext = typeof params.context === 'string' ? params.context : '';
  const reportedUserId = typeof params.userId === 'string' && params.userId ? params.userId : undefined;

  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [detail, setDetail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);

  const what = reportType === 'hello' ? t('account.report.consentWhatHello')
    : reportType === 'hootza_comment' ? t('account.report.consentWhatComment')
    : reportType === 'hootza_chat' ? t('account.report.consentWhatGroupMessage')
    : t('account.report.consentWhatPost');

  const handleSubmit = async () => {
    if (!selectedReason || !reportType || !reportedId || busy.current) return;
    busy.current = true;
    setIsSubmitting(true);
    setError(null);
    const result = await sendReport({
      reportType,
      conversationId: reportedId,
      reason: selectedReason,
      details: detail.trim() || undefined,
      reportedUserId,
    });
    busy.current = false;
    setIsSubmitting(false);
    if (result.error) {
      setError(result.error.code === 'chat_reporting_unavailable' ? t('account.report.unavailable') : result.error.message || t('account.report.failed'));
      return;
    }
    // §35.21: the receipt is all the reporter ever gets.
    setSent(true);
  };

  if (!reportType || !reportedId) {
    return (
      <View style={styles.container}>
        <View style={styles.statusBar} />
        <View style={styles.centered}>
          <Text style={styles.sentBody} accessibilityRole="alert">{t('account.report.missingTarget')}</Text>
          <TouchableOpacity style={styles.submitButton} onPress={() => router.back()} accessibilityRole="button">
            <Text style={styles.submitButtonText}>{t('account.back')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (sent) {
    return (
      <View style={styles.container}>
        <View style={styles.statusBar} />
        <View style={styles.centered} testID="report-sent">
          <Text style={styles.sentTitle}>{t('account.report.sent')}</Text>
          <Text style={styles.sentBody}>{t('account.report.sentBody')}</Text>
          <TouchableOpacity style={styles.submitButton} onPress={() => router.back()} accessibilityRole="button" testID="report-done">
            <Text style={styles.submitButtonText}>{t('account.report.done')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statusBar} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button">
          <Text style={styles.cancelButton}>{t('account.cancel')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('account.report.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* Context card */}
        <View style={styles.contextCard}>
          <View style={styles.contextImage} />
          <View>
            <Text style={styles.contextLabel}>{t(`account.report.header.${reportType}`)}</Text>
            <Text style={styles.contextDetail}>{reportedName}{reportedContext ? ` · ${reportedContext}` : ''}</Text>
          </View>
        </View>

        {/* What's the problem — the six reasons, §35.19 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('account.report.whatsTheProblem')}</Text>
          <View style={styles.reasonList}>
            {REPORT_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason}
                style={styles.reasonRow}
                onPress={() => setSelectedReason(reason)}
                accessibilityRole="radio"
                accessibilityState={{ selected: selectedReason === reason }}
                testID={`report-reason-${reason}`}
              >
                <Text style={styles.reasonText}>{t(`account.report.reasons.${reason}`)}</Text>
                {selectedReason === reason && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tell us more (optional, §35.20) */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {t('account.report.tellUsMore')} <Text style={styles.optionalText}>{t('account.report.optional')}</Text>
          </Text>
          <TextInput
            style={styles.detailInput}
            placeholder={t('account.report.detailPlaceholder')}
            placeholderTextColor={Colors.Faint}
            value={detail}
            onChangeText={setDetail}
            maxLength={2000}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* What sending shares, and that the other side is never told (§23.14, §35.21) */}
        <Text style={styles.privacyNotice}>
          {t('account.report.consent', { what, name: reportedName || t('account.report.consentWhatHello') })}
        </Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText} accessibilityRole="alert">{error}</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, !selectedReason && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!selectedReason || isSubmitting}
          accessibilityRole="button"
          testID="report-submit"
        >
          <Text style={styles.submitButtonText}>{isSubmitting ? t('account.report.sending') : t('account.report.send')}</Text>
        </TouchableOpacity>

        {/* Emergency notice */}
        <Text style={styles.emergencyNotice}>{t('account.report.emergency')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 26, gap: 14 },
  sentTitle: { fontSize: 22, fontWeight: '800', color: Colors.Ink },
  sentBody: { fontSize: 15, lineHeight: 22, color: Colors.Muted, textAlign: 'center' },
  container: {
    flex: 1,
    backgroundColor: Colors.Chalk,
  },
  statusBar: {
    height: 46,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 4,
    paddingBottom: 14,
  },
  cancelButton: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.Muted,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.Ink,
  },
  headerSpacer: {
    width: 60, // Match cancel button width
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 22,
  },
  contextCard: {
    backgroundColor: Colors.Bone,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 15,
  },
  contextImage: {
    width: 40,
    height: 40,
    borderRadius: 9,
    backgroundColor: Colors.Line,
  },
  contextLabel: {
    fontSize: 11,
    letterSpacing: 0.12,
    textTransform: 'uppercase',
    color: Colors.Faint,
    fontWeight: '700',
  },
  contextDetail: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.Ink,
  },

  // Sections
  section: {
    marginBottom: 15,
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 0.14,
    textTransform: 'uppercase',
    color: Colors.Faint,
    fontWeight: '700',
    marginBottom: 8,
  },
  optionalText: {
    textTransform: 'none',
    letterSpacing: 0,
    fontWeight: '600',
    color: Colors.Faint,
  },

  // Reason list
  reasonList: {
    backgroundColor: Colors.Hairline,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.Hairline,
    gap: 1,
  },
  reasonRow: {
    backgroundColor: Colors.Chalk,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reasonText: {
    fontSize: 16,
    color: Colors.Ink,
  },
  selectedBadge: {
    width: 21,
    height: 21,
    borderRadius: 21,
    backgroundColor: Colors.Ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.Chalk,
  },

  // Detail input
  detailInput: {
    borderWidth: 1,
    borderColor: Colors.Line,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: Colors.Ink,
    minHeight: 66,
    textAlignVertical: 'top',
  },

  // Privacy notice
  privacyNotice: {
    borderTopWidth: 1,
    borderTopColor: Colors.Hairline,
    paddingTop: 13,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.Muted,
    marginBottom: 14,
  },

  // Error
  errorBox: {
    backgroundColor: '#FFF3F3',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#C63A2C',
  },

  // Footer
  footer: {
    padding: 14,
    paddingHorizontal: 22,
    paddingBottom: 26,
    gap: 9,
  },
  submitButton: {
    backgroundColor: Colors.Ink,
    borderRadius: 27,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: Colors.Faint,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.Chalk,
  },
  emergencyNotice: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    color: Colors.Faint,
  },
});
