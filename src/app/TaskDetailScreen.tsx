import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  selectTaskById,
  selectActiveTaskId,
  setActiveTask,
  completeTask,
  deleteTask,
} from '../features/tasks/taskSlice';
import { useTimer } from '../hooks/useTimer';
import { blockerService } from '../features/appBlocker/blockerService';
import { COLORS } from '../constants/config';

export default function TaskDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const dispatch = useAppDispatch();
  const { taskId } = route.params as { taskId: string };

  const task = useAppSelector(selectTaskById(taskId));
  const activeTaskId = useAppSelector(selectActiveTaskId);
  const isActive = activeTaskId === taskId;

  const { remainingMs, isExpired } = useTimer(
    task?.deadline ?? 0,
    !!task && !task.completed,
  );

  // Auto-stop monitoring if task expires
  useEffect(() => {
    if (isExpired && isActive) {
      blockerService.stopMonitoring();
      dispatch(setActiveTask(null));
    }
  }, [isExpired, isActive, dispatch]);

  if (!task) return null;

  const formatTime = (ms: number) => {
    if (ms <= 0) return '00:00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0'),
    ].join(':');
  };

  const handleActivate = async () => {
    const [usage, accessibility, overlay] = await Promise.all([
      blockerService.hasUsageStatsPermission(),
      blockerService.hasAccessibilityPermission(),
      blockerService.hasOverlayPermission(),
    ]);
    if (!usage || !accessibility || !overlay) {
      Alert.alert(
        'Permissions Required',
        'Please grant all permissions before starting Focus Lock.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Go to Permissions',
            onPress: () => navigation.navigate('Permissions'),
          },
        ],
      );
      return;
    }
    if (activeTaskId && activeTaskId !== taskId) {
      blockerService.stopMonitoring();
    }
    dispatch(setActiveTask(taskId));
    blockerService.startMonitoring(task.blockedApps);
    Alert.alert('🔒 Focus Lock Active', 'Blocked apps are now locked!');
  };

  const handleDeactivate = () => {
    blockerService.stopMonitoring();
    dispatch(setActiveTask(null));
    Alert.alert('Focus Lock Stopped', 'Apps are now unblocked.');
  };

  const handleComplete = () => {
    Alert.alert('Complete Task', 'Mark this task as done?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Complete ✓',
        onPress: () => {
          blockerService.stopMonitoring();
          dispatch(completeTask(taskId));
          Alert.alert('🎉 Task Complete!', 'Great work! Apps are unlocked.');
          navigation.goBack();
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (isActive) blockerService.stopMonitoring();
          dispatch(deleteTask(taskId));
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Detail</Text>
        <TouchableOpacity onPress={handleDelete}>
          <Text style={styles.delete}>Delete</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Task Title */}
        <Text style={styles.taskTitle}>{task.title}</Text>

        {/* Priority Badge */}
        <View style={[styles.priorityBadge, styles[`priority_${task.priority}`]]}>
          <Text style={styles.priorityText}>
            {task.priority.toUpperCase()} PRIORITY
          </Text>
        </View>

        {/* Status Banner */}
        {isActive && (
          <View style={styles.activeBanner}>
            <Text style={styles.activeBannerText}>🔴 Focus Lock is Active</Text>
            <Text style={styles.activeBannerSub}>
              {task.blockedApps.length} app
              {task.blockedApps.length !== 1 ? 's' : ''} blocked
            </Text>
          </View>
        )}

        {task.completed && (
          <View style={styles.completedBanner}>
            <Text style={styles.completedBannerText}>✅ Task Completed</Text>
          </View>
        )}

        {isExpired && !task.completed && (
          <View style={styles.overdueBanner}>
            <Text style={styles.overdueBannerText}>⚠️ Task Overdue</Text>
          </View>
        )}

        {/* Countdown Timer */}
        {!task.completed && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>
              {isExpired ? 'Time Expired' : 'Time Remaining'}
            </Text>
            <Text style={[styles.timerValue, isExpired && styles.timerExpired]}>
              {formatTime(remainingMs)}
            </Text>
            <View style={styles.timerBar}>
              <View
                style={[
                  styles.timerBarFill,
                  {
                    width: `${Math.min(
                      100,
                      Math.max(
                        0,
                        (remainingMs /
                          (task.deadline - task.createdAt)) *
                          100,
                      ),
                    )}%`,
                  },
                  isExpired && styles.timerBarExpired,
                ]}
              />
            </View>
          </View>
        )}

        {/* Blocked Apps List */}
        {task.blockedApps.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              🚫 Blocked Apps ({task.blockedApps.length})
            </Text>
            {task.blockedApps.map(pkg => (
              <View key={pkg} style={styles.appRow}>
                <Text style={styles.appPkg} numberOfLines={1}>
                  {pkg}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        {!task.completed && (
          <View style={styles.actions}>
            {!isActive ? (
              <TouchableOpacity
                style={styles.activateBtn}
                onPress={handleActivate}>
                <Text style={styles.activateBtnText}>
                  ▶ Start Focus Lock
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.stopBtn}
                onPress={handleDeactivate}>
                <Text style={styles.stopBtnText}>■ Stop Monitoring</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.completeBtn}
              onPress={handleComplete}>
              <Text style={styles.completeBtnText}>✓ Mark Complete</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles: any = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  back: { color: COLORS.primary, fontSize: 16 },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  delete: { color: COLORS.danger, fontSize: 16 },
  content: { padding: 20, alignItems: 'center', gap: 16 },
  taskTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  priorityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  priority_low: { backgroundColor: '#1a472a' },
  priority_medium: { backgroundColor: '#7a5a00' },
  priority_high: { backgroundColor: '#7a1a1a' },
  priorityText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  activeBanner: {
    width: '100%',
    backgroundColor: '#1a1a3e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  activeBannerText: {
    color: '#FF6B6B',
    fontWeight: '800',
    fontSize: 16,
  },
  activeBannerSub: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  completedBanner: {
    width: '100%',
    backgroundColor: '#1a2e1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  completedBannerText: {
    color: COLORS.success,
    fontWeight: '800',
    fontSize: 16,
  },
  overdueBanner: {
    width: '100%',
    backgroundColor: '#2e1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  overdueBannerText: {
    color: COLORS.danger,
    fontWeight: '800',
    fontSize: 16,
  },
  timerContainer: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timerLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  timerValue: {
    fontSize: 52,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 4,
    fontVariant: ['tabular-nums'],
  },
  timerExpired: { color: COLORS.danger },
  timerBar: {
    width: '100%',
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    marginTop: 16,
    overflow: 'hidden',
  },
  timerBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  timerBarExpired: { backgroundColor: COLORS.danger },
  section: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 12,
  },
  appRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  appPkg: { color: COLORS.textSecondary, fontSize: 13 },
  actions: { width: '100%', gap: 12 },
  activateBtn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  activateBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  stopBtn: {
    backgroundColor: '#4a1a1a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  stopBtnText: { color: COLORS.danger, fontWeight: '800', fontSize: 16 },
  completeBtn: {
    backgroundColor: '#1a2e1a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  completeBtnText: { color: COLORS.success, fontWeight: '800', fontSize: 16 },
});