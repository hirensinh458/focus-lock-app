// FILE: src/components/TaskCard.tsx

import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Task } from '../features/tasks/taskTypes';
import {
  formatDeadline,
  formatCountdown,
  getDeadlineProgressPercent,
  getPriorityColor,
  isTaskOverdue,
} from '../utils/helpers';
import { COLORS } from '../constants/config';
import { useTimer } from '../hooks/useTimer';

interface TaskCardProps {
  task: Task;
  onPress: (task: Task) => void;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const TaskCard = memo(({ task, onPress, onComplete, onDelete }: TaskCardProps) => {
  const { remainingMs, isExpired } = useTimer(task.id, task.deadline, undefined, !task.completed);
  const progress = getDeadlineProgressPercent(task.createdAt, task.deadline);
  const priorityColor = getPriorityColor(task.priority);
  const overdue = isTaskOverdue(task.deadline) && !task.completed;

  const statusColor = task.completed
    ? COLORS.success
    : overdue
    ? COLORS.danger
    : COLORS.primary;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        task.completed && styles.cardCompleted,
        overdue && styles.cardOverdue,
      ]}
      onPress={() => onPress(task)}
      activeOpacity={0.85}
    >
      {/* Priority stripe */}
      <View style={[styles.priorityBar, { backgroundColor: priorityColor }]} />

      <View style={styles.cardBody}>
        {/* Header */}
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              task.completed && styles.titleCompleted,
            ]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
          <TouchableOpacity
            style={[styles.checkBtn, task.completed && styles.checkBtnDone]}
            onPress={() => onComplete(task.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.checkIcon}>{task.completed ? '✓' : ''}</Text>
          </TouchableOpacity>
        </View>

        {/* Countdown / Status */}
        {!task.completed && (
          <View style={styles.timerRow}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.timerText, overdue && styles.overdueText]}>
              {overdue ? 'OVERDUE' : formatCountdown(remainingMs)}
            </Text>
            <Text style={styles.deadlineText}>{formatDeadline(task.deadline)}</Text>
          </View>
        )}

        {task.completed && (
          <Text style={styles.completedLabel}>✓ Completed</Text>
        )}

        {/* Progress bar */}
        {!task.completed && (
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor: overdue ? COLORS.danger : COLORS.primary,
                },
              ]}
            />
          </View>
        )}

        {/* Blocked apps count */}
        {task.blockedApps.length > 0 && !task.completed && (
          <View style={styles.appsRow}>
            <Text style={styles.appsIcon}>🔒</Text>
            <Text style={styles.appsText}>
              {task.blockedApps.length} app{task.blockedApps.length > 1 ? 's' : ''} blocked
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 7,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cardCompleted: {
    opacity: 0.55,
    borderColor: COLORS.success + '44',
  },
  cardOverdue: {
    borderColor: COLORS.danger + '66',
  },
  priorityBar: {
    width: 4,
    borderRadius: 0,
  },
  cardBody: {
    flex: 1,
    padding: 14,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  checkBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkBtnDone: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  checkIcon: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  timerText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
  overdueText: {
    color: COLORS.danger,
  },
  deadlineText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 'auto',
  },
  progressTrack: {
    height: 3,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  appsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  appsIcon: {
    fontSize: 12,
  },
  appsText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  completedLabel: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '600',
  },
});

export default TaskCard;