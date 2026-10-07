const fs = require('fs');
const path = require('path');

const locales = ['en', 'ta', 'hi'];
const baseDir = path.join(__dirname, '../src/i18n/locales');

const additionalTranslations = {
  en: {
    auth: {
      secure_access: "SECURE ACCESS",
      welcome_back: "Welcome back.",
      subtitle: "Sign in to manage your medical inventory, stock levels and dispensing activity.",
      email: "EMAIL",
      required: "REQUIRED",
      email_placeholder: "name@hospital.org",
      password: "PASSWORD",
      password_placeholder: "Enter your password",
      remember_me: "Remember this device",
      forgot_password: "Forgot password?",
      sign_in: "Sign In",
      authenticating: "AUTHENTICATING...",
      security_note: "Secure authentication powered by Medtrix",
      or: "OR",
      continue_google: "Continue with Google",
      google_subtitle: "Use your hospital Google account",
      no_account: "Don't have an account?",
      create_account: "Create account",
      missing_info: "Missing information",
      missing_info_desc: "Please enter your email or employee ID and password.",
      sign_in_failed: "Sign in failed",
      something_wrong: "Something went wrong",
      unable_to_sign_in: "Unable to sign in. Please try again."
    }
  },
  ta: {
    auth: {
      secure_access: "பாதுகாப்பான அணுகல்",
      welcome_back: "மீண்டும் வருக.",
      subtitle: "உங்கள் மருத்துவ இருப்பு, சரக்கு நிலைகள் மற்றும் விநியோக நடவடிக்கைகளை நிர்வகிக்க உள்நுழைக.",
      email: "மின்னஞ்சல்",
      required: "தேவை",
      email_placeholder: "name@hospital.org",
      password: "கடவுச்சொல்",
      password_placeholder: "உங்கள் கடவுச்சொல்லை உள்ளிடவும்",
      remember_me: "இந்தச் சாதனத்தை நினைவில் கொள்க",
      forgot_password: "கடவுச்சொல்லை மறந்துவிட்டீர்களா?",
      sign_in: "உள்நுழை",
      authenticating: "அங்கீகரிக்கிறது...",
      security_note: "Medtrix மூலம் பாதுகாப்பான அங்கீகாரம்",
      or: "அல்லது",
      continue_google: "Google மூலம் தொடரவும்",
      google_subtitle: "உங்கள் மருத்துவமனை Google கணக்கைப் பயன்படுத்தவும்",
      no_account: "கணக்கு இல்லையா?",
      create_account: "கணக்கை உருவாக்கு",
      missing_info: "தகவல் இல்லை",
      missing_info_desc: "தயவுசெய்து உங்கள் மின்னஞ்சல் அல்லது பணியாளர் அடையாள எண் மற்றும் கடவுச்சொல்லை உள்ளிடவும்.",
      sign_in_failed: "உள்நுழைவு தோல்வியடைந்தது",
      something_wrong: "ஏதோ தவறு நடந்துவிட்டது",
      unable_to_sign_in: "உள்நுழைய முடியவில்லை. மீண்டும் முயற்சிக்கவும்."
    }
  },
  hi: {
    auth: {
      secure_access: "सुरक्षित पहुंच",
      welcome_back: "वापसी पर स्वागत है।",
      subtitle: "अपनी चिकित्सा सूची, स्टॉक स्तर और वितरण गतिविधि को प्रबंधित करने के लिए साइन इन करें।",
      email: "ईमेल",
      required: "आवश्यक",
      email_placeholder: "name@hospital.org",
      password: "पासवर्ड",
      password_placeholder: "अपना पासवर्ड दर्ज करें",
      remember_me: "इस डिवाइस को याद रखें",
      forgot_password: "पासवर्ड भूल गए?",
      sign_in: "साइन इन करें",
      authenticating: "प्रमाणीकरण...",
      security_note: "Medtrix द्वारा संचालित सुरक्षित प्रमाणीकरण",
      or: "या",
      continue_google: "Google के साथ जारी रखें",
      google_subtitle: "अपने अस्पताल के Google खाते का उपयोग करें",
      no_account: "खाता नहीं है?",
      create_account: "खाता बनाएँ",
      missing_info: "जानकारी गायब है",
      missing_info_desc: "कृपया अपना ईमेल या कर्मचारी आईडी और पासवर्ड दर्ज करें।",
      sign_in_failed: "साइन इन विफल रहा",
      something_wrong: "कुछ गलत हो गया",
      unable_to_sign_in: "साइन इन करने में असमर्थ। कृपया पुनः प्रयास करें।"
    }
  }
};

locales.forEach(lang => {
  const filePath = path.join(baseDir, lang, 'translation.json');
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    data.auth = additionalTranslations[lang].auth;
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${lang} translations.`);
  }
});
