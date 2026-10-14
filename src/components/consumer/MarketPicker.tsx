/**
 * The market (country) picker for phone entry — RULES §26.9, SN-94. Chosen by hand from the list of
 * launch markets; never inferred from the SIM or locale. Shows "[+N] ▾"; the sheet lists every market
 * with its dialling code. "Somewhere else" is handled by typing the full number with its +.
 */
import { MARKET_CHOICES, marketByCallingCode } from '../../lib/phone';
import { OptionField } from './OptionSheet';
import { t } from '../../i18n';

export function MarketPicker(props: { callingCode: string; onChange: (code: string) => void }) {
  const current = marketByCallingCode(props.callingCode);
  return (
    <OptionField
      title={t('s2c.phone.pickTitle')}
      placeholder={`+${current.callingCode}`}
      value={current.callingCode}
      onChange={props.onChange}
      testID="market-picker"
      shortLabel={o => `+${o.value}`}
      options={MARKET_CHOICES.map(m => ({ value: m.callingCode, label: `${m.name}  +${m.callingCode}` }))}
    />
  );
}
