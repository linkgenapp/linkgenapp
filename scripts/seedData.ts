import { initializeApp } from 'firebase/app';
import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function resetCollection(name: string) {
  const snap = await getDocs(collection(db, name));
  await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, name, d.id))));
}

async function seed() {
  await resetCollection('users');
  await resetCollection('tasks');
  await resetCollection('events');
  await resetCollection('matches');

  const elderlyUsers = [
    { id: 'elderly-1', role: 'elderly', name: 'Mrs. Chan', district: 'Central', profilePhoto: 'placeholder-1' },
    { id: 'elderly-2', role: 'elderly', name: 'Mr. Wong', district: 'Mong Kok', profilePhoto: 'placeholder-2' },
    { id: 'elderly-3', role: 'elderly', name: 'Auntie Lee', district: 'Tsuen Wan', profilePhoto: 'placeholder-3' },
  ];
  const youthUsers = [
    { id: 'youth-1', role: 'youth', name: 'Alex', district: 'Causeway Bay', profilePhoto: 'placeholder-4' },
    { id: 'youth-2', role: 'youth', name: 'Chris', district: 'Central', profilePhoto: 'placeholder-5' },
    { id: 'youth-3', role: 'youth', name: 'Mina', district: 'Wan Chai', profilePhoto: 'placeholder-6' },
  ];

  await Promise.all(
    [...elderlyUsers, ...youthUsers].map((u) =>
      setDoc(doc(db, 'users', u.id), {
        ...u,
        createdAt: serverTimestamp(),
      })
    )
  );

  const tasks = [
    { title: 'Help me carry groceries', location: 'Central', time: 'Fri 5:00 PM', description: 'Need help from market to home.', elderlyId: 'elderly-1', elderlyName: 'Mrs. Chan', latitude: 22.2819, longitude: 114.1582 },
    { title: 'Teach me WhatsApp', location: 'Mong Kok', time: 'Sat 2:00 PM', description: 'How to send photos and voice messages.', elderlyId: 'elderly-2', elderlyName: 'Mr. Wong', latitude: 22.3193, longitude: 114.1694 },
    { title: 'Accompany me to doctor', location: 'Tsuen Wan', time: 'Mon 9:00 AM', description: 'Clinic visit support needed.', elderlyId: 'elderly-3', elderlyName: 'Auntie Lee', latitude: 22.3717, longitude: 114.1131 },
    { title: 'Help clean air conditioner', location: 'Wan Chai', time: 'Sun 11:00 AM', description: 'Need basic cleaning help.', elderlyId: 'elderly-1', elderlyName: 'Mrs. Chan', latitude: 22.2765, longitude: 114.1751 },
    { title: 'Tea chat companion', location: 'Causeway Bay', time: 'Thu 4:00 PM', description: 'Would love company for tea.', elderlyId: 'elderly-2', elderlyName: 'Mr. Wong', latitude: 22.2808, longitude: 114.1845 },
  ];

  const events = [
    { name: 'Mahjong Night', location: 'Causeway Bay', time: 'Fri 7:30 PM', description: 'Community mahjong gathering.', elderlyId: 'elderly-1', elderlyName: 'Mrs. Chan' },
    { name: 'Hong Kong History Talk', location: 'Central Library', time: 'Sat 2:00 PM', description: 'Stories across generations.', elderlyId: 'elderly-2', elderlyName: 'Mr. Wong' },
    { name: 'Cantonese Opera Workshop', location: 'Tsim Sha Tsui', time: 'Sun 4:00 PM', description: 'Hands-on opera session.', elderlyId: 'elderly-3', elderlyName: 'Auntie Lee' },
    { name: 'Dim Sum Exchange Night', location: 'Mong Kok', time: 'Wed 6:30 PM', description: 'Meet and share life stories.', elderlyId: 'elderly-1', elderlyName: 'Mrs. Chan' },
  ];

  await Promise.all(
    tasks.map((t) =>
      addDoc(collection(db, 'tasks'), {
        ...t,
        type: 'task',
        status: 'open',
        participants: 1,
        createdBy: t.elderlyId,
        createdAt: serverTimestamp(),
      })
    )
  );

  await Promise.all(
    events.map((e) =>
      addDoc(collection(db, 'events'), {
        ...e,
        type: 'event',
        participants: 8,
        createdAt: serverTimestamp(),
      })
    )
  );

  await Promise.all([
    addDoc(collection(db, 'matches'), {
      matchId: 'm-1',
      youthId: 'youth-1',
      elderlyId: 'elderly-1',
      activityId: 'sample-task',
      activityType: 'task',
      activityName: 'Help me carry groceries',
      createdAt: serverTimestamp(),
    }),
  ]);

  console.log('Seed complete.');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
