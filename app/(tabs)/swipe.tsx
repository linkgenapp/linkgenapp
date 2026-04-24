import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useAuthRole } from '../../store/authRole';
import { COLORS, SHADOW } from '../../lib/theme';
import { t } from '../../lib/i18n';
import { REGION_COORDINATES } from '../../lib/constants';
import { MatchProfile, parseInterests, rankMatches, RankedMatch, haversineKm, finalMatchScore } from '../../lib/matching';
import { FAKE_ELDERLY_PROFILES } from '../../lib/fakeElderlyProfiles';
import { FAKE_YOUTH_PROFILES } from '../../lib/fakeYouthProfiles';
import { buildSampleEvents } from '../../lib/localizedSamples';

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

type SwipeCard = RankedMatch & {
  cardType: 'person' | 'event';
  targetInterests: string[];
  baseFinalScore: number;
  adaptiveScore: number;
  eventTime?: string;
  eventLocation?: string;
  eventHost?: string;
  eventCategory?: string;
};

type SwipeMode = 'smart' | 'fake';
type DeckMode = 'people' | 'events' | 'mixed';

type SwipeEventRow = {
  direction?: 'left' | 'right';
  targetInterests?: string[];
  distanceKm?: number;
};

type EventRecord = {
  id: string;
  name?: string;
  title?: string;
  district?: string;
  location?: string;
  date?: string;
  time?: string;
  description?: string;
  category?: string;
  elderlyName?: string;
  organizer_name?: string;
};

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;

export default function SwipeScreen() {
  const { uid, role, language } = useAuthRole();
  const [cards, setCards] = useState<SwipeCard[]>([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profileReady, setProfileReady] = useState(true);
  const [swipeMode, setSwipeMode] = useState<SwipeMode>('fake');
  const [deckMode, setDeckMode] = useState<DeckMode>('mixed');

  const pan = useRef(new Animated.ValueXY()).current;

  const rotate = pan.x.interpolate({
    inputRange: [-width, 0, width],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

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

  const districtToRegionKey = (district?: string): string | undefined => {
    if (!district) return undefined;
    const normalized = district.trim().toLowerCase().replace(/\s+/g, '_');
    const [region] = district.split(' - ');
    const map: Record<string, string> = {
      'Central and Western': 'central_western',
      Eastern: 'eastern',
      Southern: 'southern',
      'Wan Chai': 'wan_chai',
      'Kowloon City': 'kowloon_city',
      'Kwun Tong': 'kwun_tong',
      'Sham Shui Po': 'sham_shui_po',
      'Wong Tai Sin': 'wong_tai_sin',
      'Yau Tsim Mong': 'yau_tsim_mong',
      Islands: 'islands',
      'Kwai Tsing': 'kwai_tsing',
      North: 'north',
      'Sai Kung': 'sai_kung',
      'Sha Tin': 'sha_tin',
      'Tai Po': 'tai_po',
      'Tsuen Wan': 'tsuen_wan',
      'Tuen Mun': 'tuen_mun',
      'Yuen Long': 'yuen_long',
    };
    return map[region] ?? normalized;
  };

  const buildFallbackCurrent = useCallback((): MatchProfile => {
    const baseRegion = REGION_COORDINATES[0];
    return {
      uid: uid ?? `guest-${role}`,
      displayName: role === 'elderly' ? 'Demo Elderly' : 'Demo Youth',
      role,
      district: baseRegion.key,
      latitude: baseRegion.latitude,
      longitude: baseRegion.longitude,
      interests: role === 'elderly' ? ['tea', 'walking', 'companionship'] : ['community', 'digital_help', 'walking'],
    };
  }, [role, uid]);

  const normalizeInterest = (value: string) => value.trim().toLowerCase();

  const buildFakePeopleCards = useCallback(
    (currentProfile: MatchProfile): SwipeCard[] => {
      const fakeProfiles: MatchProfile[] =
        role === 'youth'
          ? FAKE_ELDERLY_PROFILES.map((item) => ({
              uid: item.id,
              displayName: item.name,
              role: 'elderly',
              district: districtToRegionKey(item.district) ?? item.district,
              latitude: item.latitude,
              longitude: item.longitude,
              interests: parseInterests(item.interests),
            }))
          : FAKE_YOUTH_PROFILES.map((item) => ({
              uid: item.id,
              displayName: item.name,
              role: 'youth',
              district: item.district,
              latitude: item.latitude,
              longitude: item.longitude,
              interests: parseInterests(item.interests),
            }));

      const ranked = rankMatches(currentProfile, fakeProfiles, 120);
      const fakeMap = new Map(fakeProfiles.map((item) => [item.uid, item]));
      return ranked.map((item) => ({
        cardType: 'person',
        ...item,
        baseFinalScore: item.finalScore,
        adaptiveScore: item.finalScore,
        targetInterests: fakeMap.get(item.targetUid)?.interests ?? [],
      }));
    },
    [role]
  );

  const applyBehaviorLearning = (rankedCards: SwipeCard[], events: SwipeEventRow[]): SwipeCard[] => {
    if (!events.length || !rankedCards.length) {
      return rankedCards
        .map((card) => ({ ...card, adaptiveScore: card.finalScore }))
        .sort((a, b) => b.adaptiveScore - a.adaptiveScore);
    }

    const likes = new Map<string, number>();
    const skips = new Map<string, number>();
    let likedDistanceSum = 0;
    let likedDistanceCount = 0;

    events.forEach((event) => {
      const dir = event.direction;
      const tags = Array.isArray(event.targetInterests) ? event.targetInterests : [];

      tags.map(normalizeInterest).forEach((interest) => {
        if (dir === 'right') {
          likes.set(interest, (likes.get(interest) ?? 0) + 1);
        } else if (dir === 'left') {
          skips.set(interest, (skips.get(interest) ?? 0) + 1);
        }
      });

      if (dir === 'right' && typeof event.distanceKm === 'number' && Number.isFinite(event.distanceKm)) {
        likedDistanceSum += event.distanceKm;
        likedDistanceCount += 1;
      }
    });

    const likedDistanceAvg = likedDistanceCount > 0 ? likedDistanceSum / likedDistanceCount : null;

    return rankedCards
      .map((card) => {
        const normalized = card.targetInterests.map(normalizeInterest);

        let prefSum = 0;
        let prefCount = 0;
        normalized.forEach((interest) => {
          const l = likes.get(interest) ?? 0;
          const s = skips.get(interest) ?? 0;
          const total = l + s;
          if (total > 0) {
            prefSum += (l - s) / total;
            prefCount += 1;
          }
        });

        const interestBoost = prefCount > 0 ? (prefSum / prefCount) * 0.12 : 0;

        let distanceBoost = 0;
        if (likedDistanceAvg !== null) {
          if (card.distanceKm <= likedDistanceAvg) distanceBoost = 0.03;
          else if (card.distanceKm > likedDistanceAvg * 1.5) distanceBoost = -0.03;
        }

        const adaptiveScore = card.finalScore + interestBoost + distanceBoost;

        return {
          ...card,
          adaptiveScore,
        };
      })
      .sort((a, b) => b.adaptiveScore - a.adaptiveScore);
  };

  const eventToCard = useCallback(
    (event: EventRecord, currentProfile: MatchProfile): SwipeCard => {
      const region = getRegionFromDistrict(event.district);
      const eventInterests = parseInterests(
        `${event.category ?? ''};${event.name ?? event.title ?? ''};${event.description ?? ''}`
      );
      const sharedInterests = currentProfile.interests.filter((item) =>
        eventInterests.includes(item)
      );
      const jaccardDen = new Set([...currentProfile.interests, ...eventInterests]).size;
      const jaccardScore = jaccardDen > 0 ? sharedInterests.length / jaccardDen : 0;
      const distanceKm = haversineKm(
        currentProfile.latitude,
        currentProfile.longitude,
        region.latitude,
        region.longitude
      );
      const finalScore = finalMatchScore(jaccardScore, distanceKm);
      const eventName = event.name ?? event.title ?? 'Community Event';
      return {
        cardType: 'event',
        targetUid: `event-${event.id}`,
        targetName: eventName,
        targetDistrict: event.district,
        sharedInterests,
        jaccardScore,
        distanceKm,
        finalScore,
        baseFinalScore: finalScore,
        adaptiveScore: finalScore,
        targetInterests: eventInterests,
        eventTime: `${event.date ?? ''} ${event.time ?? ''}`.trim(),
        eventLocation: event.location,
        eventHost: event.elderlyName ?? event.organizer_name,
        eventCategory: event.category,
      };
    },
    [getRegionFromDistrict]
  );

  const fetchEventCards = useCallback(
    async (currentProfile: MatchProfile): Promise<SwipeCard[]> => {
      try {
        const snap = await getDocs(query(collection(db, 'events'), limit(40)));
        const serverEvents = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<EventRecord, 'id'>) }));
        const source = serverEvents.length > 0
          ? serverEvents
          : buildSampleEvents(language).map((event) => ({
              id: event.id,
              name: event.name,
              district: event.district,
              location: event.location,
              date: event.date,
              time: event.time,
              description: event.description,
              category: event.category,
              elderlyName: event.elderlyName,
            }));
        return source.map((event) => eventToCard(event, currentProfile));
      } catch {
        return buildSampleEvents(language).map((event) =>
          eventToCard(
            {
              id: event.id,
              name: event.name,
              district: event.district,
              location: event.location,
              date: event.date,
              time: event.time,
              description: event.description,
              category: event.category,
              elderlyName: event.elderlyName,
            },
            currentProfile
          )
        );
      }
    },
    [eventToCard, language]
  );

  const fetchPeopleCards = useCallback(async () => {
    if (!uid) {
      setCards([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const selfSnap = await getDoc(doc(db, 'users', uid));

      const selfData = selfSnap.data() as UserRecord | undefined;
      const current = selfData ? toProfile(uid, selfData) : null;

      let peopleCards: SwipeCard[] = [];

      const currentProfile = current ?? buildFallbackCurrent();

      if (swipeMode === 'smart') {
        if (!currentProfile) {
          setProfileReady(false);
          setCards([]);
          return;
        }

        const othersSnap = await getDocs(
          query(collection(db, 'users'), where('role', '==', role === 'youth' ? 'elderly' : 'youth'))
        );

        const others = othersSnap.docs
          .map((item) => toProfile(item.id, item.data() as UserRecord))
          .filter((value): value is MatchProfile => value !== null)
          .filter((value) => value.uid !== uid);

        const ranked = rankMatches(currentProfile, others, 80);
        const interestsByUid = new Map(others.map((item) => [item.uid, item.interests]));

        peopleCards = ranked.map((item) => ({
          cardType: 'person',
          ...item,
          baseFinalScore: item.finalScore,
          adaptiveScore: item.finalScore,
          targetInterests: interestsByUid.get(item.targetUid) ?? [],
        }));

        // Keep decks non-empty for elderly users when smart source is sparse.
        if (!peopleCards.length) {
          peopleCards = buildFakePeopleCards(currentProfile);
        }
      } else {
        peopleCards = buildFakePeopleCards(currentProfile);
      }

      const eventCards = await fetchEventCards(currentProfile);

      let nextCards: SwipeCard[] = [];
      if (deckMode === 'people') {
        nextCards = peopleCards;
      } else if (deckMode === 'events') {
        nextCards = eventCards;
      } else {
        nextCards = [...peopleCards, ...eventCards].sort((a, b) => b.adaptiveScore - a.adaptiveScore);
      }

      if (!nextCards.length) {
        // Final guard: always provide a people deck fallback.
        nextCards = buildFakePeopleCards(currentProfile);
      }

      const eventsSnap = await getDocs(
        query(collection(db, 'swipe_events'), where('userId', '==', uid), limit(120))
      );
      const events = eventsSnap.docs.map((d) => d.data()) as SwipeEventRow[];
      const personalized = applyBehaviorLearning(nextCards, events);

      setCards(personalized);
      setCardIndex(0);
      setProfileReady(true);
    } catch (error) {
      console.error('Error building swipe cards:', error);
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, [buildFakePeopleCards, buildFallbackCurrent, deckMode, fetchEventCards, getRegionFromDistrict, role, swipeMode, uid]);

  useEffect(() => {
    fetchPeopleCards();
  }, [fetchPeopleCards]);

  const persistSwipe = useCallback(
    async (card: SwipeCard, direction: 'left' | 'right') => {
      if (!uid) return;

      await addDoc(collection(db, 'swipe_events'), {
        userId: uid,
        targetUserId: card.targetUid,
        direction,
        type: card.cardType === 'event' ? 'event' : swipeMode === 'fake' ? 'fake_profile' : 'profile',
        source: swipeMode,
        targetInterests: card.targetInterests,
        distanceKm: card.distanceKm,
        jaccardScore: card.jaccardScore,
        baseFinalScore: card.baseFinalScore,
        adaptiveScore: card.adaptiveScore,
        timestamp: serverTimestamp(),
      });

      if (direction === 'right') {
        await addDoc(collection(db, 'matches'), {
          matchId: `${uid}-${card.targetUid}`,
          youthId: role === 'youth' ? uid : card.targetUid,
          elderlyId: role === 'elderly' ? uid : card.targetUid,
          activityId: card.targetUid,
          activityType:
            card.cardType === 'event'
              ? 'event'
              : swipeMode === 'fake'
                ? 'fake_profile_match'
                : 'profile_match',
          activityName: card.targetName,
          final_score: card.baseFinalScore,
          adaptive_score: card.adaptiveScore,
          jaccard_score: card.jaccardScore,
          distance_km: card.distanceKm,
          shared_interests: card.sharedInterests.join('; '),
          createdAt: serverTimestamp(),
        });
      }
    },
    [role, swipeMode, uid]
  );

  const completeSwipe = useCallback(
    (direction: 'left' | 'right') => {
      const current = cards[cardIndex];
      if (!current) return;

      pan.setValue({ x: 0, y: 0 });
      setCardIndex((prev) => prev + 1);
      void persistSwipe(current, direction);
    },
    [cardIndex, cards, pan, persistSwipe]
  );

  const forceSwipe = useCallback(
    (direction: 'left' | 'right') => {
      const x = direction === 'right' ? width * 1.2 : -width * 1.2;
      Animated.timing(pan, {
        toValue: { x, y: 0 },
        duration: 180,
        useNativeDriver: false,
      }).start(() => completeSwipe(direction));
    },
    [completeSwipe, pan]
  );

  const resetPosition = useCallback(() => {
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      friction: 6,
      useNativeDriver: false,
    }).start();
  }, [pan]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_evt, gesture) =>
          Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5,
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_evt, gesture) => {
          if (gesture.dx > SWIPE_THRESHOLD) {
            forceSwipe('right');
            return;
          }
          if (gesture.dx < -SWIPE_THRESHOLD) {
            forceSwipe('left');
            return;
          }
          resetPosition();
        },
      }),
    [forceSwipe, pan.x, pan.y, resetPosition]
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>{t(language, 'loadingActivities')}</Text>
      </View>
    );
  }

  if (!profileReady) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noMoreText}>Complete your profile interests and location first.</Text>
      </View>
    );
  }

  const currentCard = cards[cardIndex];
  const nextCard = cards[cardIndex + 1];

  if (!currentCard) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noMoreText}>No more cards right now.</Text>
        <Pressable style={styles.refreshBtn} onPress={fetchPeopleCards}>
          <Text style={styles.refreshText}>Reload deck</Text>
        </Pressable>
      </View>
    );
  }

  const animatedCardStyle = {
    transform: [...pan.getTranslateTransform(), { rotate }],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Discover Matches</Text>
      <Text style={styles.pageSub}>Swipe right to connect with people who share your interests</Text>

      <View style={styles.modeRow}>
        <Pressable
          style={[styles.modeBtn, swipeMode === 'fake' && styles.modeBtnActive]}
          onPress={() => setSwipeMode('fake')}>
          <Text style={[styles.modeBtnText, swipeMode === 'fake' && styles.modeBtnTextActive]}>
            {role === 'elderly' ? 'People (Fake Youth)' : 'People (Fake Elderly)'}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.modeBtn, swipeMode === 'smart' && styles.modeBtnActive]}
          onPress={() => setSwipeMode('smart')}>
          <Text style={[styles.modeBtnText, swipeMode === 'smart' && styles.modeBtnTextActive]}>
            Smart Matches
          </Text>
        </Pressable>
      </View>

      <View style={styles.modeRow}>
        <Pressable
          style={[styles.modeBtn, deckMode === 'people' && styles.modeBtnActive]}
          onPress={() => setDeckMode('people')}>
          <Text style={[styles.modeBtnText, deckMode === 'people' && styles.modeBtnTextActive]}>People</Text>
        </Pressable>
        <Pressable
          style={[styles.modeBtn, deckMode === 'events' && styles.modeBtnActive]}
          onPress={() => setDeckMode('events')}>
          <Text style={[styles.modeBtnText, deckMode === 'events' && styles.modeBtnTextActive]}>Events</Text>
        </Pressable>
        <Pressable
          style={[styles.modeBtn, deckMode === 'mixed' && styles.modeBtnActive]}
          onPress={() => setDeckMode('mixed')}>
          <Text style={[styles.modeBtnText, deckMode === 'mixed' && styles.modeBtnTextActive]}>Mixed</Text>
        </Pressable>
      </View>

      <View style={styles.deckWrap}>
        {nextCard ? (
          <View style={[styles.card, styles.nextCard]}>
            <Text style={styles.title}>{nextCard.targetName}</Text>
            <Text style={styles.scoreText}>
              {nextCard.cardType === 'event' ? 'Event card' : 'Profile card'}
            </Text>
          </View>
        ) : null}

        <Animated.View style={[styles.card, animatedCardStyle]} {...panResponder.panHandlers}>
          <Text style={styles.title}>{currentCard.targetName}</Text>
          <Text style={styles.infoText}>Distance: {currentCard.distanceKm.toFixed(1)} km</Text>
          <Text style={styles.infoText}>District: {currentCard.targetDistrict ?? 'Unknown'}</Text>

          {currentCard.cardType === 'event' ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Event details</Text>
              <Text style={styles.sectionText}>Host: {currentCard.eventHost ?? 'Community organizer'}</Text>
              <Text style={styles.sectionText}>When: {currentCard.eventTime || 'TBD'}</Text>
              <Text style={styles.sectionText}>Where: {currentCard.eventLocation || currentCard.targetDistrict || 'TBD'}</Text>
              {currentCard.eventCategory ? (
                <Text style={styles.sectionText}>Category: {currentCard.eventCategory}</Text>
              ) : null}
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shared interests</Text>
            <View style={styles.tagWrap}>
              {(currentCard.sharedInterests.length
                ? currentCard.sharedInterests
                : ['No shared interests yet']).map((item) => (
                <View key={item} style={styles.tag}>
                  <Text style={styles.tagText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {currentCard.cardType === 'event' ? 'Event tags' : 'Their profile interests'}
            </Text>
            <View style={styles.tagWrap}>
              {(currentCard.targetInterests.length
                ? currentCard.targetInterests
                : ['No interests listed']).map((item) => (
                <View key={item} style={styles.tag}>
                  <Text style={styles.tagText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      </View>

      <View style={styles.actionRow}>
        <Pressable style={[styles.actionBtn, styles.leftBtn]} onPress={() => forceSwipe('left')}>
          <Text style={styles.actionText}>Skip</Text>
        </Pressable>
        <Pressable style={[styles.actionBtn, styles.rightBtn]} onPress={() => forceSwipe('right')}>
          <Text style={styles.actionText}>Like</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite, paddingHorizontal: 16, paddingTop: 10 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  pageTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1B5E20',
    textAlign: 'center',
  },
  pageSub: {
    fontSize: 14,
    color: '#2E7D32',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 10,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2E7D32',
    backgroundColor: '#FFF8D6',
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: '#2E7D32',
  },
  modeBtnText: { color: '#1B5E20', fontWeight: '700', fontSize: 12 },
  modeBtnTextActive: { color: '#FFFFFF' },
  deckWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: Math.min(width * 0.88, 440),
    minHeight: 460,
    borderRadius: 22,
    backgroundColor: '#FFE48A',
    padding: 18,
    borderWidth: 2,
    borderColor: '#F9A825',
    ...SHADOW,
  },
  nextCard: {
    position: 'absolute',
    transform: [{ scale: 0.95 }, { translateY: 14 }],
    opacity: 0.7,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1B5E20',
    textAlign: 'center',
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 15,
    color: '#1B5E20',
    textAlign: 'center',
    marginBottom: 3,
  },
  section: {
    marginTop: 14,
    backgroundColor: '#FFF8D6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2B13B',
    padding: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
  },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    borderWidth: 1,
    borderColor: '#D7B66B',
    borderRadius: 999,
    backgroundColor: '#FFF3C4',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: { fontSize: 12, color: '#2E7D32', fontWeight: '600' },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    height: 62,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    ...SHADOW,
  },
  leftBtn: { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' },
  rightBtn: { backgroundColor: '#B7F0B1', borderColor: '#86EFAC' },
  actionText: { fontSize: 22, fontWeight: '700', color: '#1B5E20' },
  noMoreText: { fontSize: 16, color: '#2E7D32', textAlign: 'center', marginBottom: 12 },
  refreshBtn: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  refreshText: { color: '#FFFFFF', fontWeight: '700' },
});
