// FILE: src/components/Timer.tsx

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCountdown } from '../utils/helpers';
import { COLORS } from '../constants/config';

interface TimerProps {
  remainingMs: number;
  isExpired: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const Timer = memo(({ remainingMs, isExpired, size = 'md', showLabel = true }: TimerProps) => {
  const timeStr = formatCountdown(remainingMs);
  const segments = timeStr.split(':');

  const fontSizes = {
    sm: { digit: 20, colon: 16, label: 9 },
    md: { digit: 32, colon: 24, label: 11 },
    lg: { digit: 52, colon: 40, label: 13 },
  };

  const fs = fontSizes[size];

  return (
    <View style={styles.container}>
      {showLabel && (
        <Text style={[styles.label, { fontSize: fs.label }]}>
          {isExpired ? 'TIME EXPIRED' : 'TIME REMAINING'}
        </Text>
      )}
      <View style={styles.digitRow}>
        {segments.map((seg, idx) => (
          <React.Fragment key={idx}>
            <View style={styles.digitBlock}>
              {seg.split('').map((char, ci) => (
                <Text
                  key={ci}
                  style={[
                    styles.digit,
                    { fontSize: fs.digit },
                    isExpired && styles.digitExpired,
                  ]}
                >
                  {char}
                </Text>
              ))}
            </View>
            {idx < segments.length - 1 && (
              <Text
                style={[
                  styles.colon,
                  { fontSize: fs.colon },
                  isExpired && styles.digitExpired,
                ]}
              >
                :
              </Text>
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
  },
  label: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  digitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  digitBlock: {
    flexDirection: 'row',
  },
  digit: {
    color: COLORS.textPrimary,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  digitExpired: {
    color: COLORS.danger,
  },
  colon: {
    color: COLORS.textSecondary,
    fontWeight: '800',
    marginBottom: 4,
    paddingHorizontal: 2,
  },
});

export default Timer;