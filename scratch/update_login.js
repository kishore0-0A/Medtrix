const fs = require('fs');

const loginPath = 'src/app/auth/login.tsx';
let content = fs.readFileSync(loginPath, 'utf8');

// 1. Imports
content = content.replace(
  "import { Auth } from '../../supabase';",
  "import { Auth } from '../../supabase';\nimport { useTranslation } from 'react-i18next';\nimport { changeLanguage } from '../../i18n';"
);

// 2. Component Setup
content = content.replace(
  "export default function LoginScreen() {\n  const [email, setEmail] = useState('');",
  "export default function LoginScreen() {\n  const { t, i18n } = useTranslation();\n  const [email, setEmail] = useState('');"
);

// 3. Alerts
content = content.replace(
  /'Missing information',\n\s+'Please enter your email or employee ID and password\.'/g,
  "t('auth.missing_info'),\n        t('auth.missing_info_desc')"
);
content = content.replace(
  /'Sign in failed',\n\s+error\.message/g,
  "t('auth.sign_in_failed'), error.message"
);
content = content.replace(
  /'Something went wrong',\n\s+err\?\.message \|\| 'Unable to sign in\. Please try again\.'/g,
  "t('auth.something_wrong'),\n        err?.message || t('auth.unable_to_sign_in')"
);

// 4. Language Selector
content = content.replace(
  /<KeyboardAvoidingView\n\s+style=\{styles\.keyboardView\}\n\s+behavior=\{Platform\.OS === 'ios' \? 'padding' : undefined\}\n\s+>/g,
  `<View style={styles.languageRow}>
        <TouchableOpacity onPress={() => changeLanguage('en')}>
          <Text style={[styles.langText, i18n.language === 'en' && styles.langActive]}>English</Text>
        </TouchableOpacity>
        <Text style={styles.langDivider}>|</Text>
        <TouchableOpacity onPress={() => changeLanguage('ta')}>
          <Text style={[styles.langText, i18n.language === 'ta' && styles.langActive]}>தமிழ்</Text>
        </TouchableOpacity>
        <Text style={styles.langDivider}>|</Text>
        <TouchableOpacity onPress={() => changeLanguage('hi')}>
          <Text style={[styles.langText, i18n.language === 'hi' && styles.langActive]}>हिन्दी</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >`
);

// 5. Texts
content = content.replace(/SECURE ACCESS/g, "{t('auth.secure_access')}");
content = content.replace(/Welcome back\./g, "{t('auth.welcome_back')}");
content = content.replace(/Sign in to manage your medical inventory,\n\s+stock levels and dispensing activity\./g, "{t('auth.subtitle')}");

content = content.replace(/>\n\s+EMAIL\n\s+<\/Text>/g, ">\n                  {t('auth.email')}\n                </Text>");
content = content.replace(/>\n\s+REQUIRED\n\s+<\/Text>/g, ">\n                  {t('auth.required')}\n                </Text>");
content = content.replace(/placeholder="name@hospital\.org"/g, "placeholder={t('auth.email_placeholder')}");

content = content.replace(/>\n\s+PASSWORD\n\s+<\/Text>/g, ">\n                  {t('auth.password')}\n                </Text>");
content = content.replace(/placeholder="Enter your password"/g, "placeholder={t('auth.password_placeholder')}");

content = content.replace(/>\n\s+Remember this device\n\s+<\/Text>/g, ">\n                  {t('auth.remember_me')}\n                </Text>");
content = content.replace(/>\n\s+Forgot password\?\n\s+<\/Text>/g, ">\n                  {t('auth.forgot_password')}\n                </Text>");

content = content.replace(/>\n\s+AUTHENTICATING\.\.\.\n\s+<\/Text>/g, ">\n                      {t('auth.authenticating')}\n                    </Text>");
content = content.replace(/>\n\s+Sign In\n\s+<\/Text>/g, ">\n                      {t('auth.sign_in')}\n                    </Text>");

content = content.replace(/>\n\s+Secure authentication powered by Medtrix\n\s+<\/Text>/g, ">\n                {t('auth.security_note')}\n              </Text>");

content = content.replace(/>OR<\/Text>/g, ">{t('auth.or')}</Text>");

content = content.replace(/>\n\s+Continue with Google\n\s+<\/Text>/g, ">\n                  {t('auth.continue_google')}\n                </Text>");
content = content.replace(/>\n\s+Use your hospital Google account\n\s+<\/Text>/g, ">\n                  {t('auth.google_subtitle')}\n                </Text>");

content = content.replace(/>\n\s+Don&apos;t have an account\?\n\s+<\/Text>/g, ">\n              {t('auth.no_account')}\n            </Text>");
content = content.replace(/>\n\s+Create account\n\s+<\/Text>/g, ">\n                {t('auth.create_account')}\n              </Text>");

// 6. Styles
content = content.replace(
  "backgroundColor: COLORS.background.canvas,\n  },",
  "backgroundColor: COLORS.background.canvas,\n  },\n\n  languageRow: {\n    flexDirection: 'row',\n    justifyContent: 'center',\n    alignItems: 'center',\n    paddingTop: 10,\n    zIndex: 10,\n  },\n  langText: {\n    ...TYPOGRAPHY.body,\n    fontSize: 12,\n    color: COLORS.text.muted,\n  },\n  langActive: {\n    ...TYPOGRAPHY.bodyBold,\n    color: COLORS.brand.primary,\n  },\n  langDivider: {\n    marginHorizontal: 8,\n    color: COLORS.text.disabled,\n  },"
);

fs.writeFileSync(loginPath, content);
console.log('Updated login.tsx');
