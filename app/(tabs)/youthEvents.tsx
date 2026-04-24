import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { arrayUnion, collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../utils/firebase';
import { useAuthRole } from '../../store/authRole';
import { COLORS, SHADOW } from '../../lib/theme';
import { DISTRICTS, EVENT_CATEGORIES } from '../../lib/constants';
import { districtLabel, eventCategoryLabel, t } from '../../lib/i18n';
import { buildSampleEvents, SampleEventCard } from '../../lib/localizedSamples';

type EventCard = SampleEventCard;

export default function YouthEventsScreen() {
  const { role, uid, language } = useAuthRole();
  const fallback = useMemo(() => buildSampleEvents(language), [language]);
  const [events, setEvents] = useState<EventCard[]>(fallback);
  const [loading, setLoading] = useState(true);
  const [joiningIds, setJoiningIds] = useState<Record<string, boolean>>({});
  const [localJoinedIds, setLocalJoinedIds] = useState<Record<string, boolean>>({});
  const [fromServer, setFromServer] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'events'));
        const fetched = snap.docs.map((d) => ({
          id: d.id,
          type: 'event' as const,
          ...d.data(),
          name: (d.data().title as string) ?? (d.data().name as string) ?? t(language, 'communityEvent'),
          district: (d.data().district as string) ?? 'central_western',
          location:
            (d.data().location as string) ??
            DISTRICTS[(d.data().district as string) ?? 'central_western'],
          date: (d.data().date as string) ?? '',
          elderlyId:
            (d.data().organizer as string) ??
            (d.data().elderlyId as string) ??
            'organizer-unknown',
          elderlyName:
            (d.data().organizer_name as string) ??
            (d.data().elderlyName as string) ??
            t(language, 'hostFallback'),
          time: (d.data().time as string) ?? t(language, 'tbd'),
          participants: (d.data().participants as number) ?? ((d.data().attendees as string[])?.length ?? 0),
          max_participants: (d.data().max_participants as number) ?? 20,
          attendees: (d.data().attendees as string[]) ?? [],
        })) as EventCard[];
        if (fetched.length > 0) {
          setEvents(fetched);
          setFromServer(true);
        } else {
          setEvents(fallback);
          setFromServer(false);
        }
      } catch {
        setEvents(fallback);
        setFromServer(false);
      } finally {
        setLoading(false);
      }
    })();
    // Mount-only load; localized fallbacks refresh in the next effect when `fromServer` is false.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!fromServer) setEvents(fallback);
  }, [fallback, fromServer]);

  if (role !== 'youth') {
    return (
      <View style={styles.centered}>
        <Text>{t(language, 'youthOnly')}</Text>
      </View>
    );
  }

  const youthId = uid ?? auth?.currentUser?.uid ?? 'demo-youth-user';
  const register = async (event: EventCard) => {
    const attendeeCount = event.attendees?.length ?? event.participants ?? 0;
    const cap = event.max_participants ?? 20;
    if (attendeeCount >= cap) {
      Alert.alert(t(language, 'eventFull'), t(language, 'eventFullMsg'));
      return;
    }
    if ((event.attendees ?? []).includes(youthId) || localJoinedIds[event.id]) {
      Alert.alert(t(language, 'alreadyIn'), t(language, 'alreadyInMsg'));
      return;
    }
    setLocalJoinedIds((prev) => ({ ...prev, [event.id]: true }));
    setJoiningIds((prev) => ({ ...prev, [event.id]: true }));
    try {
      await Promise.race([
        updateDoc(doc(db, 'events', event.id), {
          attendees: arrayUnion(youthId),
        }),
        new Promise((resolve) => setTimeout(resolve, 1200)),
      ]);
      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id
            ? {
                ...e,
                attendees: [...(e.attendees ?? []), youthId],
              }
            : e
        )
      );
    } catch {
      // Keep optimistic local join for demo flow
    } finally {
      setJoiningIds((prev) => ({ ...prev, [event.id]: false }));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>{t(language, 'yevDashTitle')}</Text>
      <Text style={styles.modeHint}>{t(language, 'yevHint')}</Text>
      {loading ? (
        <View style={styles.centered}>
          <Text>{t(language, 'loadingEvents')}</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          renderItem={({ item }) => {
            const attendeeCount = item.attendees?.length ?? item.participants ?? 0;
            const cap = item.max_participants ?? 20;
            const spotsLeft = Math.max(0, cap - attendeeCount);
            const joined = (item.attendees ?? []).includes(youthId) || !!localJoinedIds[item.id];
            const full = spotsLeft === 0;
            const cat = item.category ?? 'other';
            return (
              <View style={styles.card}>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.badge}>
                  {EVENT_CATEGORIES[cat]?.emoji ?? '🎉'} {eventCategoryLabel(language, cat)}
                </Text>
                <Text style={styles.detail}>
                  {t(language, 'organizer')}: {item.elderlyName}
                </Text>
                <Text style={styles.detail}>
                  📍 {item.location} ({districtLabel(language, item.district ?? 'central_western')})
                </Text>
                <Text style={styles.detail}>
                  🗓️ {item.date || t(language, 'tbd')} · 🕒 {item.time}
                </Text>
                <Text style={styles.detail}>{item.description}</Text>
                <Text style={styles.capacity}>
                  {t(language, 'capacity')}: {attendeeCount}/{cap} ({spotsLeft} {t(language, 'spotsLeft')})
                </Text>
                <Pressable
                  style={[
                    styles.registerBtn,
                    (joined || full) && styles.registerBtnDisabled,
                    joiningIds[item.id] && styles.registerBtnDisabled,
                  ]}
                  disabled={joined || full || joiningIds[item.id]}
                  onPress={() => register(item)}>
                  <Text style={styles.registerText}>
                    {joined
                      ? t(language, 'registered')
                      : full
                        ? t(language, 'full')
                        : joiningIds[item.id]
                          ? t(language, 'registering')
                          : t(language, 'register')}
                  </Text>
                </Pressable>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pageTitle: { fontSize: 30, fontWeight: '800', color: COLORS.textPrimary, paddingHorizontal: 16, paddingTop: 14 },
  modeHint: { textAlign: 'center', color: COLORS.textSecondary, fontSize: 15, marginBottom: 4 },
  card: {
    marginTop: 10,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW,
  },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 8, color: COLORS.textPrimary },
  badge: {
    alignSelf: 'flex-start',
    fontSize: 13,
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  detail: { fontSize: 16, marginVertical: 2, color: COLORS.textSecondary },
  capacity: { fontSize: 15, color: COLORS.textPrimary, marginTop: 8, fontWeight: '600' },
  registerBtn: {
    marginTop: 12,
    backgroundColor: COLORS.greenPrimary,
    borderRadius: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerBtnDisabled: { opacity: 0.55 },
  registerText: { color: 'white', fontWeight: '700', fontSize: 17 },
});
