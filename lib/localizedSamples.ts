import { AppLanguage } from '../store/authRole';
import { DISTRICTS } from './constants';
import { districtLabel, t } from './i18n';
import { FAKE_ELDERLY_PROFILES } from './fakeElderlyProfiles';
import { ESTATE_OPTIONS } from './locationOptions';

type HotspotEstate = {
  estate: string;
  regionKey: string;
};

function buildElderlyHotspots(limit = 10): HotspotEstate[] {
  const counts = new Map<string, number>();
  FAKE_ELDERLY_PROFILES.forEach((profile) => {
    const estate = profile.district?.trim();
    if (!estate) return;
    counts.set(estate, (counts.get(estate) ?? 0) + 1);
  });

  const hotspots = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([estate]) => {
      const estateMeta = ESTATE_OPTIONS.find((item) => item.value === estate || item.label === estate);
      return {
        estate,
        regionKey: estateMeta?.regionKey ?? 'central_western',
      };
    });

  return hotspots.length
    ? hotspots
    : [{ estate: districtLabel('en', 'central_western'), regionKey: 'central_western' }];
}

export type SampleActivity = {
  id: string;
  type: 'task';
  name: string;
  category?: string;
  district?: string;
  location: string;
  participants: number;
  time: string;
  description: string;
  elderlyId: string;
  elderlyName: string;
};

export function buildSampleTasks(lang: AppLanguage): SampleActivity[] {
  const names = [0, 1, 2, 3, 4, 5].map((i) => t(lang, `task_sample_${i}`));
  const elders = [t(lang, 'elder_mrs_chan'), t(lang, 'elder_mr_wong'), t(lang, 'elder_auntie_lee')];
  const slots = ['morning', 'afternoon', 'evening', 'flexible'];
  const cats = ['transport', 'groceries', 'tech_help', 'cleaning', 'companionship', 'errands'];
  const keys = Object.keys(DISTRICTS);

  return Array.from({ length: 24 }).map((_, i) => {
    const dKey = keys[i % keys.length];
    return {
      id: `sample-task-${i + 1}`,
      type: 'task',
      name: names[i % 6],
      category: cats[i % 6],
      district: dKey,
      location: districtLabel(lang, dKey),
      participants: 1,
      time: t(lang, `time_${slots[i % 4]}`),
      description: t(lang, 'taskDescSample'),
      elderlyId: `elderly-${(i % 3) + 1}`,
      elderlyName: elders[i % 3],
    };
  });
}

export type SampleEventCard = {
  id: string;
  type?: 'event';
  name: string;
  category?: string;
  district?: string;
  location: string;
  date?: string;
  time: string;
  description: string;
  elderlyId: string;
  elderlyName: string;
  participants?: number;
  max_participants?: number;
  attendees?: string[];
};

export type ElderlyEventRow = {
  id: string;
  title?: string;
  name?: string;
  location: string;
  district?: string;
  category?: string;
  date?: string;
  time: string;
  description: string;
};

/** Fallback list for the elderly “Community events” screen when Firestore is empty. */
export function buildElderlyEventsScreenFallback(lang: AppLanguage): ElderlyEventRow[] {
  const hotspots = buildElderlyHotspots(2);
  return [
    {
      id: 'ev-1',
      name: t(lang, 'evReadName1'),
      location: hotspots[0]?.estate ?? t(lang, 'evReadLoc1'),
      time: t(lang, 'evReadTime1'),
      description: t(lang, 'evReadDesc1'),
      district: hotspots[0]?.regionKey ?? 'central_western',
      category: 'learning',
    },
    {
      id: 'ev-2',
      name: t(lang, 'evReadName2'),
      location: hotspots[1]?.estate ?? t(lang, 'evReadLoc2'),
      time: t(lang, 'evReadTime2'),
      description: t(lang, 'evReadDesc2'),
      district: hotspots[1]?.regionKey ?? 'yau_tsim_mong',
      category: 'cultural',
    },
  ];
}

export function buildSampleEvents(lang: AppLanguage): SampleEventCard[] {
  const names = [0, 1, 2, 3, 4].map((i) => t(lang, `evs_${i}`));
  const hosts = [t(lang, 'host_golden'), t(lang, 'elder_mrs_chan'), t(lang, 'elder_mr_wong')];
  const cats = ['games', 'learning', 'cultural', 'food', 'exercise'];
  const hotspots = buildElderlyHotspots(12);

  return Array.from({ length: 22 }).map((_, i) => {
    const hotspot = hotspots[i % hotspots.length];
    const dKey = hotspot.regionKey;
    return {
      id: `sample-event-${i + 1}`,
      type: 'event',
      name: names[i % 5],
      category: cats[i % 5],
      district: dKey,
      location: hotspot.estate,
      date: ['2026-05-01', '2026-05-03', '2026-05-06', '2026-05-09'][i % 4],
      time: ['Fri 7PM', 'Sat 3PM', 'Sun 11AM', 'Wed 6:30PM'][i % 4],
      description: t(lang, 'evDescSample'),
      elderlyId: `organizer-${(i % 3) + 1}`,
      elderlyName: hosts[i % 3],
      participants: 4 + (i % 10),
      max_participants: 12 + (i % 8),
      attendees: [],
    };
  });
}

export type SampleMatch = {
  id: string;
  activityName: string;
  activityType: 'task' | 'event';
  elderlyId: string;
};

export function buildSampleMatches(lang: AppLanguage): SampleMatch[] {
  return [
    { id: 'match-1', activityName: t(lang, 'sample_match_1'), activityType: 'task', elderlyId: 'elderly-1' },
    { id: 'match-2', activityName: t(lang, 'sample_match_2'), activityType: 'event', elderlyId: 'elderly-3' },
  ];
}

export type MapPinSample = {
  id: string;
  title: string;
  location: string;
  latitude: number;
  longitude: number;
  status: 'open' | 'closed' | 'published';
  kind: 'task' | 'event';
  category?: string;
};

export function buildMapFallbackPins(lang: AppLanguage): MapPinSample[] {
  return [
    {
      id: 'pin-1',
      title: t(lang, 'map_pin_groceries'),
      location: districtLabel(lang, 'yau_tsim_mong'),
      latitude: 22.3193,
      longitude: 114.1694,
      status: 'open',
      kind: 'task',
      category: 'groceries',
    },
    {
      id: 'pin-2',
      title: t(lang, 'map_pin_doctor'),
      location: districtLabel(lang, 'central_western'),
      latitude: 22.2819,
      longitude: 114.1582,
      status: 'open',
      kind: 'task',
      category: 'transport',
    },
    {
      id: 'pin-3',
      title: t(lang, 'map_pin_taichi'),
      location: districtLabel(lang, 'yau_tsim_mong'),
      latitude: 22.2965,
      longitude: 114.1722,
      status: 'published',
      kind: 'event',
      category: 'wellness',
    },
  ];
}
