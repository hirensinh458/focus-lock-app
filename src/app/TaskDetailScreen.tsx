import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppSelector } from '../store/hooks';
import { selectTaskById } from '../features/tasks/taskSlice';
import { useTasks } from '../hooks/useTasks';
import Timer from '../components/Timer';
import { useTimer } from '../hooks/useTimer';
import { COLORS } from '../constants/config';

export default function TaskDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { taskId } = route.params as { taskId: string };
  const task = useAppSelector(selectTaskById(taskId));
  const { markComplete, removeTask } = useTasks();
  const { remainingMs, isExpired } = useTimer(
    task?.deadline ?? 0,
    !!task && !task.completed
  );

  if (!task) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Task Detail</Text>
        <TouchableOpacity
          onPress={() => {
            removeTask(task.id);
            navigation.goBack();
          }}
        >
          <Text style={styles.delete}>Delete</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        {!task.completed && (
          <Timer remainingMs={remainingMs} isExpired={isExpired} size="lg" />
        )}
        {!task.completed && (
          <TouchableOpacity
            style={styles.completeBtn}
            onPress={() => markComplete(task.id)}
          >
            <Text style={styles.completeText}>✓ Mark Complete</Text>
          </TouchableOpacity>
        )}
        {task.completed && <Text style={styles.completed}>✅ Completed</Text>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  back: { color: COLORS.primary },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  delete: { color: COLORS.danger },
  content: { padding: 20, alignItems: 'center', gap: 24 },
  taskTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  completeBtn: {
    backgroundColor: COLORS.success,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  completeText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
  completed: { fontSize: 18, color: COLORS.success },
});