import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { db } from '../../utils/firebase';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { useAuthRole } from '../../store/authRole';
import { SHADOW } from '../../lib/theme';
import { districtLabel, t } from '../../lib/i18n';
import { MatchProfile, parseInterests, rankMatches, RankedMatch } from '../../lib/matching';
import { DISTRICTS, REGION_COORDINATES } from '../../lib/constants';
import { FAKE_ELDERLY_PROFILES } from '../../lib/fakeElderlyProfiles';
import { FAKE_YOUTH_PROFILES } from '../../lib/fakeYouthProfiles';

type MatchSourceMode = 'fake' | 'smart';

type UserRecord = {
  display_name?: string;
  name?: string;
  role?: 'youth' | 'elderly';
  district?: string;
  region_key?: string;
  latitude?: number | string;
  longitude?: number | string;
  interests?: string[];
  interests_text?: string;
};

export default function MatchesScreen() {
  const { uid, role, language } = useAuthRole();
  const [matches, setMatches] = useState<RankedMatch[]>([]);
  const [profileReady, setProfileReady] = useState(true);
  const [loading, setLoading] = useState(true);
  const [sourceMode, setSourceMode] = useState<MatchSourceMode>('fake');

  const whoYouMatchWith = useMemo(
    () => (role === 'youth' ? t(language, 'roleElderly') : t(language, 'roleYouth')),
    [language, role]
  );

  const getRegionFromDistrict = useCallback((district?: string) => {
    if (!district) return REGION_COORDINATES[0];
    return REGION_COORDINATES.find((item) => item.key === district) ?? REGION_COORDINATES[0];
  }, []);

  const toNumber = (value: number | string | undefined) => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  };

  const toProfile = (id: string, user: UserRecord): MatchProfile | null => {
    const region = getRegionFromDistrict(user.region_key ?? user.district);
    const latitude = toNumber(user.latitude) ?? region.latitude;
    const longitude = toNumber(user.longitude) ?? region.longitude;
    const interests = parseInterests(user.interests ?? user.interests_text ?? '');
    if (!interests.length) return null;

    return {
      uid: id,
      displayName: user.display_name ?? user.name ?? id,
      role: user.role === 'elderly' ? 'elderly' : 'youth',
      district: user.district,
      latitude,
      longitude,
      interests,
    };
  };

  const fetchRankedMatches = useCallback(async () => {
    if (!uid) {
      setMatches([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const selfSnap = await getDoc(doc(db, 'users', uid));

      const selfData = selfSnap.data() as UserRecord | undefined;
      const current = selfData ? toProfile(uid, selfData) : null;

      if (!current) {
        setProfileReady(false);
        setMatches([]);
        return;
      }

      let others: MatchProfile[] = [];
      if (sourceMode === 'smart') {
        const othersSnap = await getDocs(
          query(collection(db, 'users'), where('role', '==', role === 'youth' ? 'elderly' : 'youth'))
        );
        others = othersSnap.docs
          .map((item) => toProfile(item.id, item.data() as UserRecord))
          .filter((value): value is MatchProfile => value !== null)
          .filter((value) => value.uid !== uid);
      } else {
        others = role === 'youth'
          ? FAKE_ELDERLY_PROFILES.map((item) => ({
              uid: item.id,
              displayName: item.name,
              role: 'elderly' as const,
              district: item.district,
              latitude: item.latitude,
              longitude: item.longitude,
              interests: parseInterests(item.interests),
            }))
          : FAKE_YOUTH_PROFILES.map((item) => ({
              uid: item.id,
              displayName: item.name,
              role: 'youth' as const,
              district: item.district,
              latitude: item.latitude,
              longitude: item.longitude,
              interests: parseInterests(item.interests),
            }));
      }

      setProfileReady(true);
      setMatches(rankMatches(current, others, 30));
    } catch (error) {
      console.error('Error computing matches:', error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, [getRegionFromDistrict, role, sourceMode, uid]);

  useEffect(() => {
    fetchRankedMatches();
  }, [fetchRankedMatches]);

  const renderMatchCard = ({ item, index }: { item: RankedMatch; index: number }) => (
    <View style={styles.card}>
      <Text style={styles.rank}>#{index + 1}</Text>
      <Text style={styles.title}>{item.targetName}</Text>
      <Text style={styles.detail}>
        Final score: {item.finalScore.toFixed(3)}
      </Text>
      <Text style={styles.detail}>
        Jaccard: {item.jaccardScore.toFixed(3)}
      </Text>
      <Text style={styles.detail}>Distance: {item.distanceKm.toFixed(2)} km</Text>
      <Text style={styles.detail}>
        District:{' '}
        {item.targetDistrict && item.targetDistrict in DISTRICTS
          ? districtLabel(language, item.targetDistrict)
          : item.targetDistrict ?? 'Unknown'}
      </Text>
      <Text style={styles.subtle}>
        Shared interests: {item.sharedInterests.length ? item.sharedInterests.join(', ') : 'None'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>{t(language, 'loadingMatches')}</Text>
      </View>
    );
  }

  if (!profileReady) {
    return (
      <View style={styles.center}>
        <Text style={styles.noMatches}>Complete your profile with district + interests first.</Text>
      </View>
    );
  }

  if (matches.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.noMatches}>{t(language, 'noMatchesHint')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.targetUid}
        renderItem={renderMatchCard}
        ListHeaderComponent={
          <View style={styles.hero}>
            <Text style={styles.heading}>
              {t(language, 'matchHeading')} ({matches.length})
            </Text>
            <Text style={styles.subheading}>Matching with {whoYouMatchWith}</Text>
            <View style={styles.modeRow}>
              <Pressable
                style={[styles.modeBtn, sourceMode === 'fake' && styles.modeBtnActive]}
                onPress={() => setSourceMode('fake')}>
                <Text style={[styles.modeText, sourceMode === 'fake' && styles.modeTextActive]}>Synthetic</Text>
              </Pressable>
              <Pressable
                style={[styles.modeBtn, sourceMode === 'smart' && styles.modeBtnActive]}
                onPress={() => setSourceMode('smart')}>
                <Text style={[styles.modeText, sourceMode === 'smart' && styles.modeTextActive]}>Live users</Text>
              </Pressable>
            </View>
            <Pressable style={styles.refreshBtn} onPress={fetchRankedMatches}>
              <Text style={styles.refreshText}>Refresh scores</Text>
            </Pressable>
          </View>
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF4B8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  hero: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#2E7D32',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  heading: { fontSize: 24, fontWeight: '800', marginBottom: 4, color: '#1B5E20', textAlign: 'center' },
  subheading: { fontSize: 14, color: '#2E7D32', textAlign: 'center' },
  modeRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  modeBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#FFF8D6',
  },
  modeBtnActive: { backgroundColor: '#2E7D32' },
  modeText: { color: '#1B5E20', fontWeight: '700' },
  modeTextActive: { color: '#FFFFFF' },
  refreshBtn: {
    marginTop: 10,
    alignSelf: 'center',
    backgroundColor: '#2E7D32',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  refreshText: { color: '#FFFFFF', fontWeight: '700' },
  card: {
    backgroundColor: '#FFE48A',
    borderColor: '#F9A825',
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...SHADOW,
  },
  rank: { fontSize: 12, fontWeight: '700', color: '#2E7D32', marginBottom: 4 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 8, color: '#1B5E20' },
  detail: { fontSize: 18, color: '#2E7D32', marginVertical: 2 },
  subtle: { fontSize: 12, color: '#1B5E20', marginTop: 8 },
  noMatches: { fontSize: 16, textAlign: 'center', color: '#2E7D32' },
});
