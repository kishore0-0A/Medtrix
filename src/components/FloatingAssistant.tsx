import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, Animated, Modal, TextInput, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, GLASS, SHADOWS } from '../theme';
import { useTranslation } from 'react-i18next';
import * as Speech from 'expo-speech';
import { askAssistant } from '../services/aiService';
import { router, usePathname } from 'expo-router';

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
  console.log("expo-speech-recognition module not found or failed to load. Voice input will be mocked.");
}

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function FloatingAssistant() {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const messageIdCounter = useRef(1);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1500, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: Platform.OS !== 'web' })
      ])
    ).start();
  }, [pulseAnim]);

  const speak = (text: string, onFinish?: () => void) => {
    Speech.stop();
    setIsSpeaking(true);
    let langCode = 'en-US';
    if (i18n.language === 'ta') langCode = 'ta-IN';
    if (i18n.language === 'hi') langCode = 'hi-IN';
    
    Speech.speak(text, {
      language: langCode,
      onDone: () => {
        setIsSpeaking(false);
        if (onFinish) onFinish();
      },
      onError: () => {
        setIsSpeaking(false);
        if (onFinish) onFinish();
      }
    });
  };

  const stopSpeaking = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: Message = { id: `msg-${messageIdCounter.current++}`, role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);
    const response = await askAssistant(text.trim(), i18n.language, pathname);
    setIsProcessing(false);
    setMessages(prev => [...prev, { id: `msg-${messageIdCounter.current++}`, role: 'assistant', content: response.answer }]);
    
    speak(response.answer, () => {
      if (response.action === 'NAVIGATE' && response.route) {
        closeAssistant();
        router.push(response.route as any);
      }
    });
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

  function closeAssistant() {
    stopSpeaking();
    if (isListening && ExpoSpeechRecognitionModule) {
      ExpoSpeechRecognitionModule.stop();
    }
    setIsListening(false);
    setIsOpen(false);
  }

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
          // If user typed something before clicking mic, send that. Otherwise use a demo question.
          handleSend(input.trim() ? input.trim() : "Where am I?");
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
              {isProcessing && (
                <View style={[styles.messageBubble, styles.aiBubble]}>
                  <Text style={styles.aiText}>{t('assistant.processing')}</Text>
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
