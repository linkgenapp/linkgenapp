import csv
import random
from pathlib import Path

OUTPUT_CSV = "fake_elderly_profiles.csv"
ESTATE_SOURCE_CSV = "MHE_21C_with_latlon_updated.csv"
NUM_RECORDS = 3000
SEED = 21

HK_LAT_MIN, HK_LAT_MAX = 22.1, 22.6
HK_LON_MIN, HK_LON_MAX = 113.8, 114.5

# 40+ district-area labels across Hong Kong.
# Tuple: ("District - Area", latitude, longitude, within_district_factor)
DISTRICT_AREAS = [
    ("Central and Western - Sheung Wan", 22.2866, 114.1527, 1.4),
    ("Central and Western - Sai Ying Pun", 22.2856, 114.1424, 1.3),
    ("Central and Western - Kennedy Town", 22.2819, 114.1289, 1.2),
    ("Central and Western - Mid-Levels", 22.2758, 114.1501, 1.2),
    ("Wan Chai - Wan Chai", 22.2775, 114.1722, 1.3),
    ("Wan Chai - Causeway Bay", 22.2802, 114.1849, 1.2),
    ("Eastern - North Point", 22.2915, 114.2002, 2.1),
    ("Eastern - Quarry Bay", 22.2877, 114.2105, 2.0),
    ("Eastern - Shau Kei Wan", 22.2814, 114.2281, 2.0),
    ("Eastern - Chai Wan", 22.2649, 114.2384, 2.1),
    ("Southern - Aberdeen", 22.2470, 114.1541, 1.4),
    ("Southern - Ap Lei Chau", 22.2425, 114.1548, 1.3),
    ("Southern - Pok Fu Lam", 22.2578, 114.1358, 1.2),
    ("Yau Tsim Mong - Tsim Sha Tsui", 22.2988, 114.1722, 1.4),
    ("Yau Tsim Mong - Yau Ma Tei", 22.3123, 114.1709, 1.5),
    ("Yau Tsim Mong - Mong Kok", 22.3193, 114.1694, 1.6),
    ("Sham Shui Po - Sham Shui Po", 22.3307, 114.1622, 1.8),
    ("Sham Shui Po - Cheung Sha Wan", 22.3350, 114.1486, 1.8),
    ("Kowloon City - Kowloon Tong", 22.3368, 114.1786, 1.5),
    ("Kowloon City - Ho Man Tin", 22.3194, 114.1823, 1.5),
    ("Wong Tai Sin - Wong Tai Sin", 22.3420, 114.1951, 2.4),
    ("Wong Tai Sin - Diamond Hill", 22.3407, 114.2018, 2.3),
    ("Wong Tai Sin - Chuk Yuen", 22.3462, 114.1922, 2.4),
    ("Wong Tai Sin - Lok Fu", 22.3358, 114.1860, 2.2),
    ("Kwun Tong - Kwun Tong", 22.3129, 114.2251, 1.9),
    ("Kwun Tong - Ngau Tau Kok", 22.3159, 114.2191, 1.7),
    ("Kwun Tong - Lam Tin", 22.3069, 114.2339, 1.7),
    ("Kwun Tong - Yau Tong", 22.2968, 114.2388, 1.6),
    ("Kwai Tsing - Kwai Chung", 22.3590, 114.1327, 1.7),
    ("Kwai Tsing - Tsing Yi", 22.3581, 114.1075, 1.7),
    ("Tsuen Wan - Tsuen Wan", 22.3715, 114.1130, 1.6),
    ("Tuen Mun - Tuen Mun", 22.3917, 113.9770, 1.7),
    ("Yuen Long - Yuen Long", 22.4445, 114.0222, 1.8),
    ("Yuen Long - Tin Shui Wai", 22.4593, 114.0049, 1.9),
    ("North - Fanling", 22.4939, 114.1388, 1.5),
    ("North - Sheung Shui", 22.5017, 114.1270, 1.5),
    ("Tai Po - Tai Po", 22.4508, 114.1688, 1.5),
    ("Sha Tin - Sha Tin", 22.3826, 114.1887, 1.6),
    ("Sha Tin - Ma On Shan", 22.4245, 114.2310, 1.5),
    ("Sai Kung - Tseung Kwan O", 22.3154, 114.2645, 1.6),
    ("Sai Kung - Hang Hau", 22.3222, 114.2572, 1.4),
    ("Sai Kung - Sai Kung Town", 22.3838, 114.2700, 1.3),
    ("Islands - Tung Chung", 22.2897, 113.9422, 1.2),
    ("Islands - Discovery Bay", 22.2960, 114.0160, 1.1),
]

# District-level elderly share profile used to mimic where more seniors live.
# These are relative weights for synthetic generation, with higher weight in
# Wong Tai Sin/Eastern as requested.
DISTRICT_ELDERLY_WEIGHTS = {
    "Central and Western": 0.62,
    "Wan Chai": 0.66,
    "Eastern": 1.22,
    "Southern": 0.72,
    "Yau Tsim Mong": 1.02,
    "Sham Shui Po": 1.12,
    "Kowloon City": 0.98,
    "Wong Tai Sin": 1.28,
    "Kwun Tong": 1.00,
    "Kwai Tsing": 1.00,
    "Tsuen Wan": 0.90,
    "Tuen Mun": 0.94,
    "Yuen Long": 0.88,
    "North": 0.86,
    "Tai Po": 0.82,
    "Sha Tin": 0.87,
    "Sai Kung": 0.70,
    "Islands": 0.55,
}

REGION_KEY_MAP = {
    "Central and Western": "central_western",
    "Eastern": "eastern",
    "Southern": "southern",
    "Wan Chai": "wan_chai",
    "Kowloon City": "kowloon_city",
    "Kwun Tong": "kwun_tong",
    "Sham Shui Po": "sham_shui_po",
    "Wong Tai Sin": "wong_tai_sin",
    "Yau Tsim Mong": "yau_tsim_mong",
    "Islands": "islands",
    "Kwai Tsing": "kwai_tsing",
    "North": "north",
    "Sai Kung": "sai_kung",
    "Sha Tin": "sha_tin",
    "Tai Po": "tai_po",
    "Tsuen Wan": "tsuen_wan",
    "Tuen Mun": "tuen_mun",
    "Yuen Long": "yuen_long",
}

INTERESTS = [
    "Morning park walk",
    "Tai chi in park",
    "Mahjong with friends",
    "Cantonese opera",
    "Chinese calligraphy",
    "Dim sum social",
    "Tea gathering",
    "Temple visit",
    "Chess / Chinese chess",
    "Karaoke / old songs",
    "Home cooking",
    "Newspaper reading",
    "TV drama discussion",
    "Smartphone learning",
    "Light stretching",
    "Community centre classes",
    "Handicrafts and knitting",
    "Volunteer service",
]

INTEREST_WEIGHTS = [
    0.08,
    0.09,
    0.10,
    0.05,
    0.05,
    0.08,
    0.07,
    0.03,
    0.05,
    0.05,
    0.06,
    0.07,
    0.05,
    0.04,
    0.05,
    0.05,
    0.04,
    0.04,
]

LAST_NAMES = [
    "Chan",
    "Lee",
    "Wong",
    "Cheung",
    "Lau",
    "Ng",
    "Leung",
    "Ho",
    "Chow",
    "Lam",
    "Yip",
    "Tang",
]

GIVEN_NAMES = [
    "Mei Lin",
    "Siu Lan",
    "Yuk Lan",
    "Wai Ling",
    "Ka Yan",
    "Ming Yuet",
    "Chun Wah",
    "Tak Ming",
    "Kin Man",
    "Wing Chiu",
    "Chi Keung",
    "Kwok Wai",
    "Sze Man",
    "Yat Fung",
    "Yee Kwan",
    "Hoi Yan",
    "Pak Kuen",
    "Siu Fong",
    "Lai Kwan",
    "Kam Ming",
]


def weighted_choice(items, weights):
    return random.choices(items, weights=weights, k=1)[0]


def random_age():
    # Elderly-only ages, skewed toward early-to-mid 70s.
    return int(round(random.triangular(65, 98, 73)))


def random_name():
    return f"{weighted_choice(LAST_NAMES, [1] * len(LAST_NAMES))} {weighted_choice(GIVEN_NAMES, [1] * len(GIVEN_NAMES))}"


def load_estate_pool():
    estate_path = Path(ESTATE_SOURCE_CSV)
    if not estate_path.exists():
        return None

    pool = []
    with open(estate_path, "r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            estate = (row.get("estate_eng") or "").strip()
            lat_raw = row.get("latitude")
            lon_raw = row.get("longitude")
            if not estate or estate.lower() in {"major housing estate total", "hong kong"}:
                continue
            try:
                lat = float(lat_raw)
                lon = float(lon_raw)
            except (TypeError, ValueError):
                continue
            if not (HK_LAT_MIN <= lat <= HK_LAT_MAX and HK_LON_MIN <= lon <= HK_LON_MAX):
                continue
            district = (row.get("full_address_alt") or "").split(",", 1)[0].strip()
            region_key = REGION_KEY_MAP.get(district, "")
            pool.append((estate, lat, lon, district, region_key))

    seen = set()
    unique_pool = []
    for estate, lat, lon, district, region_key in pool:
        if estate in seen:
            continue
        seen.add(estate)
        unique_pool.append((estate, lat, lon, district, region_key))
    return unique_pool


def build_area_weights(estate_pool=None):
    names = []
    lats = []
    lons = []
    weights = []

    if estate_pool:
        for label, lat, lon, district, _region_key in estate_pool:
            district_weight = DISTRICT_ELDERLY_WEIGHTS.get(district, 0.8)
            final_weight = district_weight

            names.append(label)
            lats.append(lat)
            lons.append(lon)
            weights.append(final_weight)
        return names, lats, lons, weights

    for label, lat, lon, local_factor in DISTRICT_AREAS:
        district = label.split(" - ")[0]
        district_weight = DISTRICT_ELDERLY_WEIGHTS.get(district, 0.8)
        final_weight = district_weight * local_factor

        names.append(label)
        lats.append(lat)
        lons.append(lon)
        weights.append(final_weight)

    return names, lats, lons, weights


def jitter_coordinate(lat, lon):
    # Add small random offset so points are not identical.
    lat_offset = random.uniform(-0.008, 0.008)
    lon_offset = random.uniform(-0.008, 0.008)
    return round(lat + lat_offset, 6), round(lon + lon_offset, 6)


def random_interests():
    # Each profile has at least 3 interests, sometimes 4.
    target_count = 3 if random.random() < 0.72 else 4
    picked = []
    while len(picked) < target_count:
        candidate = weighted_choice(INTERESTS, INTEREST_WEIGHTS)
        if candidate not in picked:
            picked.append(candidate)
    return "; ".join(picked)


def main():
    random.seed(SEED)
    estate_pool = load_estate_pool()
    district_names, district_lats, district_lons, district_weights = build_area_weights(estate_pool)

    out_headers = [
        "name",
        "district",
        "interests",
        "age",
        "longitude",
        "latitude",
    ]

    records = []
    for _ in range(NUM_RECORDS):
        idx = random.choices(range(len(district_names)), weights=district_weights, k=1)[0]
        district = district_names[idx]
        base_lat = district_lats[idx]
        base_lon = district_lons[idx]

        interest = random_interests()
        age = random_age()
        latitude, longitude = jitter_coordinate(base_lat, base_lon)

        records.append(
            [
                random_name(),
                district,
                interest,
                age,
                longitude,
                latitude,
            ]
        )

    with open(OUTPUT_CSV, "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(out_headers)
        writer.writerows(records)

    print(f"Created {OUTPUT_CSV} with {NUM_RECORDS} synthetic records.")
    if estate_pool:
        print(f"Unique estates from cleaned geocoded source: {len(estate_pool)}")
    else:
        print(f"Unique district areas (fallback pool): {len(DISTRICT_AREAS)}")


if __name__ == "__main__":
    main()
