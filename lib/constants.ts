export const DISTRICTS: Record<string, string> = {
  central_western: 'Central & Western',
  eastern: 'Eastern',
  southern: 'Southern',
  wan_chai: 'Wan Chai',
  kowloon_city: 'Kowloon City',
  kwun_tong: 'Kwun Tong',
  sham_shui_po: 'Sham Shui Po',
  wong_tai_sin: 'Wong Tai Sin',
  yau_tsim_mong: 'Yau Tsim Mong',
  islands: 'Islands',
  kwai_tsing: 'Kwai Tsing',
  north: 'North',
  sai_kung: 'Sai Kung',
  sha_tin: 'Sha Tin',
  tai_po: 'Tai Po',
  tsuen_wan: 'Tsuen Wan',
  tuen_mun: 'Tuen Mun',
  yuen_long: 'Yuen Long',
};

export const TASK_CATEGORIES: Record<string, { label: string; emoji: string }> = {
  transport: { label: 'Transport', emoji: '🚗' },
  groceries: { label: 'Groceries', emoji: '🛒' },
  cleaning: { label: 'Cleaning', emoji: '🧹' },
  cooking: { label: 'Cooking', emoji: '🍳' },
  companionship: { label: 'Companionship', emoji: '🤝' },
  tech_help: { label: 'Tech Help', emoji: '📱' },
  errands: { label: 'Errands', emoji: '📦' },
  other: { label: 'Other', emoji: '✨' },
};

export const EVENT_CATEGORIES: Record<string, { label: string; emoji: string }> = {
  cultural: { label: 'Cultural', emoji: '🏛️' },
  games: { label: 'Games', emoji: '🀄' },
  food: { label: 'Food', emoji: '🥟' },
  exercise: { label: 'Exercise', emoji: '🚶' },
  learning: { label: 'Learning', emoji: '📚' },
  social: { label: 'Social', emoji: '🎉' },
  outdoor: { label: 'Outdoor', emoji: '🌳' },
  other: { label: 'Other', emoji: '✨' },
};

export const TIME_SLOTS: Record<string, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  flexible: 'Flexible',
};

export type RegionOption = {
  key: keyof typeof DISTRICTS;
  latitude: number;
  longitude: number;
};

// District center points used to estimate user location for distance scoring.
export const REGION_COORDINATES: RegionOption[] = [
  { key: 'central_western', latitude: 22.2867, longitude: 114.1548 },
  { key: 'eastern', latitude: 22.2849, longitude: 114.2246 },
  { key: 'southern', latitude: 22.2472, longitude: 114.1588 },
  { key: 'wan_chai', latitude: 22.2773, longitude: 114.1737 },
  { key: 'kowloon_city', latitude: 22.3282, longitude: 114.1915 },
  { key: 'kwun_tong', latitude: 22.3123, longitude: 114.2250 },
  { key: 'sham_shui_po', latitude: 22.3300, longitude: 114.1595 },
  { key: 'wong_tai_sin', latitude: 22.3420, longitude: 114.1953 },
  { key: 'yau_tsim_mong', latitude: 22.3214, longitude: 114.1694 },
  { key: 'islands', latitude: 22.2866, longitude: 113.9455 },
  { key: 'kwai_tsing', latitude: 22.3659, longitude: 114.1056 },
  { key: 'north', latitude: 22.4961, longitude: 114.1280 },
  { key: 'sai_kung', latitude: 22.3835, longitude: 114.2730 },
  { key: 'sha_tin', latitude: 22.3872, longitude: 114.1953 },
  { key: 'tai_po', latitude: 22.4500, longitude: 114.1680 },
  { key: 'tsuen_wan', latitude: 22.3718, longitude: 114.1171 },
  { key: 'tuen_mun', latitude: 22.3910, longitude: 113.9730 },
  { key: 'yuen_long', latitude: 22.4456, longitude: 114.0222 },
];

export const PROFILE_INTEREST_OPTIONS = [
  'games',
  'mahjong',
  'karaoke',
  'music',
  'reading',
  'walking',
  'park',
  'light_exercise',
  'chess',
  'chinese',
  'arts',
  'calligraphy',
  'food_social',
  'cooking',
  'digital_help',
  'smartphone',
  'community',
  'companionship',
  'stretching',
  'tea',
] as const;
