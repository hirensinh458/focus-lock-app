import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Task } from '../features/tasks/taskTypes';
import { formatCountdown, formatDeadline, getPriorityColor } from '../utils/helpers';
import { COLORS } from '../constants/config';
import { useTimer } from '../hooks/useTimer';

interface Props { task: Task; onPress: () => void; onComplete: () => void; }
const TaskCard = memo(({ task, onPress, onComplete }: Props) => {
  const { remainingMs, isExpired } = useTimer(task.deadline, !task.completed);
  const priorityColor = getPriorityColor(task.priority);
  const isOverdue = !task.completed && task.deadline < Date.now();

  return (
    <TouchableOpacity style={[styles.card, isOverdue && styles.overdueCard]} onPress={onPress}>
      <View style={[styles.priorityBar, { backgroundColor: priorityColor }]} />
      <View style={styles.content}>
        <Text style={[styles.title, task.completed && styles.completedTitle]}>{task.title}</Text>
        {!task.completed && (
          <View style={styles.row}>
            <Text style={[styles.timer, isOverdue && styles.overdueText]}>
              {isOverdue ? 'OVERDUE' : formatCountdown(remainingMs)}
            </Text>
            <Text style={styles.deadline}>{formatDeadline(task.deadline)}</Text>
          </View>
        )}
        <TouchableOpacity style={styles.checkCircle} onPress={onComplete}>
          <Text>{task.completed ? '✓' : '○'}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});
const styles = StyleSheet.create({
  card: { flexDirection: 'row', marginHorizontal: 16, marginVertical: 6, backgroundColor: COLORS.surface, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  priorityBar: { width: 4 },
  content: { flex: 1, padding: 12, gap: 4 },
  title: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  completedTitle: { textDecorationLine: 'line-through', color: COLORS.textSecondary },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  timer: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  overdueText: { color: COLORS.danger },
  deadline: { fontSize: 11, color: COLORS.textSecondary },
  checkCircle: { position: 'absolute', right: 12, top: 12, width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  overdueCard: { borderColor: COLORS.danger },
});
export default TaskCard;