import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useAuthRole } from '../../store/authRole';
import { COLORS } from '../../lib/theme';
import { t } from '../../lib/i18n';
import { buildMapFallbackPins } from '../../lib/localizedSamples';

type MapPin = {
  id: string;
  title: string;
  location: string;
  latitude: number;
  longitude: number;
  status: 'open' | 'closed' | 'published';
  kind: 'task' | 'event';
  category?: string;
};

export default function MapScreen() {
  const { role, language } = useAuthRole();
  const fallbackPins = useMemo(() => buildMapFallbackPins(language), [language]);
  const [pins, setPins] = React.useState<MapPin[]>(fallbackPins);
  const [fromServer, setFromServer] = React.useState(false);

  React.useEffect(() => {
    if (!fromServer) setPins(fallbackPins);
  }, [fallbackPins, fromServer]);

  let MapViewAny: any = null;
  let MarkerAny: any = null;
  try {
    const maps = require('react-native-maps');
    MapViewAny = maps.default;
    MarkerAny = maps.Marker;
  } catch {
    MapViewAny = null;
    MarkerAny = null;
  }

  React.useEffect(() => {
    (async () => {
      try {
        const [taskSnap, eventSnap] = await Promise.all([
          getDocs(query(collection(db, 'tasks'), where('status', '==', 'open'))),
          getDocs(collection(db, 'events')),
        ]);
        const taskPins = taskSnap.docs
          .map((d) => ({ id: d.id, ...d.data(), kind: 'task' as const }))
          .filter((row: any) => typeof row.latitude === 'number' && typeof row.longitude === 'number')
          .map((row: any) => ({
            id: row.id,
            title: row.title ?? row.name ?? t(language, 'helpRequest'),
            location: row.location ?? row.district ?? t(language, 'unknown'),
            latitude: row.latitude,
            longitude: row.longitude,
            status: row.status ?? 'open',
            kind: 'task' as const,
            category: row.category,
          }));
        const eventPins = eventSnap.docs
          .map((d) => ({ id: d.id, ...d.data(), kind: 'event' as const }))
          .filter((e: any) => typeof e.latitude === 'number' && typeof e.longitude === 'number')
          .map((e: any) => ({
            id: `event-${e.id}`,
            title: e.name ?? e.title ?? t(language, 'communityEvent'),
            location: e.location ?? e.district ?? t(language, 'unknown'),
            latitude: e.latitude,
            longitude: e.longitude,
            status: e.status ?? 'published',
            kind: 'event' as const,
            category: e.category,
          }));
        const merged = [...taskPins, ...eventPins];
        if (merged.length > 0) {
          setFromServer(true);
          setPins(merged);
        }
      } catch (error) {
        console.error('Failed to load map tasks:', error);
      }
    })();
  }, []);

  if (role !== 'youth') {
    return (
      <View style={styles.container}>
        <Text style={styles.subtitle}>{t(language, 'mapYouthOnly')}</Text>
      </View>
    );
  }

  if (!MapViewAny || !MarkerAny) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>{t(language, 'mapUnavailable')}</Text>
        <Text style={styles.subtitle}>{t(language, 'mapBackupHint')}</Text>
        <FlatList
          data={pins}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 12, gap: 10 }}
          renderItem={({ item }) => (
            <View style={styles.fallbackCard}>
              <Text style={styles.fallbackTitle}>
                {item.kind === 'event' ? '🎉' : '👵'} {item.title}
              </Text>
              <Text style={styles.subtitle}>📍 {item.location}</Text>
              <Text style={styles.subtitle}>
                {item.latitude}, {item.longitude}
              </Text>
            </View>
          )}
        />
      </View>
    );
  }

  const iconForPin = (pin: MapPin) => {
    if (pin.kind === 'event') return '🎉';
    if (pin.category === 'transport') return '🚕';
    if (pin.category === 'groceries') return '🛍️';
    if (pin.category === 'tech_help') return '📱';
    return '👵';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t(language, 'mapTitle')}</Text>
      <MapViewAny
        style={styles.map}
        initialRegion={{
          latitude: 22.3193,
          longitude: 114.1694,
          latitudeDelta: 0.18,
          longitudeDelta: 0.18,
        }}>
        {pins.map((pin) => (
          <MarkerAny key={pin.id} coordinate={{ latitude: pin.latitude, longitude: pin.longitude }} title={pin.title} description={pin.location}>
            <View style={[styles.markerBubble, pin.kind === 'event' ? styles.eventMarker : styles.taskMarker]}>
              <Text style={styles.markerText}>{iconForPin(pin)}</Text>
            </View>
          </MarkerAny>
        ))}
      </MapViewAny>
      <View style={styles.legend}>
        <Text style={styles.legendText}>👵 {t(language, 'legendTask')}</Text>
        <Text style={styles.legendText}>🎉 {t(language, 'legendActivity')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF4B8',
  },
  map: { flex: 1, margin: 12, borderRadius: 16 },
  header: { fontSize: 24, fontWeight: '800', color: '#1B5E20', paddingHorizontal: 16, paddingTop: 16 },
  legend: { flexDirection: 'row', justifyContent: 'space-evenly', paddingBottom: 12 },
  legendText: { color: '#1B5E20', fontWeight: '700', fontSize: 16 },
  markerBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  taskMarker: { backgroundColor: '#FFE48A', borderColor: '#F9A825' },
  eventMarker: { backgroundColor: '#C8E6C9', borderColor: '#2E7D32' },
  markerText: { fontSize: 20 },
  subtitle: {
    fontSize: 16,
    color: COLORS.greenPrimary,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  fallbackCard: {
    backgroundColor: '#FFE48A',
    borderColor: '#F9A825',
    borderWidth: 2,
    borderRadius: 14,
    padding: 12,
  },
  fallbackTitle: { color: '#1B5E20', fontSize: 20, fontWeight: '700' },
});
