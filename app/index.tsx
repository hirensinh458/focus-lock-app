// FILE: src/app/index.tsx  (Home screen — task list)

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTasks } from '../hooks/useTasks';
import { useBlocker } from '../hooks/useBlocker';
import { Task } from '../features/tasks/taskTypes';
import TaskCard from '../components/TaskCard';
import EmptyState from '../components/EmptyState';
import PermissionBanner from '../components/PermissionBanner';
import BlockScreen from '../components/BlockScreen';
import { COLORS } from '../constants/config';

type FilterTab = 'active' | 'completed' | 'overdue';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { pendingTasks, completedTasks, overdueTasks, markComplete, removeTask } = useTasks();
  const { permissions, requestUsageStats, requestAccessibility } = useBlocker();
  const [activeTab, setActiveTab] = useState<FilterTab>('active');
  const [refreshing, setRefreshing] = useState(false);

  const displayedTasks =
    activeTab === 'active'
      ? pendingTasks
      : activeTab === 'overdue'
      ? overdueTasks
      : completedTasks;

  const handlePress = useCallback(
    (task: Task) => {
      navigation.navigate('TaskDetail', { taskId: task.id });
    },
    [navigation],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const tabCount = {
    active: pendingTasks.length,
    overdue: overdueTasks.length,
    completed: completedTasks.length,
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Permission banners */}
      {!permissions.usageStats && (
        <PermissionBanner type="usageStats" onPress={requestUsageStats} />
      )}
      {!permissions.accessibility && (
        <PermissionBanner type="accessibility" onPress={requestAccessibility} />
      )}

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>FOCUS LOCK</Text>
          <Text style={styles.subtitle}>
            {pendingTasks.length} task{pendingTasks.length !== 1 ? 's' : ''} active
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('CreateTask')}
        >
          <Text style={styles.addIcon}>＋</Text>
        </TouchableOpacity>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{pendingTasks.length}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={[styles.statDivider]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.danger }]}>
            {overdueTasks.length}
          </Text>
          <Text style={styles.statLabel}>Overdue</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.success }]}>
            {completedTasks.length}
          </Text>
          <Text style={styles.statLabel}>Done</Text>
        </View>
      </View>

      {/* Filter tabs */}
      <View style={styles.tabs}>
        {(['active', 'overdue', 'completed'] as FilterTab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tabCount[tab] > 0 ? ` (${tabCount[tab]})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Task list */}
      <FlatList
        data={displayedTasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={handlePress}
            onComplete={markComplete}
            onDelete={removeTask}
          />
        )}
        contentContainerStyle={displayedTasks.length === 0 ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon={activeTab === 'completed' ? '🎉' : '📋'}
            title={activeTab === 'completed' ? 'No completed tasks' : 'No tasks here'}
            message={
              activeTab === 'active'
                ? 'Create your first task to start blocking distractions'
                : activeTab === 'overdue'
                ? 'Great job keeping up with your deadlines!'
                : 'Complete tasks to see them here'
            }
            actionLabel={activeTab === 'active' ? '+ Create Task' : undefined}
            onAction={activeTab === 'active' ? () => navigation.navigate('CreateTask') : undefined}
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Block screen overlay */}
      <BlockScreen />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  appName: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  addIcon: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
    marginTop: -1,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: COLORS.border,
    alignSelf: 'center',
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
  },
});

export default HomeScreen;