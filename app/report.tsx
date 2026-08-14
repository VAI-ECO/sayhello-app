/**
 * REPORT SCREEN
 *
 * One flow, six entry points — reporting a person, pin, selfie, Hootza, Hello Hangout, or comment.
 * Reasons change based on what's being reported.
 *
 * ⚠️ The reported person is NEVER told who reported them (privacy notice stated clearly).
 * ⚠️ Emergency line is the last thing before the button (§design note: safety product can't pretend to be fastest help).
 */

import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { t } from '../src/i18n';
import { Colors } from '../src/theme';
import { api } from '../src/api/client';

type ReportType = 'person' | 'pin' | 'selfie' | 'hootza' | 'hangout' | 'comment';

// Reasons vary by report type
const REASONS = {
  person: [
    'They made me feel unsafe',
    "They're pretending to be someone else",
    'Inappropriate behavior',
    'Something else',
  ],
  pin: [
    'They made me feel unsafe',
    "The selfie shouldn't be there",
    'This meeting never happened',
    "They're pretending to be someone else",
    'Something else',
  ],
  selfie: [
    "The selfie shouldn't be there",
    "I didn't consent to this photo",
    'Something else',
  ],
  hootza: [
    'Inappropriate content',
    'This event never happened',
    'Spam or misleading',
    'Something else',
  ],
  hangout: [
    'Inappropriate content',
    'Misleading information',
    'Something else',
  ],
  comment: [
    'Inappropriate content',
    'Harassment',
    'Spam',
    'Something else',
  ],
};

export default function ReportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse params: type, id, name, context
  const reportType = (params.type as ReportType) || 'person';
  const reportedId = params.id as string;
  const reportedName = params.name as string;
  const reportedContext = params.context as string; // e.g., "Foxhole · 12 Aug"

  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [detail, setDetail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reasons = REASONS[reportType] || REASONS.person;

  // Header text changes based on type
  const getHeaderText = () => {
    switch (reportType) {
      case 'person': return `REPORTING A PERSON`;
      case 'pin': return `REPORTING A PIN`;
      case 'selfie': return `REPORTING A SELFIE`;
      case 'hootza': return `REPORTING A HOOTZA`;
      case 'hangout': return `REPORTING A HELLO HANGOUT`;
      case 'comment': return `REPORTING A COMMENT`;
      default: return `REPORTING`;
    }
  };

  const handleSubmit = async () => {
    if (!selectedReason) return;

    setIsSubmitting(true);
    setError(null);

    const body: any = {
      reportType: reportType === 'person' ? 'user' : reportType === 'hangout' ? 'hangout_post' : reportType,
      reason: selectedReason,
      detail: detail.trim() || undefined,
    };

    // Map to API fields based on type
    if (reportType === 'person') body.reportedUserId = reportedId;
    if (reportType === 'pin') body.reportedHelloId = reportedId;
    if (reportType === 'hootza') body.reportedHootzaId = reportedId;
    if (reportType === 'hangout') body.reportedPostId = reportedId;
    if (reportType === 'comment') body.reportedCommentId = reportedId;

    const { error } = await api.post('/safety/report', body);

    if (error) {
      setError(error.message);
      setIsSubmitting(false);
      return;
    }

    // Success - go back
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusBar} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* Context card */}
        <View style={styles.contextCard}>
          <View style={styles.contextImage} />
          <View>
            <Text style={styles.contextLabel}>{getHeaderText()}</Text>
            <Text style={styles.contextDetail}>{reportedName}{reportedContext ? ` · ${reportedContext}` : ''}</Text>
          </View>
        </View>

        {/* What's the problem */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>WHAT'S THE PROBLEM</Text>
          <View style={styles.reasonList}>
            {reasons.map((reason) => (
              <TouchableOpacity
                key={reason}
                style={styles.reasonRow}
                onPress={() => setSelectedReason(reason)}
              >
                <Text style={styles.reasonText}>{reason}</Text>
                {selectedReason === reason && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tell us more (optional) */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            TELL US MORE <Text style={styles.optionalText}>optional</Text>
          </Text>
          <TextInput
            style={styles.detailInput}
            placeholder="Anything that helps us understand."
            placeholderTextColor={Colors.Faint}
            value={detail}
            onChangeText={setDetail}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Privacy notice */}
        <Text style={styles.privacyNotice}>
          {reportedName} is never told who reported {reportType === 'person' ? 'them' : 'this'}, and nothing on {reportType === 'person' ? 'their' : 'the'} end changes in a way that could point at you.
        </Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, !selectedReason && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!selectedReason || isSubmitting}
        >
          <Text style={styles.submitButtonText}>{isSubmitting ? 'Sending...' : 'Send it'}</Text>
        </TouchableOpacity>

        {/* Emergency notice */}
        <Text style={styles.emergencyNotice}>
          In danger right now? Call your local emergency number — we can't help fast enough.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
