const fs = require('fs');
const path = require('path');

const locales = ['en', 'ta', 'hi'];

const translations = {
  en: {
    label: "Ask Medtrix AI",
    welcome: "Hello! I am Medtrix AI. How can I help you today?",
    listening: "Listening...",
    type_message: "Ask anything about Medtrix...",
    error_mic: "Microphone permission is required to use voice features.",
    error_speech: "Speech recognition error occurred.",
    q1: "How do I use this app?",
    q2: "How do I add a medicine?",
    q3: "How do I scan a barcode?",
    q4: "How do I upload an invoice?",
    q5: "How can I check stock and expiry?",
    q6: "What should I reorder this week?"
  },
  ta: {
    label: "Medtrix AI கேள்",
    welcome: "வணக்கம்! நான் Medtrix AI. இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
    listening: "கேட்கிறது...",
    type_message: "Medtrix பற்றி ஏதேனும் கேளுங்கள்...",
    error_mic: "குரல் அம்சங்களைப் பயன்படுத்த மைக்ரோஃபோன் அனுமதி தேவை.",
    error_speech: "பேச்சு அங்கீகார பிழை ஏற்பட்டது.",
    q1: "நான் இந்த பயன்பாட்டை எவ்வாறு பயன்படுத்துவது?",
    q2: "நான் எப்படி மருந்தை சேர்ப்பது?",
    q3: "நான் எப்படி பார்கோடை ஸ்கேன் செய்வது?",
    q4: "நான் எப்படி இன்வாய்ஸை பதிவேற்றுவது?",
    q5: "நான் எப்படி இருப்பையும் காலாவதியையும் சரிபார்ப்பது?",
    q6: "இந்த வாரம் நான் எதை மறுவரிசைப்படுத்த வேண்டும்?"
  },
  hi: {
    label: "Medtrix AI से पूछें",
    welcome: "नमस्ते! मैं Medtrix AI हूँ। मैं आज आपकी कैसे मदद कर सकता हूँ?",
    listening: "सुन रहा हूँ...",
    type_message: "Medtrix के बारे में कुछ भी पूछें...",
    error_mic: "वॉइस सुविधाओं का उपयोग करने के लिए माइक्रोफ़ोन अनुमति की आवश्यकता है।",
    error_speech: "वाक् पहचान त्रुटि उत्पन्न हुई।",
    q1: "मैं इस ऐप का उपयोग कैसे करूं?",
    q2: "मैं दवा कैसे जोड़ूं?",
    q3: "मैं बारकोड को कैसे स्कैन करूं?",
    q4: "मैं इनवॉइस कैसे अपलोड करूं?",
    q5: "मैं स्टॉक और समाप्ति की जांच कैसे कर सकता हूं?",
    q6: "मुझे इस सप्ताह क्या रीऑर्डर करना चाहिए?"
  }
};

locales.forEach(lang => {
  const filePath = path.join(__dirname, `src/i18n/locales/${lang}/translation.json`);
  let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  data.assistant = {
    ...data.assistant,
    ...translations[lang]
  };
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
});

console.log('Translations updated successfully.');
