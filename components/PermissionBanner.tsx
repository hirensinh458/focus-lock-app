// FILE: src/components/PermissionBanner.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/config';

interface PermissionBannerProps {
  type: 'usageStats' | 'accessibility';
  onPress: () => void;
}

const PermissionBanner: React.FC<PermissionBannerProps> = ({ type, onPress }) => {
  const isUsage = type === 'usageStats';

  return (
    <View style={styles.banner}>
      <View style={styles.left}>
        <Text style={styles.icon}>{isUsage ? '📊' : '♿'}</Text>
        <View style={styles.textWrap}>
          <Text style={styles.title}>
            {isUsage ? 'Usage Access Required' : 'Accessibility Access Required'}
          </Text>
          <Text style={styles.desc}>
            {isUsage
              ? 'Needed to detect which app is open and block it.'
              : 'Needed to intercept and redirect blocked apps.'}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.btn} onPress={onPress}>
        <Text style={styles.btnText}>Grant</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: COLORS.warning + '22',
    borderWidth: 1,
    borderColor: COLORS.warning + '55',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: { fontSize: 22 },
  textWrap: { flex: 1 },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.warning,
    marginBottom: 2,
  },
  desc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15,
  },
  btn: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  btnText: {
    color: COLORS.black,
    fontWeight: '700',
    fontSize: 13,
  },
});

export default PermissionBanner;