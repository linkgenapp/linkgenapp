import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { deleteDoc, doc, getDocs, query, collection, where, limit } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useAuthRole } from '../../store/authRole';
import { COLORS, SHADOW } from '../../lib/theme';
import { formatMaybeTimeSlot, t } from '../../lib/i18n';

type RequestItem = {
  id: string;
  title: string;
  preferred_date?: string;
  preferred_time?: string;
  district?: string;
  location: string;
  description?: string;
  posted_by: string;
};
type MatchItem = {
  id: string;
  youthId: string;
  activityName: string;
  activityId: string;
  activityType: 'task' | 'event';
};

export default function RequestsScreen() {
  const { role, uid, language } = useAuthRole();
  const router = useRouter();
  const [items, setItems] = useState<RequestItem[]>([]);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const [snap, matchSnap] = await Promise.all([
        getDocs(query(collection(db, 'tasks'), where('posted_by', '==', uid), limit(50))),
        getDocs(
          query(
            collection(db, 'matches'),
            where('elderlyId', '==', uid),
            where('activityType', '==', 'task'),
            limit(20)
          )
        ),
      ]);
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as RequestItem[]);
      setMatches(matchSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as MatchItem[]);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeTask = async (taskId: string) => {
    await deleteDoc(doc(db, 'tasks', taskId));
    setItems((prev) => prev.filter((item) => item.id !== taskId));
    // Refresh in background to keep interested-youth section in sync.
    void fetchItems();
  };

  useEffect(() => {
    fetchItems();
  }, [uid]);

  useFocusEffect(
    React.useCallback(() => {
      fetchItems();
    }, [uid])
  );

  if (role !== 'elderly') {
    return (
      <View style={styles.center}>
        <Text>{t(language, 'elderlyOnly')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.header}>{t(language, 'reqHero')}</Text>
        <Text style={styles.subheader}>{t(language, 'reqSub')}</Text>
      </View>
      <Pressable style={styles.addBtn} onPress={() => router.push('/(tabs)/newRequest')}>
        <Text style={styles.addBtnText}>{t(language, 'newHelpBtn')}</Text>
      </Pressable>
      <Text style={styles.section}>{t(language, 'sectionInterested')}</Text>
      {loading ? (
        <Text style={styles.emptyInline}>{t(language, 'loadingActivities')}</Text>
      ) : matches.length === 0 ? (
        <Text style={styles.emptyInline}>{t(language, 'noMatchYet')}</Text>
      ) : (
        <View style={{ marginBottom: 12, gap: 8 }}>
          {matches.slice(0, 5).map((m) => (
            <View key={m.id} style={styles.matchCard}>
              <Text style={styles.matchTitle}>
                {t(language, 'youthLabel')}: {m.youthId}
              </Text>
              <Text style={styles.matchDetail}>
                {t(language, 'interestedIn')}: {m.activityName}
              </Text>
            </View>
          ))}
        </View>
      )}
      <Text style={styles.section}>
        {t(language, 'yourPosted')} ({items.length})
      </Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>{loading ? t(language, 'loadingActivities') : t(language, 'noRequests')}</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.detail}>
              {t(language, 'timeLine')}: {item.preferred_date ?? t(language, 'flexible')} ·{' '}
              {formatMaybeTimeSlot(language, String(item.preferred_time ?? 'flexible'))}
            </Text>
            <Text style={styles.detail}>
              {t(language, 'locationLine')}: {item.location}
            </Text>
            <View style={styles.row}>
              <Pressable
                style={styles.actionBtn}
                onPress={() => Alert.alert(t(language, 'editSoon'), t(language, 'editSoonMsg'))}>
                <Text style={styles.actionText}>{t(language, 'edit')}</Text>
              </Pressable>
              <Pressable
                style={[styles.actionBtn, styles.deleteBtn]}
                onPress={async () => {
                  await removeTask(item.id);
                }}>
                <Text style={styles.actionText}>{t(language, 'delete')}</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAF9D9', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: { backgroundColor: '#FFF4B8', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#F9A825' },
  header: { fontSize: 34, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },
  subheader: { fontSize: 20, color: '#7A5A00', textAlign: 'center' },
  addBtn: { backgroundColor: '#2E7D32', borderRadius: 14, padding: 18, marginBottom: 12, minHeight: 56, justifyContent: 'center' },
  addBtnText: { color: 'white', fontSize: 24, fontWeight: '700', textAlign: 'center' },
  empty: { textAlign: 'center', marginTop: 20, fontSize: 22, color: '#285430' },
  emptyInline: { fontSize: 16, color: '#285430', marginBottom: 12 },
  section: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8, textAlign: 'center' },
  matchCard: { backgroundColor: '#FFE48A', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#F9A825' },
  matchTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  matchDetail: { fontSize: 15, color: COLORS.textSecondary, marginTop: 2 },
  card: { backgroundColor: '#FFF7CC', borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#F9A825', ...SHADOW },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8, color: COLORS.textPrimary },
  detail: { fontSize: 22, color: '#2E7D32' },
  row: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionBtn: { backgroundColor: '#2E7D32', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 20, minHeight: 56, justifyContent: 'center' },
  deleteBtn: { backgroundColor: COLORS.error },
  actionText: { color: 'white', fontSize: 22, fontWeight: '700' },
});
