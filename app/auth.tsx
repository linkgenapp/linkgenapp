import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthRole, UserRole } from '../store/authRole';
import { t } from '../lib/i18n';
import { LinkGenLogo } from '../components/LinkGenLogo';
import { DISTRICTS, PROFILE_INTEREST_OPTIONS } from '../lib/constants';

export default function AuthScreen() {
  const { isAuthenticated, login, signup, loading, language, setLanguage } = useAuthRole();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hkid, setHkid] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('youth');
  const [district, setDistrict] = useState<keyof typeof DISTRICTS>('central_western');
  const [interests, setInterests] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  const onSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t(language, 'missingInfo'), t(language, 'enterEmailPwd'));
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      Alert.alert(t(language, 'missingInfo'), t(language, 'enterDisplayName'));
      return;
    }
    if (mode === 'signup' && (!hkid.trim() || !phone.trim())) {
      Alert.alert(t(language, 'missingInfo'), t(language, 'enterHkidPhone'));
      return;
    }
    if (mode === 'signup' && interests.length === 0) {
      Alert.alert(t(language, 'missingInfo'), 'Please pick at least one interest for matching.');
      return;
    }
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup({ email, password, role, name, hkid, phone, language, district, interests });
      }
    } catch (error: any) {
      Alert.alert(t(language, 'authFailed'), error?.message ?? t(language, 'tryAgain'));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleInterest = (value: string) => {
    setInterests((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}>
      <View style={styles.brandBlock}>
        <LinkGenLogo variant="hero" />
        <Text style={styles.subtitle}>{t(language, 'tagline')}</Text>
      </View>

      <View style={styles.modeRow}>
        <Pressable style={[styles.modeBtn, mode === 'login' && styles.modeActive]} onPress={() => setMode('login')}>
          <Text style={styles.modeText}>{t(language, 'login')}</Text>
        </Pressable>
        <Pressable style={[styles.modeBtn, mode === 'signup' && styles.modeActive]} onPress={() => setMode('signup')}>
          <Text style={styles.modeText}>{t(language, 'signup')}</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>{t(language, 'language')}</Text>
      <View style={styles.roleRow}>
        <Pressable style={[styles.roleBtn, language === 'en' && styles.roleActive]} onPress={() => setLanguage('en')}>
          <Text style={styles.roleText}>{t(language, 'english')}</Text>
        </Pressable>
        <Pressable style={[styles.roleBtn, language === 'zh-Hant' && styles.roleActive]} onPress={() => setLanguage('zh-Hant')}>
          <Text style={styles.roleText}>{t(language, 'traditionalChinese')}</Text>
        </Pressable>
        <Pressable style={[styles.roleBtn, language === 'zh-Hans' && styles.roleActive]} onPress={() => setLanguage('zh-Hans')}>
          <Text style={styles.roleText}>{t(language, 'simplifiedChinese')}</Text>
        </Pressable>
      </View>

      {mode === 'signup' && (
        <>
          <Text style={styles.label}>{t(language, 'displayName')}</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor="#2E7D32" />
          <Text style={styles.label}>{t(language, 'hkid')}</Text>
          <TextInput style={styles.input} value={hkid} onChangeText={setHkid} placeholder="A123456(7)" placeholderTextColor="#2E7D32" />
          <Text style={styles.label}>{t(language, 'phone')}</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+852 9123 4567" placeholderTextColor="#2E7D32" />
          <Text style={styles.label}>{t(language, 'iAmA')}</Text>
          <View style={styles.roleRow}>
            <Pressable style={[styles.roleBtn, role === 'youth' && styles.roleActive]} onPress={() => setRole('youth')}>
              <Text style={styles.roleText}>{t(language, 'roleYouth')}</Text>
            </Pressable>
            <Pressable style={[styles.roleBtn, role === 'elderly' && styles.roleActive]} onPress={() => setRole('elderly')}>
              <Text style={styles.roleText}>{t(language, 'roleElderly')}</Text>
            </Pressable>
          </View>
          <Text style={styles.label}>District</Text>
          <View style={styles.chipWrap}>
            {Object.keys(DISTRICTS).map((item) => (
              <Pressable
                key={item}
                style={[styles.chip, district === item && styles.chipActive]}
                onPress={() => setDistrict(item as keyof typeof DISTRICTS)}>
                <Text style={styles.chipText}>{DISTRICTS[item]}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>Interests</Text>
          <View style={styles.chipWrap}>
            {PROFILE_INTEREST_OPTIONS.map((item) => (
              <Pressable
                key={item}
                style={[styles.chip, interests.includes(item) && styles.chipActive]}
                onPress={() => toggleInterest(item)}>
                <Text style={styles.chipText}>{item.replace(/_/g, ' ')}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <Text style={styles.label}>{t(language, 'email')}</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        placeholderTextColor="#2E7D32"
      />

      <Text style={styles.label}>{t(language, 'password')}</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholder="At least 6 characters"
        placeholderTextColor="#2E7D32"
      />

      <Pressable style={[styles.submitBtn, submitting && styles.submitDisabled]} onPress={onSubmit}>
        <Text style={styles.submitText}>{submitting ? t(language, 'waitPlease') : mode === 'login' ? t(language, 'login') : t(language, 'signup')}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#FFF4B8',
    padding: 20,
    paddingTop: 28,
    paddingBottom: 40,
  },
  brandBlock: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#2E7D32',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 18,
    paddingHorizontal: 12,
    width: '100%',
  },
  modeRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  modeBtn: { flex: 1, borderWidth: 2, borderColor: '#2E7D32', borderRadius: 12, paddingVertical: 12, backgroundColor: '#FFE48A' },
  modeActive: { backgroundColor: '#C8E6C9', borderColor: '#1B5E20' },
  modeText: { textAlign: 'center', color: '#1B5E20', fontWeight: '700', fontSize: 16 },
  label: { color: '#1B5E20', fontSize: 16, fontWeight: '700', marginTop: 8, marginBottom: 6 },
  input: {
    borderWidth: 2,
    borderColor: '#2E7D32',
    borderRadius: 12,
    backgroundColor: '#FFE48A',
    color: '#1B5E20',
    fontSize: 17,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  roleBtn: { flex: 1, borderWidth: 1, borderColor: '#2E7D32', borderRadius: 10, paddingVertical: 10, backgroundColor: '#FFF8D6' },
  roleActive: { backgroundColor: '#C8E6C9', borderColor: '#1B5E20' },
  roleText: { textAlign: 'center', color: '#1B5E20', fontWeight: '700' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  chip: {
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FFF8D6',
  },
  chipActive: { backgroundColor: '#C8E6C9', borderColor: '#1B5E20' },
  chipText: { color: '#1B5E20', fontWeight: '600', fontSize: 12 },
  submitBtn: { marginTop: 16, backgroundColor: '#2E7D32', borderRadius: 12, paddingVertical: 14 },
  submitDisabled: { opacity: 0.7 },
  submitText: { color: 'white', textAlign: 'center', fontWeight: '800', fontSize: 18 },
});
