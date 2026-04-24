import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useAuthRole } from '../../store/authRole';
import { COLORS, SHADOW } from '../../lib/theme';
import { t } from '../../lib/i18n';
import type { AppLanguage } from '../../store/authRole';

type Message = {
  id: string;
  task_id: string;
  sender_email: string;
  sender_name?: string;
  sender_role: 'elderly' | 'youth';
  message: string;
  language: 'en' | 'zh';
  read_by?: string[];
};

type ChatPartner = {
  id: string;
  name: string;
  role: 'elderly' | 'youth';
  avatar: string;
  chatId: string;
  taskId: string;
};

const mockTranslate = (input: string, langKey: AppLanguage, to: 'en' | 'zh') =>
  `${input} [${t(langKey, 'translate')}: ${to}]`;

export default function ChatScreen() {
  const { uid, role, language } = useAuthRole();
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showTranslated, setShowTranslated] = useState<Record<string, string>>({});
  const [selectedPartner, setSelectedPartner] = useState<ChatPartner | null>(null);

  const samplePartners = useMemo<ChatPartner[]>(
    () => [
      { id: 'elderly-chan', name: t(language, 'name_chan'), role: 'elderly', avatar: '👵', chatId: 'chat-with-chan', taskId: 'task-chan-1' },
      { id: 'elderly-wong', name: t(language, 'name_wong'), role: 'elderly', avatar: '👴', chatId: 'chat-with-wong', taskId: 'task-wong-1' },
      { id: 'youth-kai', name: t(language, 'name_kai'), role: 'youth', avatar: '🧑‍🎓', chatId: 'chat-with-kai', taskId: 'task-kai-1' },
      { id: 'youth-mei', name: t(language, 'name_mei'), role: 'youth', avatar: '👩‍🎓', chatId: 'chat-with-mei', taskId: 'task-mei-1' },
    ],
    [language]
  );

  const filteredPartners = samplePartners.filter((p) => p.role !== role);
  const chatId = selectedPartner?.chatId ?? '';
  const taskId = selectedPartner?.taskId ?? 'demo-task-1';

  const fetchMessages = useCallback(async () => {
    if (!chatId) {
      setMessages([]);
      return;
    }
    const snap = await getDocs(query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc')));
    setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Message[]);
  }, [chatId]);

  useEffect(() => {
    fetchMessages().catch(console.error);
  }, [fetchMessages]);

  const displayName = role === 'elderly' ? t(language, 'elderlyUser') : t(language, 'youthUser');

  if (!selectedPartner) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>{t(language, 'chatsTitle')}</Text>
        <Text style={styles.subhead}>{t(language, 'chatPickSub')}</Text>
        <FlatList
          data={filteredPartners}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listWrap}
          renderItem={({ item }) => (
            <Pressable style={styles.personCard} onPress={() => setSelectedPartner(item)}>
              <Text style={styles.avatar}>{item.avatar}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.personName}>{item.name}</Text>
                <Text style={styles.personMeta}>
                  {item.role === 'elderly' ? t(language, 'metaElderly') : t(language, 'metaYouth')}
                </Text>
              </View>
              <Text style={styles.enterChat}>{t(language, 'open')}</Text>
            </Pressable>
          )}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.chatTopRow}>
        <Pressable style={styles.backBtn} onPress={() => setSelectedPartner(null)}>
          <Text style={styles.backText}>{t(language, 'back')}</Text>
        </Pressable>
        <Text style={styles.header}>
          {selectedPartner.avatar} {selectedPartner.name}
        </Text>
      </View>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={[styles.msgCard, item.sender_role === role ? styles.myMsg : styles.otherMsg]}>
            {item.sender_role !== role && <Text style={styles.name}>{item.sender_name ?? item.sender_email}</Text>}
            <Text style={[styles.msgText, role === 'elderly' && styles.msgTextElderly]}>{item.message}</Text>
            {showTranslated[item.id] ? <Text style={styles.translation}>{showTranslated[item.id]}</Text> : null}
            <View style={styles.msgRow}>
              <Text style={styles.meta}>
                {t(language, 'langTag')}: {item.language}
              </Text>
              <Pressable
                onPress={() => {
                  const target = item.language === 'en' ? 'zh' : 'en';
                  setShowTranslated((prev) => ({
                    ...prev,
                    [item.id]: prev[item.id] ? '' : mockTranslate(item.message, language, target),
                  }));
                }}>
                <Text style={styles.translate}>
                  {showTranslated[item.id] ? t(language, 'hide') : t(language, 'translate')}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, role === 'elderly' && styles.inputElderly]}
          placeholder={t(language, 'typeMessage')}
          value={text}
          onChangeText={setText}
        />
        <Pressable
          style={[styles.sendBtn, role === 'elderly' && styles.sendBtnElderly]}
          onPress={async () => {
            if (!text.trim()) return;
            const pendingText = text.trim();
            setMessages((prev) => [
              ...prev,
              {
                id: `local-${Date.now()}`,
                task_id: taskId,
                sender_email: uid ?? 'demo-user@example.com',
                sender_name: displayName,
                sender_role: role,
                message: pendingText,
                language: 'en',
                read_by: [uid ?? 'demo-user@example.com'],
              },
            ]);
            setText('');
            void Promise.race([
              addDoc(collection(db, 'chats', chatId, 'messages'), {
                task_id: taskId,
                sender_email: uid ?? 'demo-user@example.com',
                sender_name: displayName,
                sender_role: role,
                message: pendingText,
                timestamp: serverTimestamp(),
                language: 'en',
                read_by: [uid ?? 'demo-user@example.com'],
              }),
              new Promise((resolve) => setTimeout(resolve, 900)),
            ]);
            fetchMessages();
          }}>
          <Text style={styles.sendText}>{t(language, 'send')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF4B8' },
  header: { fontSize: 28, fontWeight: '700', color: '#1B5E20', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6, textAlign: 'center' },
  subhead: { fontSize: 16, color: '#2E7D32', paddingHorizontal: 16, paddingBottom: 8, textAlign: 'center' },
  listWrap: { padding: 16, gap: 10 },
  personCard: {
    backgroundColor: '#FFE48A',
    borderColor: '#F9A825',
    borderWidth: 2,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...SHADOW,
  },
  avatar: { fontSize: 28 },
  personName: { fontSize: 20, color: '#1B5E20', fontWeight: '700' },
  personMeta: { fontSize: 14, color: '#2E7D32' },
  enterChat: { color: '#1B5E20', fontWeight: '800' },
  chatTopRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 6 },
  backBtn: {
    marginLeft: 12,
    marginRight: 6,
    backgroundColor: '#C8E6C9',
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  backText: { color: '#1B5E20', fontWeight: '700' },
  msgCard: { borderRadius: 12, padding: 12, marginBottom: 10, maxWidth: '85%' },
  myMsg: { alignSelf: 'flex-end', backgroundColor: '#C8E6C9', borderWidth: 1, borderColor: '#2E7D32' },
  otherMsg: { alignSelf: 'flex-start', backgroundColor: '#FFE48A', borderWidth: 1, borderColor: '#F9A825' },
  name: { fontSize: 12, color: '#2E7D32', marginBottom: 4 },
  msgText: { fontSize: 16, color: '#1B5E20' },
  msgTextElderly: { fontSize: 22, lineHeight: 30 },
  translation: { fontSize: 14, color: '#2E7D32', marginTop: 6, fontStyle: 'italic' },
  msgRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  meta: { color: '#2E7D32' },
  translate: { color: '#1B5E20', fontWeight: '700' },
  inputRow: { flexDirection: 'row', padding: 12, backgroundColor: '#FFF8D6', gap: 8, borderTopWidth: 1, borderTopColor: '#F9A825' },
  input: { flex: 1, borderWidth: 1, borderColor: '#2E7D32', borderRadius: 10, paddingHorizontal: 12, backgroundColor: COLORS.white, color: '#1B5E20' },
  inputElderly: { minHeight: 56, fontSize: 22 },
  sendBtn: { backgroundColor: '#2E7D32', borderRadius: 10, justifyContent: 'center', paddingHorizontal: 16 },
  sendBtnElderly: { minHeight: 56, minWidth: 86, alignItems: 'center' },
  sendText: { color: 'white', fontWeight: '700' },
});
