// FILE: src/app/tasks/create.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Platform,
  Switch,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useTasks } from '../../hooks/useTasks';
import { COLORS, DEFAULT_BLOCKED_APPS, BlockableApp } from '../../constants/config';
import { endOfDay } from '../../utils/helpers';

type Priority = 'low' | 'medium' | 'high';
type DeadlineType = 'time' | 'day';

const CreateTaskScreen: React.FC = () => {
  const navigation = useNavigation();
  const { createTask } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [deadlineType, setDeadlineType] = useState<DeadlineType>('time');
  const [deadline, setDeadline] = useState<Date>(new Date(Date.now() + 3600000)); // +1h
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const toggleApp = useCallback((packageName: string) => {
    setSelectedApps(prev =>
      prev.includes(packageName)
        ? prev.filter(p => p !== packageName)
        : [...prev, packageName],
    );
  }, []);

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a task title.');
      return;
    }

    const deadlineTs =
      deadlineType === 'day' ? endOfDay(deadline) : deadline.getTime();

    if (deadlineTs <= Date.now()) {
      Alert.alert('Invalid Deadline', 'Please set a deadline in the future.');
      return;
    }

    setIsSaving(true);
    try {
      createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        deadline: deadlineTs,
        deadlineType,
        blockedApps: selectedApps,
        priority,
      });
      navigation.goBack();
    } finally {
      setIsSaving(false);
    }
  }, [title, description, deadline, deadlineType, selectedApps, priority, createTask, navigation]);

  const priorityOptions: Priority[] = ['low', 'medium', 'high'];
  const priorityColors = { low: COLORS.success, medium: COLORS.warning, high: COLORS.danger };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Back + Title */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>New Task</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.form}>
          {/* Title */}
          <View style={styles.field}>
            <Text style={styles.label}>Task Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="What do you need to do?"
              placeholderTextColor={COLORS.textMuted}
              value={title}
              onChangeText={setTitle}
              maxLength={80}
              autoFocus
            />
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              placeholder="Optional details..."
              placeholderTextColor={COLORS.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Priority */}
          <View style={styles.field}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.pillRow}>
              {priorityOptions.map(p => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.pill,
                    priority === p && {
                      backgroundColor: priorityColors[p],
                      borderColor: priorityColors[p],
                    },
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text
                    style={[
                      styles.pillText,
                      priority === p && { color: COLORS.black, fontWeight: '800' },
                    ]}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Deadline type */}
          <View style={styles.field}>
            <Text style={styles.label}>Deadline Type</Text>
            <View style={styles.pillRow}>
              <TouchableOpacity
                style={[styles.pill, deadlineType === 'time' && styles.pillActive]}
                onPress={() => setDeadlineType('time')}
              >
                <Text style={[styles.pillText, deadlineType === 'time' && styles.pillTextActive]}>
                  ⏰ Specific Time
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pill, deadlineType === 'day' && styles.pillActive]}
                onPress={() => setDeadlineType('day')}
              >
                <Text style={[styles.pillText, deadlineType === 'day' && styles.pillTextActive]}>
                  📅 End of Day
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Date & time pickers */}
          <View style={styles.field}>
            <Text style={styles.label}>Deadline Date</Text>
            <TouchableOpacity
              style={styles.pickerBtn}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.pickerBtnText}>
                {deadline.toLocaleDateString([], {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
              <Text style={styles.pickerArrow}>▼</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={deadline}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(_, date) => {
                  setShowDatePicker(false);
                  if (date) setDeadline(prev => {
                    const d = new Date(date);
                    d.setHours(prev.getHours(), prev.getMinutes());
                    return d;
                  });
                }}
              />
            )}
          </View>

          {deadlineType === 'time' && (
            <View style={styles.field}>
              <Text style={styles.label}>Deadline Time</Text>
              <TouchableOpacity
                style={styles.pickerBtn}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.pickerBtnText}>
                  {deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Text style={styles.pickerArrow}>▼</Text>
              </TouchableOpacity>

              {showTimePicker && (
                <DateTimePicker
                  value={deadline}
                  mode="time"
                  display="default"
                  onChange={(_, date) => {
                    setShowTimePicker(false);
                    if (date) setDeadline(date);
                  }}
                />
              )}
            </View>
          )}

          {/* App blocker selection */}
          <View style={styles.field}>
            <Text style={styles.label}>Block These Apps Until Done</Text>
            <Text style={styles.sublabel}>
              These apps will be blocked while this task is active
            </Text>
            <View style={styles.appsGrid}>
              {DEFAULT_BLOCKED_APPS.map(app => {
                const selected = selectedApps.includes(app.packageName);
                return (
                  <TouchableOpacity
                    key={app.packageName}
                    style={[styles.appChip, selected && styles.appChipSelected]}
                    onPress={() => toggleApp(app.packageName)}
                  >
                    <Text style={[styles.appChipText, selected && styles.appChipTextSelected]}>
                      {selected ? '✓ ' : ''}{app.displayName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Save button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveBtnText}>
            {isSaving ? 'Creating...' : 'Create Task'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 22, color: COLORS.textPrimary },
  navTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  form: { paddingHorizontal: 20, paddingBottom: 20, gap: 20 },
  field: { gap: 8 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sublabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: -4,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  inputMulti: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  pillTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  pickerBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerBtnText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  pickerArrow: { color: COLORS.textMuted, fontSize: 12 },
  appsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  appChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  appChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '22',
  },
  appChipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  appChipTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  footer: {
    padding: 20,
    paddingBottom: 32,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 10,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default CreateTaskScreen;