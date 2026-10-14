/** LEAVING 2 of 3 — what happens to the page (CANON-RL-05-SN-13). "Hand it to someone" is not built: handover is unruled. */
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '../../../../src/components';
import { t } from '../../../../src/i18n';
import { OrgScreen, Choice } from '../../../../src/components/organization/parts';

export default function ClosePage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [choice, setChoice] = useState<'take_down' | 'leave_up' | null>(null);
  return (
    <OrgScreen title={t('organizations.close.pick')} step={t('organizations.close.step', { n: 2 })} onBack={() => router.back()}
      footer={
        <>
          <Button title={t('organizations.close.nextQuestion')} disabled={!choice} testID="org-close-page-next"
            onPress={() => router.push({ pathname: '/(organization)/[id]/close/followers', params: { id, choice: choice! } })} />
          <Button title={t('organizations.common.back')} variant="secondary" onPress={() => router.back()} />
        </>
      }>
      <Choice label={t('organizations.close.takeDown')} hint={t('organizations.close.takeDownBody')} selected={choice === 'take_down'} onPress={() => setChoice('take_down')} testID="org-close-take-down" />
      <Choice label={t('organizations.close.leaveUp')} hint={t('organizations.close.leaveUpBody')} selected={choice === 'leave_up'} onPress={() => setChoice('leave_up')} testID="org-close-leave-up" />
    </OrgScreen>
  );
}
