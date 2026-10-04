const fs = require('fs');
const path = require('path');

// 1. Fix ai-triage.tsx
const aiTriagePath = path.join(__dirname, 'src/app/profile/ai-triage.tsx');
let aiTriage = fs.readFileSync(aiTriagePath, 'utf8');
aiTriage = aiTriage.replace(/i => i\.status/g, '(i: any) => i.status');
aiTriage = aiTriage.replace(/COLORS\.white/g, "'#FFFFFF'");
fs.writeFileSync(aiTriagePath, aiTriage);
console.log('Fixed ai-triage.tsx');

// 2. Fix profile.tsx
const profilePath = path.join(__dirname, 'src/app/(tabs)/profile.tsx');
let profile = fs.readFileSync(profilePath, 'utf8');
profile = profile.replace(/COLORS\.status\.infoSoft/g, 'COLORS.status.infoBg');
fs.writeFileSync(profilePath, profile);
console.log('Fixed profile.tsx');

// 3. Fix FloatingAssistant.tsx
const assistantPath = path.join(__dirname, 'src/components/FloatingAssistant.tsx');
let assistant = fs.readFileSync(assistantPath, 'utf8');
assistant = assistant.replace(/COLORS\.white/g, "'#FFFFFF'");
assistant = assistant.replace(/SHADOWS\.large/g, 'SHADOWS.medium');
assistant = assistant.replace(/COLORS\.brand\.primaryDark/g, 'COLORS.brand.deep');
fs.writeFileSync(assistantPath, assistant);
console.log('Fixed FloatingAssistant.tsx');
