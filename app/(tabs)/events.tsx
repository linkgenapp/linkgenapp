import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useAuthRole } from '../../store/authRole';
import { EVENT_CATEGORIES } from '../../lib/constants';
import { COLORS, SHADOW } from '../../lib/theme';
import { districtLabel, eventCategoryLabel, t } from '../../lib/i18n';
import { buildElderlyEventsScreenFallback, ElderlyEventRow } from '../../lib/localizedSamples';

export default function EventsScreen() {
  const { role, language } = useAuthRole();
  const fallback = useMemo(() => buildElderlyEventsScreenFallback(language), [language]);
  const [items, setItems] = useState<ElderlyEventRow[]>(fallback);
  const [fromServer, setFromServer] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'events'));
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ElderlyEventRow[];
        if (data.length > 0) {
          setItems(data);
          setFromServer(true);
        } else {
          setItems(fallback);
          setFromServer(false);
        }
      } catch (error) {
        console.error('Failed to load events:', error);
        setItems(fallback);
        setFromServer(false);
      }
    })();
    // Intentionally once on mount; `fallback` updates are applied via the effect below when not using Firestore data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!fromServer) setItems(fallback);
  }, [fallback, fromServer]);

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
        <Text style={styles.header}>{t(language, 'evHero')}</Text>
        <Text style={styles.sub}>{t(language, 'evSub')}</Text>
      </View>
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title ?? item.name}</Text>
            <Text style={styles.badge}>
              {EVENT_CATEGORIES[item.category ?? 'other']?.emoji ?? '🎉'}{' '}
              {eventCategoryLabel(language, item.category ?? 'other')}
            </Text>
            <Text style={styles.detail}>
              {t(language, 'districtPrefix')}: {districtLabel(language, item.district ?? 'central_western')}
            </Text>
            <Text style={styles.detail}>📍 {item.location}</Text>
            <Text style={styles.detail}>
              🕒 {item.date ?? t(language, 'tbd')} {item.time ?? ''}
            </Text>
            <Text style={styles.detail}>{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF4B8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: { marginHorizontal: 16, marginTop: 16, backgroundColor: '#D6F5D6', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#2E7D32' },
  header: { fontSize: 34, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },
  sub: { fontSize: 18, color: '#2E7D32', textAlign: 'center' },
  card: { backgroundColor: '#E8F5E9', borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#2E7D32', ...SHADOW },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8, color: COLORS.textPrimary },
  badge: { alignSelf: 'flex-start', fontSize: 16, backgroundColor: '#F9A825', color: '#111827', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, marginBottom: 8 },
  detail: { fontSize: 22, color: '#1B5E20', marginBottom: 4 },
});
