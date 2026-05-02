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

// ── Duration option type ──────────────────────────────────────────────────────
interface DurationOption {
  label: string;
  ms: number;
}

const DURATION_OPTIONS: DurationOption[] = [
  { label: '15 min', ms: 15 * 60 * 1000 },
  { label: '30 min', ms: 30 * 60 * 1000 },
  { label: '1 hour', ms: 60 * 60 * 1000 },
  { label: '2 hours', ms: 2 * 60 * 60 * 1000 },
  { label: '3 hours', ms: 3 * 60 * 60 * 1000 },
  { label: '4 hours', ms: 4 * 60 * 60 * 1000 },
  { label: 'Custom', ms: 0 },
];

const PRIORITY_OPTIONS = ['low', 'medium', 'high'] as const;
type Priority = (typeof PRIORITY_OPTIONS)[number];

export default function CreateTaskScreen() {
  const navigation = useNavigation();
  const { createTask } = useTasks();

  // ── Form state ──────────────────────────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [deadlineMode, setDeadlineMode] = useState<'duration' | 'custom'>(
    'duration',
  );

  // Duration mode
  const [selectedDuration, setSelectedDuration] = useState<DurationOption>(
    DURATION_OPTIONS[2], // default: 1 hour
  );

  // Custom mode — user types hours and minutes manually
  const [customHours, setCustomHours] = useState('1');
  const [customMinutes, setCustomMinutes] = useState('0');

  // Apps
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [installedApps, setInstalledApps] = useState<BlockableApp[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Load installed apps ─────────────────────────────────────────────────────
  useEffect(() => {
    async function loadApps() {
      try {
        const apps = await blockerService.getInstalledApps();
        // Deduplicate by packageName on JS side as safety net
        const seen = new Set<string>();
        const unique = apps.filter(app => {
          if (seen.has(app.packageName)) return false;
          seen.add(app.packageName);
          return true;
        });
        setInstalledApps(unique);
      } catch (error) {
        Alert.alert('Error', 'Could not load app list');
      } finally {
        setLoading(false);
      }
    }
    loadApps();
  }, []);

  // ── Compute final deadline timestamp ────────────────────────────────────────
  const computeDeadline = (): number | null => {
    if (deadlineMode === 'duration') {
      if (selectedDuration.ms === 0) return null; // "Custom" selected but mode not switched
      return Date.now() + selectedDuration.ms;
    }
    // Custom mode
    const h = parseInt(customHours, 10);
    const m = parseInt(customMinutes, 10);
    if (isNaN(h) || isNaN(m) || h < 0 || m < 0 || m > 59) return null;
    if (h === 0 && m === 0) return null;
    const ms = h * 3600000 + m * 60000;
    return Date.now() + ms;
  };

  // ── Preview label ────────────────────────────────────────────────────────────
  const getDeadlinePreview = (): string => {
    const dl = computeDeadline();
    if (!dl) return 'Invalid time';
    const date = new Date(dl);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // ── Toggle app selection ─────────────────────────────────────────────────────
  const toggleApp = (packageName: string) => {
    setSelectedApps(prev =>
      prev.includes(packageName)
        ? prev.filter(p => p !== packageName)
        : [...prev, packageName],
    );
  };

  // ── Save task ────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }
    const deadline = computeDeadline();
    if (!deadline) {
      Alert.alert(
        'Invalid Time',
        'Please set a valid duration (at least 1 minute).',
      );
      return;
    }
    if (selectedApps.length === 0) {
      Alert.alert(
        'No Apps Selected',
        'Select at least one app to block, or the task won\'t do anything.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Create Anyway',
            onPress: () => saveAndGoBack(deadline),
          },
        ],
      );
      return;
    }
    saveAndGoBack(deadline);
  };

  const saveAndGoBack = (deadline: number) => {
    createTask({
      title: title.trim(),
      deadline,
      deadlineType: 'time',
      blockedApps: selectedApps,
      priority,
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>New Task</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">

        {/* Title */}
        <Text style={styles.label}>Task Title</Text>
        <TextInput
          placeholder="e.g. Finish project report"
          placeholderTextColor={COLORS.textSecondary}
          style={styles.input}
          value={title}
          onChangeText={setTitle}
        />

        {/* Priority */}
        <Text style={styles.label}>Priority</Text>
        <View style={styles.row}>
          {PRIORITY_OPTIONS.map(p => (
            <TouchableOpacity
              key={p}
              style={[
                styles.priorityChip,
                priority === p && styles.priorityChipSelected,
                priority === p && styles[`priority_${p}`],
              ]}
              onPress={() => setPriority(p)}>
              <Text
                style={[
                  styles.priorityChipText,
                  priority === p && styles.priorityChipTextSelected,
                ]}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Deadline Mode Toggle */}
        <Text style={styles.label}>Block Duration</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[
              styles.modeBtn,
              deadlineMode === 'duration' && styles.modeBtnActive,
            ]}
            onPress={() => setDeadlineMode('duration')}>
            <Text
              style={[
                styles.modeBtnText,
                deadlineMode === 'duration' && styles.modeBtnTextActive,
              ]}>
              Quick Select
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeBtn,
              deadlineMode === 'custom' && styles.modeBtnActive,
            ]}
            onPress={() => setDeadlineMode('custom')}>
            <Text
              style={[
                styles.modeBtnText,
                deadlineMode === 'custom' && styles.modeBtnTextActive,
              ]}>
              Custom Time
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Select Duration Grid */}
        {deadlineMode === 'duration' && (
          <View style={styles.durationGrid}>
            {DURATION_OPTIONS.filter(d => d.ms > 0).map(opt => (
              <TouchableOpacity
                key={opt.label}
                style={[
                  styles.durationChip,
                  selectedDuration.label === opt.label &&
                  styles.durationChipSelected,
                ]}
                onPress={() => setSelectedDuration(opt)}>
                <Text
                  style={[
                    styles.durationChipText,
                    selectedDuration.label === opt.label &&
                    styles.durationChipTextSelected,
                  ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Custom Hours + Minutes Input */}
        {deadlineMode === 'custom' && (
          <View style={styles.customRow}>
            <View style={styles.customField}>
              <Text style={styles.customFieldLabel}>Hours</Text>
              <TextInput
                style={styles.customInput}
                keyboardType="numeric"
                value={customHours}
                onChangeText={v => setCustomHours(v.replace(/[^0-9]/g, ''))}
                maxLength={2}
                placeholder="0"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
            <Text style={styles.customSeparator}>:</Text>
            <View style={styles.customField}>
              <Text style={styles.customFieldLabel}>Minutes</Text>
              <TextInput
                style={styles.customInput}
                keyboardType="numeric"
                value={customMinutes}
                onChangeText={v => setCustomMinutes(v.replace(/[^0-9]/g, ''))}
                maxLength={2}
                placeholder="0"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
          </View>
        )}

        {/* Deadline Preview */}
        <View style={styles.previewBox}>
          <Text style={styles.previewLabel}>Apps will unblock at</Text>
          <Text style={styles.previewTime}>{getDeadlinePreview()}</Text>
        </View>

        {/* App Selection */}
        <Text style={styles.label}>
          Block Apps{' '}
          <Text style={styles.labelSub}>
            ({selectedApps.length} selected)
          </Text>
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginVertical: 20 }}
          />
        ) : installedApps.length === 0 ? (
          <Text style={styles.noAppsText}>
            No apps found. Make sure permissions are granted.
          </Text>
        ) : (
          <View style={styles.appList}>
            {installedApps.map(app => (
              <TouchableOpacity
                key={app.packageName}
                style={[
                  styles.appChip,
                  selectedApps.includes(app.packageName) &&
                  styles.appChipSelected,
                ]}
                onPress={() => toggleApp(app.packageName)}>
                <Text
                  style={[
                    styles.appText,
                    selectedApps.includes(app.packageName) &&
                    styles.appTextSelected,
                  ]}>
                  {app.displayName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}>
          <Text style={styles.saveText}>🔒 Create Focus Task</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles: any = StyleSheet.create({
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
  heading: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  form: { padding: 20 },
  label: {
    color: COLORS.textSecondary,
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 16,
  },
  labelSub: { fontWeight: '400', color: COLORS.textSecondary },
  input: {
    backgroundColor: COLORS.surface,
    color: COLORS.textPrimary,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 16,
  },
  row: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  // Priority
  priorityChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  priorityChipSelected: { borderWidth: 0 },
  priority_low: { backgroundColor: '#1a472a' },
  priority_medium: { backgroundColor: '#7a5a00' },
  priority_high: { backgroundColor: '#7a1a1a' },
  priorityChipText: { color: COLORS.textSecondary, fontWeight: '600' },
  priorityChipTextSelected: { color: '#FFFFFF' },
  // Mode toggle
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modeBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modeBtnText: { color: COLORS.textSecondary, fontWeight: '600' },
  modeBtnTextActive: { color: '#FFFFFF' },
  // Duration grid
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  durationChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  durationChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  durationChipText: { color: COLORS.textSecondary, fontWeight: '600' },
  durationChipTextSelected: { color: '#FFFFFF' },
  // Custom input
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  customField: { flex: 1, alignItems: 'center' },
  customFieldLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 6,
  },
  customInput: {
    backgroundColor: COLORS.surface,
    color: COLORS.textPrimary,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '100%',
    paddingVertical: 12,
  },
  customSeparator: {
    color: COLORS.textPrimary,
    fontSize: 32,
    fontWeight: '800',
    marginTop: 20,
  },
  // Preview
  previewBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginTop: 12,
    marginBottom: 4,
  },
  previewLabel: { color: COLORS.textSecondary, fontSize: 12 },
  previewTime: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  // Apps
  noAppsText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginVertical: 20,
  },
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
  appText: { color: COLORS.textSecondary },
  appTextSelected: { color: '#FFFFFF', fontWeight: '600' },
  // Save
  saveBtn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  saveText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
});