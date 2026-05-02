import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  selectPendingTasks,
  selectCompletedTasks,
  selectActiveTask,
  setActiveTask,
  completeTask,
} from '../features/tasks/taskSlice';
import { blockerService } from '../features/appBlocker/blockerService';
import { TaskCard } from '../components/TaskCard';
import { COLORS } from '../constants/config';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const pendingTasks = useAppSelector(selectPendingTasks);
  const completedTasks = useAppSelector(selectCompletedTasks);
  const activeTask = useAppSelector(selectActiveTask);
  const [permissionsOk, setPermissionsOk] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const [usage, accessibility, overlay] = await Promise.all([
      blockerService.hasUsageStatsPermission(),
      blockerService.hasAccessibilityPermission(),
      blockerService.hasOverlayPermission(),
    ]);
    setPermissionsOk(usage && accessibility && overlay);
  };

  const handleActivateTask = async (taskId: string, blockedApps: string[]) => {
    if (!permissionsOk) {
      Alert.alert(
        'Permissions Needed',
        'Please grant all required permissions first.',
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
    // Stop any existing monitoring
    if (activeTask) {
      blockerService.stopMonitoring();
    }
    dispatch(setActiveTask(taskId));
    blockerService.startMonitoring(blockedApps);
    Alert.alert('Focus Lock Active', 'Blocked apps are now locked!');
  };

  const handleDeactivateTask = () => {
    blockerService.stopMonitoring();
    dispatch(setActiveTask(null));
    Alert.alert('Focus Lock Stopped', 'Apps are now unblocked.');
  };

  const handleCompleteTask = (taskId: string) => {
    Alert.alert('Complete Task', 'Mark this task as done?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Complete',
        onPress: () => {
          blockerService.stopMonitoring();
          dispatch(completeTask(taskId));
          Alert.alert('🎉 Task Complete!', 'Great work! Apps are unlocked.');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>🔒 Focus Lock</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[
              styles.permBtn,
              permissionsOk ? styles.permBtnOk : styles.permBtnWarn,
            ]}
            onPress={() => navigation.navigate('Permissions')}>
            <Text style={styles.permBtnText}>
              {permissionsOk ? '✓ Ready' : '⚠ Setup'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('CreateTask')}>
            <Text style={styles.addBtnText}>+ New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Task Banner */}
      {activeTask && (
        <View style={styles.activeBanner}>
          <View style={styles.activeBannerLeft}>
            <Text style={styles.activeBannerLabel}>🔴 ACTIVE</Text>
            <Text style={styles.activeBannerTitle} numberOfLines={1}>
              {activeTask.title}
            </Text>
          </View>
          <View style={styles.activeBannerActions}>
            <TouchableOpacity
              style={styles.completeBtn}
              onPress={() => handleCompleteTask(activeTask.id)}>
              <Text style={styles.completeBtnText}>✓ Done</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.stopBtn}
              onPress={handleDeactivateTask}>
              <Text style={styles.stopBtnText}>■ Stop</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={pendingTasks}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          pendingTasks.length > 0 ? (
            <Text style={styles.sectionLabel}>Pending Tasks</Text>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No pending tasks.</Text>
            <Text style={styles.emptySubText}>
              Tap "+ New" to create your first task.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            isActive={activeTask?.id === item.id}
            onActivate={() =>
              handleActivateTask(item.id, item.blockedApps)
            }
            onComplete={() => handleCompleteTask(item.id)}
            onPress={() =>
              navigation.navigate('TaskDetail', { taskId: item.id })
            }
          />
        )}
        ListFooterComponent={
          completedTasks.length > 0 ? (
            <>
              <Text style={[styles.sectionLabel, { marginTop: 16 }]}>
                Completed
              </Text>
              {completedTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isActive={false}
                  onActivate={() => {}}
                  onComplete={() => {}}
                  onPress={() =>
                    navigation.navigate('TaskDetail', { taskId: task.id })
                  }
                />
              ))}
            </>
          ) : null
        }
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  heading: { fontSize: 22, fontWeight: 'bold', color: COLORS.textPrimary },
  headerRight: { flexDirection: 'row', gap: 8 },
  permBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  permBtnOk: { backgroundColor: '#1a472a' },
  permBtnWarn: { backgroundColor: '#7a3a00' },
  permBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  addBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: { color: '#FFFFFF', fontWeight: '700' },
  activeBanner: {
    backgroundColor: '#1a1a3e',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeBannerLeft: { flex: 1 },
  activeBannerLabel: {
    fontSize: 10,
    color: '#FF6B6B',
    fontWeight: '800',
    letterSpacing: 1,
  },
  activeBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  activeBannerActions: { flexDirection: 'row', gap: 8 },
  completeBtn: {
    backgroundColor: '#1a472a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  completeBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  stopBtn: {
    backgroundColor: '#4a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  stopBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  list: { paddingVertical: 16 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '600' },
  emptySubText: { color: COLORS.textSecondary, fontSize: 14, marginTop: 8 },
});