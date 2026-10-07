import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, GLASS } from '../../theme';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Database } from '../../supabase';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

type TriageMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function AiTriageScreen() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<TriageMessage[]>([]);
  const [input, setInput] = useState('');
  const [inventoryStats, setInventoryStats] = useState<any>(null);

  

  const loadInventoryStats = async () => {
    try {
      const { data } = await Database.getInventory();
      
      const totalMedicines = data?.length || 0;
      const lowStock = data?.filter((i: any) => i.status === 'low' || i.status === 'critical').length || 0;
      const expiringSoon = data?.filter((i: any) => i.status === 'expiring').length || 0;

      setInventoryStats({ totalMedicines, lowStock, expiringSoon });
      
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: `${t('ai_triage.title')}: I have analyzed ${totalMedicines} medicine batches. There are ${lowStock} batches running low and ${expiringSoon} batches expiring soon. ${t('ai_triage.ask_question')}`,
        }
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventoryStats();
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage: TriageMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Mock AI Response based on inventory logic
    setTimeout(() => {
      let responseContent = "";
      if (input.toLowerCase().includes("report") || input.includes("அறிக்கை") || input.includes("रिपोर्ट")) {
        responseContent = `${t('ai_triage.report_title')}:\n- Total Batches: ${inventoryStats?.totalMedicines}\n- Items to Reorder: ${inventoryStats?.lowStock}\n- Recommendation: Prioritize reordering ${inventoryStats?.lowStock} critical items. ${t('ai_triage.insufficient_data')}`;
      } else {
        responseContent = `Based on current data, you should restock ${inventoryStats?.lowStock} items soon. ${t('ai_triage.insufficient_data')}`;
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
      }]);
      setLoading(false);
    }, 1500);
  };

  const exportToPDF = async () => {
    try {
      const html = `
        <html>
          <body style="font-family: Helvetica, sans-serif; padding: 20px;">
            <h1 style="color: #2563EB;">Medtrix AI Triage Report</h1>
            <h2>Inventory Overview</h2>
            <ul>
              <li>Total Batches: ${inventoryStats?.totalMedicines}</li>
              <li>Low Stock: ${inventoryStats?.lowStock}</li>
              <li>Expiring Soon: ${inventoryStats?.expiringSoon}</li>
            </ul>
            <h2>Recommendation</h2>
            <p>Prioritize reordering critical items immediately.</p>
          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('profile.ai_triage')}</Text>
        <View style={{flex: 1}} />
        <Pressable onPress={exportToPDF} style={{padding: 8}}>
          <Ionicons name="document-text-outline" size={24} color={COLORS.brand.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.chatContainer}>
        {messages.map(msg => (
          <View key={msg.id} style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
            <Text style={[styles.messageText, msg.role === 'user' ? styles.userText : styles.assistantText]}>
              {msg.content}
            </Text>
          </View>
        ))}
        {loading && (
          <View style={[styles.messageBubble, styles.assistantBubble]}>
            <ActivityIndicator color={COLORS.brand.primary} />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={t('ai_triage.ask_question')}
          placeholderTextColor={COLORS.text.muted}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
        />
        <Pressable style={styles.sendButton} onPress={handleSend}>
          <Ionicons name="send" size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background.canvas },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border.subtle },
  backButton: { marginRight: 16 },
  headerTitle: { ...TYPOGRAPHY.heading, fontSize: 20, color: COLORS.text.primary },
  chatContainer: { padding: 20, paddingBottom: 40 },
  messageBubble: { padding: 16, borderRadius: 16, marginBottom: 12, maxWidth: '85%' },
  userBubble: { backgroundColor: COLORS.brand.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  assistantBubble: { backgroundColor: '#FFFFFF', alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: COLORS.border.subtle },
  messageText: { ...TYPOGRAPHY.body, fontSize: 15 },
  userText: { color: '#FFFFFF' },
  assistantText: { color: COLORS.text.primary },
  inputContainer: { flexDirection: 'row', padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: COLORS.border.subtle },
  input: { flex: 1, height: 48, backgroundColor: COLORS.background.canvas, borderRadius: 24, paddingHorizontal: 20, ...TYPOGRAPHY.body, fontSize: 15, color: COLORS.text.primary },
  sendButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.brand.primary, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
});
