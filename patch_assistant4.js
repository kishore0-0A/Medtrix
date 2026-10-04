const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/FloatingAssistant.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const newHandleSend = `const handleSend = (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: Message = { id: \`msg-\${messageIdCounter.current++}\`, role: 'user', content: text.trim() };
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
      
      setMessages(prev => [...prev, { id: \`msg-\${messageIdCounter.current++}\`, role: 'assistant', content: reply }]);
      speak(reply);
    }, 1000);
  };`;

// Use regex to replace the entire handleSend function block
content = content.replace(/const handleSend = \(text: string\) => \{[\s\S]*?\}, 1000\);\s*\};/, newHandleSend);

// Modify UI
content = content.replace(
  "<Pressable style={[styles.floatingButton, GLASS.hero]} onPress={openAssistant}>\n          <Text style={styles.robotEmoji}>🤖</Text>\n        </Pressable>",
  "<Pressable style={[styles.floatingButton, GLASS.hero]} onPress={openAssistant}>\n          <Text style={styles.robotEmojiSmall}>🤖</Text>\n          <Text style={styles.launcherText}>{t('assistant.label')}</Text>\n        </Pressable>"
);
content = content.replace(
  "<Pressable style={[styles.floatingButton, GLASS.hero]} onPress={openAssistant}>\r\n          <Text style={styles.robotEmoji}>🤖</Text>\r\n        </Pressable>",
  "<Pressable style={[styles.floatingButton, GLASS.hero]} onPress={openAssistant}>\r\n          <Text style={styles.robotEmojiSmall}>🤖</Text>\r\n          <Text style={styles.launcherText}>{t('assistant.label')}</Text>\r\n        </Pressable>"
);

content = content.replace(
  "[t('assistant.suggestion_1'), t('assistant.suggestion_2')]",
  "[t('assistant.q1'), t('assistant.q2'), t('assistant.q3'), t('assistant.q4'), t('assistant.q5'), t('assistant.q6')]"
);

content = content.replace(
  "placeholder={t('assistant.type_message')}",
  "placeholder={t('assistant.type_message')}\n                multiline={true}"
);

content = content.replace(
  "height: 44, backgroundColor",
  "minHeight: 44, maxHeight: 100, backgroundColor, paddingVertical: 12"
);

// Fix styling for the pill button
content = content.replace(
  "  floatingButton: {\n    width: 56,\n    height: 56,\n    borderRadius: 28,\n    alignItems: 'center',\n    justifyContent: 'center',",
  "  floatingButton: {\n    flexDirection: 'row',\n    paddingHorizontal: 16,\n    height: 56,\n    borderRadius: 28,\n    alignItems: 'center',\n    justifyContent: 'center',"
);
content = content.replace(
  "  floatingButton: {\r\n    width: 56,\r\n    height: 56,\r\n    borderRadius: 28,\r\n    alignItems: 'center',\r\n    justifyContent: 'center',",
  "  floatingButton: {\r\n    flexDirection: 'row',\r\n    paddingHorizontal: 16,\r\n    height: 56,\r\n    borderRadius: 28,\r\n    alignItems: 'center',\r\n    justifyContent: 'center',"
);

// Add launcherText style if not exists
if (!content.includes('launcherText: {')) {
  content = content.replace(
    "  robotEmojiSmall: { fontSize: 20, marginRight: 8 },",
    "  robotEmojiSmall: { fontSize: 20, marginRight: 8 },\n  launcherText: { ...TYPOGRAPHY.bodyBold, color: COLORS.brand.deep, fontSize: 14 },"
  );
}

fs.writeFileSync(filePath, content);
console.log('FloatingAssistant patched successfully.');
