import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Task } from '../features/tasks/taskTypes';
import { COLORS } from '../constants/config';

interface Props {
  task: Task;
  isActive: boolean;
  onPress: () => void;
  onActivate: () => void;
  onComplete: () => void;
}

export function TaskCard({ task, isActive, onPress, onActivate, onComplete }: Props) {
  const timeLeft = task.deadline - Date.now();
  const hoursLeft = Math.max(0, Math.floor(timeLeft / 3600000));
  const minsLeft = Math.max(0, Math.floor((timeLeft % 3600000) / 60000));
  const isOverdue = !task.completed && timeLeft <= 0;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isActive && styles.cardActive,
        task.completed && styles.cardCompleted,
        isOverdue && styles.cardOverdue,
      ]}
      onPress={onPress}
      activeOpacity={0.8}>
      {/* Top Row */}
      <View style={styles.topRow}>
        <Text style={styles.title} numberOfLines={1}>
          {task.title}
        </Text>
        <View style={[styles.priorityBadge, styles[`priority_${task.priority}`]]}>
          <Text style={styles.priorityText}>{task.priority}</Text>
        </View>
      </View>

      {/* Meta Row */}
      <View style={styles.metaRow}>
        {task.completed ? (
          <Text style={styles.metaCompleted}>✓ Completed</Text>
        ) : isOverdue ? (
          <Text style={styles.metaOverdue}>⚠ Overdue</Text>
        ) : (
          <Text style={styles.metaTime}>
            ⏱ {hoursLeft}h {minsLeft}m remaining
          </Text>
        )}
        {task.blockedApps.length > 0 && (
          <Text style={styles.metaApps}>
            🚫 {task.blockedApps.length} app{task.blockedApps.length > 1 ? 's' : ''} blocked
          </Text>
        )}
      </View>

      {/* Action Buttons — only for pending tasks */}
      {!task.completed && (
        <View style={styles.actions}>
          {isActive ? (
            <View style={styles.activeIndicator}>
              <Text style={styles.activeIndicatorText}>🔴 Monitoring Active</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.activateBtn} onPress={onActivate}>
              <Text style={styles.activateBtnText}>▶ Start Focus</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.doneBtn} onPress={onComplete}>
            <Text style={styles.doneBtnText}>✓ Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardActive: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  cardCompleted: {
    opacity: 0.5,
  },
  cardOverdue: {
    borderColor: '#FF6B6B',
    borderWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  priority_low: { backgroundColor: '#1a472a' },
  priority_medium: { backgroundColor: '#7a5a00' },
  priority_high: { backgroundColor: '#7a1a1a' },
  priorityText: { fontSize: 11, color: '#FFFFFF', fontWeight: '600' },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metaTime: { fontSize: 13, color: COLORS.textSecondary },
  metaCompleted: { fontSize: 13, color: '#4CAF50' },
  metaOverdue: { fontSize: 13, color: '#FF6B6B' },
  metaApps: { fontSize: 13, color: COLORS.textSecondary },
  actions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  activateBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  activateBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  activeIndicator: {
    flex: 1,
    backgroundColor: '#1a1a3e',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeIndicatorText: { color: '#FF6B6B', fontWeight: '700', fontSize: 13 },
  doneBtn: {
    backgroundColor: '#1a472a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
});