import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTasks } from '../hooks/useTasks';
import TaskCard from '../components/TaskCard';
import { COLORS } from '../constants/config';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { pendingTasks, overdueTasks, completedTasks, markComplete, removeTask } = useTasks();
  const [tab, setTab] = useState<'active'|'overdue'|'completed'>('active');
  const data = tab === 'active' ? pendingTasks : tab === 'overdue' ? overdueTasks : completedTasks;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>FOCUS LOCK</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('CreateTask')}>
          <Text style={styles.addText}>+</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tabs}>
        {(['active','overdue','completed'] as const).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.activeTab]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.activeTabText]}>{t.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        renderItem={({item}) => <TaskCard task={item} onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })} onComplete={() => markComplete(item.id)} />}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 24, fontWeight: '900', color: COLORS.primary },
  addBtn: { backgroundColor: COLORS.primary, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  addText: { fontSize: 24, color: COLORS.white },
  tabs: { flexDirection: 'row', marginHorizontal: 16, marginVertical: 12, backgroundColor: COLORS.surface, borderRadius: 8, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  activeTab: { backgroundColor: COLORS.primary },
  tabText: { color: COLORS.textSecondary, fontWeight: '600' },
  activeTabText: { color: COLORS.white },
});