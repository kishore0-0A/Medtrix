import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { COLORS, TYPOGRAPHY, GLASS, SHADOWS } from '../theme';

// Stepper states
type Step = 'Patient' | 'Symptoms' | 'Vitals' | 'Assessment' | 'Report';
const STEPS: Step[] = ['Patient', 'Symptoms', 'Vitals', 'Assessment', 'Report'];

export default function ClinicalTriageScreen() {
  const { t, i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState<Step>('Patient');
  const [loading, setLoading] = useState(false);
  
  // Form Data
  const [patientInfo, setPatientInfo] = useState({ age: '', sex: '', allergies: '' });
  const [symptoms, setSymptoms] = useState({ main: '', duration: '', severity: 5, location: '' });
  const [redFlags, setRedFlags] = useState<string[]>([]);
  
  // Fake Assessment Data generated on step 4
  const [assessment, setAssessment] = useState<any>(null);

  const nextStep = () => {
    const idx = STEPS.indexOf(currentStep);
    if (idx < STEPS.length - 1) {
      if (STEPS[idx + 1] === 'Assessment') {
        simulateAIAssessment();
      } else {
        setCurrentStep(STEPS[idx + 1]);
      }
    }
  };

  const prevStep = () => {
    const idx = STEPS.indexOf(currentStep);
    if (idx > 0) setCurrentStep(STEPS[idx - 1]);
  };

  const simulateAIAssessment = () => {
    setLoading(true);
    setCurrentStep('Assessment');
    setTimeout(() => {
      let riskLevel = 'Moderate';
      if (redFlags.length > 0 || symptoms.severity > 7) riskLevel = 'High';
      
      setAssessment({
        riskLevel,
        urgency: riskLevel === 'High' ? 'Urgent Attention Required' : 'Standard Care',
        findings: `Patient presents with ${symptoms.main} lasting ${symptoms.duration}. Severity: ${symptoms.severity}/10.`,
        recommendation: riskLevel === 'High' ? 'Immediate clinical evaluation recommended.' : 'Monitor symptoms and schedule standard follow-up.',
        category: 'General Medicine'
      });
      setLoading(false);
      setCurrentStep('Report');
    }, 2500);
  };

  const toggleRedFlag = (flag: string) => {
    setRedFlags(prev => prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag]);
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Clinical AI Triage</Text>
          <Text style={styles.headerSub}>Patient Diagnostics & Assessment</Text>
        </View>
        <View style={styles.langSelector}>
          <Pressable onPress={() => changeLanguage('en')} style={[styles.langBtn, i18n.language === 'en' && styles.langBtnActive]}>
            <Text style={[styles.langText, i18n.language === 'en' && styles.langTextActive]}>EN</Text>
          </Pressable>
          <Pressable onPress={() => changeLanguage('ta')} style={[styles.langBtn, i18n.language === 'ta' && styles.langBtnActive]}>
            <Text style={[styles.langText, i18n.language === 'ta' && styles.langTextActive]}>TA</Text>
          </Pressable>
        </View>
      </View>

      {/* PROGRESS INDICATOR */}
      <View style={styles.progressContainer}>
        {STEPS.map((s, i) => {
          const isActive = STEPS.indexOf(currentStep) >= i;
          return (
            <React.Fragment key={s}>
              <View style={[styles.stepDot, isActive && styles.stepDotActive]}>
                <Text style={[styles.stepText, isActive && styles.stepTextActive]}>{i + 1}</Text>
              </View>
              {i < STEPS.length - 1 && <View style={[styles.stepLine, isActive && styles.stepLineActive]} />}
            </React.Fragment>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* STEP 1: PATIENT INFO */}
        {currentStep === 'Patient' && (
          <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.card}>
            <Text style={styles.sectionTitle}>1. Patient Information</Text>
            
            <Text style={styles.label}>Age</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. 45" 
              keyboardType="numeric"
              value={patientInfo.age}
              onChangeText={t => setPatientInfo({...patientInfo, age: t})} 
            />

            <Text style={styles.label}>Sex</Text>
            <View style={styles.rowBtnContainer}>
              {['Male', 'Female', 'Other'].map(sex => (
                <Pressable 
                  key={sex} 
                  style={[styles.chipBtn, patientInfo.sex === sex && styles.chipBtnActive]}
                  onPress={() => setPatientInfo({...patientInfo, sex})}
                >
                  <Text style={[styles.chipText, patientInfo.sex === sex && styles.chipTextActive]}>{sex}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Known Allergies</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. Penicillin, Peanuts (or None)" 
              value={patientInfo.allergies}
              onChangeText={t => setPatientInfo({...patientInfo, allergies: t})} 
            />
          </Animated.View>
        )}

        {/* STEP 2: SYMPTOMS */}
        {currentStep === 'Symptoms' && (
          <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.card}>
            <Text style={styles.sectionTitle}>2. Main Symptoms</Text>
            
            <Text style={styles.label}>Primary Symptom</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. Severe Chest Pain" 
              value={symptoms.main}
              onChangeText={t => setSymptoms({...symptoms, main: t})} 
            />

            <Text style={styles.label}>Duration</Text>
            <View style={styles.rowBtnContainer}>
              {['< 24 Hours', '1-3 Days', '1 Week', 'Longer'].map(dur => (
                <Pressable 
                  key={dur} 
                  style={[styles.chipBtn, symptoms.duration === dur && styles.chipBtnActive]}
                  onPress={() => setSymptoms({...symptoms, duration: dur})}
                >
                  <Text style={[styles.chipText, symptoms.duration === dur && styles.chipTextActive]}>{dur}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Severity Scale (0-10)</Text>
            <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 12}}>
              <Text style={{width: 20, textAlign: 'center'}}>{symptoms.severity}</Text>
              <View style={{flex: 1, height: 4, backgroundColor: COLORS.border.subtle, marginHorizontal: 10, borderRadius: 2}}>
                <View style={{width: `${symptoms.severity * 10}%`, height: '100%', backgroundColor: symptoms.severity > 7 ? COLORS.status.critical : COLORS.brand.primary, borderRadius: 2}} />
              </View>
              <Pressable onPress={() => setSymptoms(s => ({...s, severity: Math.min(10, s.severity + 1)}))} style={{padding: 8, backgroundColor: COLORS.background.primary, borderRadius: 8}}><Text>+</Text></Pressable>
              <Pressable onPress={() => setSymptoms(s => ({...s, severity: Math.max(0, s.severity - 1)}))} style={{padding: 8, backgroundColor: COLORS.background.primary, borderRadius: 8, marginLeft: 8}}><Text>-</Text></Pressable>
            </View>
          </Animated.View>
        )}

        {/* STEP 3: VITALS & RED FLAGS */}
        {currentStep === 'Vitals' && (
          <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.card}>
            <Text style={styles.sectionTitle}>3. Red Flag Screening</Text>
            <Text style={styles.subText}>Select any urgent symptoms present:</Text>
            
            <View style={{marginTop: 12}}>
              {['Severe breathing difficulty', 'Loss of consciousness', 'Severe chest pain', 'Uncontrolled bleeding'].map(flag => (
                <Pressable 
                  key={flag} 
                  style={[styles.redFlagBtn, redFlags.includes(flag) && styles.redFlagBtnActive]}
                  onPress={() => toggleRedFlag(flag)}
                >
                  <Ionicons name="warning" size={20} color={redFlags.includes(flag) ? COLORS.status.critical : COLORS.text.muted} />
                  <Text style={[styles.redFlagText, redFlags.includes(flag) && {color: COLORS.status.critical, fontFamily: TYPOGRAPHY.bodyBold.fontFamily}]}>{flag}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}

        {/* STEP 4: ASSESSMENT LOADING */}
        {currentStep === 'Assessment' && (
          <Animated.View entering={FadeIn} style={[styles.card, {alignItems: 'center', paddingVertical: 60}]}>
            <ActivityIndicator size="large" color={COLORS.brand.primary} />
            <Text style={[styles.sectionTitle, {marginTop: 24}]}>Analyzing Patient Information...</Text>
            <Text style={styles.subText}>Evaluating risk factors and checking red-flag indicators.</Text>
          </Animated.View>
        )}

        {/* STEP 5: REPORT */}
        {currentStep === 'Report' && assessment && (
          <Animated.View entering={FadeInRight} style={styles.reportContainer}>
            <View style={styles.reportHeader}>
              <View>
                <Text style={styles.reportTitle}>AI Triage Assessment</Text>
                <Text style={styles.subText}>Generated: {new Date().toLocaleString()}</Text>
              </View>
              <Pressable style={styles.downloadBtn}>
                <Ionicons name="document-text" size={18} color="#fff" />
                <Text style={styles.downloadText}>Download PDF</Text>
              </Pressable>
            </View>

            <View style={[styles.card, { borderColor: assessment.riskLevel === 'High' ? COLORS.status.critical : COLORS.border.subtle }]}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
                <Text style={styles.label}>Risk Classification</Text>
                <View style={[styles.chipBtnActive, {backgroundColor: assessment.riskLevel === 'High' ? COLORS.status.criticalBg : COLORS.status.warningBg, borderColor: assessment.riskLevel === 'High' ? COLORS.status.critical : COLORS.status.warning}]}>
                  <Text style={[styles.chipTextActive, {color: assessment.riskLevel === 'High' ? COLORS.status.critical : COLORS.status.warning}]}>{assessment.riskLevel.toUpperCase()}</Text>
                </View>
              </View>

              <Text style={styles.label}>Key Findings</Text>
              <Text style={styles.valueText}>{assessment.findings}</Text>

              <Text style={[styles.label, {marginTop: 16}]}>Recommended Action</Text>
              <Text style={[styles.valueText, {fontFamily: TYPOGRAPHY.bodyBold.fontFamily}]}>{assessment.recommendation}</Text>
              
              {redFlags.length > 0 && (
                <View style={styles.alertBox}>
                  <Ionicons name="alert-circle" size={24} color={COLORS.status.critical} />
                  <Text style={styles.alertText}>URGENT ATTENTION RECOMMENDED: Red flags detected.</Text>
                </View>
              )}
            </View>
          </Animated.View>
        )}

      </ScrollView>

      {/* FOOTER ACTIONS */}
      {currentStep !== 'Assessment' && currentStep !== 'Report' && (
        <View style={styles.footer}>
          <Pressable style={[styles.actionBtn, styles.actionBtnOutline, currentStep === 'Patient' && {opacity: 0.5}]} onPress={prevStep} disabled={currentStep === 'Patient'}>
            <Text style={styles.actionBtnOutlineText}>Back</Text>
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={nextStep}>
            <Text style={styles.actionBtnText}>{currentStep === 'Vitals' ? 'Generate Assessment' : 'Continue'}</Text>
          </Pressable>
        </View>
      )}
      {currentStep === 'Report' && (
        <View style={styles.footer}>
          <Pressable style={styles.actionBtn} onPress={() => { setCurrentStep('Patient'); setPatientInfo({age:'', sex:'', allergies:''}); setSymptoms({main:'', duration:'', severity:5, location:''}); setRedFlags([]); }}>
            <Text style={styles.actionBtnText}>Start New Triage</Text>
          </Pressable>
        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.canvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.subtle,
  },
  backBtn: {
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 20,
    color: COLORS.text.primary,
  },
  headerSub: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: COLORS.text.muted,
  },
  langSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.primary,
    borderRadius: 8,
    padding: 2,
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  langBtnActive: {
    backgroundColor: '#fff',
    ...SHADOWS.soft,
  },
  langText: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 12,
    color: COLORS.text.muted,
  },
  langTextActive: {
    color: COLORS.brand.primary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.background.primary,
  },
  stepDotActive: {
    backgroundColor: COLORS.brand.soft,
    borderColor: COLORS.brand.primary,
  },
  stepText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 12,
    color: COLORS.text.muted,
  },
  stepTextActive: {
    color: COLORS.brand.primary,
  },
  stepLine: {
    flex: 1,
    height: 3,
    backgroundColor: COLORS.background.primary,
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: COLORS.brand.primary,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 22,
    color: COLORS.text.primary,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    ...SHADOWS.medium,
  },
  label: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: COLORS.background.canvas,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...TYPOGRAPHY.body,
    fontSize: 15,
  },
  rowBtnContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chipBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    backgroundColor: COLORS.background.canvas,
  },
  chipBtnActive: {
    borderColor: COLORS.brand.primary,
    backgroundColor: COLORS.brand.soft,
  },
  chipText: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  chipTextActive: {
    color: COLORS.brand.primary,
  },
  redFlagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: COLORS.background.canvas,
  },
  redFlagBtnActive: {
    borderColor: COLORS.status.critical,
    backgroundColor: COLORS.status.criticalBg,
  },
  redFlagText: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 15,
    color: COLORS.text.primary,
    marginLeft: 12,
  },
  subText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.text.muted,
  },
  reportContainer: {
    marginBottom: 20,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  reportTitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 24,
    color: COLORS.text.primary,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brand.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    ...SHADOWS.soft,
  },
  downloadText: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 13,
    color: '#fff',
    marginLeft: 6,
  },
  valueText: {
    ...TYPOGRAPHY.body,
    fontSize: 15,
    color: COLORS.text.primary,
    lineHeight: 22,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.status.criticalBg,
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  alertText: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 14,
    color: COLORS.status.critical,
    marginLeft: 12,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: COLORS.border.subtle,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: COLORS.brand.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 16,
    color: '#fff',
  },
  actionBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  actionBtnOutlineText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 16,
    color: COLORS.text.secondary,
  }
});
