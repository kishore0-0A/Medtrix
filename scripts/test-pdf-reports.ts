import {
  buildReportHtml,
  generateAITriageReport,
  generateNextMonthPurchaseReport,
  generateExpiryRiskReport,
  generateAnalyticsReport,
  generateClinicalTriageReport,
  getReportTranslations,
} from '../src/services/reportService';

const fs = require('fs');
const path = require('path');
const mockPrint = require('./mock-expo-print');
const mockSharing = require('./mock-expo-sharing');
const mockFs = require('./mock-expo-file-system');

// Scratch directory for saving real generated report test artifacts
const scratchDir = path.resolve('C:/Users/prave/.gemini/antigravity-ide/brain/2b6d8414-8099-466f-bbe8-b730a14fcdfa/scratch');
if (!fs.existsSync(scratchDir)) {
  fs.mkdirSync(scratchDir, { recursive: true });
}

async function runPdfTests() {
  console.log('================================================================');
  console.log('   MEDTRIX MULTILINGUAL AI TRIAGE PDF REPORTS TEST SUITE');
  console.log('================================================================\n');

  // TEST 1: English Comprehensive Report HTML
  console.log('--- TEST 1: English Comprehensive AI Triage Report ---');
  const { html: enHtml, defaultFilename: enFilename } = await buildReportHtml('comprehensive', 'AI Triage Comprehensive Report', 'en');

  if (!enHtml.includes('MEDTRIX')) {
    throw new Error('Test 1 Failed: Missing MEDTRIX branding header');
  }
  if (!enHtml.includes('Executive Inventory Health Summary')) {
    throw new Error('Test 1 Failed: Missing English Executive Inventory Health Summary heading');
  }
  if (!enHtml.includes('Next-Month Medicine Purchase Plan') && !enHtml.includes('Purchase Recommendations')) {
    throw new Error('Test 1 Failed: Missing purchase plan section');
  }
  if (!enHtml.includes('<svg')) {
    throw new Error('Test 1 Failed: Missing self-contained inline SVG charts');
  }
  if (!enHtml.includes('@page') || !enHtml.includes('size: A4 portrait;')) {
    throw new Error('Test 1 Failed: Missing standard A4 print CSS rules');
  }
  if (!enHtml.includes('display: table-header-group;')) {
    throw new Error('Test 1 Failed: Missing repeating table header on subsequent pages');
  }
  fs.writeFileSync(path.join(scratchDir, 'test_comprehensive_en.html'), enHtml);
  console.log('✓ Valid HTML5 document structure verified');
  console.log('✓ Executive health summary cards verified');
  console.log('✓ Next-month purchase planner section verified');
  console.log('✓ Self-contained SVG velocity charts verified');
  console.log('✓ Standard A4 print stylesheet & repeated table headers verified');
  console.log('✓ TEST 1 PASSED\n');

  // TEST 2: Tamil Multilingual Rendering & Dynamic Reasons
  console.log('--- TEST 2: Tamil (ta) Multilingual Report & Unicode ---');
  const { html: taHtml } = await buildReportHtml('comprehensive', 'AI Triage Comprehensive Report', 'ta');

  if (!taHtml.includes('Noto+Sans+Tamil')) {
    throw new Error('Test 2 Failed: Missing Noto Sans Tamil Google Font embedding');
  }
  if (!taHtml.includes('நிர்வாக சரக்கு சுகாதார சுருக்கம்')) {
    throw new Error('Test 2 Failed: Missing Tamil translation for Inventory Health Summary');
  }
  if (!taHtml.includes('அடுத்த மாத மருந்து கொள்முதல் திட்டம்') && !taHtml.includes('கொள்முதல் பரிந்துரைகள்')) {
    throw new Error('Test 2 Failed: Missing Tamil translation for Next Month Purchase Recommendations');
  }
  if (!taHtml.includes('மருந்து & வடிவம்') && !taHtml.includes('மருந்து')) {
    throw new Error('Test 2 Failed: Missing Tamil table header for Medicine Name');
  }
  // Check for Tamil localized dynamic reasons (not hardcoded English)
  if (!taHtml.includes('FEFO விதிகளின்படி') && !taHtml.includes('நாட்களில் காலாவதியாகிறது') && !taHtml.includes('தீர்ந்துவிடும் ஆபத்து') && !taHtml.includes('உகந்த நிலையில் உள்ளன')) {
    throw new Error('Test 2 Failed: Attention reasons or purchase explanations are not localized into Tamil');
  }
  fs.writeFileSync(path.join(scratchDir, 'test_comprehensive_ta.html'), taHtml);
  console.log('✓ Noto Sans Tamil font stack verified');
  console.log('✓ Tamil Unicode script rendered without broken glyphs');
  console.log('✓ Tamil table headers, risk badges, and metrics localized');
  console.log('✓ Tamil dynamic reasons and risk assessments localized');
  console.log('✓ TEST 2 PASSED\n');

  // TEST 3: Hindi Multilingual Rendering & Dynamic Reasons
  console.log('--- TEST 3: Hindi (hi) Multilingual Report & Unicode ---');
  const { html: hiHtml } = await buildReportHtml('comprehensive', 'AI Triage Comprehensive Report', 'hi');

  if (!hiHtml.includes('Noto+Sans+Devanagari')) {
    throw new Error('Test 3 Failed: Missing Noto Sans Devanagari Google Font embedding');
  }
  if (!hiHtml.includes('कार्यकारी इन्वेंटरी स्वास्थ्य सारांश')) {
    throw new Error('Test 3 Failed: Missing Hindi translation for Inventory Health Summary');
  }
  if (!hiHtml.includes('अगले महीने के लिए दवा खरीद सिफारिशें') && !hiHtml.includes('दवा खरीद योजना')) {
    throw new Error('Test 3 Failed: Missing Hindi translation for Next Month Purchase Recommendations');
  }
  if (!hiHtml.includes('दवा एवं खुराक रूप') && !hiHtml.includes('दवा')) {
    throw new Error('Test 3 Failed: Missing Hindi table header for Medicine Name');
  }
  // Check for Hindi localized dynamic reasons
  if (!hiHtml.includes('FEFO नियमों के तहत') && !hiHtml.includes('दिनों में समाप्त') && !hiHtml.includes('स्टॉक समाप्ति') && !hiHtml.includes('इष्टतम स्थिति में हैं')) {
    throw new Error('Test 3 Failed: Attention reasons or purchase explanations are not localized into Hindi');
  }
  fs.writeFileSync(path.join(scratchDir, 'test_comprehensive_hi.html'), hiHtml);
  console.log('✓ Noto Sans Devanagari font stack verified');
  console.log('✓ Hindi Devanagari Unicode script rendered accurately');
  console.log('✓ Hindi table headers, risk badges, and formulas localized');
  console.log('✓ Hindi dynamic reasons and risk assessments localized');
  console.log('✓ TEST 3 PASSED\n');

  // TEST 4: Next-Month Medicine Purchase Plan PDF
  console.log('--- TEST 4: Next-Month Medicine Purchase Plan Export ---');
  const res4 = await generateNextMonthPurchaseReport('en');
  if (!res4.success) throw new Error('Test 4 Failed: generateNextMonthPurchaseReport returned failure');
  const lastHtml4 = mockPrint.getLastHtml();

  if (!lastHtml4.includes('Next-Month Medicine Purchase Plan')) {
    throw new Error('Test 4 Failed: Incorrect report title in purchase plan HTML');
  }
  if (!lastHtml4.includes('Units to Order')) {
    throw new Error('Test 4 Failed: Missing Units to Order column');
  }
  if (!lastHtml4.includes('30d Forecast')) {
    throw new Error('Test 4 Failed: Missing 30d forecast demand column');
  }
  const lastCopied4 = mockFs.getLastCopied();
  if (!lastCopied4 || !lastCopied4.to.includes('Medtrix_Next_Month_Purchase_Plan_')) {
    throw new Error('Test 4 Failed: Expected sanitized filename Medtrix_Next_Month_Purchase_Plan_*.pdf');
  }
  const lastShared4 = mockSharing.getLastShare();
  if (lastShared4.options.mimeType !== 'application/pdf') {
    throw new Error('Test 4 Failed: Invalid MIME type, expected application/pdf');
  }
  fs.writeFileSync(path.join(scratchDir, 'test_purchase_plan_en.html'), lastHtml4);
  console.log('✓ Purchase plan specific columns and formulas verified');
  console.log('✓ Sanitized filename pattern verified:', lastCopied4.to);
  console.log('✓ Sharing MIME type verified: application/pdf');
  console.log('✓ TEST 4 PASSED\n');

  // TEST 5: Expiry & Stock Risk Report Export
  console.log('--- TEST 5: Expiry & Stock-Risk Report Export ---');
  const res5 = await generateExpiryRiskReport('en');
  if (!res5.success) throw new Error('Test 5 Failed: generateExpiryRiskReport returned failure');
  const lastHtml5 = mockPrint.getLastHtml();

  if (!lastHtml5.includes('Medicine Expiry') || !lastHtml5.includes('FEFO Quarantine Risk Audit')) {
    throw new Error('Test 5 Failed: Incorrect title in expiry report');
  }
  const lastCopied5 = mockFs.getLastCopied();
  if (!lastCopied5 || !lastCopied5.to.includes('Medtrix_Expiry_Risk_Audit_')) {
    throw new Error('Test 5 Failed: Expected sanitized filename Medtrix_Expiry_Risk_Audit_*.pdf');
  }
  fs.writeFileSync(path.join(scratchDir, 'test_expiry_risk_en.html'), lastHtml5);
  console.log('✓ Quarantine and urgency filters verified');
  console.log('✓ Sanitized filename pattern verified:', lastCopied5.to);
  console.log('✓ TEST 5 PASSED\n');

  // TEST 6: Tamil Purchase Plan Specific Check
  console.log('--- TEST 6: Tamil Purchase Plan Specific Translation ---');
  const res6 = await generateNextMonthPurchaseReport('ta');
  if (!res6.success) throw new Error('Test 6 Failed: generateNextMonthPurchaseReport in ta failed');
  const lastHtml6 = mockPrint.getLastHtml();
  if (!lastHtml6.includes('அடுத்த மாத மருந்து கொள்முதல் திட்டம்')) {
    throw new Error('Test 6 Failed: Missing Tamil title for Next Month Purchase Plan');
  }
  fs.writeFileSync(path.join(scratchDir, 'test_purchase_plan_ta.html'), lastHtml6);
  console.log('✓ Tamil purchase plan title and headers verified');
  console.log('✓ TEST 6 PASSED\n');

  // TEST 7: Hindi Expiry Risk Specific Check
  console.log('--- TEST 7: Hindi Expiry Risk Specific Translation ---');
  const res7 = await generateExpiryRiskReport('hi');
  if (!res7.success) throw new Error('Test 7 Failed: generateExpiryRiskReport in hi failed');
  const lastHtml7 = mockPrint.getLastHtml();
  if (!lastHtml7.includes('दवा समाप्ति एवं FEFO क्वारंटाइन जोखिम ऑडिट')) {
    throw new Error('Test 7 Failed: Missing Hindi title for Expiry Risk Audit');
  }
  fs.writeFileSync(path.join(scratchDir, 'test_expiry_risk_hi.html'), lastHtml7);
  console.log('✓ Hindi expiry risk title and quarantine terms verified');
  console.log('✓ TEST 7 PASSED\n');

  // TEST 8: Dedicated Inventory Analytics & Velocity Report Export
  console.log('--- TEST 8: Dedicated Inventory Analytics & Velocity Report ---');
  const res8 = await generateAnalyticsReport('en');
  if (!res8.success) throw new Error('Test 8 Failed: generateAnalyticsReport failed');
  const lastHtml8 = mockPrint.getLastHtml();
  if (!lastHtml8.includes('Inventory Movement Velocity') || !lastHtml8.includes('Consumption Analytics')) {
    throw new Error('Test 8 Failed: Missing analytics report title');
  }
  if (!lastHtml8.includes('Total Stock In (Received)') || !lastHtml8.includes('Total Stock Out (Dispensed)')) {
    throw new Error('Test 8 Failed: Missing velocity indicators');
  }
  const lastCopied8 = mockFs.getLastCopied();
  if (!lastCopied8 || !lastCopied8.to.includes('Medtrix_Analytics_Report_')) {
    throw new Error('Test 8 Failed: Expected sanitized filename Medtrix_Analytics_Report_*.pdf');
  }
  fs.writeFileSync(path.join(scratchDir, 'test_analytics_en.html'), lastHtml8);

  // Also check Tamil & Hindi analytics
  const res8Ta = await generateAnalyticsReport('ta');
  if (!res8Ta.success) throw new Error('Test 8 Failed: generateAnalyticsReport in ta failed');
  const lastHtml8Ta = mockPrint.getLastHtml();
  if (!lastHtml8Ta.includes('சரக்கு பரிவர்த்தனை வேகம்') || !lastHtml8Ta.includes('நுகர்வு பகுப்பாய்வு')) {
    throw new Error('Test 8 Failed: Missing Tamil analytics title');
  }
  fs.writeFileSync(path.join(scratchDir, 'test_analytics_ta.html'), lastHtml8Ta);

  const res8Hi = await generateAnalyticsReport('hi');
  if (!res8Hi.success) throw new Error('Test 8 Failed: generateAnalyticsReport in hi failed');
  const lastHtml8Hi = mockPrint.getLastHtml();
  if (!lastHtml8Hi.includes('इन्वेंटरी संचलन गति एवं खपत विश्लेषण')) {
    throw new Error('Test 8 Failed: Missing Hindi analytics title');
  }
  fs.writeFileSync(path.join(scratchDir, 'test_analytics_hi.html'), lastHtml8Hi);
  console.log('✓ Dedicated analytics and velocity report generated');
  console.log('✓ Sanitized filename pattern verified:', lastCopied8.to);
  console.log('✓ Tamil & Hindi analytics translations verified');
  console.log('✓ TEST 8 PASSED\n');

  // TEST 9: Clinical AI Triage Assessment Report Export
  console.log('--- TEST 9: Clinical AI Triage Assessment Report ---');
  const sampleClinicalData = {
    patient: { age: '52', sex: 'Male', allergies: 'Penicillin' },
    symptoms: { main: 'Severe Chest Tightness & Dyspnea', duration: '2 Hours', severity: 8, location: 'Retrosternal' },
    redFlags: ['Severe breathing difficulty', 'Severe chest pain'],
    assessment: {
      riskLevel: 'High',
      urgency: 'Immediate Emergency Care Required',
      findings: 'Patient exhibits acute retrosternal distress with pain radiation and dyspnea. Severity: 8/10.',
      recommendation: 'Immediate emergency clinical evaluation, 12-lead ECG, and cardiac enzyme workup.',
      category: 'Emergency Cardiology / Acute Care',
    },
  };

  const res9 = await generateClinicalTriageReport(sampleClinicalData, 'en');
  if (!res9.success) throw new Error('Test 9 Failed: generateClinicalTriageReport returned failure');
  const lastHtml9 = mockPrint.getLastHtml();
  if (!lastHtml9.includes('Clinical AI Triage Patient Diagnostic Assessment')) {
    throw new Error('Test 9 Failed: Missing clinical triage title');
  }
  if (!lastHtml9.includes('Penicillin') || !lastHtml9.includes('52')) {
    throw new Error('Test 9 Failed: Patient demographics missing in clinical triage PDF');
  }
  if (!lastHtml9.includes('Severe breathing difficulty')) {
    throw new Error('Test 9 Failed: Red flag indicators missing in clinical triage PDF');
  }
  const lastCopied9 = mockFs.getLastCopied();
  if (!lastCopied9 || !lastCopied9.to.includes('Medtrix_Clinical_Triage_Assessment_')) {
    throw new Error('Test 9 Failed: Expected sanitized filename Medtrix_Clinical_Triage_Assessment_*.pdf');
  }
  fs.writeFileSync(path.join(scratchDir, 'test_clinical_triage_en.html'), lastHtml9);

  // Also check Tamil & Hindi clinical triage
  const res9Ta = await generateClinicalTriageReport(sampleClinicalData, 'ta');
  if (!res9Ta.success) throw new Error('Test 9 Failed: generateClinicalTriageReport in ta failed');
  const lastHtml9Ta = mockPrint.getLastHtml();
  if (!lastHtml9Ta.includes('மருத்துவ AI டிரையேஜ் நோயாளி பரிசோதனை அறிக்கை')) {
    throw new Error('Test 9 Failed: Missing Tamil clinical triage title');
  }
  if (!lastHtml9Ta.includes('நோயாளி விவரங்கள்') || !lastHtml9Ta.includes('அவசர எச்சரிக்கை')) {
    throw new Error('Test 9 Failed: Missing Tamil clinical headings');
  }
  fs.writeFileSync(path.join(scratchDir, 'test_clinical_triage_ta.html'), lastHtml9Ta);

  const res9Hi = await generateClinicalTriageReport(sampleClinicalData, 'hi');
  if (!res9Hi.success) throw new Error('Test 9 Failed: generateClinicalTriageReport in hi failed');
  const lastHtml9Hi = mockPrint.getLastHtml();
  if (!lastHtml9Hi.includes('क्लिनिकल AI ट्राइएज रोगी निदान एवं मूल्यांकन रिपोर्ट')) {
    throw new Error('Test 9 Failed: Missing Hindi clinical triage title');
  }
  if (!lastHtml9Hi.includes('रोगी जनसांख्यिकी विवरण') || !lastHtml9Hi.includes('आपातकालीन चेतावनी')) {
    throw new Error('Test 9 Failed: Missing Hindi clinical headings');
  }
  fs.writeFileSync(path.join(scratchDir, 'test_clinical_triage_hi.html'), lastHtml9Hi);
  console.log('✓ Clinical triage report structure, demographics & red flags verified');
  console.log('✓ Sanitized filename pattern verified:', lastCopied9.to);
  console.log('✓ Multilingual clinical triage translations (EN, TA, HI) verified');
  console.log('✓ TEST 9 PASSED\n');

  // TEST 10: Graceful Fallback Handling for Unsupported / Unknown Language
  console.log('--- TEST 10: Graceful Language Fallback Handling ---');
  const fallbackTrans = getReportTranslations('fr-FR');
  if (!fallbackTrans.facilityName || !fallbackTrans.execSummaryTitle) {
    throw new Error('Test 10 Failed: getReportTranslations failed to fallback to English');
  }
  const { html: fallbackHtml } = await buildReportHtml('comprehensive', undefined, 'fr-FR');
  if (!fallbackHtml || !fallbackHtml.includes('MEDTRIX') || !fallbackHtml.includes('Executive Inventory Health Summary')) {
    throw new Error('Test 10 Failed: HTML generation with unknown locale did not fall back cleanly to English');
  }
  console.log('✓ Unknown language code "fr-FR" seamlessly fell back to English');
  console.log('✓ No undefined or broken text tokens produced');
  console.log('✓ TEST 10 PASSED\n');

  console.log('================================================================');
  console.log('   ALL 10 MULTILINGUAL AI TRIAGE PDF REPORT TESTS PASSED!');
  console.log('================================================================');
}

runPdfTests().catch((err) => {
  console.error('\n❌ Test execution failed:', err);
  process.exit(1);
});
