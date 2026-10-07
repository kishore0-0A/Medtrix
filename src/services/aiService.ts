import { supabase } from '../supabase';
import { router } from 'expo-router';
import i18n from '../i18n';

export interface AIResponse {
  answer: string;
  action?: 'NAVIGATE' | 'NONE';
  route?: string;
}

export async function askAssistant(question: string, language: string, currentPath: string = ''): Promise<AIResponse> {
  try {
    // Attempt to call a secure backend edge function
    const { data, error } = await supabase.functions.invoke('ask-assistant', {
      body: { query: question, language: language }
    });

    if (error) throw error;
    if (data && data.answer) {
      return { answer: data.answer, action: data.action, route: data.route };
    }
  } catch (error) {
    console.log("Backend AI unavailable, falling back to local context logic", error);
  }
  const lowerText = question.toLowerCase();
  let reply = "";
  let action: 'NAVIGATE' | 'NONE' = 'NONE';
  let route = "";

  if (lowerText.includes("where am i") || lowerText.includes("நான் எங்கே இருக்கிறேன்") || lowerText.includes("मैं कहाँ हूँ")) {
    const screenMap: Record<string, string> = {
      '/inventory': language === 'ta' ? 'மருந்து மேலாண்மை (Inventory)' : language === 'hi' ? 'दवा प्रबंधन (Inventory)' : 'Inventory (Medicine Management)',
      '/scan': language === 'ta' ? 'ஸ்கேன் (Scan)' : language === 'hi' ? 'स्कैन (Scan)' : 'Scan',
      '/alerts': language === 'ta' ? 'எச்சரிக்கைகள் (Alerts)' : language === 'hi' ? 'अलर्ट (Alerts)' : 'Alerts',
      '/profile': language === 'ta' ? 'சுயவிவரம் (Profile)' : language === 'hi' ? 'प्रोफ़ाइल (Profile)' : 'Profile',
      '/checkout': language === 'ta' ? 'விற்பனை (Checkout)' : language === 'hi' ? 'बिक्री (Checkout)' : 'Sales & Checkout',
      '/': language === 'ta' ? 'முகப்பு (Dashboard)' : language === 'hi' ? 'डैशबोर्ड (Dashboard)' : 'Dashboard',
    };
    const currentScreenName = screenMap[currentPath] || (currentPath ? currentPath : (language === 'ta' ? 'மெட்ரிக்சில்' : language === 'hi' ? 'मेड्रिक्स में' : 'in Medtrix'));
    reply = language === 'ta' ? `நீங்கள் இப்போது ${currentScreenName} பக்கத்தில் இருக்கிறீர்கள்.` :
            language === 'hi' ? `आप वर्तमान में ${currentScreenName} पृष्ठ पर हैं।` :
            `You are currently on the ${currentScreenName} screen.`;
  } else if (lowerText.includes("how do i use this app") || lowerText.includes("பயன்படுத்துவது") || lowerText.includes("उपयोग कैसे")) {
    reply = language === 'ta' ? "இந்த பயன்பாடு உங்களின் மருந்து இருப்பை நிர்வகிக்க உதவுகிறது. 'இன்வென்டரி' தாவலில் மருந்துகளை பார்க்கலாம், 'ஸ்கேன்' தாவலில் புதியவற்றை சேர்க்கலாம்." : 
            language === 'hi' ? "यह ऐप आपकी दवा इन्वेंट्री को प्रबंधित करने में मदद करता है। आप 'इन्वेंटरी' में दवाएं देख सकते हैं और 'स्कैन' में नई दवाएं जोड़ सकते हैं।" : 
            "Medtrix helps you manage your pharmacy stock. You can view items in Inventory, add new ones in Scan, and check alerts for low stock.";
  } else if (lowerText.includes("add") || lowerText.includes("சேர்ப்பது") || lowerText.includes("जोड़ें") || lowerText.includes("stock in") || lowerText.includes("stock out")) {
    if (currentPath === '/inventory') {
      reply = language === 'ta' ? "இதே திரையில் 'Add Medicine' என்ற பொத்தானைத் தட்டவும்." : 
              language === 'hi' ? "इसी स्क्रीन पर 'Add Medicine' बटन पर टैप करें।" : 
              "Since you are on the Inventory page, simply tap the 'Add Medicine' button to start adding stock in or out.";
    } else {
      reply = language === 'ta' ? "நான் உங்களை இன்வென்டரி பக்கத்திற்கு அழைத்துச் செல்கிறேன். அங்கு 'Add Medicine' என்பதைத் தட்டவும்." : 
              language === 'hi' ? "मैं आपको इन्वेंटरी पृष्ठ पर ले जा रहा हूँ। वहाँ 'Add Medicine' पर टैप करें।" : 
              "Let me take you to the Inventory page. Tap the 'Add Medicine' button there to add stock.";
      action = 'NAVIGATE';
      route = '/(tabs)/inventory';
    }
  } else if (lowerText.includes("scan") || lowerText.includes("ஸ்கேன்") || lowerText.includes("स्कैन") || lowerText.includes("barcode") || lowerText.includes("qr") || lowerText.includes("camera") || lowerText.includes("ocr")) {
    if (currentPath === '/scan') {
      reply = language === 'ta' ? "நீங்கள் ஏற்கனவே ஸ்கேன் பக்கத்தில் உள்ளீர்கள். கேமராவை பார்கோடுக்கு நேராகக் காட்டவும்." :
              language === 'hi' ? "आप पहले से ही स्कैन पृष्ठ पर हैं। बस बारकोड पर कैमरा पॉइंट करें।" :
              "You are already on the Scan page. Just point the camera at a barcode, QR code, or use OCR to read labels.";
    } else {
      reply = language === 'ta' ? "ஸ்கேன் பக்கத்தை திறக்கிறேன்." :
              language === 'hi' ? "स्कैन पृष्ठ खोल रहा हूँ।" :
              "Opening the Scan tab to read barcodes or medicine labels with the camera or OCR.";
      action = 'NAVIGATE';
      route = '/(tabs)/scan';
    }
  } else if (lowerText.includes("bulk") || lowerText.includes("invoice") || lowerText.includes("இன்வாய்ஸ்") || lowerText.includes("इनवॉइस")) {
    reply = language === 'ta' ? "இன்வென்டரி தாவலில் உள்ள Bulk Import ஐகானைத் தட்டி இன்வாய்ஸைப் பதிவேற்றவும்." :
            language === 'hi' ? "इन्वेंटरी टैब में बल्क इम्पोर्ट आइकन पर टैप करें और इनवॉइस अपलोड करें।" :
            "Tap the Bulk Import icon in the top right of the Inventory tab, then select your PDF or image invoice to scan and upload.";
    action = 'NAVIGATE';
    route = '/(tabs)/inventory';
  } else if (lowerText.includes("sell") || lowerText.includes("checkout") || lowerText.includes("payment") || lowerText.includes("sales") || lowerText.includes("bill") || lowerText.includes("விற்பனை") || lowerText.includes("बिक्री")) {
    if (currentPath === '/checkout') {
      reply = language === 'ta' ? "கார்ட்டில் மருந்துகளைச் சேர்த்து, Pay Now என்பதைத் தட்டவும். கட்டணம் செலுத்திய பிறகு இருப்பு குறையும்." :
              language === 'hi' ? "कार्ट में दवाएं जोड़ें और Pay Now पर टैप करें। भुगतान के बाद स्टॉक कम हो जाएगा।" :
              "You are on the Checkout screen. Add medicines to the cart and tap Pay Now. Stock is deducted only after confirmed payment.";
    } else {
      reply = language === 'ta' ? "விற்பனை மற்றும் செக்அவுட் பக்கத்தை திறக்கிறேன். அங்கே மருந்துகளை விற்கலாம்." :
              language === 'hi' ? "बिक्री और चेकआउट पृष्ठ खोल रहा हूँ। वहाँ आप दवाएं बेच सकते हैं।" :
              "Let me open the Sales & Checkout page. You can manage the payment flow there.";
      action = 'NAVIGATE';
      route = '/checkout';
    }
  } else if (lowerText.includes("expiry") || lowerText.includes("fefo") || lowerText.includes("stock") || lowerText.includes("இருப்பு") || lowerText.includes("स्टॉक") || lowerText.includes("alerts")) {
    reply = language === 'ta' ? "எச்சரிக்கைகள் பக்கத்தை திறக்கிறேன். அங்கு குறைந்த இருப்பு மற்றும் FEFO விவரங்களை காணலாம்." :
            language === 'hi' ? "अलर्ट पृष्ठ खोल रहा हूँ। वहाँ आप कम स्टॉक और FEFO विवरण देख सकते हैं।" :
            "Let me open the Alerts tab so you can see low stock, FEFO tracking, and expiring items.";
    action = 'NAVIGATE';
    route = '/(tabs)/alerts';
  } else if (lowerText.includes("triage") || lowerText.includes("report") || lowerText.includes("reorder") || lowerText.includes("analytics") || lowerText.includes("மறுவரிசை") || lowerText.includes("रीऑर्डर")) {
    reply = language === 'ta' ? "AI Triage பக்கத்தில் உள்ள அறிக்கை, குறையும் சரக்கு மற்றும் மறுவரிசை பரிந்துரைகளை காட்டும்." :
            language === 'hi' ? "AI Triage पेज में रिपोर्ट आपको कम स्टॉक वाले आइटम और रीऑर्डर सिफारिशें दिखाएगी।" :
            "The Weekly AI Report in the AI Triage section tells you exactly what items are running low and gives reorder recommendations. Let's go to your Profile.";
    action = 'NAVIGATE';
    route = '/(tabs)/profile';
  } else if (lowerText.includes("password") || lowerText.includes("security") || lowerText.includes("notification") || lowerText.includes("language") || lowerText.includes("மொழி") || lowerText.includes("भाषा")) {
    reply = language === 'ta' ? "Profile பக்கத்திற்குச் சென்று, Language மற்றும் Security விருப்பங்களை மாற்றவும்." :
            language === 'hi' ? "Profile पृष्ठ पर जाएं और Language और Security विकल्प बदलें।" :
            "You can change your language, password, notifications, and security settings in the Profile tab.";
    action = 'NAVIGATE';
    route = '/(tabs)/profile';
  } else if (lowerText.includes("login") || lowerText.includes("sign in")) {
    reply = language === 'ta' ? "உள்நுழைவு திரை ஆரம்பத்தில் தோன்றும். அங்கேயே மொழியையும் மாற்றலாம்." :
            language === 'hi' ? "साइन इन स्क्रीन शुरू में दिखाई देती है। आप वहां भी भाषा बदल सकते हैं।" :
            "The Login/Sign In screen appears at launch. You can select your language right there before logging in.";
  } else {
    reply = language === 'ta' ? "நான் உங்கள் Medtrix AI உதவியாளர். மருந்துகளை எவ்வாறு சேர்ப்பது, செக்அவுட் செய்வது, பார்கோடுகளை ஸ்கேன் செய்வது, அல்லது இன்வாய்ஸ்களைப் பதிவேற்றுவது எப்படி என்று நீங்கள் என்னிடம் கேட்கலாம்!" :
            language === 'hi' ? "मैं आपका Medtrix AI सहायक हूँ। आप मुझसे पूछ सकते हैं कि दवाएँ कैसे जोड़ें, चेकआउट करें, बारकोड स्कैन करें या चालान अपलोड करें!" :
            "I am your Medtrix AI assistant. You can ask me how to use Medtrix, add medicines, handle checkout, scan barcodes, or upload bulk invoices!";
  }

  return { answer: reply, action, route };
}
