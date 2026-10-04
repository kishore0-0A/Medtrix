const fs = require('fs');
const path = require('path');

let content = fs.readFileSync(path.join(__dirname, 'src/app/(tabs)/index.tsx'), 'utf8');

if (!content.includes('useTranslation')) {
  content = content.replace(
    "import { router } from 'expo-router';",
    "import { router } from 'expo-router';\nimport { useTranslation } from 'react-i18next';"
  );
  
  content = content.replace(
    "export default function HomeScreen() {",
    "export default function HomeScreen() {\n  const { t } = useTranslation();"
  );
  
  content = content.replace(
    "<Text style={styles.scanLabel}>\n                    SMART SCAN\n                  </Text>",
    "<Text style={styles.scanLabel}>\n                    {t('dashboard.smart_scan').toUpperCase()}\n                  </Text>"
  );

  content = content.replace(
    "SMART SCAN",
    "{t('dashboard.smart_scan').toUpperCase()}"
  );
  
  content = content.replace(
    "Identify medicine{'\\n'}\n                  in seconds.",
    "{t('dashboard.identify_medicine')}"
  );

  content = content.replace(
    "Identify medicine",
    "{t('dashboard.identify_medicine')}"
  );

  content = content.replace(
    "Identify medicine{'\\n'}in seconds.",
    "{t('dashboard.identify_medicine')}"
  );

  // We'll replace the full text blocks
  content = content.replace(
    /<Text style=\{styles\.scanTitle\}>([\s\S]*?)<\/Text>/,
    '<Text style={styles.scanTitle}>{t(\'dashboard.identify_medicine\')}</Text>'
  );

  content = content.replace(
    /<Text style=\{styles\.scanLabel\}>([\s\S]*?)<\/Text>/,
    '<Text style={styles.scanLabel}>{t(\'dashboard.smart_scan\').toUpperCase()}</Text>'
  );
  
  fs.writeFileSync(path.join(__dirname, 'src/app/(tabs)/index.tsx'), content);
  console.log('Patched index.tsx');
}
