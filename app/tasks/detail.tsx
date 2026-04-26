// FILE: src/app/tasks/detail.tsx

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAppSelector } from '../../store/hooks';
import { selectTaskById } from '../../features/tasks/taskSlice';
import { useTasks } from '../../hooks/useTasks';
import { useTimer } from '../../hooks/useTimer';
import Timer from '../../components/Timer';
import { COLORS, DEFAULT_BLOCKED_APPS } from '../../constants/config';
import { formatDeadline, getPriorityColor } from '../../utils/helpers';

type RouteParams = { TaskDetail: { taskId: string } };

const TaskDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'TaskDetail'>>();
  const { taskId } = route.params;

  const task = useAppSelector(selectTaskById(taskId));
  const { markComplete, markIncomplete, removeTask } = useTasks();

  const { remainingMs, isExpired } = useTimer(
    taskId,
    task?.deadline ?? Date.now(),
    undefined,
    !!task && !task.completed,
  );

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removeTask(taskId);
            navigation.goBack();
          },
        },
      ],
    );
  }, [taskId, removeTask, navigation]);

  if (!task) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Task not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.goBack}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const blockedAppDetails = DEFAULT_BLOCKED_APPS.filter(a =>
    task.blockedApps.includes(a.packageName),
  );

  const overdue = !task.completed && task.deadline < Date.now();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Nav */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>Task Detail</Text>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
            <Text style={styles.deleteIcon}>🗑</Text>
          </TouchableOpacity>
        </View>

        {/* Timer hero section */}
        {!task.completed && (
          <View style={[styles.timerHero, overdue && styles.timerHeroOverdue]}>
            <Timer remainingMs={remainingMs} isExpired={isExpired} size="lg" />
            {overdue && (
              <View style={styles.overdueBadge}>
                <Text style={styles.overdueText}>DEADLINE PASSED</Text>
              </View>
            )}
          </View>
        )}

        {task.completed && (
          <View style={styles.completedHero}>
            <Text style={styles.completedEmoji}>🎉</Text>
            <Text style={styles.completedHeroText}>Task Completed!</Text>
          </View>
        )}

        <View style={styles.content}>
          {/* Priority badge */}
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) + '22' }]}>
            <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
            <Text style={[styles.priorityLabel, { color: getPriorityColor(task.priority) }]}>
              {task.priority.toUpperCase()} PRIORITY
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{task.title}</Text>

          {/* Description */}
          {task.description ? (
            <Text style={styles.description}>{task.description}</Text>
          ) : null}

          {/* Info cards */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardLabel}>DEADLINE</Text>
              <Text style={styles.infoCardValue}>{formatDeadline(task.deadline)}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardLabel}>TYPE</Text>
              <Text style={styles.infoCardValue}>
                {task.deadlineType === 'time' ? '⏰ Timed' : '📅 All Day'}
              </Text>
            </View>
          </View>

          {/* Blocked apps */}
          {blockedAppDetails.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                🔒 BLOCKED APPS ({blockedAppDetails.length})
              </Text>
              <View style={styles.appsGrid}>
                {blockedAppDetails.map(app => (
                  <View key={app.packageName} style={styles.appChip}>
                    <Text style={styles.appChipText}>{app.displayName}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.actions}>
            {!task.completed ? (
              <TouchableOpacity
                style={styles.completeBtn}
                onPress={() => markComplete(task.id)}
              >
                <Text style={styles.completeBtnText}>✓ Mark as Complete</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.uncompleteBtn}
                onPress={() => markIncomplete(task.id)}
              >
                <Text style={styles.uncompleteBtnText}>↩ Mark as Incomplete</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 22, color: COLORS.textPrimary },
  navTitle: { fontSize: 17, fontWeight: '800', color: COLORS.textPrimary },
  deleteBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  deleteIcon: { fontSize: 20 },
  timerHero: {
    alignItems: 'center',
    paddingVertical: 36,
    marginHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    gap: 12,
  },
  timerHeroOverdue: {
    borderColor: COLORS.danger + '66',
    backgroundColor: COLORS.danger + '11',
  },
  overdueBadge: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  overdueText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1.5,
  },
  completedHero: {
    alignItems: 'center',
    paddingVertical: 36,
    gap: 10,
  },
  completedEmoji: { fontSize: 60 },
  completedHeroText: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.success,
  },
  content: { paddingHorizontal: 20, paddingBottom: 60, gap: 18 },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  priorityDot: { width: 7, height: 7, borderRadius: 4 },
  priorityLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.8,
    lineHeight: 30,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 21,
  },
  infoGrid: { flexDirection: 'row', gap: 12 },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  infoCardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
  },
  infoCardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  section: { gap: 10 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
  },
  appsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  appChip: {
    backgroundColor: COLORS.primary + '22',
    borderWidth: 1,
    borderColor: COLORS.primary + '55',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  appChipText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  actions: { marginTop: 8, gap: 12 },
  completeBtn: {
    backgroundColor: COLORS.success,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  completeBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
  uncompleteBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  uncompleteBtnText: { color: COLORS.textSecondary, fontSize: 15, fontWeight: '600' },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFoundText: { fontSize: 18, color: COLORS.textSecondary },
  goBack: { fontSize: 15, color: COLORS.primary },
});

export default TaskDetailScreen;