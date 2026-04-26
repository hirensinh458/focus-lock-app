// FILE: src/components/BlockScreen.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { COLORS } from '../constants/config';
import { useAppSelector } from '../store/hooks';
import { selectBlockedByTaskId, selectIsBlockScreenVisible } from '../features/appBlocker/blockerSlice';
import { selectTaskById } from '../features/tasks/taskSlice';
import { useBlocker } from '../hooks/useBlocker';

const { width, height } = Dimensions.get('window');

const BlockScreen: React.FC = () => {
  const isVisible = useAppSelector(selectIsBlockScreenVisible);
  const blockedTaskId = useAppSelector(selectBlockedByTaskId);
  const task = useAppSelector(
    blockedTaskId ? selectTaskById(blockedTaskId) : () => undefined,
  );
  const { dismissBlockScreen } = useBlocker();

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <View style={styles.container}>
        {/* Background pattern */}
        <View style={styles.bgPattern} />

        {/* Lock icon */}
        <View style={styles.lockIconWrap}>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>

        {/* Main message */}
        <Text style={styles.headline}>APP BLOCKED</Text>
        <Text style={styles.subheadline}>Focus Lock is protecting your time</Text>

        {/* Task info */}
        {task && (
          <View style={styles.taskCard}>
            <Text style={styles.taskLabel}>ACTIVE TASK</Text>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskDeadline}>
              Complete this task to unlock your apps
            </Text>
          </View>
        )}

        {/* Motivational */}
        <Text style={styles.motivational}>
          Stay focused. Your future self will thank you.
        </Text>

        {/* Emergency dismiss — requires conscious choice */}
        <TouchableOpacity
          style={styles.dismissBtn}
          onPress={dismissBlockScreen}
          activeOpacity={0.7}
        >
          <Text style={styles.dismissText}>Go Back to Focus Lock</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Complete your task to permanently unlock this app
        </Text>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  bgPattern: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
    opacity: 0.95,
  },
  lockIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  lockIcon: {
    fontSize: 44,
  },
  headline: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 8,
  },
  subheadline: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 36,
    letterSpacing: 0.3,
  },
  taskCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    width: '100%',
    marginBottom: 32,
    gap: 6,
  },
  taskLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 2,
    marginBottom: 2,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  taskDeadline: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  motivational: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  dismissBtn: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  dismissText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  footerNote: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

export default BlockScreen;