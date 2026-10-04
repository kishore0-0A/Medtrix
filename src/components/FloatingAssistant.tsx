import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, Animated, Modal, TextInput, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, GLASS, SHADOWS } from '../theme';
import { useTranslation } from 'react-i18next';
import * as Speech from 'expo-speech';

// Import speech recognition safely
let ExpoSpeechRecognitionModule: any = null;
let useSpeechRecognitionEvent: any = () => {}; // Dummy hook to prevent conditionally calling hooks

try {
  const speechModule = require('expo-speech-recognition');
  if (speechModule.ExpoSpeechRecognitionModule) {
    ExpoSpeechRecognitionModule = speechModule.ExpoSpeechRecognitionModule;
    useSpeechRecognitionEvent = speechModule.useSpeechRecognitionEvent;
  }
} catch (e) {
  console.warn("expo-speech-recognition module not found or failed to load. Voice input will be mocked.");
}

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function FloatingAssistant() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messageIdCounter = useRef(1);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true })
      ])
    ).start();
  }, [pulseAnim]);

  const speak = (text: string) => {
    Speech.stop();
    setIsSpeaking(true);
    let langCode = 'en-US';
    if (i18n.language === 'ta') langCode = 'ta-IN';
    if (i18n.language === 'hi') langCode = 'hi-IN';
    
    Speech.speak(text, {
      language: langCode,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });
  };

  const stopSpeaking = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: Message = { id: `msg-${messageIdCounter.current++}`, role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    // AI App-Usage Logic
    setTimeout(() => {
      let reply = "";
      const lowerText = text.toLowerCase();
      
      if (lowerText.includes("how do i use this app") || lowerText.includes("பயன்படுத்துவது") || lowerText.includes("उपयोग कैसे")) {
        reply = i18n.language === 'ta' ? "இந்த பயன்பாடு உங்களின் மருந்து இருப்பை நிர்வகிக்க உதவுகிறது. 'இன்வென்டரி' தாவலில் மருந்துகளை பார்க்கலாம், 'ஸ்கேன்' தாவலில் புதியவற்றை சேர்க்கலாம்." : 
                i18n.language === 'hi' ? "यह ऐप आपकी दवा इन्वेंट्री को प्रबंधित करने में मदद करता है। आप 'इन्वेंटरी' में दवाएं देख सकते हैं और 'स्कैन' में नई दवाएं जोड़ सकते हैं।" : 
                "Medtrix helps you manage your pharmacy stock. You can view items in Inventory, add new ones in Scan, and check alerts for low stock.";
      } else if (lowerText.includes("add") || lowerText.includes("சேர்ப்பது") || lowerText.includes("जोड़ें")) {
        reply = i18n.language === 'ta' ? "இன்வென்டரி தாவலுக்குச் சென்று, 'Add Medicine' என்பதைத் தட்டவும்." : 
                i18n.language === 'hi' ? "इन्वेंटरी टैब पर जाएं और 'Add Medicine' पर टैप करें।" : 
                "Go to the Inventory tab and tap the 'Add Medicine' button. You can manually enter details or use the Smart Scan.";
      } else if (lowerText.includes("scan") || lowerText.includes("ஸ்கேன்") || lowerText.includes("स्कैन")) {
        reply = i18n.language === 'ta' ? "ஸ்கேன் தாவலுக்குச் சென்று பார்கோடை ஸ்கேன் செய்யுங்கள்." :
                i18n.language === 'hi' ? "स्कैन टैब पर जाएं और बारकोड को स्कैन करें।" :
                "Open the Scan tab from the bottom menu to scan a barcode or read medicine labels using AI OCR.";
      } else if (lowerText.includes("invoice") || lowerText.includes("இன்வாய்ஸ்") || lowerText.includes("इनवॉइस")) {
        reply = i18n.language === 'ta' ? "இன்வென்டரி தாவலில் உள்ள Bulk Import ஐகானைத் தட்டி இன்வாய்ஸைப் பதிவேற்றவும்." :
                i18n.language === 'hi' ? "इन्वेंटरी टैब में बल्क इम्पोर्ट आइकन पर टैप करें और इनवॉइस अपलोड करें।" :
                "Tap the Bulk Import icon in the top right of the Inventory tab, then select your PDF or image invoice to scan.";
      } else if (lowerText.includes("expiry") || lowerText.includes("stock") || lowerText.includes("இருப்பு") || lowerText.includes("स्टॉक")) {
        reply = i18n.language === 'ta' ? "சுயவிவரம் தாவலுக்குச் சென்று AI Triage என்பதைத் தேர்ந்தெடுக்கவும் அல்லது Alerts தாவலைப் பார்க்கவும்." :
                i18n.language === 'hi' ? "प्रोफ़ाइल टैब पर जाएं और AI Triage चुनें या Alerts टैब देखें।" :
                "You can see expiring items in the Alerts tab, or get a full AI analysis in Profile -> AI Triage.";
      } else if (lowerText.includes("reorder") || lowerText.includes("மறுவரிசை") || lowerText.includes("रीऑर्डर")) {
        reply = i18n.language === 'ta' ? "AI Triage பக்கத்தில் உள்ள அறிக்கை, குறைந்த இருப்பு உள்ளவற்றை காட்டும்." :
                i18n.language === 'hi' ? "AI Triage पेज में रिपोर्ट आपको कम स्टॉक वाले आइटम दिखाएगी।" :
                "The Weekly AI Report in the AI Triage section will tell you exactly what items are running low and need reordering.";
      } else {
        reply = i18n.language === 'ta' ? "இதைப் பற்றி எனக்குத் தெரியாது. வேறு கேள்வி கேட்கவும்." :
                i18n.language === 'hi' ? "मुझे इसके बारे में पता नहीं है। कोई अन्य प्रश्न पूछें।" :
                "I am your Medtrix assistant. You can ask me how to add medicines, scan barcodes, check reports, or upload invoices!";
      }
      
      setMessages(prev => [...prev, { id: `msg-${messageIdCounter.current++}`, role: 'assistant', content: reply }]);
      speak(reply);
    }, 1000);
  };

  // Safe hook call (hook always exists now)
  useSpeechRecognitionEvent('result', (event: any) => {
    const transcript = event.results?.[0]?.transcript;
    if (transcript && event.isFinal) {
      setIsListening(false);
      handleSend(transcript);
    }
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
  });
  
  useSpeechRecognitionEvent('error', (event: any) => {
    setIsListening(false);
    console.warn('Speech recognition error:', event);
  });

  const openAssistant = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      const welcome = t('assistant.welcome');
      setMessages([{ id: `msg-${messageIdCounter.current++}`, role: 'assistant', content: welcome }]);
      speak(welcome);
    }
  };

  const closeAssistant = () => {
    stopSpeaking();
    if (isListening && ExpoSpeechRecognitionModule) {
      ExpoSpeechRecognitionModule.stop();
    }
    setIsListening(false);
    setIsOpen(false);
  };

  const startListening = async () => {
    if (isSpeaking) stopSpeaking();
    
    if (isListening && ExpoSpeechRecognitionModule) {
      ExpoSpeechRecognitionModule.stop();
      setIsListening(false);
      return;
    }

    try {
      if (ExpoSpeechRecognitionModule) {
        const { status } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (status !== 'granted') {
          alert(t('assistant.error_mic'));
          return;
        }

        let langCode = 'en-US';
        if (i18n.language === 'ta') langCode = 'ta-IN';
        if (i18n.language === 'hi') langCode = 'hi-IN';

        setIsListening(true);
        ExpoSpeechRecognitionModule.start({ lang: langCode });
      } else {
        // Fallback mock if native module is not linked in Expo Go
        setIsListening(true);
        setTimeout(() => {
          setIsListening(false);
          handleSend(t('assistant.suggestion_1'));
        }, 2500);
      }
    } catch (e) {
      console.warn(e);
      alert(t('assistant.error_speech'));
      setIsListening(false);
    }
  };

  return (
    <>
      <Animated.View style={[styles.floatingButtonContainer, { transform: [{ scale: pulseAnim }] }]}>
        <Pressable style={[styles.floatingButton, GLASS.hero]} onPress={openAssistant}>
          <Text style={styles.robotEmojiSmall}>🤖</Text>
          <Text style={styles.launcherText}>{t('assistant.label')}</Text>
        </Pressable>
      </Animated.View>

      <Modal visible={isOpen} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContainer}>
          <View style={[styles.chatPanel, GLASS.hero]}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.robotEmojiSmall}>🤖</Text>
                <Text style={styles.headerTitle}>Medtrix Assistant</Text>
              </View>
              <Pressable onPress={closeAssistant} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={COLORS.text.primary} />
              </Pressable>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.messageList} keyboardShouldPersistTaps='handled'>
              {messages.map(msg => (
                <View key={msg.id} style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                  <Text style={[styles.messageText, msg.role === 'user' ? styles.userText : styles.aiText]}>{msg.content}</Text>
                  {msg.role === 'assistant' && (
                    <Pressable onPress={() => isSpeaking ? stopSpeaking() : speak(msg.content)} style={styles.speakerBtn}>
                      <Ionicons name={isSpeaking ? "stop-circle" : "volume-medium"} size={18} color={COLORS.brand.primary} />
                    </Pressable>
                  )}
                </View>
              ))}
              {isListening && (
                <View style={[styles.messageBubble, styles.aiBubble]}>
                  <Text style={styles.aiText}>{t('assistant.listening')}</Text>
                </View>
              )}
            </ScrollView>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsRow}>
              {[t('assistant.q1'), t('assistant.q2'), t('assistant.q3'), t('assistant.q4'), t('assistant.q5'), t('assistant.q6')].map((s, i) => (
                <Pressable key={i} style={styles.suggestionChip} onPress={() => handleSend(s)}>
                  <Text style={styles.suggestionText}>{s}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.inputArea}>
              <Pressable onPress={startListening} style={[styles.micButton, isListening && styles.micListening]}>
                <Ionicons name={isListening ? "stop" : "mic"} size={22} color={isListening ? '#FFFFFF' : COLORS.brand.primary} />
              </Pressable>
              <TextInput
                style={styles.input}
                placeholder={t('assistant.type_message')}
                multiline={true}
                placeholderTextColor={COLORS.text.muted}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={() => handleSend(input)}
              />
              <Pressable onPress={() => handleSend(input)} style={styles.sendButton}>
                <Ionicons name="send" size={20} color={'#FFFFFF'} />
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButtonContainer: {
    position: 'absolute',
    right: 20,
    bottom: 100, // Above tab bar
    zIndex: 999,
    elevation: 10,
  },
  floatingButton: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    backgroundColor: 'rgba(255,255,255,0.4)', // Slightly stronger glass
    shadowColor: COLORS.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  robotEmoji: { fontSize: 28 },
  robotEmojiSmall: { fontSize: 20, marginRight: 8 },
  launcherText: { ...TYPOGRAPHY.bodyBold, color: COLORS.brand.deep, fontSize: 14 },
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
  chatPanel: {
    flex: 1,
    marginTop: '20%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    ...SHADOWS.medium
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border.subtle },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { ...TYPOGRAPHY.heading, fontSize: 18, color: COLORS.text.primary },
  closeButton: { padding: 4 },
  messageList: { padding: 20, flexGrow: 1 },
  messageBubble: { padding: 14, borderRadius: 16, marginBottom: 12, maxWidth: '85%' },
  userBubble: { backgroundColor: COLORS.brand.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: '#FFFFFF', alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: COLORS.border.subtle },
  messageText: { ...TYPOGRAPHY.body, fontSize: 15 },
  userText: { color: '#FFFFFF' },
  aiText: { color: COLORS.text.primary },
  speakerBtn: { alignSelf: 'flex-end', marginTop: 8 },
  suggestionsRow: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 12 },
  suggestionChip: { backgroundColor: COLORS.brand.soft, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, marginRight: 8, marginBottom: 8 },
  suggestionText: { ...TYPOGRAPHY.body, fontSize: 13, color: COLORS.brand.deep },
  inputArea: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: COLORS.border.subtle, backgroundColor: '#FFFFFF' },
  input: { flex: 1, minHeight: 44, maxHeight: 100, backgroundColor: COLORS.background.canvas, paddingVertical: 12, borderRadius: 22, paddingHorizontal: 16, marginHorizontal: 12, ...TYPOGRAPHY.body, fontSize: 15, color: COLORS.text.primary },
  micButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.brand.soft, alignItems: 'center', justifyContent: 'center' },
  micListening: { backgroundColor: COLORS.status.critical },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.brand.primary, alignItems: 'center', justifyContent: 'center' },
});
