import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth, db } from '../utils/firebase';
import { collection, doc, getDocs, limit, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { PROFILE_INTEREST_OPTIONS, REGION_COORDINATES } from '../lib/constants';

export type UserRole = 'youth' | 'elderly';
export type AppLanguage = 'en' | 'zh-Hant' | 'zh-Hans';

type AuthRoleContextType = {
  uid: string | null;
  role: UserRole;
  loading: boolean;
  isAuthenticated: boolean;
  language: AppLanguage;
  setRole: (role: UserRole) => Promise<void>;
  setLanguage: (language: AppLanguage) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: {
    email: string;
    password: string;
    role: UserRole;
    name: string;
    hkid: string;
    phone: string;
    language: AppLanguage;
    district?: string;
    interests?: string[];
  }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthRoleContext = createContext<AuthRoleContextType | null>(null);

function hashCode(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickInterests(seed: string, role: UserRole): string[] {
  const roleDefaults =
    role === 'elderly'
      ? ['tea', 'walking', 'companionship']
      : ['community', 'digital_help', 'walking'];
  const base = [...PROFILE_INTEREST_OPTIONS];
  const start = hashCode(seed) % base.length;
  const rotated = [...base.slice(start), ...base.slice(0, start)];
  return [...new Set([...roleDefaults, ...rotated.slice(0, 3)])].slice(0, 5);
}

function buildStarterProfile(
  uid: string,
  email: string,
  role: UserRole,
  displayName: string,
  language: AppLanguage,
  preferredDistrict?: string,
  preferredInterests?: string[]
) {
  const seededRegion = REGION_COORDINATES[hashCode(uid) % REGION_COORDINATES.length];
  const region = preferredDistrict
    ? REGION_COORDINATES.find((item) => item.key === preferredDistrict) ?? seededRegion
    : seededRegion;
  const interests = preferredInterests && preferredInterests.length
    ? preferredInterests
    : pickInterests(`${uid}-${email}`, role);
  return {
    user_email: email.trim(),
    display_name: displayName,
    role,
    language,
    district: region.key,
    region_key: region.key,
    interests,
    interests_text: interests.join('; '),
    latitude: region.latitude,
    longitude: region.longitude,
    updatedAt: serverTimestamp(),
  };
}

async function ensureBaselineUsers() {
  try {
    const [elderlySnap, youthSnap] = await Promise.all([
      getDocs(query(collection(db, 'users'), where('role', '==', 'elderly'), limit(1))),
      getDocs(query(collection(db, 'users'), where('role', '==', 'youth'), limit(1))),
    ]);

    const writes: Array<Promise<void>> = [];
    if (elderlySnap.empty) {
      const elderlySeeds = [
        { uid: 'seed-elderly-1', name: 'Mrs. Chan', district: 'central_western', interests: ['tea', 'walking', 'companionship'] },
        { uid: 'seed-elderly-2', name: 'Mr. Wong', district: 'yau_tsim_mong', interests: ['reading', 'games', 'chat'] },
        { uid: 'seed-elderly-3', name: 'Auntie Lee', district: 'tsuen_wan', interests: ['gardening', 'cooking', 'walking'] },
      ] as const;
      elderlySeeds.forEach((seed) => {
        const region = REGION_COORDINATES.find((r) => r.key === seed.district) ?? REGION_COORDINATES[0];
        writes.push(
          setDoc(
            doc(db, 'users', seed.uid),
            {
              user_email: `${seed.uid}@linkgen.local`,
              display_name: seed.name,
              role: 'elderly',
              language: 'en',
              district: seed.district,
              region_key: seed.district,
              interests: seed.interests,
              interests_text: seed.interests.join('; '),
              latitude: region.latitude,
              longitude: region.longitude,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          )
        );
      });
    }

    if (youthSnap.empty) {
      const youthSeeds = [
        { uid: 'seed-youth-1', name: 'Alex', district: 'central_western', interests: ['community', 'walking', 'digital_help'] },
        { uid: 'seed-youth-2', name: 'Mina', district: 'wan_chai', interests: ['companionship', 'reading', 'music'] },
        { uid: 'seed-youth-3', name: 'Chris', district: 'sham_shui_po', interests: ['errands', 'games', 'chat'] },
      ] as const;
      youthSeeds.forEach((seed) => {
        const region = REGION_COORDINATES.find((r) => r.key === seed.district) ?? REGION_COORDINATES[0];
        writes.push(
          setDoc(
            doc(db, 'users', seed.uid),
            {
              user_email: `${seed.uid}@linkgen.local`,
              display_name: seed.name,
              role: 'youth',
              language: 'en',
              district: seed.district,
              region_key: seed.district,
              interests: seed.interests,
              interests_text: seed.interests.join('; '),
              latitude: region.latitude,
              longitude: region.longitude,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          )
        );
      });
    }

    if (writes.length) {
      await Promise.all(writes);
    }
  } catch (error) {
    console.warn('Baseline user seed skipped:', error);
  }
}

export function AuthRoleProvider({ children }: { children: React.ReactNode }) {
  const [uid, setUid] = useState<string | null>(null);
  const [role, setRoleState] = useState<UserRole>('youth');
  const [language, setLanguageState] = useState<AppLanguage>('en');
  const [loading, setLoading] = useState(true);
  const DEMO_AUTH = true;

  useEffect(() => {
    const bootstrap = async () => {
      try {
        let resolvedUid: string | null = auth?.currentUser?.uid ?? null;
        if (!resolvedUid) {
          setUid(null);
          setRoleState('youth');
          return;
        }
        setUid(resolvedUid);

        const userRef = doc(db, 'users', resolvedUid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            ...buildStarterProfile(resolvedUid, `${resolvedUid}@demo.local`, 'youth', 'Demo Youth', 'en'),
            createdAt: serverTimestamp(),
          });
          setRoleState('youth');
        } else {
          const storedRole = userSnap.data().role as UserRole | undefined;
          const storedLanguage = userSnap.data().language as AppLanguage | undefined;
          setRoleState(storedRole === 'elderly' ? 'elderly' : 'youth');
          setLanguageState(storedLanguage ?? 'en');
        }
      } catch (error) {
        console.warn('Auth bootstrap fallback:', error);
        setUid(null);
        setRoleState('youth');
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const setRole = async (nextRole: UserRole) => {
    setRoleState(nextRole);
    if (!uid) return;
    try {
      await setDoc(
        doc(db, 'users', uid),
        { role: nextRole, updatedAt: serverTimestamp() },
        { merge: true }
      );
    } catch (error) {
      console.warn('Role saved locally only (offline mode):', error);
    }
  };

  const setLanguage = async (nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);
    if (!uid) return;
    try {
      await setDoc(
        doc(db, 'users', uid),
        { language: nextLanguage, updatedAt: serverTimestamp() },
        { merge: true }
      );
    } catch (error) {
      console.warn('Language saved locally only (offline mode):', error);
    }
  };

  const toDemoUid = (email: string) =>
    `demo-${email.trim().toLowerCase().replace(/[^a-z0-9]/g, '-') || 'user'}`;

  const signup = async ({
    email,
    password: _password,
    role: nextRole,
    name,
    hkid,
    phone,
    language: preferredLanguage,
    district,
    interests,
  }: {
    email: string;
    password: string;
    role: UserRole;
    name: string;
    hkid: string;
    phone: string;
    language: AppLanguage;
    district?: string;
    interests?: string[];
  }) => {
    const nextUid = DEMO_AUTH ? toDemoUid(email) : auth?.currentUser?.uid ?? toDemoUid(email);
    setUid(nextUid);
    setRoleState(nextRole);
    setLanguageState(preferredLanguage);
    try {
      await ensureBaselineUsers();
      await setDoc(
        doc(db, 'users', nextUid),
        {
          ...buildStarterProfile(
            nextUid,
            email,
            nextRole,
            name.trim() || 'LinkGen User',
            preferredLanguage,
            district,
            interests
          ),
          hkid: hkid.trim(),
          phone: phone.trim(),
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      // demo mode should still work without network
      console.warn('Signup profile save skipped:', error);
    }
  };

  const login = async (email: string, _password: string) => {
    const nextUid = DEMO_AUTH ? toDemoUid(email) : auth?.currentUser?.uid ?? toDemoUid(email);
    setUid(nextUid);
    try {
      await ensureBaselineUsers();
      const userSnap = await getDoc(doc(db, 'users', nextUid));
      if (userSnap.exists()) {
        const storedRole = userSnap.data().role as UserRole | undefined;
        const storedLanguage = userSnap.data().language as AppLanguage | undefined;
        setRoleState(storedRole === 'elderly' ? 'elderly' : 'youth');
        setLanguageState(storedLanguage ?? 'en');
      } else {
        const fallbackRole: UserRole =
          /elder|senior|grand|auntie|uncle/i.test(email.trim()) ? 'elderly' : 'youth';
        const fallbackLanguage: AppLanguage = 'en';
        await setDoc(
          doc(db, 'users', nextUid),
          {
            ...buildStarterProfile(
              nextUid,
              email,
              fallbackRole,
              fallbackRole === 'elderly' ? 'Demo Elderly' : 'Demo Youth',
              fallbackLanguage
            ),
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );
        setRoleState(fallbackRole);
        setLanguageState(fallbackLanguage);
      }
    } catch (error) {
      console.warn('Login profile fetch skipped:', error);
      const fallbackRole: UserRole =
        /elder|senior|grand|auntie|uncle/i.test(email.trim()) ? 'elderly' : 'youth';
      const fallbackLanguage: AppLanguage = 'en';
      setRoleState(fallbackRole);
      setLanguageState(fallbackLanguage);
      try {
        await setDoc(
          doc(db, 'users', nextUid),
          {
            ...buildStarterProfile(
              nextUid,
              email,
              fallbackRole,
              fallbackRole === 'elderly' ? 'Demo Elderly' : 'Demo Youth',
              fallbackLanguage
            ),
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (writeError) {
        console.warn('Login starter profile save skipped:', writeError);
      }
    }
  };

  const logout = async () => {
    if (!DEMO_AUTH && auth) {
      // Kept for optional future real-auth mode.
      await auth.signOut();
    }
    setUid(null);
    setRoleState('youth');
    setLanguageState('en');
  };

  const isAuthenticated = !!uid;
  const value = useMemo(
    () => ({ uid, role, loading, isAuthenticated, language, setRole, setLanguage, login, signup, logout }),
    [uid, role, loading, isAuthenticated, language]
  );
  return <AuthRoleContext.Provider value={value}>{children}</AuthRoleContext.Provider>;
}

export function useAuthRole() {
  const ctx = useContext(AuthRoleContext);
  if (!ctx) {
    throw new Error('useAuthRole must be used inside AuthRoleProvider');
  }
  return ctx;
}
