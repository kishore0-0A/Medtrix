import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Database, InventoryItem } from '../supabase/database';
import { AuthHelpers } from '../supabase/auth';

export type ReportMode = 'comprehensive' | 'purchase_plan' | 'expiry_risk' | 'analytics' | 'clinical_triage' | 'weekly';

export interface ReportGenerationResult {
  success: boolean;
  uri?: string;
  filename?: string;
  error?: string;
}

export interface ClinicalAssessmentData {
  patient: {
    age?: string;
    sex?: string;
    allergies?: string;
  };
  symptoms: {
    main?: string;
    duration?: string;
    severity?: number;
    location?: string;
  };
  redFlags?: string[];
  assessment: {
    riskLevel?: string;
    urgency?: string;
    findings?: string;
    recommendation?: string;
    category?: string;
  };
}

// ============================================================
// LOCALIZED DICTIONARY FOR PROFESSIONAL MULTILINGUAL PDFS
// Covers English (en), Tamil (ta), and Hindi (hi) with safe fallback
// ============================================================
export const REPORT_TRANSLATIONS = {
  en: {
    facilityName: 'MEDTRIX HEALTHCARE & PHARMACY NETWORK',
    systemTag: 'AI TRIAGE & INVENTORY INTELLIGENCE',
    titleComprehensive: 'AI Triage Comprehensive Inventory Health & Procurement Report',
    titlePurchasePlan: 'Next-Month Medicine Purchase Plan & Order Forecast',
    titleExpiryRisk: 'Medicine Expiry & FEFO Quarantine Risk Audit',
    titleAnalytics: 'Inventory Movement Velocity & Consumption Analytics',
    titleClinicalTriage: 'Clinical AI Triage Patient Diagnostic Assessment',
    subtitle: 'Automated Clinical Supply Chain Analytics, Demand Forecasting & Smart Restock Predictions',
    clinicalSubtitle: 'Automated Patient Risk Stratification, Diagnostic Findings & Clinical Protocol Directives',
    generatedOn: 'Generated on',
    reportingPeriod: 'Reporting Period',
    periodValue: 'Last 30 Days (Rolling)',
    protocol: 'Compliance Protocol',
    protocolValue: 'FEFO (First-Expiry, First-Out) Verified',
    confidentiality: 'STRICTLY CONFIDENTIAL — FOR AUTHORIZED HEALTHCARE & PHARMACY INVENTORY CONTROL ONLY',
    facilityLabel: 'Healthcare Facility',
    defaultFacility: 'Medtrix Central Pharmacy & Clinic',
    
    // Executive Summary
    execSummaryTitle: 'Executive Inventory Health Summary',
    totalMedicines: 'Tracked Medicines',
    totalBatches: 'Active Batches',
    totalStockUnits: 'Total Units in Stock',
    lowStock: 'Low Stock (<20)',
    outOfStock: 'Out of Stock',
    expiringSoon: 'Expiring Soon (<60d)',
    expiredQuarantine: 'Expired / Quarantine',
    stockoutRisk: 'Imminent Stockout (<14d)',
    netVelocityDelta: '30-Day Net Delta',
    
    // Section 1: Urgent Attention
    attentionSectionTitle: '1. Immediate Clinical Supply-Chain Risks & Quarantine Items',
    attentionSectionDesc: 'Critical inventory alerts requiring prompt procurement, quarantine segregation, or dispensing prioritization.',
    colMedicine: 'Medicine & Form',
    colBatch: 'Batch #',
    colStock: 'Usable Stock',
    colExpiry: 'Expiry Date',
    colSeverity: 'Urgency Level',
    colAction: 'Recommended Action / Clinical Rationale',
    noAttentionItems: 'All inventory items are currently in optimal condition. No critical stockout or expiry risks detected.',
    statusExpired: 'EXPIRED',
    statusOutOfStock: 'OUT OF STOCK',
    statusCriticalLow: 'CRITICAL LOW',
    statusLowStock: 'LOW STOCK',
    statusExpiringSoon: 'EXPIRING SOON',

    // Attention dynamic reasons
    reasonExpiredBatch: 'Expired batch quarantined under FEFO rules. Immediate disposal / return required.',
    reasonOutOfStock: 'Complete stockout causing dispensing delays. Immediate restock emergency.',
    reasonCriticallyLow: (qty: number, days?: number) => `Critically low stock (${qty} units left). Danger of total stockout within ${days || 5} days.`,
    reasonExpiringSoon: (days: number) => `Expires in ${days} days. Prioritize first for patient dispensing under FEFO.`,
    
    // Section 2: Purchase Recommendations
    purchaseSectionTitle: '2. Next-Month Medicine Purchase Recommendations',
    purchaseSectionDesc: 'Intelligent procurement forecast calculated from usable non-expired inventory, recorded consumption run-rate, and safety buffers.',
    formulaLabel: 'Verified Mathematical Procurement Formula',
    formulaText: 'Order Units = max(0, 30-Day Forecast Demand + Safety Stock Reserve (20) − Usable Non-Expired Stock − Confirmed Incoming)',
    colForecastDemand: '30d Forecast',
    colSafetyStock: 'Safety Target',
    colIncoming: 'Incoming',
    colAdditionalUnits: 'Units to Order',
    colPacks: 'Suggested Packs',
    colDaysLeft: 'Stock Runway',
    colPriority: 'Priority',
    colReason: 'Procurement Rationale & Risk Assessment',
    priorityCritical: 'CRITICAL',
    priorityHigh: 'HIGH',
    priorityMedium: 'MEDIUM',
    priorityOptimal: 'OPTIMAL',
    noPurchaseNeeded: 'Fully Stocked (0 Needed)',
    noPurchasePlanItems: 'No purchase recommendations found for the current inventory parameters.',

    // Purchase plan dynamic reasons
    reasonImminentStockout: (runway: number) => `Imminent stock-out (${runway}d runway). Current inventory cannot sustain 30-day demand.`,
    reasonDemandExceeds: (forecast: number, usable: number) => `Demand (${forecast}) exceeds usable stock (${usable}). Reorder to prevent stockout.`,
    reasonBufferBreach: (buffer: number) => `Stock will breach the ${buffer}-unit safety buffer during next month.`,
    reasonComfortableStock: (usable: number) => `Current stock (${usable}) comfortably covers projected 30-day demand and safety buffer.`,
    
    // Section 3: Analytics & Velocity
    analyticsSectionTitle: '3. Inventory Movement Velocity & Consumption Analytics',
    analyticsSectionDesc: 'Comparative dispensing analysis showing received inventory versus issued units and top-velocity medications.',
    stockInLabel: 'Total Stock In (Received)',
    stockOutLabel: 'Total Stock Out (Dispensed)',
    netDeltaLabel: 'Net Inventory Movement',
    topConsumedTitle: 'Top Dispensed Medications (30-Day Velocity)',
    unitsLabel: 'units',
    dispensedShare: 'Dispensed Volume',
    recentTransactionsTitle: 'Recent 30-Day Dispensing Transaction Logs',
    colDate: 'Date & Time',
    colType: 'Type',
    colQty: 'Qty',
    noTransactionsRecorded: 'No dispensing transaction logs recorded for this period.',
    
    // Clinical Triage Report Specific
    patientDemographics: 'Patient Demographics',
    patientAge: 'Age',
    patientSex: 'Biological Sex',
    patientAllergies: 'Known Allergies',
    symptomSummaryTitle: 'Clinical Presentation & Symptoms',
    symptomPrimary: 'Primary Symptom',
    symptomDuration: 'Duration',
    symptomSeverity: 'Reported Severity',
    redFlagTitle: 'Red Flag Emergency Indicators',
    noRedFlags: 'No critical red-flag emergency symptoms detected during clinical intake screening.',
    redFlagsDetected: 'URGENT ATTENTION: Immediate red-flag indicators detected during intake.',
    clinicalAssessmentTitle: 'Clinical AI Assessment & Recommendation',
    riskClassification: 'Risk Classification',
    clinicalUrgency: 'Clinical Urgency Level',
    keyFindings: 'Key Clinical Findings',
    clinicalRecommendation: 'Recommended Clinical Action',
    triageCategory: 'Clinical Specialty Category',
    disclaimerClinical: 'NOTICE: This clinical triage assessment is an automated AI-assisted preliminary evaluation based on reported symptoms. It does not replace independent clinical judgment by a licensed medical practitioner.',
    signatureClinician: 'Attending Clinician / Triage Officer',

    // Sign-off & Footer
    auditSignOff: 'Clinical Supply Chain Audit Verification',
    signOffNotice: 'This automated audit report is generated strictly from verified database batch records and recorded transaction logs under FEFO governance. Physical shelf counts and cold-chain compliance must be cross-verified prior to supplier purchase orders.',
    signaturePharmacist: 'Chief Pharmacist / Authorized Signature',
    signatureDate: 'Verification Date',
    facilityStamp: 'Facility Stamp & Certification',
    footerBrand: 'Medtrix AI Medical Inventory OS — High-Integrity Autonomous Pharmacy Infrastructure',
  },
  ta: {
    facilityName: 'மெட்ரிக்ச் ஹெல்த்கேர் & பார்மசி நெட்வொர்க்',
    systemTag: 'AI டிரையேஜ் & சரக்கு நுண்ணறிவு',
    titleComprehensive: 'AI டிரையேஜ் முழுமையான சரக்கு நிலை & கொள்முதல் அறிக்கை',
    titlePurchasePlan: 'அடுத்த மாத மருந்து கொள்முதல் திட்டம் & தேவை கணிப்பு',
    titleExpiryRisk: 'மருந்து காலாவதி மற்றும் FEFO தனிமைப்படுத்தல் இடர் தணிக்கை',
    titleAnalytics: 'சரக்கு பரிவர்த்தனை வேகம் & நுகர்வு பகுப்பாய்வு',
    titleClinicalTriage: 'மருத்துவ AI டிரையேஜ் நோயாளி பரிசோதனை அறிக்கை',
    subtitle: 'தானியங்கி மருத்துவ விநியோகச் சங்கிலி பகுப்பாய்வு, தேவை முன்கணிப்பு & ஸ்மார்ட் மறுவரிசை பரிந்துரைகள்',
    clinicalSubtitle: 'தானியங்கி நோயாளி இடர் வகைப்பாடு, மருத்துவக் கண்டுபிடிப்புகள் & வழிகாட்டுதல்கள்',
    generatedOn: 'உருவாக்கப்பட்ட தேதி',
    reportingPeriod: 'அறிக்கை காலம்',
    periodValue: 'கடந்த 30 நாட்கள் (சுழலும்)',
    protocol: 'இணக்க நெறிமுறை',
    protocolValue: 'FEFO (முதலில் காலாவதியாகும் மருந்து முதலில் வெளியேறும் முறை)',
    confidentiality: 'முற்றிலும் ரகசியமானது — அங்கீகரிக்கப்பட்ட மருந்தக உள் பயன்பாட்டிற்கு மட்டுமே',
    facilityLabel: 'சுகாதார மையம் / மருந்தகம்',
    defaultFacility: 'மெட்ரிக்ச் மத்திய மருத்துவமனை & மருந்தகம்',
    
    // Executive Summary
    execSummaryTitle: 'நிர்வாக சரக்கு சுகாதார சுருக்கம்',
    totalMedicines: 'கண்காணிக்கப்படும் மருந்துகள்',
    totalBatches: 'செயலில் உள்ள பேட்ச்கள்',
    totalStockUnits: 'மொத்த இருப்பு அலகுகள்',
    lowStock: 'குறைந்த இருப்பு (<20)',
    outOfStock: 'இருப்பு இல்லை (0)',
    expiringSoon: 'விரைவில் காலாவதி (<60d)',
    expiredQuarantine: 'காலாவதியானவை / தனிமைப்படுத்தல்',
    stockoutRisk: 'தீர்ந்துவிடும் ஆபத்து (<14d)',
    netVelocityDelta: '30 நாள் நிகர மாற்றம்',
    
    // Section 1: Urgent Attention
    attentionSectionTitle: '1. உடனடி மருத்துவ விநியோகச் சங்கிலி இடர்கள் & தனிமைப்படுத்தல்',
    attentionSectionDesc: 'உடனடி கொள்முதல், தனிமைப்படுத்தல் அல்லது விநியோக முன்னுரிமை தேவைப்படும் முக்கியமான இருப்பு எச்சரிக்கைகள்.',
    colMedicine: 'மருந்து & வடிவம்',
    colBatch: 'பேட்ச் #',
    colStock: 'கிடைக்கும் இருப்பு',
    colExpiry: 'காலாவதி தேதி',
    colSeverity: 'முக்கியத்துவம்',
    colAction: 'பரிந்துரைக்கப்பட்ட நடவடிக்கை / மருத்துவக் காரணம்',
    noAttentionItems: 'அனைத்து மருந்துகளும் தற்போது உகந்த நிலையில் உள்ளன. அவசர இடர்கள் எதுவும் கண்டறியப்படவில்லை.',
    statusExpired: 'காலாவதியானது',
    statusOutOfStock: 'இருப்பு இல்லை',
    statusCriticalLow: 'மிகக் குறைந்த இருப்பு',
    statusLowStock: 'குறைந்த இருப்பு',
    statusExpiringSoon: 'விரைவில் காலாவதி',

    // Attention dynamic reasons
    reasonExpiredBatch: 'FEFO விதிகளின்படி காலாவதியான தொகுதி தனிமைப்படுத்தப்பட்டது. உடனடி அகற்றல் / திரும்பப் பெறுதல் தேவை.',
    reasonOutOfStock: 'மருந்து முற்றிலும் தீர்ந்துவிட்டது. நோயாளிக்கு வழங்குவதில் தாமதம் ஏற்படுவதைத் தவிர்க்க உடனடி மறுவரிசை தேவை.',
    reasonCriticallyLow: (qty: number, days?: number) => `மிகக் குறைந்த இருப்பு (${qty} அலகுகள் மட்டுமே உள்ளன). ${days || 5} நாட்களுக்குள் தீர்ந்துவிடும் அபாயம்.`,
    reasonExpiringSoon: (days: number) => `${days} நாட்களில் காலாவதியாகிறது. FEFO முறையில் முதலில் நோயாளிகளுக்கு விநியோகிக்க முன்னுரிமை அளிக்கவும்.`,
    
    // Section 2: Purchase Recommendations
    purchaseSectionTitle: '2. அடுத்த மாத மருந்து கொள்முதல் பரிந்துரைகள்',
    purchaseSectionDesc: 'பயன்படுத்தக்கூடிய இருப்பு, நுகர்வு விகிதம் மற்றும் பாதுகாப்பு இருப்பு ஆகியவற்றின் அடிப்படையில் கணக்கிடப்பட்ட கொள்முதல் திட்டம்.',
    formulaLabel: 'சரிபார்க்கப்பட்ட கணித கொள்முதல் சூத்திரம்',
    formulaText: 'ஆர்டர் யூனிட்கள் = max(0, 30 நாள் தேவை கணிப்பு + பாதுகாப்பு இருப்பு (20) − பயன்படுத்தக்கூடிய இருப்பு − வரவிருக்கும் இருப்பு)',
    colForecastDemand: '30 நாள் தேவை',
    colSafetyStock: 'பாதுகாப்பு இலக்கு',
    colIncoming: 'உள்வருகை',
    colAdditionalUnits: 'வாங்க வேண்டியவை',
    colPacks: 'பரிந்துரைக்கப்பட்ட பேக்குகள்',
    colDaysLeft: 'இருப்பு நீடிக்கும் நாட்கள்',
    colPriority: 'முன்னுரிமை',
    colReason: 'கொள்முதல் காரணம் & இடர் மதிப்பீடு',
    priorityCritical: 'அவசரம்',
    priorityHigh: 'உயர் முன்னுரிமை',
    priorityMedium: 'நடுத்தர முன்னுரிமை',
    priorityOptimal: 'உகந்தது',
    noPurchaseNeeded: 'போதுமான இருப்பு உள்ளது (0 தேவை)',
    noPurchasePlanItems: 'தற்போதைய சரக்கு விதிகளுக்கு கொள்முதல் பரிந்துரைகள் எதுவும் இல்லை.',

    // Purchase plan dynamic reasons
    reasonImminentStockout: (runway: number) => `விரைவில் தீர்ந்துவிடும் ஆபத்து (${runway} நாட்கள் மட்டுமே நீடிக்கும்). தற்போதைய இருப்பு 30 நாள் தேவையைப் பூர்த்தி செய்யாது.`,
    reasonDemandExceeds: (forecast: number, usable: number) => `எதிர்பார்க்கப்படும் தேவை (${forecast}) இருப்பு அளவை (${usable}) விட அதிகம். பற்றாக்குறையைத் தவிர்க்க மறுவரிசை செய்யவும்.`,
    reasonBufferBreach: (buffer: number) => `அடுத்த மாதத்தில் இருப்பு ${buffer} யூனிட் பாதுகாப்பு வரம்பை விடக் குறையும்.`,
    reasonComfortableStock: (usable: number) => `தற்போதைய இருப்பு (${usable}) 30 நாள் தேவை மற்றும் பாதுகாப்பு இருப்பு இரண்டையும் போதுமான அளவு பூர்த்தி செய்கிறது.`,
    
    // Section 3: Analytics & Velocity
    analyticsSectionTitle: '3. சரக்கு பரிவர்த்தனை வேகம் & நுகர்வு பகுப்பாய்வு',
    analyticsSectionDesc: 'பெறப்பட்ட சரக்கு மற்றும் வழங்கப்பட்ட அலகுகளின் ஒப்பீட்டு பகுப்பாய்வு மற்றும் அதிக விற்பனையாகும் மருந்துகள்.',
    stockInLabel: 'மொத்த உள்வருகை (பெறப்பட்டது)',
    stockOutLabel: 'மொத்த வெளிச்செல்லல் (வழங்கப்பட்டது)',
    netDeltaLabel: 'நிகர சரக்கு இயக்கம்',
    topConsumedTitle: 'அதிகமாக விநியோகிக்கப்பட்ட மருந்துகள் (30 நாள் வேகம்)',
    unitsLabel: 'அலகுகள்',
    dispensedShare: 'வழங்கப்பட்ட அளவு',
    recentTransactionsTitle: 'சமீபத்திய 30 நாள் விநியோக பரிவர்த்தனை பதிவுகள்',
    colDate: 'தேதி & நேரம்',
    colType: 'வகை',
    colQty: 'அளவு',
    noTransactionsRecorded: 'இந்த காலத்திற்கு பரிவர்த்தனை பதிவுகள் எதுவும் இல்லை.',
    
    // Clinical Triage Report Specific
    patientDemographics: 'நோயாளி விவரங்கள்',
    patientAge: 'வயது',
    patientSex: 'பாலினம்',
    patientAllergies: 'அலர்ஜிகள்',
    symptomSummaryTitle: 'மருத்துவ அறிகுறிகள் & நிலை',
    symptomPrimary: 'முதன்மை அறிகுறி',
    symptomDuration: 'கால அளவு',
    symptomSeverity: 'தீவிரத்தன்மை அளவு',
    redFlagTitle: 'அவசர எச்சரிக்கை குறிகாட்டிகள் (Red Flags)',
    noRedFlags: 'அவசர சிகிச்சை தேவைப்படும் அபாய அறிகுறிகள் எதுவும் கண்டறியப்படவில்லை.',
    redFlagsDetected: 'அவசர எச்சரிக்கை: உடனடி மருத்துவ கவனிப்பு தேவைப்படும் ஆபத்து அறிகுறிகள் கண்டறியப்பட்டன.',
    clinicalAssessmentTitle: 'மருத்துவ AI மதிப்பீடு & பரிந்துரை',
    riskClassification: 'இடர் வகைப்பாடு',
    clinicalUrgency: 'அவசர நிலை',
    keyFindings: 'முக்கிய மருத்துவக் கண்டுபிடிப்புகள்',
    clinicalRecommendation: 'பரிந்துரைக்கப்பட்ட மருத்துவ நடவடிக்கை',
    triageCategory: 'மருத்துவ பிரிவு',
    disclaimerClinical: 'குறிப்பு: இந்த AI மருத்துவ மதிப்பீடு முதற்கட்ட வழிகாட்டுதலுக்கு மட்டுமே. இது தகுதிவாய்ந்த மருத்துவரின் நேரடி பரிசோதனைக்கு மாற்றாகாது.',
    signatureClinician: 'பரிசோதித்த மருத்துவர் / டிரையேஜ் அலுவலர்',

    // Sign-off & Footer
    auditSignOff: 'மருத்துவ விநியோகச் சங்கிலி தணிக்கை சரிபார்ப்பு',
    signOffNotice: 'இந்த தானியங்கி தணிக்கை அறிக்கை FEFO நெறிமுறைகளின் கீழ் பதிவு செய்யப்பட்ட பரிவர்த்தனை பதிவுகளிலிருந்து உருவாக்கப்பட்டது. கொள்முதல் செய்வதற்கு முன் இயற்பியல் இருப்பு சரிபார்க்கப்பட வேண்டும்.',
    signaturePharmacist: 'தலைமை மருந்தாளர் / அங்கீகரிக்கப்பட்ட கையொப்பம்',
    signatureDate: 'சரிபார்க்கப்பட்ட தேதி',
    facilityStamp: 'மருந்தக முத்திரை & சான்றிதழ்',
    footerBrand: 'மெட்ரிக்ச் AI மெடிக்கல் இன்வென்டரி OS — உயர் நம்பகத்தன்மை கொண்ட தன்னாட்சி மருந்தக கட்டமைப்பு',
  },
  hi: {
    facilityName: 'मेड्रिक्स हेल्थकेयर एवं फ़ार्मेसी नेटवर्क',
    systemTag: 'AI ट्राइएज एवं इन्वेंटरी इंटेलिजेंस',
    titleComprehensive: 'AI ट्राइएज व्यापक इन्वेंटरी स्वास्थ्य एवं खरीद रिपोर्ट',
    titlePurchasePlan: 'अगले महीने की दवा खरीद योजना एवं मांग पूर्वानुमान',
    titleExpiryRisk: 'दवा समाप्ति एवं FEFO क्वारंटाइन जोखिम ऑडिट',
    titleAnalytics: 'इन्वेंटरी संचलन गति एवं खपत विश्लेषण',
    titleClinicalTriage: 'क्लिनिकल AI ट्राइएज रोगी निदान एवं मूल्यांकन रिपोर्ट',
    subtitle: 'स्वचालित क्लिनिकल आपूर्ति श्रृंखला विश्लेषण, मांग पूर्वानुमान एवं स्मार्ट रीऑर्डर भविष्यवाणियां',
    clinicalSubtitle: 'स्वचालित रोगी जोखिम वर्गीकरण, नैदानिक निष्कर्ष एवं प्रोटोकॉल निर्देश',
    generatedOn: 'जनरेट करने की तिथि',
    reportingPeriod: 'रिपोर्टिंग अवधि',
    periodValue: 'पिछले 30 दिन (रोलिंग)',
    protocol: 'अनुपालन प्रोटोकॉल',
    protocolValue: 'FEFO (प्रथम समाप्ति, प्रथम निकास) सत्यापित',
    confidentiality: 'कड़ाई से गोपनीय — केवल अधिकृत स्वास्थ्य सेवा एवं फ़ार्मेसी इन्वेंटरी नियंत्रण हेतु',
    facilityLabel: 'स्वास्थ्य सेवा संस्थान',
    defaultFacility: 'मेड्रिक्स सेंट्रल फ़ार्मेसी एवं क्लिनिक',
    
    // Executive Summary
    execSummaryTitle: 'कार्यकारी इन्वेंटरी स्वास्थ्य सारांश',
    totalMedicines: 'ट्रैक की गई दवाएं',
    totalBatches: 'सक्रिय बैच',
    totalStockUnits: 'स्टॉक में कुल इकाइयां',
    lowStock: 'कम स्टॉक (<20)',
    outOfStock: 'स्टॉक समाप्त (0)',
    expiringSoon: 'जल्द समाप्त (<60d)',
    expiredQuarantine: 'समाप्त / क्वारंटाइन',
    stockoutRisk: 'आसन्न स्टॉक समाप्ति (<14d)',
    netVelocityDelta: '30-दिवसीय शुद्ध परिवर्तन',
    
    // Section 1: Urgent Attention
    attentionSectionTitle: '1. तत्काल क्लिनिकल आपूर्ति-श्रृंखला जोखिम एवं क्वारंटाइन वस्तुएं',
    attentionSectionDesc: 'महत्वपूर्ण इन्वेंटरी अलर्ट जिनके लिए तत्काल खरीद, क्वारंटाइन अलगाव या वितरण प्राथमिकता आवश्यक है।',
    colMedicine: 'दवा एवं खुराक रूप',
    colBatch: 'बैच #',
    colStock: 'उपलब्ध स्टॉक',
    colExpiry: 'समाप्ति तिथि',
    colSeverity: 'गंभीरता स्तर',
    colAction: 'अनुशंसित कार्रवाई / नैदानिक तर्क',
    noAttentionItems: 'वर्तमान में सभी इन्वेंटरी वस्तुएं इष्टतम स्थिति में हैं। कोई गंभीर जोखिम नहीं पाया गया।',
    statusExpired: 'समाप्त',
    statusOutOfStock: 'स्टॉक समाप्त',
    statusCriticalLow: 'अति न्यून स्टॉक',
    statusLowStock: 'कम स्टॉक',
    statusExpiringSoon: 'शीघ्र समाप्त',

    // Attention dynamic reasons
    reasonExpiredBatch: 'FEFO नियमों के तहत समाप्त बैच को क्वारंटाइन किया गया। तत्काल निपटान या वापसी आवश्यक।',
    reasonOutOfStock: 'स्टॉक पूर्णतः समाप्त। वितरण में देरी से बचने हेतु तत्काल रीऑर्डर आपातकालीन स्थिति।',
    reasonCriticallyLow: (qty: number, days?: number) => `अति न्यून स्टॉक (केवल ${qty} इकाइयां शेष)। ${days || 5} दिनों के भीतर पूर्ण समाप्ति का खतरा।`,
    reasonExpiringSoon: (days: number) => `${days} दिनों में समाप्त हो रहा है। FEFO के तहत पहले वितरण हेतु प्राथमिकता दें।`,
    
    // Section 2: Purchase Recommendations
    purchaseSectionTitle: '2. अगले महीने के लिए दवा खरीद सिफारिशें',
    purchaseSectionDesc: 'उपयोग योग्य गैर-समाप्त इन्वेंटरी, दर्ज खपत दर और सुरक्षा बफ़र से परिकलित बुद्धिमान खरीद पूर्वानुमान।',
    formulaLabel: 'सत्यापित गणितीय खरीद सूत्र',
    formulaText: 'ऑर्डर इकाइयां = max(0, 30-दिवसीय मांग पूर्वानुमान + सुरक्षा स्टॉक (20) − उपयोग योग्य वर्तमान स्टॉक − सत्यापित आवक स्टॉक)',
    colForecastDemand: '30-दिवसीय मांग',
    colSafetyStock: 'सुरक्षा लक्ष्य',
    colIncoming: 'आवक स्टॉक',
    colAdditionalUnits: 'खरीदने हेतु इकाइयां',
    colPacks: 'अनुशंसित पैक',
    colDaysLeft: 'स्टॉक रनवे',
    colPriority: 'प्राथमिकता',
    colReason: 'खरीद तर्क एवं जोखिम मूल्यांकन',
    priorityCritical: 'गंभीर',
    priorityHigh: 'उच्च',
    priorityMedium: 'मध्यम',
    priorityOptimal: 'इष्टतम',
    noPurchaseNeeded: 'पूर्णतः स्टॉक में (0 आवश्यक)',
    noPurchasePlanItems: 'वर्तमान इन्वेंटरी मापदंडों के लिए कोई खरीद सिफारिश नहीं मिली।',

    // Purchase plan dynamic reasons
    reasonImminentStockout: (runway: number) => `आसन्न स्टॉक समाप्ति (${runway} दिन का रनवे)। वर्तमान स्टॉक 30 दिनों की मांग को पूरा करने में असमर्थ है।`,
    reasonDemandExceeds: (forecast: number, usable: number) => `अनुमानित मांग (${forecast}) उपलब्ध स्टॉक (${usable}) से अधिक है। स्टॉक समाप्ति से बचने हेतु रीऑर्डर करें।`,
    reasonBufferBreach: (buffer: number) => `अगले महीने के दौरान स्टॉक ${buffer}-यूनिट सुरक्षा बफ़र से नीचे चला जाएगा।`,
    reasonComfortableStock: (usable: number) => `वर्तमान स्टॉक (${usable}) अनुमानित 30-दिवसीय मांग और सुरक्षा बफ़र को आसानी से पूरा करता है।`,
    
    // Section 3: Analytics & Velocity
    analyticsSectionTitle: '3. इन्वेंटरी संचलन गति एवं खपत विश्लेषण',
    analyticsSectionDesc: 'प्राप्त इन्वेंटरी बनाम वितरित इकाइयों और शीर्ष गति वाली दवाओं का तुलनात्मक विश्लेषण।',
    stockInLabel: 'कुल आवक (प्राप्त)',
    stockOutLabel: 'कुल निकासी (वितरित)',
    netDeltaLabel: 'शुद्ध इन्वेंटरी संचलन',
    topConsumedTitle: 'शीर्ष वितरित दवाएं (30-दिवसीय गति)',
    unitsLabel: 'इकाइयां',
    dispensedShare: 'वितरित मात्रा',
    recentTransactionsTitle: 'हाल के 30-दिवसीय वितरण लेनदेन लॉग',
    colDate: 'दिनांक एवं समय',
    colType: 'प्रकार',
    colQty: 'मात्रा',
    noTransactionsRecorded: 'इस अवधि के लिए कोई वितरण लेनदेन लॉग दर्ज नहीं है।',
    
    // Clinical Triage Report Specific
    patientDemographics: 'रोगी जनसांख्यिकी विवरण',
    patientAge: 'आयु',
    patientSex: 'लिंग',
    patientAllergies: 'ज्ञात एलर्जी',
    symptomSummaryTitle: 'नैदानिक लक्षण एवं स्थिति',
    symptomPrimary: 'प्राथमिक लक्षण',
    symptomDuration: 'अवधि',
    symptomSeverity: 'गंभीरता स्तर',
    redFlagTitle: 'आपातकालीन चेतावनी संकेत (Red Flags)',
    noRedFlags: 'प्रवेश स्क्रीनिंग के दौरान कोई गंभीर आपातकालीन लक्षण नहीं पाए गए।',
    redFlagsDetected: 'आपातकालीन चेतावनी: तत्काल चिकित्सा ध्यान देने योग्य गंभीर संकेत पाए गए।',
    clinicalAssessmentTitle: 'क्लिनिकल AI मूल्यांकन एवं सिफारिशें',
    riskClassification: 'जोखिम वर्गीकरण',
    clinicalUrgency: 'नैदानिक तात्कालिकता स्तर',
    keyFindings: 'मुख्य नैदानिक निष्कर्ष',
    clinicalRecommendation: 'अनुशंसित नैदानिक कार्रवाई',
    triageCategory: 'चिकित्सा विशेषता श्रेणी',
    disclaimerClinical: 'सूचना: यह क्लिनिकल AI ट्राइएज मूल्यांकन बताए गए लक्षणों पर आधारित प्रारंभिक विश्लेषण है। यह किसी लाइसेंस प्राप्त चिकित्सक के परामर्श का विकल्प नहीं है।',
    signatureClinician: 'परीक्षक चिकित्सक / ट्राइएज अधिकारी',

    // Sign-off & Footer
    auditSignOff: 'क्लिनिकल आपूर्ति श्रृंखला ऑडिट सत्यापन',
    signOffNotice: 'यह स्वचालित ऑडिट रिपोर्ट FEFO प्रोटोकॉल के तहत सत्यापित डेटाबेस बैच रिकॉर्ड और लेनदेन लॉग से जनरेट की गई है। सप्लायर खरीद ऑर्डर से पहले भौतिक शेल्फ स्टॉक का सत्यापन आवश्यक है।',
    signaturePharmacist: 'मुख्य फार्मासिस्ट / अधिकृत हस्ताक्षर',
    signatureDate: 'सत्यापन तिथि',
    facilityStamp: 'संस्थान मुहर एवं प्रमाणन',
    footerBrand: 'मेड्रिक्स AI मेडिकल इन्वेंटरी OS — उच्च-विश्वसनीयता स्वायत्त फ़ार्मेसी अवसंरचना',
  },
};

/**
 * Robust locale resolution with automatic fallback to English
 */
export function getReportTranslations(language: string = 'en') {
  const normalized = (language || 'en').toLowerCase().split(/[-_]/)[0];
  const base = REPORT_TRANSLATIONS.en;
  const target = (REPORT_TRANSLATIONS as any)[normalized] || {};
  return { ...base, ...target };
}

// Helper to escape HTML safely
export function escapeHtml(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Generate inline SVG Bar Chart for Stock Movement Velocity
export function renderVelocitySvg(stockIn: number, stockOut: number, strings: any): string {
  const maxVal = Math.max(stockIn, stockOut, 1);
  const inWidth = Math.round((stockIn / maxVal) * 280);
  const outWidth = Math.round((stockOut / maxVal) * 280);
  const netDelta = stockIn - stockOut;

  return `
    <svg width="100%" height="150" viewBox="0 0 520 150" style="background: #F8FAFC; border-radius: 8px; border: 1px solid #E2E8F0; padding: 12px; font-family: inherit;">
      <!-- Stock In Bar -->
      <text x="16" y="32" font-size="12" font-weight="600" fill="#1E293B">${escapeHtml(strings.stockInLabel)}</text>
      <rect x="16" y="42" width="300" height="20" rx="4" fill="#E2E8F0" />
      <rect x="16" y="42" width="${Math.max(inWidth, 4)}" height="20" rx="4" fill="#2563EB" />
      <text x="328" y="57" font-size="13" font-weight="700" fill="#2563EB">+${stockIn} ${escapeHtml(strings.unitsLabel)}</text>

      <!-- Stock Out Bar -->
      <text x="16" y="90" font-size="12" font-weight="600" fill="#1E293B">${escapeHtml(strings.stockOutLabel)}</text>
      <rect x="16" y="100" width="300" height="20" rx="4" fill="#E2E8F0" />
      <rect x="16" y="100" width="${Math.max(outWidth, 4)}" height="20" rx="4" fill="#3B82F6" />
      <text x="328" y="115" font-size="13" font-weight="700" fill="#3B82F6">-${stockOut} ${escapeHtml(strings.unitsLabel)}</text>

      <!-- Net Delta Indicator -->
      <rect x="420" y="38" width="86" height="84" rx="8" fill="${netDelta >= 0 ? '#EFF6FF' : '#FEF2F2'}" stroke="${netDelta >= 0 ? '#BFDBFE' : '#FECACA'}" />
      <text x="463" y="62" font-size="10" font-weight="700" text-anchor="middle" fill="${netDelta >= 0 ? '#1E40AF' : '#991B1B'}">NET DELTA</text>
      <text x="463" y="90" font-size="18" font-weight="800" text-anchor="middle" fill="${netDelta >= 0 ? '#2563EB' : '#DC2626'}">${netDelta >= 0 ? `+${netDelta}` : netDelta}</text>
      <text x="463" y="106" font-size="9" text-anchor="middle" fill="#64748B">${escapeHtml(strings.unitsLabel)}</text>
    </svg>
  `;
}

// Generate inline SVG Horizontal Bars for Top Consumed Medicines
export function renderTopMedicinesSvg(topList: { name: string; qty: number }[], strings: any): string {
  if (topList.length === 0) {
    return `<div style="padding: 16px; background: #F8FAFC; border-radius: 8px; text-align: center; color: #64748B; font-size: 9pt;">${escapeHtml(strings.noTransactionsRecorded)}</div>`;
  }

  const maxQty = Math.max(...topList.map(t => t.qty), 1);
  const barHeight = 24;
  const gap = 16;
  const svgHeight = Math.max(120, topList.length * (barHeight + gap) + 30);

  const rows = topList.map((item, idx) => {
    const yPos = 24 + idx * (barHeight + gap);
    const barWidth = Math.round((item.qty / maxQty) * 240);
    const colors = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD'];
    const barColor = colors[idx % colors.length];

    return `
      <text x="16" y="${yPos - 4}" font-size="11" font-weight="600" fill="#0F172A">${escapeHtml(item.name.slice(0, 26))}</text>
      <rect x="16" y="${yPos}" width="260" height="${barHeight - 6}" rx="4" fill="#E2E8F0" />
      <rect x="16" y="${yPos}" width="${Math.max(barWidth, 4)}" height="${barHeight - 6}" rx="4" fill="${barColor}" />
      <text x="286" y="${yPos + 13}" font-size="11" font-weight="700" fill="#1E293B">${item.qty} ${escapeHtml(strings.unitsLabel)}</text>
    `;
  }).join('');

  return `
    <svg width="100%" height="${svgHeight}" viewBox="0 0 520 ${svgHeight}" style="background: #F8FAFC; border-radius: 8px; border: 1px solid #E2E8F0; padding: 12px; font-family: inherit;">
      ${rows}
    </svg>
  `;
}

// ============================================================
// CORE DATA PREPARATION & REPORT HTML BUILDER
// ============================================================
export async function buildReportHtml(
  mode: ReportMode,
  customTitle?: string,
  language: string = 'en',
  extraData?: any
): Promise<{ html: string; defaultFilename: string }> {
  // 1. Fetch authorized user metadata for hospital/facility name
  let facilityName = '';
  try {
    const user = await AuthHelpers.getCurrentUser();
    if (user?.user_metadata?.hospital_name) {
      facilityName = user.user_metadata.hospital_name;
    }
  } catch {
    // Graceful fallback to default facility
  }

  // 2. Fetch inventory and transactions data (for inventory reports)
  let inventory: InventoryItem[] = [];
  let transactions: any[] = [];
  if (mode !== 'clinical_triage') {
    try {
      const [invRes, txRes] = await Promise.all([
        Database.getInventory(),
        Database.getInventoryTransactions(),
      ]);
      inventory = invRes.data || [];
      transactions = txRes.data || [];
    } catch (err) {
      console.warn('Error fetching inventory data for report:', err);
    }
  }

  const s = getReportTranslations(language);
  if (!facilityName) {
    facilityName = s.defaultFacility;
  }

  const now = new Date();
  const dateLocale = language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
  const dateStr = now.toLocaleDateString(dateLocale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString(dateLocale, {
    hour: '2-digit',
    minute: '2-digit',
  });
  const isoDate = now.toISOString().split('T')[0];

  // ------------------------------------------------------------
  // CLINICAL TRIAGE ASSESSMENT REPORT BUILDER
  // ------------------------------------------------------------
  if (mode === 'clinical_triage') {
    const clinData: ClinicalAssessmentData = extraData || {
      patient: {},
      symptoms: {},
      redFlags: [],
      assessment: {},
    };

    const reportMainTitle = customTitle || s.titleClinicalTriage;
    const defaultFilename = `Medtrix_Clinical_Triage_Assessment_${isoDate}.pdf`;

    const risk = clinData.assessment?.riskLevel || 'Moderate';
    const isHighRisk = risk.toLowerCase() === 'high' || (clinData.redFlags && clinData.redFlags.length > 0);
    const riskBadgeClass = isHighRisk ? 'badge-critical' : 'badge-high';

    const html = `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(reportMainTitle)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Sans+Tamil:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm 16mm 14mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Noto Sans', 'Noto Sans Tamil', 'Noto Sans Devanagari', 'Nirmala UI', 'Kohinoor Tamil', 'Kohinoor Devanagari', 'Latha', 'Mangal', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0F172A;
      background: #FFFFFF;
      margin: 0;
      padding: 0;
      font-size: 10pt;
      line-height: 1.5;
    }
    .avoid-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .header-banner {
      background: #0D1117;
      color: #FFFFFF;
      border-radius: 12px;
      padding: 20px 24px;
      margin-bottom: 20px;
      border-left: 6px solid #2563EB;
    }
    .brand-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      border-bottom: 1px solid #1E293B;
      padding-bottom: 10px;
    }
    .brand-title {
      font-size: 13pt;
      font-weight: 800;
      letter-spacing: 1px;
      color: #60A5FA;
      margin: 0;
    }
    .system-pill {
      background: #111827;
      border: 1px solid #3B82F6;
      color: #93C5FD;
      font-size: 7.5pt;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .report-title {
      font-size: 16pt;
      font-weight: 800;
      color: #FFFFFF;
      margin: 4px 0 6px 0;
      line-height: 1.3;
    }
    .report-sub {
      font-size: 9pt;
      color: #CBD5E1;
      margin: 0 0 14px 0;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      background: #111827;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 8pt;
      border: 1px solid #1E293B;
    }
    .meta-cell-label {
      color: #94A3B8;
      font-weight: 500;
      text-transform: uppercase;
      font-size: 7pt;
      margin-bottom: 2px;
    }
    .meta-cell-value {
      color: #FFFFFF;
      font-weight: 700;
      word-break: break-word;
    }
    .section-title {
      font-size: 12pt;
      font-weight: 700;
      color: #0F172A;
      margin: 22px 0 6px 0;
      display: flex;
      align-items: center;
      border-bottom: 2px solid #2563EB;
      padding-bottom: 6px;
      page-break-after: avoid;
      break-after: avoid;
    }
    .card-box {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 14px;
      margin-bottom: 16px;
    }
    .card-box-danger {
      background: #FEF2F2;
      border-color: #FECACA;
    }
    .field-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px dashed #E2E8F0;
      font-size: 9pt;
    }
    .field-row:last-child {
      border-bottom: none;
    }
    .field-label {
      font-weight: 600;
      color: #475569;
    }
    .field-val {
      font-weight: 700;
      color: #0F172A;
    }
    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 8pt;
      font-weight: 700;
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }
    .badge-critical { background: #FFE4E6; color: #BE123C; border: 1px solid #FDA4AF; }
    .badge-high { background: #FEF3C7; color: #B45309; border: 1px solid #FCD34D; }
    .badge-medium { background: #DBEAFE; color: #1D4ED8; border: 1px solid #93C5FD; }
    .badge-healthy { background: #D1FAE5; color: #047857; border: 1px solid #6EE7B7; }
    .sign-off-box {
      border: 1px solid #CBD5E1;
      border-radius: 8px;
      padding: 14px;
      background: #F8FAFC;
      margin-top: 24px;
      font-size: 8pt;
    }
    .sign-off-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 16px;
      margin-top: 14px;
      align-items: end;
    }
    .signature-line {
      border-bottom: 1px solid #475569;
      height: 32px;
      margin-bottom: 4px;
    }
    .footer-note {
      text-align: center;
      margin-top: 20px;
      font-size: 7.5pt;
      color: #64748B;
      border-top: 1px solid #E2E8F0;
      padding-top: 8px;
    }
  </style>
</head>
<body>

  <!-- HEADER BRANDING -->
  <div class="header-banner">
    <div class="brand-row">
      <div class="brand-title">MEDTRIX</div>
      <div class="system-pill">${escapeHtml(s.systemTag)}</div>
    </div>
    <div class="report-title">${escapeHtml(reportMainTitle)}</div>
    <div class="report-sub">${escapeHtml(s.clinicalSubtitle)}</div>

    <div class="meta-grid">
      <div>
        <div class="meta-cell-label">${escapeHtml(s.facilityLabel)}</div>
        <div class="meta-cell-value">${escapeHtml(facilityName)}</div>
      </div>
      <div>
        <div class="meta-cell-label">${escapeHtml(s.generatedOn)}</div>
        <div class="meta-cell-value">${escapeHtml(dateStr)} ${escapeHtml(timeStr)}</div>
      </div>
      <div>
        <div class="meta-cell-label">${escapeHtml(s.triageCategory)}</div>
        <div class="meta-cell-value">${escapeHtml(clinData.assessment?.category || 'General Medicine')}</div>
      </div>
      <div>
        <div class="meta-cell-label">${escapeHtml(s.riskClassification)}</div>
        <div class="meta-cell-value"><span class="badge ${riskBadgeClass}">${escapeHtml(risk.toUpperCase())}</span></div>
      </div>
    </div>
  </div>

  <!-- PATIENT DEMOGRAPHICS -->
  <div class="avoid-break">
    <div class="section-title">${escapeHtml(s.patientDemographics)}</div>
    <div class="card-box">
      <div class="field-row">
        <span class="field-label">${escapeHtml(s.patientAge)}:</span>
        <span class="field-val">${escapeHtml(clinData.patient.age || '—')}</span>
      </div>
      <div class="field-row">
        <span class="field-label">${escapeHtml(s.patientSex)}:</span>
        <span class="field-val">${escapeHtml(clinData.patient.sex || '—')}</span>
      </div>
      <div class="field-row">
        <span class="field-label">${escapeHtml(s.patientAllergies)}:</span>
        <span class="field-val" style="color: ${clinData.patient.allergies ? '#DC2626' : '#0F172A'};">${escapeHtml(clinData.patient.allergies || 'None Recorded')}</span>
      </div>
    </div>
  </div>

  <!-- SYMPTOMS & CLINICAL PRESENTATION -->
  <div class="avoid-break">
    <div class="section-title">${escapeHtml(s.symptomSummaryTitle)}</div>
    <div class="card-box">
      <div class="field-row">
        <span class="field-label">${escapeHtml(s.symptomPrimary)}:</span>
        <span class="field-val">${escapeHtml(clinData.symptoms.main || '—')}</span>
      </div>
      <div class="field-row">
        <span class="field-label">${escapeHtml(s.symptomDuration)}:</span>
        <span class="field-val">${escapeHtml(clinData.symptoms.duration || '—')}</span>
      </div>
      <div class="field-row">
        <span class="field-label">${escapeHtml(s.symptomSeverity)}:</span>
        <span class="field-val">${clinData.symptoms.severity ?? 5} / 10</span>
      </div>
    </div>
  </div>

  <!-- RED FLAG SCREENING -->
  <div class="avoid-break">
    <div class="section-title">${escapeHtml(s.redFlagTitle)}</div>
    <div class="card-box ${isHighRisk ? 'card-box-danger' : ''}">
      ${clinData.redFlags && clinData.redFlags.length > 0 ? `
        <div style="font-weight: 700; color: #DC2626; margin-bottom: 8px;">⚠️ ${escapeHtml(s.redFlagsDetected)}</div>
        <ul style="margin: 0; padding-left: 20px; color: #991B1B; font-weight: 600; font-size: 8.5pt;">
          ${clinData.redFlags.map(rf => `<li>${escapeHtml(rf)}</li>`).join('')}
        </ul>
      ` : `
        <div style="color: #166534; font-size: 8.5pt; font-weight: 500;">✓ ${escapeHtml(s.noRedFlags)}</div>
      `}
    </div>
  </div>

  <!-- CLINICAL ASSESSMENT & ACTION -->
  <div class="avoid-break">
    <div class="section-title">${escapeHtml(s.clinicalAssessmentTitle)}</div>
    <div class="card-box" style="border-left: 4px solid ${isHighRisk ? '#DC2626' : '#2563EB'};">
      <div style="margin-bottom: 12px;">
        <div style="font-size: 8pt; font-weight: 600; text-transform: uppercase; color: #64748B; margin-bottom: 2px;">${escapeHtml(s.keyFindings)}</div>
        <div style="font-size: 9.5pt; font-weight: 500; color: #1E293B;">${escapeHtml(clinData.assessment?.findings || 'Patient assessment completed under standard triage protocol.')}</div>
      </div>
      <div>
        <div style="font-size: 8pt; font-weight: 600; text-transform: uppercase; color: #64748B; margin-bottom: 2px;">${escapeHtml(s.clinicalRecommendation)}</div>
        <div style="font-size: 10pt; font-weight: 700; color: ${isHighRisk ? '#DC2626' : '#2563EB'};">${escapeHtml(clinData.assessment?.recommendation || 'Standard clinical observation and follow-up recommended.')}</div>
      </div>
    </div>
  </div>

  <!-- CLINICAL DISCLAIMER & SIGN-OFF -->
  <div class="avoid-break sign-off-box">
    <div style="font-weight: 700; font-size: 8.5pt; color: #0F172A; margin-bottom: 4px;">${escapeHtml(s.disclaimerClinical)}</div>
    <div class="sign-off-grid">
      <div>
        <div class="signature-line"></div>
        <div style="font-size: 7.5pt; color: #64748B;">${escapeHtml(s.signatureClinician)}</div>
      </div>
      <div>
        <div class="signature-line"></div>
        <div style="font-size: 7.5pt; color: #64748B;">${escapeHtml(s.signatureDate)}</div>
      </div>
      <div>
        <div class="signature-line"></div>
        <div style="font-size: 7.5pt; color: #64748B;">${escapeHtml(s.facilityStamp)}</div>
      </div>
    </div>
  </div>

  <div class="footer-note">
    <strong>${escapeHtml(s.confidentiality)}</strong><br />
    ${escapeHtml(s.footerBrand)} • ${escapeHtml(dateStr)} ${escapeHtml(timeStr)}
  </div>

</body>
</html>
    `;

    return { html, defaultFilename };
  }

  // ------------------------------------------------------------
  // INVENTORY TRIAGE DATA AGGREGATION & ENGINE
  // ------------------------------------------------------------
  const dayMs = 24 * 60 * 60 * 1000;
  const tx30d = transactions.filter((t) => (now.getTime() - new Date(t.created_at).getTime()) <= 30 * dayMs);
  let totalStockIn = 0;
  let totalStockOut = 0;
  const medUsageMap: Record<string, { stockOut: number; txCount: number; name: string }> = {};

  tx30d.forEach((t) => {
    const qty = Math.abs(t.quantity || 0);
    if (t.transaction_type === 'stock_in') totalStockIn += qty;
    else if (t.transaction_type === 'stock_out') {
      totalStockOut += qty;
      const mId = t.medicine_id || 'unknown';
      if (!medUsageMap[mId]) {
        medUsageMap[mId] = { stockOut: 0, txCount: 0, name: t.medicines?.name || 'Medicine' };
      }
      medUsageMap[mId].stockOut += qty;
      medUsageMap[mId].txCount += 1;
    }
  });

  // Top consumed medicines
  const topConsumed = Object.values(medUsageMap)
    .sort((a, b) => b.stockOut - a.stockOut)
    .slice(0, 4)
    .map((item) => ({ name: item.name, qty: item.stockOut }));

  // Health Metrics
  const uniqueMeds = new Set(inventory.map((i) => i.name.toLowerCase().trim()));
  let totalStockUnits = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  let expiringSoonCount = 0;
  let expiredBatchesCount = 0;
  let stockoutRiskCount = 0;

  const sixtyDaysFromNow = new Date();
  sixtyDaysFromNow.setDate(now.getDate() + 60);

  const attentionList: {
    medicineName: string;
    strength?: string;
    batchNumber?: string;
    quantity: number;
    expiryDate?: string;
    daysRemaining?: number;
    severityLabel: string;
    severityClass: string;
    reason: string;
  }[] = [];

  inventory.forEach((item) => {
    const qty = item.quantity || 0;
    totalStockUnits += qty;
    let isExpired = false;
    let isExpiringSoon = false;
    let daysRemaining: number | undefined;

    if (item.expiryDate) {
      const parts = item.expiryDate.split(/[\/-]/);
      let expDate: Date | null = null;
      if (parts.length === 2) {
        const m = parseInt(parts[0], 10);
        const y = parseInt(parts[1], 10) + (parseInt(parts[1], 10) < 100 ? 2000 : 0);
        expDate = new Date(y, m, 0);
      } else if (parts.length === 3) {
        expDate = new Date(item.expiryDate);
      }
      if (expDate && !isNaN(expDate.getTime())) {
        const diffMs = expDate.getTime() - now.getTime();
        daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (expDate < now) isExpired = true;
        else if (expDate <= sixtyDaysFromNow) isExpiringSoon = true;
      }
    }

    if (isExpired) expiredBatchesCount++;
    else if (isExpiringSoon || item.status === 'expiring') expiringSoonCount++;

    if (qty === 0) outOfStockCount++;
    else if (item.status === 'low' || item.status === 'critical' || qty <= 20) lowStockCount++;

    const usage = medUsageMap[item.medicineId]?.stockOut || 0;
    const daily = usage / 30;
    if (daily > 0 && qty / daily < 14 && qty > 0) stockoutRiskCount++;

    // Localized attention reasons
    if (isExpired) {
      attentionList.push({
        medicineName: item.name,
        strength: item.strength || undefined,
        batchNumber: item.batchNumber,
        quantity: qty,
        expiryDate: item.expiryDate || 'N/A',
        daysRemaining,
        severityLabel: s.statusExpired,
        severityClass: 'badge-expired',
        reason: s.reasonExpiredBatch,
      });
    } else if (qty === 0) {
      attentionList.push({
        medicineName: item.name,
        strength: item.strength || undefined,
        batchNumber: item.batchNumber,
        quantity: 0,
        severityLabel: s.statusOutOfStock,
        severityClass: 'badge-critical',
        reason: s.reasonOutOfStock,
      });
    } else if (item.status === 'critical' || qty <= 10) {
      attentionList.push({
        medicineName: item.name,
        strength: item.strength || undefined,
        batchNumber: item.batchNumber,
        quantity: qty,
        expiryDate: item.expiryDate || 'N/A',
        daysRemaining,
        severityLabel: s.statusCriticalLow,
        severityClass: 'badge-critical',
        reason: s.reasonCriticallyLow(qty, daysRemaining),
      });
    } else if (isExpiringSoon) {
      attentionList.push({
        medicineName: item.name,
        strength: item.strength || undefined,
        batchNumber: item.batchNumber,
        quantity: qty,
        expiryDate: item.expiryDate || 'N/A',
        daysRemaining,
        severityLabel: s.statusExpiringSoon,
        severityClass: 'badge-warning',
        reason: s.reasonExpiringSoon(daysRemaining ?? 45),
      });
    }
  });

  // Next Month Medicine Purchase Recommendations Engine
  const SAFETY_STOCK = 20;
  const medGroupMap: Record<string, {
    items: InventoryItem[];
    name: string;
    generic?: string;
    strength?: string;
    form?: string;
    packSize?: number;
    usableStock: number;
    expiredStock: number;
    earliestExpiry?: string;
  }> = {};

  inventory.forEach((item) => {
    const key = item.medicineId || item.name.toLowerCase().trim();
    if (!medGroupMap[key]) {
      medGroupMap[key] = {
        items: [],
        name: item.name,
        generic: item.genericName || undefined,
        strength: item.strength || undefined,
        form: item.form || undefined,
        packSize: item.packSize || item.unitsPerStrip || undefined,
        usableStock: 0,
        expiredStock: 0,
      };
    }
    medGroupMap[key].items.push(item);

    let isExpired = false;
    if (item.expiryDate) {
      const parts = item.expiryDate.split(/[\/-]/);
      let expDate: Date | null = null;
      if (parts.length === 2) {
        const m = parseInt(parts[0], 10);
        const y = parseInt(parts[1], 10) + (parseInt(parts[1], 10) < 100 ? 2000 : 0);
        expDate = new Date(y, m, 0);
      } else if (parts.length === 3) {
        expDate = new Date(item.expiryDate);
      }
      if (expDate && !isNaN(expDate.getTime()) && expDate < now) {
        isExpired = true;
      }
    }

    if (isExpired) medGroupMap[key].expiredStock += (item.quantity || 0);
    else medGroupMap[key].usableStock += (item.quantity || 0);
  });

  const purchasePlans: {
    medicineName: string;
    generic?: string;
    strength?: string;
    form?: string;
    unit: string;
    usableStock: number;
    forecastDemand: number;
    safetyStock: number;
    incoming: number;
    additionalUnits: number;
    suggestedPacks?: number;
    daysRunway: number;
    priority: string;
    priorityClass: string;
    reason: string;
  }[] = [];

  Object.values(medGroupMap).forEach((group) => {
    let medStockOut = 0;
    group.items.forEach((it) => {
      if (medUsageMap[it.medicineId]) medStockOut += medUsageMap[it.medicineId].stockOut;
    });

    const forecastDemand = medStockOut > 0 ? medStockOut : 15;
    const incoming = 0;
    const usable = group.usableStock;
    const additionalUnits = Math.max(0, forecastDemand + SAFETY_STOCK - usable - incoming);

    let suggestedPacks: number | undefined;
    if (group.packSize && group.packSize > 1 && additionalUnits > 0) {
      suggestedPacks = Math.ceil(additionalUnits / group.packSize);
    }

    const dailyUsage = forecastDemand / 30;
    const daysRunway = dailyUsage > 0 ? Math.floor(usable / dailyUsage) : (usable > 0 ? 999 : 0);

    let priority = s.priorityMedium;
    let priorityClass = 'badge-medium';
    let reason = '';

    if (usable === 0 || daysRunway < 7) {
      priority = s.priorityCritical;
      priorityClass = 'badge-critical';
      reason = s.reasonImminentStockout(daysRunway);
    } else if (daysRunway < 30 || forecastDemand > usable) {
      priority = s.priorityHigh;
      priorityClass = 'badge-high';
      reason = s.reasonDemandExceeds(forecastDemand, usable);
    } else if (additionalUnits > 0) {
      priority = s.priorityMedium;
      priorityClass = 'badge-medium';
      reason = s.reasonBufferBreach(SAFETY_STOCK);
    } else {
      priority = s.priorityOptimal;
      priorityClass = 'badge-optimal';
      reason = s.reasonComfortableStock(usable);
    }

    purchasePlans.push({
      medicineName: group.name,
      generic: group.generic,
      strength: group.strength,
      form: group.form,
      unit: group.form ? `${group.form.toLowerCase()}s` : s.unitsLabel,
      usableStock: usable,
      forecastDemand,
      safetyStock: SAFETY_STOCK,
      incoming,
      additionalUnits,
      suggestedPacks,
      daysRunway,
      priority,
      priorityClass,
      reason,
    });
  });

  // Sort purchase plans: Critical first, then High, then Units Needed descending
  purchasePlans.sort((a, b) => {
    const order: Record<string, number> = { [s.priorityCritical]: 0, [s.priorityHigh]: 1, [s.priorityMedium]: 2, [s.priorityOptimal]: 3 };
    return (order[a.priority] ?? 4) - (order[b.priority] ?? 4) || b.additionalUnits - a.additionalUnits;
  });

  // Title and Filename selection
  let reportMainTitle = s.titleComprehensive;
  let defaultFilename = `Medtrix_AI_Triage_Report_${isoDate}.pdf`;

  if (mode === 'purchase_plan') {
    reportMainTitle = s.titlePurchasePlan;
    defaultFilename = `Medtrix_Next_Month_Purchase_Plan_${isoDate}.pdf`;
  } else if (mode === 'expiry_risk') {
    reportMainTitle = s.titleExpiryRisk;
    defaultFilename = `Medtrix_Expiry_Risk_Audit_${isoDate}.pdf`;
  } else if (mode === 'analytics') {
    reportMainTitle = s.titleAnalytics;
    defaultFilename = `Medtrix_Analytics_Report_${isoDate}.pdf`;
  }

  if (customTitle) {
    reportMainTitle = customTitle;
  }

  // Build HTML
  const velocitySvg = renderVelocitySvg(totalStockIn, totalStockOut, s);
  const topMedSvg = renderTopMedicinesSvg(topConsumed, s);

  const html = `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(reportMainTitle)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Sans+Tamil:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm 16mm 14mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Noto Sans', 'Noto Sans Tamil', 'Noto Sans Devanagari', 'Nirmala UI', 'Kohinoor Tamil', 'Kohinoor Devanagari', 'Latha', 'Mangal', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0F172A;
      background: #FFFFFF;
      margin: 0;
      padding: 0;
      font-size: 10pt;
      line-height: 1.5;
    }
    .avoid-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .header-banner {
      background: #0D1117;
      color: #FFFFFF;
      border-radius: 12px;
      padding: 20px 24px;
      margin-bottom: 20px;
      border-left: 6px solid #2563EB;
    }
    .brand-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      border-bottom: 1px solid #1E293B;
      padding-bottom: 10px;
    }
    .brand-title {
      font-size: 13pt;
      font-weight: 800;
      letter-spacing: 1px;
      color: #60A5FA;
      margin: 0;
    }
    .system-pill {
      background: #111827;
      border: 1px solid #3B82F6;
      color: #93C5FD;
      font-size: 7.5pt;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .report-title {
      font-size: 16pt;
      font-weight: 800;
      color: #FFFFFF;
      margin: 4px 0 6px 0;
      line-height: 1.3;
    }
    .report-sub {
      font-size: 9pt;
      color: #CBD5E1;
      margin: 0 0 14px 0;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      background: #111827;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 8pt;
      border: 1px solid #1E293B;
    }
    .meta-cell-label {
      color: #94A3B8;
      font-weight: 500;
      text-transform: uppercase;
      font-size: 7pt;
      margin-bottom: 2px;
    }
    .meta-cell-value {
      color: #FFFFFF;
      font-weight: 700;
      word-break: break-word;
    }
    .section-title {
      font-size: 12pt;
      font-weight: 700;
      color: #0F172A;
      margin: 22px 0 6px 0;
      display: flex;
      align-items: center;
      border-bottom: 2px solid #2563EB;
      padding-bottom: 6px;
      page-break-after: avoid;
      break-after: avoid;
    }
    .section-desc {
      font-size: 8.5pt;
      color: #475569;
      margin: 0 0 12px 0;
    }
    .metrics-container {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 18px;
    }
    .metric-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 10px 12px;
      text-align: left;
    }
    .metric-card-danger {
      background: #FEF2F2;
      border-color: #FECACA;
    }
    .metric-card-warning {
      background: #FFFBEB;
      border-color: #FDE68A;
    }
    .metric-card-highlight {
      background: #EFF6FF;
      border-color: #BFDBFE;
    }
    .metric-card-value {
      font-size: 18pt;
      font-weight: 800;
      color: #0F172A;
      line-height: 1.1;
      margin-bottom: 2px;
    }
    .metric-card-danger .metric-card-value { color: #DC2626; }
    .metric-card-warning .metric-card-value { color: #D97706; }
    .metric-card-highlight .metric-card-value { color: #2563EB; }
    .metric-card-label {
      font-size: 8pt;
      font-weight: 600;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .formula-banner {
      background: #EFF6FF;
      border-left: 4px solid #2563EB;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 12px;
      font-size: 8.5pt;
      color: #1E3A8A;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .formula-banner-title {
      font-weight: 700;
      margin-bottom: 2px;
      text-transform: uppercase;
      font-size: 7.5pt;
      letter-spacing: 0.5px;
    }
    .formula-code {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
      font-size: 8.5pt;
      color: #1D4ED8;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 8.5pt;
      background: #FFFFFF;
      page-break-inside: auto;
    }
    thead {
      display: table-header-group;
    }
    tfoot {
      display: table-footer-group;
    }
    tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    th {
      background: #0F172A;
      color: #FFFFFF;
      font-weight: 700;
      text-align: left;
      padding: 7px 10px;
      font-size: 8pt;
      letter-spacing: 0.3px;
      border: 1px solid #1E293B;
    }
    td {
      padding: 7px 10px;
      border: 1px solid #E2E8F0;
      vertical-align: middle;
      color: #1E293B;
      word-break: break-word;
      overflow-wrap: break-word;
    }
    tr:nth-child(even) td {
      background: #F8FAFC;
    }
    tr.tr-critical td {
      background: #FEF2F2 !important;
    }
    tr.tr-high td {
      background: #FFFBEB !important;
    }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 7.5pt;
      font-weight: 700;
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }
    .badge-critical { background: #FFE4E6; color: #BE123C; border: 1px solid #FDA4AF; }
    .badge-expired { background: #FEE2E2; color: #991B1B; border: 1px solid #FCA5A5; }
    .badge-high { background: #FEF3C7; color: #B45309; border: 1px solid #FCD34D; }
    .badge-medium { background: #DBEAFE; color: #1D4ED8; border: 1px solid #93C5FD; }
    .badge-warning { background: #FFEDD5; color: #C2410C; border: 1px solid #FDBA74; }
    .badge-optimal { background: #D1FAE5; color: #047857; border: 1px solid #6EE7B7; }
    .analytics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 20px;
    }
    .sign-off-box {
      border: 1px solid #CBD5E1;
      border-radius: 8px;
      padding: 14px;
      background: #F8FAFC;
      margin-top: 24px;
      font-size: 8pt;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .sign-off-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 16px;
      margin-top: 14px;
      align-items: end;
    }
    .signature-line {
      border-bottom: 1px solid #475569;
      height: 32px;
      margin-bottom: 4px;
    }
    .footer-note {
      text-align: center;
      margin-top: 20px;
      font-size: 7.5pt;
      color: #64748B;
      border-top: 1px solid #E2E8F0;
      padding-top: 8px;
    }
  </style>
</head>
<body>

  <!-- HEADER BRANDING -->
  <div class="header-banner">
    <div class="brand-row">
      <div class="brand-title">MEDTRIX</div>
      <div class="system-pill">${escapeHtml(s.systemTag)}</div>
    </div>
    <div class="report-title">${escapeHtml(reportMainTitle)}</div>
    <div class="report-sub">${escapeHtml(s.subtitle)}</div>

    <div class="meta-grid">
      <div>
        <div class="meta-cell-label">${escapeHtml(s.facilityLabel)}</div>
        <div class="meta-cell-value">${escapeHtml(facilityName)}</div>
      </div>
      <div>
        <div class="meta-cell-label">${escapeHtml(s.generatedOn)}</div>
        <div class="meta-cell-value">${escapeHtml(dateStr)} ${escapeHtml(timeStr)}</div>
      </div>
      <div>
        <div class="meta-cell-label">${escapeHtml(s.reportingPeriod)}</div>
        <div class="meta-cell-value">${escapeHtml(s.periodValue)}</div>
      </div>
      <div>
        <div class="meta-cell-label">${escapeHtml(s.protocol)}</div>
        <div class="meta-cell-value">${escapeHtml(s.protocolValue)}</div>
      </div>
    </div>
  </div>

  <!-- EXECUTIVE SUMMARY METRICS (Omitted only if pure analytics report) -->
  ${mode !== 'analytics' ? `
  <div class="avoid-break">
    <div class="section-title">${escapeHtml(s.execSummaryTitle)}</div>
    <div class="metrics-container">
      <div class="metric-card metric-card-highlight">
        <div class="metric-card-value">${uniqueMeds.size}</div>
        <div class="metric-card-label">${escapeHtml(s.totalMedicines)} (${totalStockUnits} u. / ${inventory.length} b.)</div>
      </div>
      <div class="metric-card metric-card-danger">
        <div class="metric-card-value">${outOfStockCount + lowStockCount}</div>
        <div class="metric-card-label">${escapeHtml(s.lowStock)} / OOS (${stockoutRiskCount} risk)</div>
      </div>
      <div class="metric-card metric-card-warning">
        <div class="metric-card-value">${expiringSoonCount}</div>
        <div class="metric-card-label">${escapeHtml(s.expiringSoon)}</div>
      </div>
      <div class="metric-card metric-card-danger">
        <div class="metric-card-value">${expiredBatchesCount}</div>
        <div class="metric-card-label">${escapeHtml(s.expiredQuarantine)}</div>
      </div>
    </div>
  </div>
  ` : ''}

  ${(mode === 'comprehensive' || mode === 'expiry_risk') ? `
  <!-- SECTION 1: ATTENTION & QUARANTINE RISKS -->
  <div class="avoid-break">
    <div class="section-title">${escapeHtml(s.attentionSectionTitle)}</div>
    <div class="section-desc">${escapeHtml(s.attentionSectionDesc)}</div>

    ${attentionList.length === 0 ? `
      <div style="background: #F0FDF4; border: 1px solid #BBF7D0; color: #166534; padding: 12px; border-radius: 8px; font-size: 9pt; margin-bottom: 16px;">
        ✓ ${escapeHtml(s.noAttentionItems)}
      </div>
    ` : `
      <table>
        <thead>
          <tr>
            <th style="width: 28%;">${escapeHtml(s.colMedicine)}</th>
            <th style="width: 14%;">${escapeHtml(s.colBatch)}</th>
            <th style="width: 12%;" class="text-right">${escapeHtml(s.colStock)}</th>
            <th style="width: 14%;">${escapeHtml(s.colExpiry)}</th>
            <th style="width: 14%;" class="text-center">${escapeHtml(s.colSeverity)}</th>
            <th style="width: 18%;">${escapeHtml(s.colAction)}</th>
          </tr>
        </thead>
        <tbody>
          ${attentionList.slice(0, 25).map(item => `
            <tr>
              <td><strong>${escapeHtml(item.medicineName)}</strong>${item.strength ? ` <span style="color:#64748B;">${escapeHtml(item.strength)}</span>` : ''}</td>
              <td style="font-family: 'JetBrains Mono', monospace; font-size: 8pt;">${escapeHtml(item.batchNumber || '—')}</td>
              <td class="text-right"><strong>${item.quantity}</strong></td>
              <td>${escapeHtml(item.expiryDate || '—')}${item.daysRemaining !== undefined ? ` <span style="font-size:7.5pt; color:#64748B;">(${item.daysRemaining}d)</span>` : ''}</td>
              <td class="text-center"><span class="badge ${item.severityClass}">${escapeHtml(item.severityLabel)}</span></td>
              <td style="font-size: 8pt; color: #334155;">${escapeHtml(item.reason)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `}
  </div>
  ` : ''}

  ${(mode === 'comprehensive' || mode === 'purchase_plan') ? `
  <!-- SECTION 2: NEXT MONTH PURCHASE RECOMMENDATIONS -->
  <div class="avoid-break">
    <div class="section-title">${escapeHtml(s.purchaseSectionTitle)}</div>
    <div class="section-desc">${escapeHtml(s.purchaseSectionDesc)}</div>

    <div class="formula-banner">
      <div class="formula-banner-title">📐 ${escapeHtml(s.formulaLabel)}</div>
      <div class="formula-code">${escapeHtml(s.formulaText)}</div>
    </div>

    ${purchasePlans.length === 0 ? `
      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 14px; border-radius: 8px; text-align: center; color: #64748B; font-size: 9pt; margin-bottom: 16px;">
        ${escapeHtml(s.noPurchasePlanItems)}
      </div>
    ` : `
      <table>
        <thead>
          <tr>
            <th style="width: 24%;">${escapeHtml(s.colMedicine)}</th>
            <th style="width: 9%;" class="text-right">${escapeHtml(s.colStock)}</th>
            <th style="width: 10%;" class="text-right">${escapeHtml(s.colForecastDemand)}</th>
            <th style="width: 12%;" class="text-right">${escapeHtml(s.colAdditionalUnits)}</th>
            <th style="width: 10%;" class="text-right">${escapeHtml(s.colPacks)}</th>
            <th style="width: 9%;" class="text-center">${escapeHtml(s.colDaysLeft)}</th>
            <th style="width: 11%;" class="text-center">${escapeHtml(s.colPriority)}</th>
            <th style="width: 15%;">${escapeHtml(s.colReason)}</th>
          </tr>
        </thead>
        <tbody>
          ${purchasePlans.map(plan => `
            <tr class="${plan.priority === s.priorityCritical ? 'tr-critical' : plan.priority === s.priorityHigh ? 'tr-high' : ''}">
              <td>
                <strong>${escapeHtml(plan.medicineName)}</strong>
                ${plan.strength ? `<div style="font-size:7.5pt; color:#64748B;">${escapeHtml(plan.strength)}${plan.form ? ` • ${escapeHtml(plan.form)}` : ''}</div>` : ''}
              </td>
              <td class="text-right">${plan.usableStock}</td>
              <td class="text-right">${plan.forecastDemand}</td>
              <td class="text-right">
                ${plan.additionalUnits > 0 ? `<strong style="color: #2563EB; font-size: 9.5pt;">+${plan.additionalUnits}</strong>` : `<span style="color:#047857; font-size: 8pt;">0 (OK)</span>`}
              </td>
              <td class="text-right">${plan.suggestedPacks ? `<strong>${plan.suggestedPacks}</strong>` : '—'}</td>
              <td class="text-center">${plan.daysRunway > 365 ? '365d+' : `${plan.daysRunway}d`}</td>
              <td class="text-center"><span class="badge ${plan.priorityClass}">${escapeHtml(plan.priority)}</span></td>
              <td style="font-size: 7.5pt; line-height: 1.3; color: #475569;">${escapeHtml(plan.reason)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `}
  </div>
  ` : ''}

  ${(mode === 'comprehensive' || mode === 'analytics' || mode === 'weekly') ? `
  <!-- SECTION 3: ANALYTICS & VELOCITY CHARTS -->
  <div class="avoid-break">
    <div class="section-title">${escapeHtml(s.analyticsSectionTitle)}</div>
    <div class="section-desc">${escapeHtml(s.analyticsSectionDesc)}</div>

    <div class="analytics-grid">
      <div>
        <div style="font-weight: 600; font-size: 9pt; color: #1E293B; margin-bottom: 6px;">${escapeHtml(s.netDeltaLabel)}</div>
        ${velocitySvg}
      </div>
      <div>
        <div style="font-weight: 600; font-size: 9pt; color: #1E293B; margin-bottom: 6px;">${escapeHtml(s.topConsumedTitle)}</div>
        ${topMedSvg}
      </div>
    </div>

    ${mode === 'analytics' && tx30d.length > 0 ? `
    <div style="margin-top: 14px;">
      <div style="font-weight: 700; font-size: 9pt; color: #0F172A; margin-bottom: 6px;">${escapeHtml(s.recentTransactionsTitle)}</div>
      <table>
        <thead>
          <tr>
            <th style="width: 25%;">${escapeHtml(s.colDate)}</th>
            <th style="width: 35%;">${escapeHtml(s.colMedicine)}</th>
            <th style="width: 20%;">${escapeHtml(s.colType)}</th>
            <th style="width: 20%;" class="text-right">${escapeHtml(s.colQty)}</th>
          </tr>
        </thead>
        <tbody>
          ${tx30d.slice(0, 15).map(tx => `
            <tr>
              <td>${new Date(tx.created_at).toLocaleDateString(dateLocale, { day: '2-digit', month: 'short' })} ${new Date(tx.created_at).toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' })}</td>
              <td><strong>${escapeHtml(tx.medicines?.name || 'Medicine')}</strong></td>
              <td><span class="badge ${tx.transaction_type === 'stock_in' ? 'badge-optimal' : 'badge-medium'}">${escapeHtml(tx.transaction_type === 'stock_in' ? s.stockInLabel : s.stockOutLabel)}</span></td>
              <td class="text-right"><strong>${tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}
  </div>
  ` : ''}

  <!-- SIGN-OFF & VERIFICATION BLOCK -->
  <div class="avoid-break sign-off-box">
    <div style="font-weight: 700; font-size: 9pt; color: #0F172A; margin-bottom: 4px;">${escapeHtml(s.auditSignOff)}</div>
    <p style="margin: 0; color: #475569; font-size: 7.5pt; line-height: 1.4;">${escapeHtml(s.signOffNotice)}</p>
    <div class="sign-off-grid">
      <div>
        <div class="signature-line"></div>
        <div style="font-size: 7.5pt; color: #64748B;">${escapeHtml(s.signaturePharmacist)}</div>
      </div>
      <div>
        <div class="signature-line"></div>
        <div style="font-size: 7.5pt; color: #64748B;">${escapeHtml(s.signatureDate)}</div>
      </div>
      <div>
        <div class="signature-line"></div>
        <div style="font-size: 7.5pt; color: #64748B;">${escapeHtml(s.facilityStamp)}</div>
      </div>
    </div>
  </div>

  <div class="footer-note">
    <strong>${escapeHtml(s.confidentiality)}</strong><br />
    ${escapeHtml(s.footerBrand)} • ${escapeHtml(dateStr)} ${escapeHtml(timeStr)}
  </div>

</body>
</html>
  `;

  return { html, defaultFilename };
}

// ============================================================
// EXPORTED REPORT SERVICE API
// ============================================================

/**
 * Generates the full comprehensive AI Triage report including Health Metrics,
 * Attention Items, Next-Month Purchase Planner, and Analytics Velocity charts.
 */
export const generateAITriageReport = async (
  reportType: string = 'AI Triage Comprehensive Report',
  language: string = 'en'
): Promise<ReportGenerationResult> => {
  try {
    const { html, defaultFilename } = await buildReportHtml('comprehensive', reportType, language);
    return await executePrintAndShare(html, defaultFilename, reportType);
  } catch (err: any) {
    console.error('Error generating AI Triage report:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
};

/**
 * Generates a focused procurement purchase order recommendation PDF
 * specifically for next-month medicine restocking.
 */
export const generateNextMonthPurchaseReport = async (
  language: string = 'en'
): Promise<ReportGenerationResult> => {
  try {
    const { html, defaultFilename } = await buildReportHtml('purchase_plan', undefined, language);
    return await executePrintAndShare(html, defaultFilename, 'Next Month Purchase Plan');
  } catch (err: any) {
    console.error('Error generating purchase plan report:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
};

/**
 * Generates a focused expiry, FEFO prioritization, and quarantine risk audit report.
 */
export const generateExpiryRiskReport = async (
  language: string = 'en'
): Promise<ReportGenerationResult> => {
  try {
    const { html, defaultFilename } = await buildReportHtml('expiry_risk', undefined, language);
    return await executePrintAndShare(html, defaultFilename, 'Expiry Risk Audit');
  } catch (err: any) {
    console.error('Error generating expiry risk report:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
};

/**
 * Generates an Inventory Velocity, Movement, and Consumption Trends analytics PDF.
 */
export const generateAnalyticsReport = async (
  language: string = 'en'
): Promise<ReportGenerationResult> => {
  try {
    const { html, defaultFilename } = await buildReportHtml('analytics', undefined, language);
    return await executePrintAndShare(html, defaultFilename, 'Inventory Analytics Report');
  } catch (err: any) {
    console.error('Error generating analytics report:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
};

/**
 * Generates a Clinical AI Triage patient assessment and diagnostic PDF report.
 */
export const generateClinicalTriageReport = async (
  data: ClinicalAssessmentData,
  language: string = 'en'
): Promise<ReportGenerationResult> => {
  try {
    const { html, defaultFilename } = await buildReportHtml('clinical_triage', undefined, language, data);
    return await executePrintAndShare(html, defaultFilename, 'Clinical AI Triage Assessment');
  } catch (err: any) {
    console.error('Error generating clinical triage report:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
};

/**
 * Global mutex flag to prevent overlapping share requests.
 * On Android, ExpoSharing rejects concurrent calls with "Another share request is being processed now".
 */
let isSharingInProgress = false;

/**
 * Helper to render HTML to PDF, save with clean sanitized filename, and trigger sharing dialog.
 * Uses in-memory base64 to write directly into cacheDirectory, avoiding Android 11+ scoped storage / Print cache read errors.
 */
export async function executePrintAndShare(
  html: string,
  filename: string,
  dialogTitle: string
): Promise<ReportGenerationResult> {
  if (isSharingInProgress) {
    console.log('[Sharing] A share request is already in progress, ignoring duplicate call.');
    return { success: true, filename };
  }

  isSharingInProgress = true;
  try {
    // Request base64: true so we receive the complete PDF bytes directly from the native module
    const { uri, base64 } = await Print.printToFileAsync({ html, base64: true });

    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    let finalUri = uri;

    const baseDir = FileSystem.cacheDirectory || FileSystem.documentDirectory;
    if (baseDir) {
      const targetPath = `${baseDir}${sanitizedFilename}`;
      if (base64) {
        try {
          await FileSystem.writeAsStringAsync(targetPath, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
          finalUri = targetPath;
        } catch (writeErr) {
          console.warn('Could not write PDF to cache directory from base64:', writeErr);
        }
      } else {
        try {
          await FileSystem.copyAsync({ from: uri, to: targetPath });
          finalUri = targetPath;
        } catch (copyErr) {
          console.warn('Could not copy PDF file, using default URI:', copyErr);
        }
      }
    }

    if (await Sharing.isAvailableAsync()) {
      try {
        await Sharing.shareAsync(finalUri, {
          mimeType: 'application/pdf',
          UTI: '.pdf',
          dialogTitle,
        });
      } catch (shareErr: any) {
        const errorMsg = shareErr?.message || String(shareErr);
        if (errorMsg.includes('Another share request is being processed')) {
          console.log('[Sharing] System share dialog is already active.');
        } else {
          console.warn('[Sharing] shareAsync warning:', shareErr);
        }
      }
    }

    return { success: true, uri: finalUri, filename };
  } catch (err: any) {
    console.warn('[Sharing] executePrintAndShare error:', err);
    return { success: false, error: err.message || 'Unknown error' };
  } finally {
    setTimeout(() => {
      isSharingInProgress = false;
    }, 1200);
  }
}


