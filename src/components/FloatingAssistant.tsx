import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Animated,
  Modal,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  useWindowDimensions,
  Dimensions,
  PanResponder,
  AccessibilityInfo,
  Keyboard,
  ActivityIndicator,
  DeviceEventEmitter,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import { useTranslation } from 'react-i18next';
import { router, usePathname } from 'expo-router';

import { COLORS, TYPOGRAPHY, SHADOWS } from '../theme';
import { useThemeContext } from '../context/ThemeContext';
import { askAssistant, ChatMessage } from '../services/aiService';
import {
  generateAITriageReport,
  generateNextMonthPurchaseReport,
  generateExpiryRiskReport,
  generateAnalyticsReport,
} from '../services/reportService';

export const triggerMedtrixAssistant = (prompt?: string) => {
  DeviceEventEmitter.emit('openMedtrixAssistant', { prompt });
};

const STORAGE_KEY_POS = '@medtrix_assistant_pos_v2';

// Safely import speech recognition
let ExpoSpeechRecognitionModule: any = null;
let useSpeechRecognitionEvent: any = () => {};

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const speechModule = require('expo-speech-recognition');
  if (speechModule.ExpoSpeechRecognitionModule) {
    ExpoSpeechRecognitionModule = speechModule.ExpoSpeechRecognitionModule;
    useSpeechRecognitionEvent = speechModule.useSpeechRecognitionEvent;
  }
} catch {
  // Suppress warning if not linked in standard Expo Go
}

function getCategoryQuestions(catId: string, _t: any): string[] {
  switch (catId) {
    case 'inventory':
      return [
        'How many medicines are currently in inventory?',
        'How many unique medicines do we have?',
        'What is the total available stock?',
        'Which medicines have the highest stock?',
        'Which medicines are out of stock?',
        'Which medicines have multiple batches?',
        'Which medicines have incomplete details?',
      ];
    case 'stock':
      return [
        'How much stock came in today?',
        'How much stock went out today?',
        'Show Stock In transactions for this week',
        'Show Stock Out transactions for this month',
        'Compare Stock In and Stock Out for this month',
        'Which medicines had the highest stock movement?',
      ];
    case 'expiry':
      return [
        'Which medicines are expiring soon?',
        'Which medicines expire in the next 7 days?',
        'Which medicines expire in the next 30 days?',
        'Which medicines have already expired?',
        'Which batches should be used first under FEFO?',
        'What is the estimated value of stock at expiry risk?',
      ];
    case 'reorder':
      return [
        'Which medicines should I reorder today?',
        'What should I buy this week?',
        'Predict which medicines may run out soon',
        'Show the assumptions behind the demand forecast',
        'Which medicines are running low?',
      ];
    case 'sales':
      return [
        'What are today\'s total sales?',
        'What are this month\'s total sales?',
        'Which medicines sell the most?',
        'Which medicines have the highest recorded consumption?',
        'Show sales by medicine category',
      ];
    case 'analytics':
      return [
        'Show Stock In versus Stock Out for this month',
        'Show top 10 medicines by consumption',
        'Explain the current inventory chart',
        'Identify unusual changes in stock movement',
      ];
    case 'reports':
      return [
        'Generate this month\'s inventory report',
        'Create a weekly stock report',
        'Generate a stock expiry report',
        'Generate a low-stock report',
        'Export the current report as PDF',
      ];
    case 'invoices':
      return [
        'How do I upload an invoice?',
        'How do I import multiple medicines from an invoice?',
        'Why did my invoice import fail?',
        'How can I correct an extracted batch number?',
      ];
    case 'scanning':
      return [
        'How do I scan a medicine barcode?',
        'How do I identify a medicine using the camera?',
        'Why was the barcode not recognized?',
        'Can I manually search for a medicine after scanning fails?',
      ];
    case 'help':
    default:
      return [
        'How do I add a new medicine?',
        'What is FEFO?',
        'How do I change my language?',
        'How do I move the floating AI assistant?',
        'How do I enable voice chat?',
      ];
  }
}

export default function FloatingAssistant() {
  const { t, i18n } = useTranslation();
  const { isDark, glass } = useThemeContext();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const windowDims = useWindowDimensions();
  const screenWidth = windowDims.width > 0 ? windowDims.width : (Dimensions.get('window').width || 390);
  const screenHeight = windowDims.height > 0 ? windowDims.height : (Dimensions.get('window').height || 800);

  // Assistant UI states
  const [isOpen, setIsOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [speechAvailable, setSpeechAvailable] = useState<boolean | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [selectedTopicCat, setSelectedTopicCat] = useState('inventory');

  const messageIdCounter = useRef(1);
  const scrollViewRef = useRef<ScrollView>(null);

  // Layout sizing constants
  const EXPANDED_WIDTH = 168;
  const COMPACT_SIZE = 52;

  const currentWidth = isCompact ? COMPACT_SIZE : EXPANDED_WIDTH;

  // Clamping margins
  const minX = 14;
  const maxX = Math.max(minX, screenWidth - currentWidth - 14);
  const minY = (insets?.top || 24) + 16;
  const maxY = Math.max(minY, screenHeight - (insets?.bottom || 24) - 88);

  // Default initial position (bottom right)
  const defaultPos = useMemo(() => ({
    x: Math.max(minX, screenWidth - currentWidth - 16),
    y: Math.max(minY, screenHeight - (insets?.bottom || 24) - 130),
  }), [screenWidth, screenHeight, currentWidth, insets?.bottom, minX, minY]);

  // Animated coordinates for dragging
  const pan = useRef(new Animated.ValueXY({ x: defaultPos.x, y: defaultPos.y })).current;
  const currentPosRef = useRef({ x: defaultPos.x, y: defaultPos.y });

  // Visual state animations
  const bobbingAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Keyboard avoidance offset
  const keyboardShiftAnim = useRef(new Animated.Value(0)).current;

  // Check speech recognition capability
  useEffect(() => {
    async function checkSpeech() {
      try {
        if (ExpoSpeechRecognitionModule?.isRecognitionAvailable) {
          const available = await ExpoSpeechRecognitionModule.isRecognitionAvailable();
          setSpeechAvailable(!!available);
        } else {
          setSpeechAvailable(false);
        }
      } catch {
        setSpeechAvailable(false);
      }
    }
    checkSpeech();

    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      setReduceMotion(!!enabled);
    });
  }, []);

  // Restore saved position on mount
  useEffect(() => {
    async function loadSavedState() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY_POS);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed.isCompact === 'boolean') {
            setIsCompact(parsed.isCompact);
          }
          if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
            const clampedX = Math.min(Math.max(parsed.x, minX), maxX);
            const clampedY = Math.min(Math.max(parsed.y, minY), maxY);
            pan.setValue({ x: clampedX, y: clampedY });
            currentPosRef.current = { x: clampedX, y: clampedY };
            return;
          }
        }
      } catch {
        // Fall back to default
      }
      pan.setValue({ x: defaultPos.x, y: defaultPos.y });
      currentPosRef.current = { x: defaultPos.x, y: defaultPos.y };
    }
    loadSavedState();
  }, [defaultPos.x, defaultPos.y, maxX, maxY, minX, minY, pan]);

  // Recalculate and re-clamp position safely when screen size or orientation changes
  useEffect(() => {
    const clampedX = Math.min(Math.max(currentPosRef.current.x, minX), maxX);
    const clampedY = Math.min(Math.max(currentPosRef.current.y, minY), maxY);
    if (clampedX !== currentPosRef.current.x || clampedY !== currentPosRef.current.y) {
      pan.setValue({ x: clampedX, y: clampedY });
      currentPosRef.current = { x: clampedX, y: clampedY };
    }
  }, [minX, maxX, minY, maxY, pan]);

  // Continuous bobbing animation
  useEffect(() => {
    if (!reduceMotion) {
      const bobbing = Animated.loop(
        Animated.sequence([
          Animated.timing(bobbingAnim, {
            toValue: -5,
            duration: 1800,
            useNativeDriver: false,
          }),
          Animated.timing(bobbingAnim, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: false,
          }),
        ])
      );
      bobbing.start();

      return () => bobbing.stop();
    }
  }, [bobbingAnim, reduceMotion]);

  // Pulse animation when listening or thinking
  useEffect(() => {
    if (isListening || isProcessing) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: false }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 600, useNativeDriver: false }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening, isProcessing, pulseAnim]);

  // Intelligent collision avoidance: Keyboard detection
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        const keyboardHeight = event.endCoordinates.height;
        // If the launcher is positioned where the keyboard will be, shift it upward
        if (currentPosRef.current.y > screenHeight - keyboardHeight - 80) {
          Animated.timing(keyboardShiftAnim, {
            toValue: -(keyboardHeight * 0.75),
            duration: 250,
            useNativeDriver: false,
          }).start();
        }
      }
    );

    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.timing(keyboardShiftAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardShiftAnim, screenHeight]);

  // Edge snapping & clamping gesture handler
  const savePosition = useCallback(async (x: number, y: number, compact: boolean) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY_POS,
        JSON.stringify({ x, y, isCompact: compact })
      );
    } catch {
      // Ignore write errors
    }
  }, []);

  const resetToDefaultPosition = useCallback(() => {
    const targetX = defaultPos.x;
    const targetY = defaultPos.y;
    Animated.spring(pan, {
      toValue: { x: targetX, y: targetY },
      tension: 50,
      friction: 8,
      useNativeDriver: false,
    }).start();
    currentPosRef.current = { x: targetX, y: targetY };
    setIsCompact(false);
    savePosition(targetX, targetY, false);
  }, [defaultPos.x, defaultPos.y, pan, savePosition]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.hypot(gestureState.dx, gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: currentPosRef.current.x,
          y: currentPosRef.current.y,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();
        const rawX = currentPosRef.current.x + gestureState.dx;
        const rawY = currentPosRef.current.y + gestureState.dy;

        // True drag-anywhere positioning: smoothly clamp inside visible screen boundaries
        const clampedX = Math.min(Math.max(rawX, minX), maxX);
        const clampedY = Math.min(Math.max(rawY, minY), maxY);

        Animated.spring(pan, {
          toValue: { x: clampedX, y: clampedY },
          tension: 50,
          friction: 8,
          useNativeDriver: false,
        }).start();

        currentPosRef.current = { x: clampedX, y: clampedY };
        savePosition(clampedX, clampedY, isCompact);
      },
    })
  ).current;

  // Speech output helper
  const speak = useCallback((text: string, onFinish?: () => void) => {
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
      },
    });
  }, [i18n.language]);

  const stopSpeaking = useCallback(() => {
    Speech.stop();
    setIsSpeaking(false);
  }, []);

  // Sending message
  const handleSend = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `msg-${messageIdCounter.current++}`,
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    try {
      const response = await askAssistant(trimmed, i18n.language, pathname, messages);
      setIsProcessing(false);

      const assistantMsg: ChatMessage = {
        id: `msg-${messageIdCounter.current++}`,
        role: 'assistant',
        content: response.answer,
        action: response.action,
        route: response.route,
        actionLabel: response.actionLabel,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      speak(response.answer);
    } catch {
      setIsProcessing(false);
      const errorMsg: ChatMessage = {
        id: `msg-${messageIdCounter.current++}`,
        role: 'assistant',
        content: t('assistant.error_speech'),
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  }, [i18n.language, messages, pathname, speak, t]);

  // Speech recognition hooks
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

  useSpeechRecognitionEvent('error', () => {
    setIsListening(false);
  });

  // Start speech listening
  const startListening = async () => {
    if (isSpeaking) stopSpeaking();

    if (isListening) {
      if (ExpoSpeechRecognitionModule?.stop) {
        ExpoSpeechRecognitionModule.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      if (ExpoSpeechRecognitionModule?.requestPermissionsAsync) {
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
        alert(t('assistant.voice_not_supported'));
      }
    } catch {
      alert(t('assistant.error_speech'));
      setIsListening(false);
    }
  };

  const openAssistant = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      const welcome = t('assistant.welcome');
      const welcomeMsg: ChatMessage = {
        id: `msg-${messageIdCounter.current++}`,
        role: 'assistant',
        content: welcome,
        timestamp: Date.now(),
      };
      setMessages([welcomeMsg]);
      speak(welcome);
    }
  };

  const closeAssistant = () => {
    stopSpeaking();
    if (isListening && ExpoSpeechRecognitionModule?.stop) {
      ExpoSpeechRecognitionModule.stop();
    }
    setIsListening(false);
    setIsOpen(false);
  };

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('openMedtrixAssistant', (data?: { prompt?: string }) => {
      setIsOpen(true);
      if (data?.prompt) {
        handleSend(data.prompt);
      }
    });
    return () => {
      sub.remove();
    };
  }, [handleSend]);

  const handleAction = (msg: ChatMessage) => {
    if (msg.action === 'NAVIGATE' && msg.route) {
      closeAssistant();
      router.push(msg.route as any);
    } else if (msg.action === 'GENERATE_REPORT') {
      closeAssistant();
      const rName = (msg.route || '').toLowerCase();
      (async () => {
        try {
          let res;
          if (rName.includes('purchase') || rName.includes('reorder')) {
            res = await generateNextMonthPurchaseReport(i18n.language);
          } else if (rName.includes('expiry') || rName.includes('risk')) {
            res = await generateExpiryRiskReport(i18n.language);
          } else if (rName.includes('analytic') || rName.includes('velocity') || rName.includes('trend')) {
            res = await generateAnalyticsReport(i18n.language);
          } else {
            res = await generateAITriageReport(msg.route || 'AI Triage Comprehensive Report', i18n.language);
          }
          if (res?.success) {
            Alert.alert(
              t('ai_triage.report_generated_success') || 'Report Generated',
              'Your PDF report has been generated and is ready to share or save.'
            );
          } else if (res?.error) {
            Alert.alert(
              t('ai_triage.report_generation_failed') || 'Report Generation Failed',
              res.error
            );
          }
        } catch (err: any) {
          console.warn('Floating assistant report generation failed:', err);
          Alert.alert(
            t('ai_triage.report_generation_failed') || 'Report Generation Failed',
            err?.message || 'Unable to generate PDF report.'
          );
        }
      })();
    }
  };

  // Dynamic context-aware suggested questions
  const contextSuggestions = useMemo(() => {
    if (pathname.includes('/inventory')) {
      return [
        t('assistant.q2'), // Low stock
        t('assistant.q3'), // Expiring soon
        t('assistant.q5'), // Upload invoice
        t('assistant.q6'), // Reorder
      ];
    }
    if (pathname.includes('/scan')) {
      return [
        t('assistant.q4'), // Scan barcode
        'Explain OCR label scanning',
        'FEFO priority rules',
        t('assistant.q2'), // Low stock
      ];
    }
    if (pathname.includes('/alerts')) {
      return [
        t('assistant.q3'), // Expiring soon
        t('assistant.q2'), // Low stock
        t('assistant.q6'), // Reorder
        'Explain FEFO in Medtrix',
      ];
    }
    if (pathname.includes('/checkout')) {
      return [
        'How does checkout deduct stock?',
        'Compare Stock In and Stock Out',
        t('assistant.q2'), // Low stock
        'Supported payment methods',
      ];
    }
    return [
      t('assistant.q1'), // How to use app
      t('assistant.q2'), // Low stock
      t('assistant.q3'), // Expiring soon
      t('assistant.q6'), // Reorder
      t('assistant.q4'), // Barcode scan
      t('assistant.q5'), // Invoice upload
    ];
  }, [pathname, t]);

  // Camera scan screen collision avoidance: auto-tuck or compact mode
  const isOnCameraScan = pathname === '/(tabs)/scan' || pathname === '/scan';

  return (
    <View style={styles.fullscreenLayer} pointerEvents="box-none">
      {/* DRAGGABLE LAUNCHER */}
      <Animated.View
        style={[
          styles.draggableWrapper,
          {
            transform: [
              { translateX: pan.x },
              { translateY: Animated.add(Animated.add(pan.y, bobbingAnim), keyboardShiftAnim) },
              { scale: pulseAnim },
            ],
            opacity: isOnCameraScan ? 0.75 : 1,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Pressable
          style={[
            styles.launcherSurface,
            isCompact ? styles.launcherCompact : styles.launcherExpanded,
            glass.hero,
            isDark && { backgroundColor: '#0D1117', borderColor: '#1E293B', shadowColor: '#000000' },
            isListening && styles.surfaceListening,
            isProcessing && styles.surfaceProcessing,
          ]}
          onPress={openAssistant}
          onLongPress={() => {
            const nextCompact = !isCompact;
            setIsCompact(nextCompact);
            savePosition(currentPosRef.current.x, currentPosRef.current.y, nextCompact);
          }}
          accessibilityLabel={t('assistant.label')}
          accessibilityRole="button"
        >
          {/* Animated Robot / Status Indicator */}
          <View style={styles.robotBadgeContainer}>
            <Text style={styles.robotEmoji}>🤖</Text>
            {isListening ? (
              <View style={[styles.statusDot, styles.dotListening]} />
            ) : isProcessing ? (
              <View style={[styles.statusDot, styles.dotProcessing]} />
            ) : isSpeaking ? (
              <View style={[styles.statusDot, styles.dotSpeaking]} />
            ) : (
              <View style={[styles.statusDot, styles.dotIdle]} />
            )}
          </View>

          {!isCompact && (
            <View style={styles.launcherLabelContainer}>
              <Text style={[styles.launcherText, isDark && { color: '#60A5FA' }]} numberOfLines={1}>
                {isListening
                  ? t('assistant.listening')
                  : isProcessing
                  ? t('assistant.processing')
                  : t('assistant.label')}
              </Text>
            </View>
          )}
        </Pressable>
      </Animated.View>

      {/* FLOATING CHAT PANEL */}
      <Modal visible={isOpen} animationType="slide" transparent onRequestClose={closeAssistant}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.modalBackdrop, isDark && { backgroundColor: 'rgba(0, 0, 0, 0.75)' }]}
        >
          <View style={[styles.chatCard, glass.hero, isDark && { backgroundColor: '#0D1117', borderColor: '#1E293B' }]}>
            {/* CARD HEADER */}
            <View style={[styles.header, isDark && { backgroundColor: '#080B12', borderBottomColor: '#1E293B' }]}>
              <View style={styles.headerLeft}>
                <View style={styles.headerAvatarContainer}>
                  <Text style={styles.headerAvatar}>🤖</Text>
                  {isSpeaking && (
                    <View style={styles.speakingWaveBadge}>
                      <Ionicons name="volume-high" size={12} color="#FFFFFF" />
                    </View>
                  )}
                </View>
                <View style={styles.headerTitleCol}>
                  <Text style={[styles.headerTitle, isDark && { color: '#FFFFFF' }]}>{t('assistant.title')}</Text>
                  <Text style={[styles.headerSubtitle, isDark && { color: '#60A5FA' }]}>
                    {isListening
                      ? t('assistant.subtitle_listening')
                      : isProcessing
                      ? t('assistant.subtitle_thinking')
                      : isSpeaking
                      ? t('assistant.subtitle_speaking')
                      : t('assistant.subtitle_online')}
                  </Text>
                </View>
              </View>

              <View style={styles.headerControls}>
                {/* Reset Launcher Position */}
                <Pressable
                  onPress={resetToDefaultPosition}
                  style={styles.iconButton}
                  accessibilityLabel={t('assistant.reset_pos')}
                >
                  <Ionicons name="locate-outline" size={20} color={isDark ? '#CBD5E1' : COLORS.text.secondary} />
                </Pressable>

                {/* Clear / New Chat */}
                <Pressable
                  onPress={() => {
                    stopSpeaking();
                    setMessages([]);
                    const welcome = t('assistant.welcome');
                    setMessages([{
                      id: `msg-${messageIdCounter.current++}`,
                      role: 'assistant',
                      content: welcome,
                      timestamp: Date.now(),
                    }]);
                    speak(welcome);
                  }}
                  style={styles.iconButton}
                  accessibilityLabel={t('assistant.clear_chat')}
                >
                  <Ionicons name="refresh-outline" size={20} color={isDark ? '#CBD5E1' : COLORS.text.secondary} />
                </Pressable>

                {/* Minimize */}
                <Pressable
                  onPress={closeAssistant}
                  style={styles.iconButton}
                  accessibilityLabel={t('assistant.minimize')}
                >
                  <Ionicons name="remove-outline" size={22} color={isDark ? '#CBD5E1' : COLORS.text.secondary} />
                </Pressable>

                {/* Close */}
                <Pressable
                  onPress={closeAssistant}
                  style={styles.iconButton}
                  accessibilityLabel={t('assistant.close')}
                >
                  <Ionicons name="close" size={22} color={isDark ? '#FFFFFF' : COLORS.text.primary} />
                </Pressable>
              </View>
            </View>

            {/* MESSAGE SCROLL AREA */}
            <ScrollView
              ref={scrollViewRef}
              style={[styles.messageScroll, isDark && { backgroundColor: '#000000' }]}
              contentContainerStyle={styles.messageContent}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.map((msg) => (
                <View
                  key={msg.id}
                  style={[
                    styles.messageRow,
                    msg.role === 'user' ? styles.userRow : styles.assistantRow,
                  ]}
                >
                  {msg.role === 'assistant' && (
                    <Text style={styles.assistantAvatarSmall}>🤖</Text>
                  )}

                  <View
                    style={[
                      styles.bubble,
                      msg.role === 'user' ? styles.userBubble : styles.assistantBubble,
                      msg.role === 'assistant' && isDark && { backgroundColor: '#0D1117', borderColor: '#1E293B' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.bubbleText,
                        msg.role === 'user' ? styles.userBubbleText : styles.assistantBubbleText,
                        msg.role === 'assistant' && isDark && { color: '#CBD5E1' },
                      ]}
                      selectable
                    >
                      {msg.content}
                    </Text>

                    {/* Action button if AI recommends a screen navigation or report */}
                    {msg.action && msg.action !== 'NONE' && (
                      <Pressable
                        onPress={() => handleAction(msg)}
                        style={[styles.actionChip, isDark && { backgroundColor: 'rgba(37, 99, 235, 0.16)', borderColor: '#2563EB' }]}
                      >
                        <Ionicons
                          name={msg.action === 'GENERATE_REPORT' ? 'document-text-outline' : 'arrow-forward-circle-outline'}
                          size={16}
                          color={isDark ? '#60A5FA' : COLORS.brand.primary}
                        />
                        <Text style={[styles.actionChipText, isDark && { color: '#60A5FA' }]}>
                          {msg.actionLabel || (msg.action === 'GENERATE_REPORT' ? t('assistant.generate_report_action') : t('assistant.tap_to_navigate'))}
                        </Text>
                      </Pressable>
                    )}

                    {/* Speaker / Replay Button */}
                    {msg.role === 'assistant' && (
                      <View style={styles.bubbleFooter}>
                        <Pressable
                          onPress={() => (isSpeaking ? stopSpeaking() : speak(msg.content))}
                          style={styles.speakerButton}
                        >
                          <Ionicons
                            name={isSpeaking ? 'stop-circle' : 'volume-medium-outline'}
                            size={16}
                            color={isSpeaking ? (isDark ? '#93C5FD' : COLORS.status.critical) : (isDark ? '#60A5FA' : COLORS.brand.primary)}
                          />
                          <Text style={[styles.speakerLabel, isDark && { color: '#60A5FA' }]}>
                            {isSpeaking ? t('assistant.stop') : t('assistant.speak')}
                          </Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                </View>
              ))}

              {/* Listening Indicator Bar */}
              {isListening && (
                <View style={[styles.messageRow, styles.assistantRow]}>
                  <Text style={styles.assistantAvatarSmall}>🎙️</Text>
                  <View style={[styles.bubble, styles.assistantBubble, styles.listeningBubble]}>
                    <ActivityIndicator size="small" color={COLORS.brand.primary} />
                    <Text style={[styles.bubbleText, styles.assistantBubbleText, { marginLeft: 8 }]}>
                      {t('assistant.listening')}
                    </Text>
                  </View>
                </View>
              )}

              {/* Thinking Indicator */}
              {isProcessing && (
                <View style={[styles.messageRow, styles.assistantRow]}>
                  <Text style={styles.assistantAvatarSmall}>🤖</Text>
                  <View style={[styles.bubble, styles.assistantBubble]}>
                    <ActivityIndicator size="small" color={COLORS.brand.primary} />
                    <Text style={[styles.bubbleText, styles.assistantBubbleText, { marginLeft: 8 }]}>
                      {t('assistant.processing')}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* CONTEXT-AWARE SUGGESTION CHIPS */}
            <View style={[styles.suggestionContainer, isDark && { backgroundColor: '#080B12', borderTopColor: '#1E293B' }]}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.suggestionScroll}
              >
                {/* More Questions Toggle Chip */}
                <Pressable
                  style={[
                    styles.suggestionChip,
                    styles.moreQuestionsChip,
                    isDark && { backgroundColor: 'rgba(37, 99, 235, 0.20)', borderColor: '#2563EB' }
                  ]}
                  onPress={() => setShowAllTopics(prev => !prev)}
                >
                  <Ionicons
                    name={showAllTopics ? "close-circle" : "grid-outline"}
                    size={13}
                    color={isDark ? '#60A5FA' : COLORS.brand.primary}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.suggestionText, styles.moreQuestionsText, isDark && { color: '#60A5FA' }]}>
                    {showAllTopics ? t('assistant.hide_questions') : t('assistant.more_questions')}
                  </Text>
                </Pressable>

                {contextSuggestions.map((suggestion, index) => (
                  <Pressable
                    key={`sug-${index}`}
                    style={[styles.suggestionChip, isDark && { backgroundColor: '#0D1117', borderColor: '#1E293B' }]}
                    onPress={() => {
                      setShowAllTopics(false);
                      handleSend(suggestion);
                    }}
                  >
                    <Ionicons name="sparkles-outline" size={13} color={isDark ? '#60A5FA' : COLORS.brand.deep} style={{ marginRight: 4 }} />
                    <Text style={[styles.suggestionText, isDark && { color: '#CBD5E1' }]}>{suggestion}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* EXPANDABLE CATEGORIZED TOPICS EXPLORER */}
            {showAllTopics && (
              <View style={[styles.topicExplorerContainer, isDark && { backgroundColor: '#080B12', borderTopColor: '#1E293B' }]}>
                {/* Category Tabs */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.topicTabsScroll}
                >
                  {[
                    { id: 'inventory', title: t('assistant.cat_inventory') },
                    { id: 'stock', title: t('assistant.cat_stock') },
                    { id: 'expiry', title: t('assistant.cat_expiry') },
                    { id: 'reorder', title: t('assistant.cat_reorder') },
                    { id: 'sales', title: t('assistant.cat_sales') },
                    { id: 'analytics', title: t('assistant.cat_analytics') },
                    { id: 'reports', title: t('assistant.cat_reports') },
                    { id: 'invoices', title: t('assistant.cat_invoices') },
                    { id: 'scanning', title: t('assistant.cat_scanning') },
                    { id: 'help', title: t('assistant.cat_help') },
                  ].map(cat => (
                    <Pressable
                      key={cat.id}
                      style={[
                        styles.topicTab,
                        isDark && { backgroundColor: '#0D1117', borderColor: '#1E293B' },
                        selectedTopicCat === cat.id && styles.topicTabActive,
                        selectedTopicCat === cat.id && isDark && { backgroundColor: '#2563EB', borderColor: '#2563EB' },
                      ]}
                      onPress={() => setSelectedTopicCat(cat.id)}
                    >
                      <Text
                        style={[
                          styles.topicTabText,
                          isDark && { color: '#CBD5E1' },
                          selectedTopicCat === cat.id && styles.topicTabActiveText,
                        ]}
                      >
                        {cat.title}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>

                {/* Question List for Selected Category */}
                <ScrollView style={styles.topicQuestionsScroll} nestedScrollEnabled>
                  {getCategoryQuestions(selectedTopicCat, t).map((q, idx) => (
                    <Pressable
                      key={`topic-q-${idx}`}
                      style={[styles.topicQuestionCard, isDark && { backgroundColor: '#0D1117', borderColor: '#1E293B' }]}
                      onPress={() => {
                        setShowAllTopics(false);
                        handleSend(q);
                      }}
                    >
                      <Ionicons name="chatbubble-ellipses-outline" size={15} color={isDark ? '#60A5FA' : COLORS.brand.primary} style={{ marginRight: 8, marginTop: 1 }} />
                      <Text style={[styles.topicQuestionCardText, isDark && { color: '#CBD5E1' }]}>{q}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* INPUT COMPOSER */}
            <View style={[styles.composerBar, isDark && { backgroundColor: '#080B12', borderTopColor: '#1E293B' }]}>
              <Pressable
                onPress={startListening}
                style={[
                  styles.micButton,
                  isDark && { backgroundColor: 'rgba(37, 99, 235, 0.16)' },
                  isListening && styles.micButtonListening,
                  speechAvailable === false && styles.micButtonDisabled,
                ]}
                accessibilityLabel="Microphone"
              >
                <Ionicons
                  name={isListening ? 'stop' : 'mic'}
                  size={22}
                  color={isListening ? '#FFFFFF' : (isDark ? '#60A5FA' : COLORS.brand.primary)}
                />
              </Pressable>

              <TextInput
                style={[styles.inputField, isDark && { backgroundColor: '#000000', borderColor: '#1E293B', color: '#FFFFFF' }]}
                placeholder={t('assistant.type_message')}
                placeholderTextColor={isDark ? '#94A3B8' : COLORS.text.muted}
                multiline
                value={input}
                onChangeText={setInput}
                onSubmitEditing={() => handleSend(input)}
                returnKeyType="send"
              />

              <Pressable
                onPress={() => handleSend(input)}
                disabled={!input.trim() || isProcessing}
                style={[
                  styles.sendButton,
                  isDark && { backgroundColor: '#2563EB' },
                  (!input.trim() || isProcessing) && styles.sendButtonDisabled,
                ]}
                accessibilityLabel="Send"
              >
                <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreenLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999999,
    elevation: 99,
  },
  draggableWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 999999,
    elevation: 99,
  },
  launcherSurface: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    shadowColor: COLORS.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 8,
  },
  launcherExpanded: {
    height: 52,
    paddingHorizontal: 16,
  },
  launcherCompact: {
    width: 52,
    height: 52,
    borderRadius: 26,
    paddingHorizontal: 0,
  },
  surfaceListening: {
    borderColor: COLORS.status.critical,
    backgroundColor: 'rgba(255, 241, 242, 0.92)',
  },
  surfaceProcessing: {
    borderColor: COLORS.brand.primary,
    backgroundColor: 'rgba(239, 246, 255, 0.92)',
  },
  robotBadgeContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  robotEmoji: {
    fontSize: 24,
  },
  statusDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  dotIdle: {
    backgroundColor: COLORS.status.healthy,
  },
  dotListening: {
    backgroundColor: COLORS.status.critical,
  },
  dotProcessing: {
    backgroundColor: COLORS.brand.primary,
  },
  dotSpeaking: {
    backgroundColor: '#8B5CF6',
  },
  launcherLabelContainer: {
    marginLeft: 10,
  },
  launcherText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 14,
    color: COLORS.brand.deep,
  },

  // Modal Backdrop & Card
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  chatCard: {
    flex: 1,
    marginTop: '16%',
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.subtle,
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  headerAvatar: {
    fontSize: 26,
  },
  speakingWaveBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 17,
    color: COLORS.text.primary,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: COLORS.brand.primary,
    marginTop: 1,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 6,
    marginLeft: 4,
    borderRadius: 8,
  },

  // Message area
  messageScroll: {
    flex: 1,
    backgroundColor: COLORS.background.canvas,
  },
  messageContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  assistantRow: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  assistantAvatarSmall: {
    fontSize: 18,
    marginRight: 8,
    marginTop: 4,
  },
  bubble: {
    maxWidth: '82%',
    padding: 14,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: COLORS.brand.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    ...SHADOWS.soft,
  },
  listeningBubble: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bubbleText: {
    ...TYPOGRAPHY.body,
    fontSize: 14.5,
    lineHeight: 21,
  },
  userBubbleText: {
    color: '#FFFFFF',
  },
  assistantBubbleText: {
    color: COLORS.text.primary,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brand.verySoft,
    borderWidth: 1,
    borderColor: COLORS.brand.soft,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  actionChipText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 13,
    color: COLORS.brand.deep,
    marginLeft: 6,
  },
  bubbleFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border.subtle,
  },
  speakerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  speakerLabel: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 12,
    color: COLORS.brand.primary,
    marginLeft: 4,
  },

  // Suggestion chips
  suggestionContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.border.subtle,
    paddingVertical: 8,
  },
  suggestionScroll: {
    paddingHorizontal: 16,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brand.verySoft,
    borderWidth: 1,
    borderColor: COLORS.brand.soft,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    marginRight: 8,
  },
  suggestionText: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 12.5,
    color: COLORS.brand.deep,
  },
  moreQuestionsChip: {
    backgroundColor: '#EFF6FF',
    borderColor: COLORS.brand.primary,
    borderWidth: 1.5,
  },
  moreQuestionsText: {
    color: COLORS.brand.primary,
    fontFamily: 'PlusJakartaSans_700Bold',
  },

  // Topic Explorer Drawer
  topicExplorerContainer: {
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: COLORS.border.subtle,
    maxHeight: 220,
    paddingTop: 8,
    paddingBottom: 8,
  },
  topicTabsScroll: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  topicTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    marginRight: 8,
  },
  topicTabActive: {
    backgroundColor: COLORS.brand.primary,
    borderColor: COLORS.brand.primary,
  },
  topicTabText: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  topicTabActiveText: {
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  topicQuestionsScroll: {
    paddingHorizontal: 16,
  },
  topicQuestionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    padding: 10,
    marginBottom: 6,
  },
  topicQuestionCardText: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: COLORS.text.primary,
    flex: 1,
  },

  // Composer
  composerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.border.subtle,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.brand.verySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonListening: {
    backgroundColor: COLORS.status.critical,
  },
  micButtonDisabled: {
    opacity: 0.45,
  },
  inputField: {
    flex: 1,
    minHeight: 42,
    maxHeight: 110,
    backgroundColor: COLORS.background.canvas,
    borderRadius: 21,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 10,
    ...TYPOGRAPHY.body,
    fontSize: 14.5,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.text.disabled,
  },
});
