import csv
import random
from pathlib import Path

OUTPUT_CSV = "fake_youth_profiles.csv"
ELDERLY_SOURCE_CSV = "fake_elderly_profiles.csv"
ESTATE_SOURCE_CSV = "MHE_21C_with_latlon_updated.csv"
NUM_RECORDS = 2500
SEED = 21
ALIGN_TO_ELDERLY_DISTRIBUTION = True

HK_LAT_MIN, HK_LAT_MAX = 22.1, 22.6
HK_LON_MIN, HK_LON_MAX = 113.8, 114.5

# Same 44 area labels used in elderly data.
# Tuple: ("District - Area", latitude, longitude, within_district_factor)
DISTRICT_AREAS = [
    ("Central and Western - Sheung Wan", 22.2866, 114.1527, 1.2),
    ("Central and Western - Sai Ying Pun", 22.2856, 114.1424, 1.2),
    ("Central and Western - Kennedy Town", 22.2819, 114.1289, 1.3),
    ("Central and Western - Mid-Levels", 22.2758, 114.1501, 1.1),
    ("Wan Chai - Wan Chai", 22.2775, 114.1722, 1.2),
    ("Wan Chai - Causeway Bay", 22.2802, 114.1849, 1.1),
    ("Eastern - North Point", 22.2915, 114.2002, 1.0),
    ("Eastern - Quarry Bay", 22.2877, 114.2105, 1.1),
    ("Eastern - Shau Kei Wan", 22.2814, 114.2281, 1.1),
    ("Eastern - Chai Wan", 22.2649, 114.2384, 1.2),
    ("Southern - Aberdeen", 22.2470, 114.1541, 1.0),
    ("Southern - Ap Lei Chau", 22.2425, 114.1548, 1.0),
    ("Southern - Pok Fu Lam", 22.2578, 114.1358, 1.1),
    ("Yau Tsim Mong - Tsim Sha Tsui", 22.2988, 114.1722, 1.2),
    ("Yau Tsim Mong - Yau Ma Tei", 22.3123, 114.1709, 1.1),
    ("Yau Tsim Mong - Mong Kok", 22.3193, 114.1694, 1.2),
    ("Sham Shui Po - Sham Shui Po", 22.3307, 114.1622, 1.2),
    ("Sham Shui Po - Cheung Sha Wan", 22.3350, 114.1486, 1.3),
    ("Kowloon City - Kowloon Tong", 22.3368, 114.1786, 1.2),
    ("Kowloon City - Ho Man Tin", 22.3194, 114.1823, 1.1),
    ("Wong Tai Sin - Wong Tai Sin", 22.3420, 114.1951, 0.9),
    ("Wong Tai Sin - Diamond Hill", 22.3407, 114.2018, 1.0),
    ("Wong Tai Sin - Chuk Yuen", 22.3462, 114.1922, 0.9),
    ("Wong Tai Sin - Lok Fu", 22.3358, 114.1860, 1.0),
    ("Kwun Tong - Kwun Tong", 22.3129, 114.2251, 1.3),
    ("Kwun Tong - Ngau Tau Kok", 22.3159, 114.2191, 1.3),
    ("Kwun Tong - Lam Tin", 22.3069, 114.2339, 1.2),
    ("Kwun Tong - Yau Tong", 22.2968, 114.2388, 1.2),
    ("Kwai Tsing - Kwai Chung", 22.3590, 114.1327, 1.2),
    ("Kwai Tsing - Tsing Yi", 22.3581, 114.1075, 1.4),
    ("Tsuen Wan - Tsuen Wan", 22.3715, 114.1130, 1.2),
    ("Tuen Mun - Tuen Mun", 22.3917, 113.9770, 1.4),
    ("Yuen Long - Yuen Long", 22.4445, 114.0222, 1.5),
    ("Yuen Long - Tin Shui Wai", 22.4593, 114.0049, 1.7),
    ("North - Fanling", 22.4939, 114.1388, 1.5),
    ("North - Sheung Shui", 22.5017, 114.1270, 1.6),
    ("Tai Po - Tai Po", 22.4508, 114.1688, 1.3),
    ("Sha Tin - Sha Tin", 22.3826, 114.1887, 1.3),
    ("Sha Tin - Ma On Shan", 22.4245, 114.2310, 1.4),
    ("Sai Kung - Tseung Kwan O", 22.3154, 114.2645, 1.8),
    ("Sai Kung - Hang Hau", 22.3222, 114.2572, 1.5),
    ("Sai Kung - Sai Kung Town", 22.3838, 114.2700, 1.2),
    ("Islands - Tung Chung", 22.2897, 113.9422, 1.8),
    ("Islands - Discovery Bay", 22.2960, 114.0160, 1.3),
]

# Higher values indicate relatively more youth population.
DISTRICT_YOUTH_WEIGHTS = {
    "Central and Western": 0.75,
    "Wan Chai": 0.78,
    "Eastern": 0.85,
    "Southern": 0.92,
    "Yau Tsim Mong": 0.96,
    "Sham Shui Po": 1.00,
    "Kowloon City": 0.95,
    "Wong Tai Sin": 0.82,
    "Kwun Tong": 1.08,
    "Kwai Tsing": 1.03,
    "Tsuen Wan": 1.00,
    "Tuen Mun": 1.15,
    "Yuen Long": 1.22,
    "North": 1.18,
    "Tai Po": 1.05,
    "Sha Tin": 1.07,
    "Sai Kung": 1.25,
    "Islands": 1.20,
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
    "Park walk and chat",
    "Tea time conversation",
    "Board games",
    "Chinese chess",
    "Mahjong companion",
    "Phone and smartphone help",
    "Grocery escort",
    "Clinic escort",
    "Home visit companionship",
    "Reading aloud",
    "Calligraphy practice",
    "Old songs karaoke",
    "Photo sharing and memory talk",
    "Simple stretching session",
    "Community centre activities",
    "Cooking together",
]

INTEREST_WEIGHTS = [
    0.09,
    0.08,
    0.08,
    0.06,
    0.06,
    0.08,
    0.07,
    0.07,
    0.07,
    0.06,
    0.05,
    0.05,
    0.06,
    0.05,
    0.04,
    0.06,
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
    "Ka Ming",
    "Wai Man",
    "Tsz Ho",
    "Yiu Tung",
    "Pak Hei",
    "Lok Yin",
    "Siu Tung",
    "Man Yi",
    "Hiu Lam",
    "Yuk Ting",
    "Wing Sze",
    "Ka Ching",
    "Chi Ho",
    "Kwok Him",
    "Sze Wing",
    "Yan Ting",
    "Ho Yin",
    "Tsz Wai",
]


def weighted_choice(items, weights):
    return random.choices(items, weights=weights, k=1)[0]


def random_age():
    return int(round(random.triangular(18, 35, 24)))


def random_name():
    return f"{weighted_choice(LAST_NAMES, [1] * len(LAST_NAMES))} {weighted_choice(GIVEN_NAMES, [1] * len(GIVEN_NAMES))}"


def jitter_coordinate(lat, lon):
    lat_offset = random.uniform(-0.008, 0.008)
    lon_offset = random.uniform(-0.008, 0.008)
    return round(lat + lat_offset, 6), round(lon + lon_offset, 6)


def random_interests():
    # Youth profiles have 3-5 interests.
    target_count = random.choices([3, 4, 5], weights=[0.58, 0.30, 0.12], k=1)[0]
    picked = []
    while len(picked) < target_count:
        candidate = weighted_choice(INTERESTS, INTEREST_WEIGHTS)
        if candidate not in picked:
            picked.append(candidate)
    return "; ".join(picked)


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
            district_weight = DISTRICT_YOUTH_WEIGHTS.get(district, 1.0)
            final_weight = district_weight
            names.append(label)
            lats.append(lat)
            lons.append(lon)
            weights.append(final_weight)
        return names, lats, lons, weights

    for label, lat, lon, local_factor in DISTRICT_AREAS:
        district = label.split(" - ")[0]
        district_weight = DISTRICT_YOUTH_WEIGHTS.get(district, 1.0)
        final_weight = district_weight * local_factor

        names.append(label)
        lats.append(lat)
        lons.append(lon)
        weights.append(final_weight)

    return names, lats, lons, weights


def build_area_weights_from_elderly(names, default_weights):
    # Read elderly area frequencies so youth data can align to same area profile.
    elderly_counts = {label: 0 for label in names}
    try:
        with open(ELDERLY_SOURCE_CSV, "r", encoding="utf-8", newline="") as f:
            reader = csv.DictReader(f)
            for row in reader:
                label = row.get("district", "").strip()
                if label in elderly_counts:
                    elderly_counts[label] += 1
    except FileNotFoundError:
        return default_weights

    # Add 1 as smoothing to avoid zero-probability areas.
    return [elderly_counts[label] + 1 for label in names]


def main():
    random.seed(SEED)
    estate_pool = load_estate_pool()
    district_names, district_lats, district_lons, district_weights = build_area_weights(estate_pool)
    if ALIGN_TO_ELDERLY_DISTRIBUTION:
        district_weights = build_area_weights_from_elderly(district_names, district_weights)

    out_headers = ["name", "district", "interests", "age", "longitude", "latitude"]

    records = []
    # Guarantee all available location keys appear at least once.
    for idx in range(len(district_names)):
        district = district_names[idx]
        base_lat = district_lats[idx]
        base_lon = district_lons[idx]

        age = random_age()
        interests = random_interests()
        latitude, longitude = jitter_coordinate(base_lat, base_lon)
        records.append([random_name(), district, interests, age, longitude, latitude])

    for _ in range(NUM_RECORDS - len(district_names)):
        idx = random.choices(range(len(district_names)), weights=district_weights, k=1)[0]
        district = district_names[idx]
        base_lat = district_lats[idx]
        base_lon = district_lons[idx]

        age = random_age()
        interests = random_interests()
        latitude, longitude = jitter_coordinate(base_lat, base_lon)

        records.append([random_name(), district, interests, age, longitude, latitude])

    with open(OUTPUT_CSV, "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(out_headers)
        writer.writerows(records)

    print(f"Created {OUTPUT_CSV} with {NUM_RECORDS} synthetic records.")
    if estate_pool:
        print(f"Unique estates from cleaned geocoded source: {len(estate_pool)}")
    else:
        print(f"Unique district areas (fallback pool): {len(DISTRICT_AREAS)}")
    if ALIGN_TO_ELDERLY_DISTRIBUTION:
        print("Youth area weighting aligned to elderly area distribution.")


if __name__ == "__main__":
    main()
