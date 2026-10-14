/**
 * LEGAL (Terms of Service, Privacy Policy, Drawing rules) — GET /public/legal/:slug
 * Text appears only once legal approved it (RULES §31.9, MA-05). Until then the screen says
 * "Pending legal approval"; no text is ever written here.
 */
import { Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { t } from '../../../src/i18n';
import { Colors } from '../../../src/theme';
import { SubScreen, subStyles } from '../../../src/components/account/SubScreen';
import { useLoader } from '../../../src/lib/use-loader';
import { getLegalDocument, type LegalDocument, type LegalSlug } from '../../../src/api/account';

const TITLES: Record<LegalSlug, string> = { terms: 'settings.terms', privacy: 'settings.privacy', drawing_rules: 'settings.drawingRules' };

export default function LegalScreen() {
  const params = useLocalSearchParams<{ slug?: string }>();
  const slug: LegalSlug = params.slug === 'privacy' || params.slug === 'drawing_rules' ? params.slug : 'terms';
  const loader = useLoader<LegalDocument>(() => getLegalDocument(slug));
  const doc = loader.data;
  return (
    <SubScreen title={t(TITLES[slug])} state={loader.state} onRetry={loader.retry}>
      {doc?.status === 'approved' && doc.body ? (
        <>
          {doc.version ? <Text style={subStyles.note}>{t('account.legal.version', { version: doc.version })}</Text> : null}
          <Text style={{ fontSize: 15, lineHeight: 23, color: Colors.Ink }} testID="legal-body">{doc.body}</Text>
        </>
      ) : (
        <>
          <Text style={[subStyles.rowLabel, { marginBottom: 8 }]} testID="legal-pending">{t('account.legal.pendingTitle')}</Text>
          <Text style={subStyles.intro}>{t('account.legal.pendingBody')}</Text>
        </>
      )}
    </SubScreen>
  );
}
