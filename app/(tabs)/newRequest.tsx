import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useAuthRole } from '../../store/authRole';
import { DISTRICTS, TASK_CATEGORIES, TIME_SLOTS } from '../../lib/constants';
import { COLORS } from '../../lib/theme';
import { districtLabel, t, taskCategoryLabel, timeSlotLabel } from '../../lib/i18n';

export default function NewRequestScreen() {
  const router = useRouter();
  const { role, uid, language } = useAuthRole();
  const [title, setTitle] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [district, setDistrict] = useState<keyof typeof DISTRICTS>('central_western');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<keyof typeof TASK_CATEGORIES>('other');
  const [preferredTime, setPreferredTime] = useState<keyof typeof TIME_SLOTS>('flexible');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [saving, setSaving] = useState(false);

  if (role !== 'elderly') {
    return (
      <View style={styles.center}>
        <Text>{t(language, 'elderlyOnly')}</Text>
      </View>
    );
  }

  const urgLabel = (level: 'low' | 'medium' | 'high') => t(language, `urg_${level}`);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.pageTitle}>{t(language, 'nrTitle')}</Text>
      <Text style={styles.pageSub}>{t(language, 'nrSub')}</Text>
      <Text style={styles.label}>{t(language, 'nrWhat')}</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder={t(language, 'nrPhTitle')}
      />
      <Text style={styles.label}>{t(language, 'nrDateTime')}</Text>
      <TextInput
        style={styles.input}
        value={dateTime}
        onChangeText={setDateTime}
        placeholder={t(language, 'nrPhDate')}
      />
      <Text style={styles.label}>{t(language, 'nrCategory')}</Text>
      <View style={styles.choiceWrap}>
        {Object.entries(TASK_CATEGORIES).map(([key, val]) => (
          <Pressable
            key={key}
            style={[styles.choice, category === key && styles.choiceActive]}
            onPress={() => setCategory(key as keyof typeof TASK_CATEGORIES)}>
            <Text style={styles.choiceText}>
              {val.emoji} {taskCategoryLabel(language, key)}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>{t(language, 'nrDistrict')}</Text>
      <View style={styles.choiceWrap}>
        {Object.entries(DISTRICTS).slice(0, 8).map(([key]) => (
          <Pressable
            key={key}
            style={[styles.choice, district === key && styles.choiceActive]}
            onPress={() => setDistrict(key as keyof typeof DISTRICTS)}>
            <Text style={styles.choiceText}>{districtLabel(language, key)}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>{t(language, 'nrPrefTime')}</Text>
      <View style={styles.choiceWrap}>
        {Object.keys(TIME_SLOTS).map((key) => (
          <Pressable
            key={key}
            style={[styles.choice, preferredTime === key && styles.choiceActive]}
            onPress={() => setPreferredTime(key as keyof typeof TIME_SLOTS)}>
            <Text style={styles.choiceText}>{timeSlotLabel(language, key)}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>{t(language, 'nrNotes')}</Text>
      <TextInput style={[styles.input, styles.notes]} value={notes} onChangeText={setNotes} multiline />
      <Text style={styles.label}>{t(language, 'nrUrgency')}</Text>
      <View style={styles.choiceWrap}>
        {(['low', 'medium', 'high'] as const).map((level) => (
          <Pressable
            key={level}
            style={[styles.choice, urgency === level && styles.choiceActive]}
            onPress={() => setUrgency(level)}>
            <Text style={styles.choiceText}>{urgLabel(level)}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={async () => {
          if (saving) return;
          if (!title || !dateTime) {
            Alert.alert(t(language, 'fillRequired'));
            return;
          }
          setSaving(true);
          try {
            await addDoc(collection(db, 'tasks'), {
              title,
              description: notes || title,
              category,
              district,
              posted_by: uid ?? 'demo-elderly-user',
              posted_by_name: t(language, 'elderlyUser'),
              status: 'open',
              preferred_date: dateTime,
              preferred_time: preferredTime,
              urgency,
              location: districtLabel(language, district),
              createdAt: serverTimestamp(),
            });
            Alert.alert(t(language, 'saved'));
            router.replace('/(tabs)/requests');
          } catch (error) {
            console.warn('Failed to save request:', error);
            Alert.alert(t(language, 'saveErr'), t(language, 'saveErrMsg'));
          } finally {
            setSaving(false);
          }
        }}>
        <Text style={styles.saveText}>{saving ? t(language, 'saving') : t(language, 'saveRequest')}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#FFF4B8', gap: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pageTitle: { fontSize: 36, fontWeight: '700', color: COLORS.textPrimary },
  pageSub: { fontSize: 20, color: '#2E7D32', marginBottom: 8 },
  label: { fontSize: 26, fontWeight: '700', color: COLORS.textPrimary },
  input: { borderWidth: 1, borderColor: '#2E7D32', borderRadius: 12, padding: 16, fontSize: 22, backgroundColor: '#E8F5E9', minHeight: 56 },
  choiceWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { borderWidth: 1, borderColor: '#2E7D32', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#FFFDF2', minHeight: 50, justifyContent: 'center' },
  choiceActive: { borderColor: '#1B5E20', backgroundColor: '#C8E6C9' },
  choiceText: { fontSize: 18, color: COLORS.textPrimary },
  notes: { minHeight: 120, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: COLORS.greenPrimary, borderRadius: 12, padding: 18, marginTop: 12, minHeight: 60, justifyContent: 'center' },
  saveBtnDisabled: { opacity: 0.7 },
  saveText: { color: 'white', textAlign: 'center', fontSize: 24, fontWeight: '700' },
});
