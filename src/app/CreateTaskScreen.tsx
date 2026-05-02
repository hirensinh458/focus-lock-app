import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTasks } from '../hooks/useTasks';
import { blockerService } from '../features/appBlocker/blockerService';
import { BlockableApp } from '../features/appBlocker/blockerTypes';
import { COLORS } from '../constants/config';

export default function CreateTaskScreen() {
  const navigation = useNavigation();
  const { createTask } = useTasks();
  const [title, setTitle] = useState('');
  const [deadline] = useState(Date.now() + 3600000);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [installedApps, setInstalledApps] = useState<BlockableApp[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all installed apps dynamically
  useEffect(() => {
    async function loadApps() {
      try {
        const apps = await blockerService.getInstalledApps();
        setInstalledApps(apps);
      } catch (error) {
        console.error('Failed to load apps', error);
        Alert.alert('Error', 'Could not load app list');
      } finally {
        setLoading(false);
      }
    }
    loadApps();
  }, []);

  const toggleApp = (packageName: string) => {
    setSelectedApps(prev =>
      prev.includes(packageName)
        ? prev.filter(p => p !== packageName)
        : [...prev, packageName]
    );
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }
    createTask({
      title: title.trim(),
      deadline,
      deadlineType: 'time',
      blockedApps: selectedApps,
      priority: 'medium',
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Task</Text>
        <View style={{ width: 50 }} />
      </View>
      <ScrollView style={styles.form}>
        <TextInput
          placeholder="Task title"
          placeholderTextColor={COLORS.textSecondary}
          style={styles.input}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Block apps (tap to select)</Text>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : (
          <View style={styles.appList}>
            {installedApps.map(app => (
              <TouchableOpacity
                key={app.packageName}
                style={[
                  styles.appChip,
                  selectedApps.includes(app.packageName) && styles.appChipSelected,
                ]}
                onPress={() => toggleApp(app.packageName)}
              >
                <Text style={styles.appText}>{app.displayName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Create Task</Text>
        </TouchableOpacity>
      </ScrollView>
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
  back: { color: COLORS.primary, fontSize: 16 },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  form: { padding: 20, gap: 16 },
  input: {
    backgroundColor: COLORS.surface,
    color: COLORS.textPrimary,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 16,
    marginBottom: 16,
  },
  label: { color: COLORS.textSecondary, fontWeight: '600', marginBottom: 8 },
  appList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  appChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  appChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  appText: { color: COLORS.textPrimary },
  saveBtn: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
});