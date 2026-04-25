const fs = require('fs');

const regionMap = {
  'Central and Western': 'central_western',
  'Eastern': 'eastern',
  'Southern': 'southern',
  'Wan Chai': 'wan_chai',
  'Kowloon City': 'kowloon_city',
  'Kwun Tong': 'kwun_tong',
  'Sham Shui Po': 'sham_shui_po',
  'Wong Tai Sin': 'wong_tai_sin',
  'Yau Tsim Mong': 'yau_tsim_mong',
  'Islands': 'islands',
  'Kwai Tsing': 'kwai_tsing',
  'North': 'north',
  'Sai Kung': 'sai_kung',
  'Sha Tin': 'sha_tin',
  'Tai Po': 'tai_po',
  'Tuen Mun': 'tuen_mun',
  'Tsuen Wan': 'tsuen_wan',
  'Yuen Long': 'yuen_long'
};

const REGION_COORDINATES = [
  { key: 'central_western', lat: 22.2867, lng: 114.1548 },
  { key: 'eastern', lat: 22.2849, lng: 114.2246 },
  { key: 'southern', lat: 22.2472, lng: 114.1588 },
  { key: 'wan_chai', lat: 22.2773, lng: 114.1737 },
  { key: 'kowloon_city', lat: 22.3282, lng: 114.1915 },
  { key: 'kwun_tong', lat: 22.3123, lng: 114.2250 },
  { key: 'sham_shui_po', lat: 22.3300, lng: 114.1595 },
  { key: 'wong_tai_sin', lat: 22.3420, lng: 114.1953 },
  { key: 'yau_tsim_mong', lat: 22.3214, lng: 114.1694 },
  { key: 'islands', lat: 22.2866, lng: 113.9455 },
  { key: 'kwai_tsing', lat: 22.3659, lng: 114.1056 },
  { key: 'north', lat: 22.4961, lng: 114.1280 },
  { key: 'sai_kung', lat: 22.3835, lng: 114.2730 },
  { key: 'sha_tin', lat: 22.3872, lng: 114.1953 },
  { key: 'tai_po', lat: 22.4500, lng: 114.1680 },
  { key: 'tsuen_wan', lat: 22.3718, lng: 114.1171 },
  { key: 'tuen_mun', lat: 22.3910, lng: 113.9730 },
  { key: 'yuen_long', lat: 22.4456, lng: 114.0222 },
];

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

function parseCSV(filename) {
  const content = fs.readFileSync(filename, 'utf8');
  const lines = content.replace(/\r/g, '').trim().split('\n');
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const obj = {};
    headers.forEach((h, i) => obj[h] = values[i] ? values[i].trim() : '');
    return obj;
  });
}

const elderly = parseCSV('fake_elderly_profiles.csv');
const youth = parseCSV('fake_youth_profiles.csv');
const all = [...elderly, ...youth];
const districts = {};

function nearestRegionKey(lat, lng) {
  let best = null;
  REGION_COORDINATES.forEach((region) => {
    const dLat = lat - region.lat;
    const dLng = lng - region.lng;
    const dist = dLat * dLat + dLng * dLng;
    if (!best || dist < best.dist) {
      best = { key: region.key, dist };
    }
  });
  return best ? best.key : null;
}

all.forEach(row => {
  const districtStr = row.district;
  if (!districtStr) return;
  
  if (!districts[districtStr]) {
    districts[districtStr] = { sumLat: 0, sumLon: 0, count: 0 };
  }
  
  const lat = parseFloat(row.latitude);
  const lon = parseFloat(row.longitude);
  
  if (!isNaN(lat) && !isNaN(lon)) {
    districts[districtStr].sumLat += lat;
    districts[districtStr].sumLon += lon;
    districts[districtStr].count++;
  }
});

const ESTATE_OPTIONS = Object.keys(districts).map(districtStr => {
  const avgLat = districts[districtStr].sumLat / districts[districtStr].count;
  const avgLng = districts[districtStr].sumLon / districts[districtStr].count;
  const regionKey = nearestRegionKey(avgLat, avgLng);
  
  if (!regionKey) return null;

  return {
    value: districtStr,
    label: districtStr,
    regionKey: regionKey,
    lat: avgLat,
    lng: avgLng
  };
}).filter(Boolean).sort((a, b) => {
  if (a.regionKey !== b.regionKey) return a.regionKey.localeCompare(b.regionKey);
  return a.label.localeCompare(b.label);
});

const tsContent = `export type EstateOption = {
  value: string;
  label: string;
  regionKey: string;
  lat: number;
  lng: number;
};

export const ESTATE_OPTIONS: EstateOption[] = ${JSON.stringify(ESTATE_OPTIONS, null, 2)};
`;

fs.writeFileSync('LinkGen-main/lib/locationOptions.ts', tsContent);
console.log('Total estates generated:', ESTATE_OPTIONS.length);
console.log('First 10 entries:', JSON.stringify(ESTATE_OPTIONS.slice(0, 10), null, 2));
