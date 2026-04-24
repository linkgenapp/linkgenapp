export type MatchProfile = {
  uid: string;
  displayName: string;
  role: 'youth' | 'elderly';
  district?: string;
  latitude: number;
  longitude: number;
  interests: string[];
};

export type RankedMatch = {
  targetUid: string;
  targetName: string;
  targetDistrict?: string;
  sharedInterests: string[];
  jaccardScore: number;
  distanceKm: number;
  finalScore: number;
};

function normalizeInterest(value: string): string {
  return value.trim().toLowerCase();
}

export function parseInterests(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((v) => typeof v === 'string')
      .map((v) => normalizeInterest(v))
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/[;,]/)
      .map((v) => normalizeInterest(v))
      .filter(Boolean);
  }

  return [];
}

export function jaccardWithShared(a: string[], b: string[]): { score: number; shared: string[] } {
  const setA = new Set(a.map(normalizeInterest));
  const setB = new Set(b.map(normalizeInterest));

  if (setA.size === 0 || setB.size === 0) {
    return { score: 0, shared: [] };
  }

  const shared = [...setA].filter((value) => setB.has(value));
  const union = new Set([...setA, ...setB]);

  return {
    score: union.size === 0 ? 0 : shared.length / union.size,
    shared,
  };
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

export function finalMatchScore(jaccardScore: number, distanceKm: number): number {
  const distanceScore = 1 / (1 + Math.max(distanceKm, 0));
  return 0.7 * jaccardScore + 0.3 * distanceScore;
}

export function rankMatches(current: MatchProfile, others: MatchProfile[], limit = 30): RankedMatch[] {
  return others
    .map((other) => {
      const { score: jaccardScore, shared } = jaccardWithShared(current.interests, other.interests);
      const distanceKm = haversineKm(current.latitude, current.longitude, other.latitude, other.longitude);
      const finalScore = finalMatchScore(jaccardScore, distanceKm);

      return {
        targetUid: other.uid,
        targetName: other.displayName,
        targetDistrict: other.district,
        sharedInterests: shared,
        jaccardScore,
        distanceKm,
        finalScore,
      };
    })
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, limit);
}
