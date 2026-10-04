const fs = require('fs');
const path = require('path');

const locales = ['en', 'ta', 'hi'];
const baseDir = path.join(__dirname, 'src/i18n/locales');

const additionalTranslations = {
  en: {
    dashboard: {
      identify_medicine: "Identify the Medicine",
      smart_scan: "Smart Scan",
      medicine_management: "Medicine Management",
      update_invoice: "Update Invoice",
      search_medicines: "Search Medicines",
      total_medicines: "Total Medicines",
      out_of_stock: "Out of Stock",
      upload_invoice: "Upload Invoice",
      bulk_import: "Import multiple medicines from one PDF"
    },
    profile: {
      barcode_stock_check: "Barcode Stock Check",
      barcode_stock_desc: "Scan a barcode to instantly check inventory status.",
      ai_triage: "AI Triage - Smart Stock Advisor",
      ai_triage_desc: "Analyze stock trends and get purchase recommendations."
    },
    ai_triage: {
      title: "Smart Stock Advisor",
      report_title: "Weekly Inventory Report",
      generate_report: "Generate Report",
      low_stock_warnings: "Low Stock Warnings",
      seasonal_trends: "Seasonal Trends",
      ask_question: "Ask inventory questions...",
      insufficient_data: "Insufficient historical data for seasonal forecasting.",
      no_data: "No data available."
    }
  },
  ta: {
    dashboard: {
      identify_medicine: "மருந்தை அடையாளம் காணவும்",
      smart_scan: "ஸ்மார்ட் ஸ்கேன்",
      medicine_management: "மருந்து மேலாண்மை",
      update_invoice: "விலைப்பட்டியலைப் புதுப்பிக்கவும்",
      search_medicines: "மருந்துகளை தேடு",
      total_medicines: "மொத்த மருந்துகள்",
      out_of_stock: "கையிருப்பு இல்லை",
      upload_invoice: "விலைப்பட்டியலை பதிவேற்றவும்",
      bulk_import: "ஒரு PDF இலிருந்து பல மருந்துகளை இறக்குமதி செய்யவும்"
    },
    profile: {
      barcode_stock_check: "பார்கோடு இருப்பு சரிபார்ப்பு",
      barcode_stock_desc: "இருப்பு நிலையை உடனடியாக சரிபார்க்க பார்கோடை ஸ்கேன் செய்யவும்.",
      ai_triage: "AI ட்ரேஜ் - ஸ்மார்ட் ஸ்டாக் ஆலோசகர்",
      ai_triage_desc: "இருப்பு போக்குகளை பகுப்பாய்வு செய்து கொள்முதல் பரிந்துரைகளைப் பெறவும்."
    },
    ai_triage: {
      title: "ஸ்மார்ட் ஸ்டாக் ஆலோசகர்",
      report_title: "வாராந்திர இருப்பு அறிக்கை",
      generate_report: "அறிக்கையை உருவாக்கு",
      low_stock_warnings: "குறைந்த இருப்பு எச்சரிக்கைகள்",
      seasonal_trends: "பருவகால போக்குகள்",
      ask_question: "இருப்பு பற்றிய கேள்விகளை கேளுங்கள்...",
      insufficient_data: "பருவகால முன்னறிவிப்பிற்கான போதிய வரலாற்றுத் தரவு இல்லை.",
      no_data: "தரவு இல்லை."
    }
  },
  hi: {
    dashboard: {
      identify_medicine: "दवा की पहचान करें",
      smart_scan: "स्मार्ट स्कैन",
      medicine_management: "दवा प्रबंधन",
      update_invoice: "चालान अपडेट करें",
      search_medicines: "दवाएं खोजें",
      total_medicines: "कुल दवाएं",
      out_of_stock: "स्टॉक में नहीं है",
      upload_invoice: "चालान अपलोड करें",
      bulk_import: "एक पीडीएफ से कई दवाएं आयात करें"
    },
    profile: {
      barcode_stock_check: "बारकोड स्टॉक चेक",
      barcode_stock_desc: "इन्वेंट्री स्थिति की तुरंत जांच करने के लिए बारकोड स्कैन करें।",
      ai_triage: "एआई ट्राइएज - स्मार्ट स्टॉक सलाहकार",
      ai_triage_desc: "स्टॉक रुझानों का विश्लेषण करें और खरीद अनुशंसाएं प्राप्त करें।"
    },
    ai_triage: {
      title: "स्मार्ट स्टॉक सलाहकार",
      report_title: "साप्ताहिक इन्वेंटरी रिपोर्ट",
      generate_report: "रिपोर्ट तैयार करें",
      low_stock_warnings: "कम स्टॉक की चेतावनी",
      seasonal_trends: "मौसमी रुझान",
      ask_question: "इन्वेंट्री के बारे में प्रश्न पूछें...",
      insufficient_data: "मौसमी पूर्वानुमान के लिए अपर्याप्त ऐतिहासिक डेटा।",
      no_data: "कोई डेटा उपलब्ध नहीं।"
    }
  }
};

locales.forEach(lang => {
  const filePath = path.join(baseDir, lang, 'translation.json');
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (!data.dashboard) data.dashboard = {};
    Object.assign(data.dashboard, additionalTranslations[lang].dashboard);
    
    if (!data.profile) data.profile = {};
    Object.assign(data.profile, additionalTranslations[lang].profile);
    
    data.ai_triage = additionalTranslations[lang].ai_triage;
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${lang} translations.`);
  }
});
