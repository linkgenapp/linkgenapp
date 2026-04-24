import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuthRole } from '../../store/authRole';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { DISTRICTS, PROFILE_INTEREST_OPTIONS, REGION_COORDINATES } from '../../lib/constants';
import { districtLabel, t } from '../../lib/i18n';
import { ESTATE_OPTIONS } from '../../lib/locationOptions';

export default function ProfileScreen() {
  const { role, uid, setRole, language, setLanguage } = useAuthRole();
  const [name, setName] = useState(role === 'elderly' ? 'Elderly User' : 'Youth User');
  const [regionKey, setRegionKey] = useState<keyof typeof DISTRICTS>('central_western');
  const [estateValue, setEstateValue] = useState<string>('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [pickerMode, setPickerMode] = useState<'region' | 'estate' | null>(null);

  const regionPoint = useMemo(() => REGION_COORDINATES.find((item) => item.key === regionKey) ?? REGION_COORDINATES[0], [regionKey]);

  const estatesForRegion = useMemo(
    () => ESTATE_OPTIONS.filter((option) => option.regionKey === regionKey),
    [regionKey]
  );

  const selectedEstate = useMemo(() => ESTATE_OPTIONS.find((option) => option.value === estateValue), [estateValue]);

  const locationPoint = useMemo(
    () =>
      selectedEstate
        ? { latitude: selectedEstate.lat, longitude: selectedEstate.lng }
        : { latitude: regionPoint.latitude, longitude: regionPoint.longitude },
    [regionPoint.latitude, regionPoint.longitude, selectedEstate]
  );

  useEffect(() => {
    const loadProfile = async () => {
      if (!uid) return;
      try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (!snap.exists()) return;
        const data = snap.data();
        if (typeof data.display_name === 'string' && data.display_name) setName(data.display_name);
        if (typeof data.bio === 'string') setBio(data.bio);
        if (typeof data.region_key === 'string' && data.region_key in DISTRICTS) {
          setRegionKey(data.region_key as keyof typeof DISTRICTS);
        } else if (typeof data.district === 'string' && data.district in DISTRICTS) {
          setRegionKey(data.district as keyof typeof DISTRICTS);
        }
        if (typeof data.estate_name === 'string' && ESTATE_OPTIONS.some((option) => option.value === data.estate_name)) {
          setEstateValue(data.estate_name);
        } else if (typeof data.district === 'string' && ESTATE_OPTIONS.some((option) => option.value === data.district)) {
          setEstateValue(data.district);
        }
        if (Array.isArray(data.interests)) {
          const cleaned = data.interests.filter((v: unknown) => typeof v === 'string') as string[];
          setInterests(cleaned);
        }
      } catch (error) {
        console.warn('Profile fetch skipped:', error);
      }
    };
    loadProfile();
  }, [uid]);

  const toggleInterest = (value: string) => {
    setInterests((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t(language, 'profile')}</Text>
      <Text style={styles.text}>
        {t(language, 'uidLabel')}: {uid ?? '—'}
      </Text>
      <Text style={styles.text}>
        {t(language, 'currentRole')}: {role === 'youth' ? t(language, 'roleYouth') : t(language, 'roleElderly')}
      </Text>
      <Text style={styles.label}>{t(language, 'displayName')}</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />
      <Text style={styles.label}>{t(language, 'labelDistrict')}</Text>
      <Pressable style={styles.selector} onPress={() => setPickerMode('region')}>
        <Text style={styles.selectorLabel}>Region: {districtLabel(language, regionKey)}</Text>
      </Pressable>
      <Pressable style={styles.selector} onPress={() => setPickerMode('estate')}>
        <Text style={styles.selectorLabel}>Estate: {selectedEstate?.label ?? 'Use region center'}</Text>
      </Pressable>
      <Text style={styles.label}>{t(language, 'labelBio')}</Text>
      <TextInput style={[styles.input, { minHeight: 90 }]} value={bio} multiline onChangeText={setBio} />
      <Text style={styles.label}>Interests (for matching)</Text>
      <View style={styles.rowWrap}>
        {PROFILE_INTEREST_OPTIONS.map((interest) => (
          <Pressable
            key={interest}
            style={[styles.chip, interests.includes(interest) && styles.chipActive]}
            onPress={() => toggleInterest(interest)}>
            <Text style={styles.chipText}>{interest.replace(/_/g, ' ')}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.geoHint}>
        Matching location: {locationPoint.latitude.toFixed(4)}, {locationPoint.longitude.toFixed(4)}
      </Text>
      <Text style={styles.label}>{t(language, 'language')}</Text>
      <View style={styles.rowWrap}>
        <Pressable style={[styles.chip, language === 'en' && styles.chipActive]} onPress={() => setLanguage('en')}>
          <Text style={styles.chipText}>{t(language, 'english')}</Text>
        </Pressable>
        <Pressable style={[styles.chip, language === 'zh-Hant' && styles.chipActive]} onPress={() => setLanguage('zh-Hant')}>
          <Text style={styles.chipText}>{t(language, 'traditionalChinese')}</Text>
        </Pressable>
        <Pressable style={[styles.chip, language === 'zh-Hans' && styles.chipActive]} onPress={() => setLanguage('zh-Hans')}>
          <Text style={styles.chipText}>{t(language, 'simplifiedChinese')}</Text>
        </Pressable>
      </View>
      <View style={styles.row}>
        <Pressable style={styles.btn} onPress={() => setRole('youth')}>
          <Text style={styles.btnText}>{t(language, 'switchYouth')}</Text>
        </Pressable>
        <Pressable style={styles.btn} onPress={() => setRole('elderly')}>
          <Text style={styles.btnText}>{t(language, 'switchElderly')}</Text>
        </Pressable>
      </View>
      <Pressable
        style={[styles.btn, { marginTop: 8, backgroundColor: '#16A34A' }]}
        onPress={async () => {
          if (!uid) return;
          await setDoc(
            doc(db, 'users', uid),
            {
              user_email: uid,
              display_name: name,
              role,
              district: selectedEstate?.label ?? regionKey,
              region_key: regionKey,
              estate_name: selectedEstate?.label ?? null,
              bio,
              interests,
              interests_text: interests.join('; '),
              latitude: locationPoint.latitude,
              longitude: locationPoint.longitude,
              is_verified: false,
              languages: ['Cantonese', 'English'],
            },
            { merge: true }
          );
        }}>
        <Text style={styles.btnText}>{t(language, 'saveProfile')}</Text>
      </Pressable>
      <Text style={styles.note}>{t(language, 'noteDemo')}</Text>

      <Modal visible={pickerMode !== null} transparent animationType="fade" onRequestClose={() => setPickerMode(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPickerMode(null)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{pickerMode === 'region' ? 'Choose region' : 'Choose estate'}</Text>
            <ScrollView style={{ maxHeight: 320 }}>
              {pickerMode === 'region'
                ? Object.keys(DISTRICTS).map((key) => (
                    <Pressable
                      key={key}
                      style={styles.optionRow}
                      onPress={() => {
                        setRegionKey(key as keyof typeof DISTRICTS);
                        setEstateValue('');
                        setPickerMode(null);
                      }}>
                      <Text style={styles.optionText}>{districtLabel(language, key)}</Text>
                    </Pressable>
                  ))
                : (
                    [
                      { value: '', label: 'Use region center' },
                      ...estatesForRegion.map((item) => ({ value: item.value, label: item.label })),
                    ] as Array<{ value: string; label: string }>
                  ).map((item) => (
                    <Pressable
                      key={`${item.value}-${item.label}`}
                      style={styles.optionRow}
                      onPress={() => {
                        setEstateValue(item.value);
                        setPickerMode(null);
                      }}>
                      <Text style={styles.optionText}>{item.label}</Text>
                    </Pressable>
                  ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF4B8', padding: 20 },
  title: { fontSize: 32, fontWeight: '800', marginBottom: 12, color: '#1B5E20', textAlign: 'center' },
  label: { marginTop: 8, fontSize: 16, color: '#2E7D32', fontWeight: '700' },
  input: { borderWidth: 2, borderColor: '#2E7D32', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: '#FFE48A', color: '#1B5E20' },
  text: { fontSize: 16, marginBottom: 8, color: '#1B5E20' },
  row: { marginTop: 12, gap: 10 },
  rowWrap: { marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  selector: {
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#2E7D32',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFE48A',
  },
  selectorLabel: { color: '#1B5E20', fontWeight: '600', fontSize: 15 },
  chip: { borderWidth: 1, borderColor: '#2E7D32', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#FFF8D6' },
  chipActive: { borderColor: '#1B5E20', backgroundColor: '#C8E6C9' },
  chipText: { fontSize: 13, color: '#1B5E20', fontWeight: '600' },
  geoHint: { fontSize: 12, color: '#2E7D32', marginTop: 8 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#FFF4B8', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#2E7D32' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1B5E20', marginBottom: 8 },
  optionRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E8D98A' },
  optionText: { fontSize: 15, color: '#1B5E20' },
  btn: { backgroundColor: '#2E7D32', borderRadius: 10, padding: 14 },
  btnText: { color: 'white', fontWeight: '700', textAlign: 'center' },
  note: { marginTop: 14, color: '#2E7D32', fontSize: 14 },
});
