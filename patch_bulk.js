const fs = require('fs');
const path = require('path');

let content = fs.readFileSync(path.join(__dirname, 'src/app/bulk-import.tsx'), 'utf8');

if (!content.includes('useTranslation')) {
  content = content.replace(
    "import React, { useState } from 'react';",
    "import React, { useState } from 'react';\nimport { useTranslation } from 'react-i18next';"
  );
  
  content = content.replace(
    "export default function BulkImportScreen() {",
    "export default function BulkImportScreen() {\n  const { t, i18n } = useTranslation();"
  );
  
  content = content.replace(
    "<Text style={styles.itemName}>Amoxicillin 500mg</Text>",
    "<Text style={styles.itemName}>{i18n.language === 'ta' ? 'அமாக்சிசிலின் 500 மி.கி' : i18n.language === 'hi' ? 'अमोक्सिसिलिन 500mg' : 'Amoxicillin 500mg'}</Text>\n              <Text style={{ fontSize: 12, color: COLORS.text.muted }}>Original text: Amoxicillin 500mg</Text>"
  );

  content = content.replace(
    "<Text style={styles.itemName}>Paracetamol 250mg</Text>",
    "<Text style={styles.itemName}>{i18n.language === 'ta' ? 'பாராசிட்டமால் 250 மி.கி' : i18n.language === 'hi' ? 'पैरासिटामोल 250mg' : 'Paracetamol 250mg'}</Text>\n              <Text style={{ fontSize: 12, color: COLORS.text.muted }}>Original text: Paracetamol 250mg</Text>"
  );
  
  fs.writeFileSync(path.join(__dirname, 'src/app/bulk-import.tsx'), content);
  console.log('Patched bulk-import.tsx');
}
