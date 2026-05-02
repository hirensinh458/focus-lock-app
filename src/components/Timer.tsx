import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCountdown } from '../utils/helpers';
import { COLORS } from '../constants/config';

interface Props { remainingMs: number; isExpired: boolean; size?: 'sm' | 'lg'; }
export default function Timer({ remainingMs, isExpired, size = 'sm' }: Props) {
  const fontSize = size === 'lg' ? 48 : 28;
  return (
    <View style={styles.container}>
      <Text style={[styles.timer, { fontSize }, isExpired && styles.expired]}>
        {formatCountdown(remainingMs)}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  timer: { fontWeight: '800', color: COLORS.textPrimary, fontVariant: ['tabular-nums'] },
  expired: { color: COLORS.danger },
});