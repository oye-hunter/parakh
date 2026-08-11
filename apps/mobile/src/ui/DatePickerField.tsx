import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { border, color, font, radius, space, surface } from '@parakh/tokens';

import { Button } from './Button';
import { Text } from './Text';

export interface DatePickerFieldProps {
  label: string;
  value: string; // YYYY-MM-DD
  onChangeDate: (dateStr: string) => void;
  placeholder?: string;
  helper?: string;
  error?: string | null;
  /** Minimum year (default 1940) */
  minYear?: number;
  /** Maximum year (default 2035) */
  maxYear?: number;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  fieldInput: {
    backgroundColor: surface.inset,
    borderRadius: radius.input,
    borderWidth: border.field,
    borderColor: color.vastInk,
    paddingVertical: 14,
    paddingHorizontal: space.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  focused: { borderWidth: border.heavy, borderColor: color.forestInk },
  errored: { borderWidth: border.heavy, borderColor: color.riskHigh },
  fieldValue: {
    fontFamily: font.data,
    fontSize: 16,
    color: color.vastInk,
  },
  placeholder: {
    fontFamily: font.data,
    fontSize: 16,
    color: color.fog,
  },
  calendarIcon: {
    fontFamily: font.data,
    fontSize: 14,
    color: color.fog,
  },
  /* Modal Styles */
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 26, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: space.base,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: color.lumenCream,
    borderRadius: radius.card,
    borderWidth: border.heavy,
    borderColor: color.vastInk,
    padding: space.base,
    gap: space.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wheelSection: {
    gap: space.xs,
  },
  scrollPillRow: {
    flexDirection: 'row',
    gap: space.xs,
  },
  pillItem: {
    borderRadius: radius.pill,
    borderWidth: border.hair,
    borderColor: color.vastInk,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: surface.card,
  },
  pillSelected: {
    backgroundColor: color.vastInk,
  },
  pillText: {
    fontFamily: font.data,
    fontSize: 13,
    color: color.vastInk,
  },
  pillTextSelected: {
    color: color.lumenCream,
  },
  /* Grid */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
  },
  dayHeaderCell: {
    width: '14.28%',
    alignItems: 'center',
  },
  dayCell: {
    width: '14.28%',
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.pill,
  },
  dayCellSelected: {
    backgroundColor: color.forestInk,
  },
  dayText: {
    fontFamily: font.data,
    fontSize: 14,
    color: color.vastInk,
  },
  dayTextSelected: {
    color: color.lumenCream,
    fontWeight: 'bold',
  },
  actions: {
    gap: space.xs,
    marginTop: space.xs,
  },
});

export function DatePickerField({
  label,
  value,
  onChangeDate,
  placeholder = 'YYYY-MM-DD',
  helper,
  error,
  minYear = 1940,
  maxYear = 2035,
}: DatePickerFieldProps) {
  const [modalVisible, setModalVisible] = useState(false);

  // Parse current value or default to current date
  const parsed = parseDateString(value);
  const [tempYear, setTempYear] = useState(parsed ? parsed.year : 1995);
  const [tempMonth, setTempMonth] = useState(parsed ? parsed.month : 1); // 1-12
  const [tempDay, setTempDay] = useState(parsed ? parsed.day : 15);

  function openModal() {
    const current = parseDateString(value);
    if (current) {
      setTempYear(current.year);
      setTempMonth(current.month);
      setTempDay(current.day);
    }
    setModalVisible(true);
  }

  function confirmSelection() {
    const formatted = `${tempYear}-${String(tempMonth).padStart(2, '0')}-${String(
      tempDay,
    ).padStart(2, '0')}`;
    onChangeDate(formatted);
    setModalVisible(false);
  }

  // Calculate days in month
  const daysInMonth = new Date(tempYear, tempMonth, 0).getDate();
  const firstWeekday = (new Date(tempYear, tempMonth - 1, 1).getDay() + 6) % 7; // MON=0

  const yearsList: number[] = [];
  for (let y = maxYear; y >= minYear; y--) {
    yearsList.push(y);
  }

  return (
    <View style={styles.wrap}>
      <Text variant="micro">{label}</Text>

      <Pressable
        onPress={openModal}
        style={[styles.fieldInput, error ? styles.errored : null]}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value || 'Select date'}`}
      >
        <Text style={value ? styles.fieldValue : styles.placeholder}>
          {value || placeholder}
        </Text>
        <Text style={styles.calendarIcon}>📅</Text>
      </Pressable>

      {error ? (
        <Text variant="caption" tone="riskHigh">
          {error}
        </Text>
      ) : helper ? (
        <Text variant="caption" tone="fog">
          {helper}
        </Text>
      ) : null}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text variant="micro" tone="fog">
                  SELECT DATE
                </Text>
                <Text variant="titleSm" style={{ marginTop: 2 }}>
                  {MONTH_NAMES[tempMonth - 1]} {tempYear}
                </Text>
              </View>
              <Pressable onPress={() => setModalVisible(false)}>
                <Text variant="caption" tone="fog">
                  ✕ Close
                </Text>
              </Pressable>
            </View>

            {/* Revolver Wheel: Year Selector */}
            <View style={styles.wheelSection}>
              <Text variant="micro" tone="fog">
                YEAR
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollPillRow}
              >
                {yearsList.map((y) => {
                  const isSel = y === tempYear;
                  return (
                    <Pressable
                      key={y}
                      onPress={() => setTempYear(y)}
                      style={[styles.pillItem, isSel && styles.pillSelected]}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          isSel && styles.pillTextSelected,
                        ]}
                      >
                        {y}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Revolver Wheel: Month Selector */}
            <View style={styles.wheelSection}>
              <Text variant="micro" tone="fog">
                MONTH
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollPillRow}
              >
                {MONTH_NAMES.map((name, idx) => {
                  const m = idx + 1;
                  const isSel = m === tempMonth;
                  return (
                    <Pressable
                      key={name}
                      onPress={() => {
                        setTempMonth(m);
                        const maxDays = new Date(tempYear, m, 0).getDate();
                        if (tempDay > maxDays) setTempDay(maxDays);
                      }}
                      style={[styles.pillItem, isSel && styles.pillSelected]}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          isSel && styles.pillTextSelected,
                        ]}
                      >
                        {name.slice(0, 3)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Days Grid Header */}
            <View style={styles.grid}>
              {WEEKDAYS.map((wd) => (
                <View key={wd} style={styles.dayHeaderCell}>
                  <Text variant="micro" tone="fog">
                    {wd}
                  </Text>
                </View>
              ))}

              {/* Offset for first day */}
              {Array.from({ length: firstWeekday }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.dayCell} />
              ))}

              {/* Days of month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const isSelected = dayNum === tempDay;
                return (
                  <Pressable
                    key={dayNum}
                    onPress={() => setTempDay(dayNum)}
                    style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected && styles.dayTextSelected,
                      ]}
                    >
                      {dayNum}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <Button label="Confirm Date" onPress={confirmSelection} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function parseDateString(str?: string) {
  if (!str) return null;
  const parts = str.split('-');
  if (parts.length !== 3) return null;
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!year || !month || !day) return null;
  return { year, month, day };
}
