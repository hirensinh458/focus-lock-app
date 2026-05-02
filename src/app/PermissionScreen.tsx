import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Alert,
  AppState,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { blockerService } from '../features/appBlocker/blockerService';
import { COLORS } from '../constants/config';

interface PermissionItem {
  key: string;
  title: string;
  description: string;
  granted: boolean;
}

export default function PermissionScreen() {
  const navigation = useNavigation();
  const [permissions, setPermissions] = useState<PermissionItem[]>([
    {
      key: 'usage',
      title: '📊 Usage Access',
      description:
        'Required to detect which app is in the foreground so Focus Lock can block distracting apps.',
      granted: false,
    },
    {
      key: 'accessibility',
      title: '♿ Accessibility Service',
      description:
        'Required to instantly detect and block apps the moment you open them.',
      granted: false,
    },
    {
      key: 'overlay',
      title: '🪟 Display Over Other Apps',
      description:
        'Required to show the Focus Lock screen on top of blocked apps.',
      granted: false,
    },
  ]);

  const checkAll = useCallback(async () => {
    const [usage, accessibility, overlay] = await Promise.all([
      blockerService.hasUsageStatsPermission(),
      blockerService.hasAccessibilityPermission(),
      blockerService.hasOverlayPermission(),
    ]);

    setPermissions(prev =>
      prev.map(p => {
        if (p.key === 'usage') return { ...p, granted: usage };
        if (p.key === 'accessibility') return { ...p, granted: accessibility };
        if (p.key === 'overlay') return { ...p, granted: overlay };
        return p;
      }),
    );

    return usage && accessibility && overlay;
  }, []);

  const handleRequest = async (key: string) => {
    if (key === 'usage') blockerService.requestUsageStatsPermission();
    if (key === 'accessibility') blockerService.requestAccessibilityPermission();
    if (key === 'overlay') blockerService.requestOverlayPermission();

    // Wait for user to return from settings then recheck
    const sub = AppState.addEventListener('change', async state => {
      if (state === 'active') {
        sub.remove();
        await checkAll();
      }
    });
  };

  const handleContinue = async () => {
    const allGranted = await checkAll();
    if (!allGranted) {
      Alert.alert(
        'Permissions Required',
        'Please grant all permissions for Focus Lock to work correctly.',
      );
      return;
    }
    navigation.goBack();
  };

  React.useEffect(() => {
    checkAll();
  }, [checkAll]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.heading}>🔒 Setup Focus Lock</Text>
        <Text style={styles.subheading}>
          Grant the following permissions to enable app blocking.
        </Text>

        {permissions.map(p => (
          <View key={p.key} style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{p.title}</Text>
              <View
                style={[
                  styles.badge,
                  p.granted ? styles.badgeGranted : styles.badgeDenied,
                ]}>
                <Text style={styles.badgeText}>
                  {p.granted ? '✓ Granted' : '✗ Required'}
                </Text>
              </View>
            </View>
            <Text style={styles.cardDesc}>{p.description}</Text>
            {!p.granted && (
              <TouchableOpacity
                style={styles.grantBtn}
                onPress={() => handleRequest(p.key)}>
                <Text style={styles.grantText}>Grant Permission →</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: 20 },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeGranted: { backgroundColor: '#1a472a' },
  badgeDenied: { backgroundColor: '#4a1a1a' },
  badgeText: { fontSize: 12, color: '#FFFFFF', fontWeight: '600' },
  cardDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  grantBtn: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  grantText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  continueBtn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  continueText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
});