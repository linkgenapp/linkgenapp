const fs = require('fs');
const path = require('path');

function parseCSV(content) {
  const lines = content.replace(/\r/g, '').trim().split('\n');
  const parseCSVLine = (line) => {
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
  };
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map((line, index) => {
    const values = parseCSVLine(line);
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = values[i];
    });
    
    return {
      id: "elderly-csv-" + (index + 1),
      name: obj.name,
      district: obj.district,
      interests: obj.interests ? obj.interests.split(';').map(s => s.trim()) : [],
      age: parseInt(obj.age, 10),
      latitude: parseFloat(obj.latitude),
      longitude: parseFloat(obj.longitude)
    };
  });
}

const csvPath = path.join(__dirname, 'fake_elderly_profiles.csv');
const outputPath = path.join(__dirname, 'LinkGen-main', 'lib', 'fakeElderlyProfiles.ts');

const csvContent = fs.readFileSync(csvPath, 'utf8');
const profiles = parseCSV(csvContent).slice(0, 800);

const tsContent = "export type FakeElderlyProfile = {\n" +
  "  id: string;\n" +
  "  name: string;\n" +
  "  district: string;\n" +
  "  interests: string[];\n" +
  "  age: number;\n" +
  "  latitude: number;\n" +
  "  longitude: number;\n" +
  "};\n\n" +
  "export const FAKE_ELDERLY_PROFILES: FakeElderlyProfile[] = " + JSON.stringify(profiles, null, 2) + ";\n";

fs.writeFileSync(outputPath, tsContent);
console.log('Successfully wrote ' + profiles.length + ' profiles to ' + outputPath);
