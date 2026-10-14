/**
 * A dropdown that opens a list (used for pronouns, the curated "Other" gender list and the Romance age
 * range). The field shows the chosen label and a ▾; the sheet is a modal list with a Close action.
 * Presentation only: the caller owns the value and what saving it means.
 */
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../theme';
import { t } from '../../i18n';

export type Option = { value: string; label: string };

export function OptionField(props: {
  label?: string;
  title: string;
  options: Option[];
  value: string | null;
  placeholder: string;
  onChange: (value: string) => void;
  testID?: string;
  compact?: boolean;
  /** What the closed field shows for the chosen option (default: its label). */
  shortLabel?: (o: Option) => string;
}) {
  const [open, setOpen] = useState(false);
  const current = props.options.find(o => o.value === props.value);
  return (
    <View style={props.compact ? styles.compact : undefined}>
      {props.label ? <Text style={styles.label}>{props.label}</Text> : null}
      <TouchableOpacity
        style={styles.field}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${props.label ?? props.title}: ${current?.label ?? props.placeholder}`}
        testID={props.testID}
      >
        <Text style={[styles.fieldText, !current && { color: Colors.Faint }]}>{current ? (props.shortLabel ? props.shortLabel(current) : current.label) : props.placeholder}</Text>
        <Text style={styles.caret}>▾</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel={t('s2c.common.close')}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <Text style={styles.sheetTitle} accessibilityRole="header">{props.title}</Text>
            <ScrollView style={{ maxHeight: 360 }}>
              {props.options.map(o => (
                <TouchableOpacity
                  key={o.value}
                  style={styles.option}
                  onPress={() => { props.onChange(o.value); setOpen(false); }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: o.value === props.value }}
                  testID={`${props.testID ?? 'option'}-${o.value}`}
                >
                  <Text style={[styles.optionText, o.value === props.value && { fontWeight: '800' }]}>{o.label}</Text>
                  {o.value === props.value ? <Text style={styles.check}>✓</Text> : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.close} onPress={() => setOpen(false)} accessibilityRole="button">
              <Text style={styles.closeText}>{t('s2c.common.close')}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

/** A row of radio choices (Gender, Looking for). */
export function RadioRow(props: {
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  testIDPrefix: string;
}) {
  return (
    <View style={styles.radioRow} accessibilityRole="radiogroup">
      {props.options.map(o => {
        const on = o.value === props.value;
        return (
          <TouchableOpacity
            key={o.value}
            style={[styles.radio, on && styles.radioOn]}
            onPress={() => props.onChange(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            testID={`${props.testIDPrefix}-${o.value}`}
          >
            <Text style={[styles.radioText, on && styles.radioTextOn]}>{o.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  compact: { flex: 1 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.Muted, marginBottom: 8, letterSpacing: 0.2 },
  field: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: Colors.Line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, backgroundColor: Colors.Chalk,
  },
  fieldText: { fontSize: 16, color: Colors.Ink, fontWeight: '600' },
  caret: { fontSize: 14, color: Colors.Muted },
  backdrop: { flex: 1, backgroundColor: 'rgba(31,30,28,0.45)', justifyContent: 'center', padding: 24 },
  sheet: { backgroundColor: Colors.Chalk, borderRadius: 16, padding: 18, maxWidth: 480, width: '100%', alignSelf: 'center' },
  sheetTitle: { fontSize: 17, fontWeight: '800', color: Colors.Ink, marginBottom: 8 },
  option: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.Hairline },
  optionText: { fontSize: 16, color: Colors.Ink },
  check: { fontSize: 16, color: Colors.Ink },
  close: { marginTop: 10, alignItems: 'center', paddingVertical: 12 },
  closeText: { fontSize: 15, fontWeight: '700', color: Colors.Muted },
  radioRow: { flexDirection: 'row', gap: 10 },
  radio: { flex: 1, borderWidth: 1, borderColor: Colors.Line, borderRadius: 12, paddingVertical: 13, alignItems: 'center', backgroundColor: Colors.Chalk },
  radioOn: { backgroundColor: Colors.Ink, borderColor: Colors.Ink },
  radioText: { fontSize: 15, fontWeight: '600', color: Colors.Ink },
  radioTextOn: { color: Colors.Chalk },
});
