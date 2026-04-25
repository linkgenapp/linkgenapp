const fs = require('fs');

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  values.push(current);
  return values.map((v) => v.trim());
}

function parseCSV(content) {
  const lines = content.replace(/\r/g, '').trim().split('\n');
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = values[i];
    });
    return obj;
  });
}

function getJaccard(s1, s2) {
  if (!s1 || !s2) return 0;
  const set1 = new Set(s1.split(';').map(s => s.trim().toLowerCase()));
  const set2 = new Set(s2.split(';').map(s => s.trim().toLowerCase()));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

function getHaversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const elderly = parseCSV(fs.readFileSync('fake_elderly_profiles.csv', 'utf8'));
const youth = parseCSV(fs.readFileSync('fake_youth_profiles.csv', 'utf8'));

console.log('Elderly count:', elderly.length);
console.log('Youth count:', youth.length);

const e2y = elderly.map(e => {
  let best = { score: -1 };
  youth.forEach(y => {
    const jaccard = getJaccard(e.interests, y.interests);
    const dist = getHaversine(parseFloat(e.latitude), parseFloat(e.longitude), parseFloat(y.latitude), parseFloat(y.longitude));
    const distScore = 1 / (1 + dist);
    const score = 0.7 * jaccard + 0.3 * distScore;
    if (score > best.score) {
      best = { targetName: y.name, score, distance: dist, jaccard };
    }
  });
  return { name: e.name, ...best };
}).sort((a, b) => b.score - a.score).slice(0, 1000);

const y2e = youth.map(y => {
  let best = { score: -1 };
  elderly.forEach(e => {
    const jaccard = getJaccard(e.interests, y.interests);
    const dist = getHaversine(parseFloat(e.latitude), parseFloat(e.longitude), parseFloat(y.latitude), parseFloat(y.longitude));
    const distScore = 1 / (1 + dist);
    const score = 0.7 * jaccard + 0.3 * distScore;
    if (score > best.score) {
      best = { targetName: e.name, score, distance: dist, jaccard };
    }
  });
  return { name: y.name, ...best };
}).sort((a, b) => b.score - a.score).slice(0, 1000);

const tsContent = `export type PrecomputedMatchRow = {
  name: string;
  targetName: string;
  score: number;
  distance: number;
  jaccard: number;
};

export const PRECOMPUTED_MATCHES = {
  elderlyToYouth: ${JSON.stringify(e2y, null, 2)},
  youthToElderly: ${JSON.stringify(y2e, null, 2)},
  meta: {
    generatedAt: "${new Date().toISOString()}",
    elderlyCount: ${e2y.length},
    youthCount: ${y2e.length}
  }
};`;

fs.writeFileSync('LinkGen-main/lib/precomputedMatches.ts', tsContent);
console.log('E2Y:', e2y.length, 'Y2E:', y2e.length);
