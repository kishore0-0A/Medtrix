const fs = require('fs');
const path = require('path');

let content = fs.readFileSync(path.join(__dirname, 'src/app/(tabs)/_layout.tsx'), 'utf8');

if (!content.includes('FloatingAssistant')) {
  content = content.replace(
    "import { useTranslation } from 'react-i18next';",
    "import { useTranslation } from 'react-i18next';\nimport FloatingAssistant from '../../components/FloatingAssistant';"
  );
  
  content = content.replace(
    "  return (\n    <Tabs",
    "  return (\n    <>\n      <Tabs"
  );
  content = content.replace(
    "  return (\r\n    <Tabs",
    "  return (\r\n    <>\r\n      <Tabs"
  );
  
  content = content.replace(
    "    </Tabs>\n  );\n}",
    "    </Tabs>\n      <FloatingAssistant />\n    </>\n  );\n}"
  );
  content = content.replace(
    "    </Tabs>\r\n  );\r\n}",
    "    </Tabs>\r\n      <FloatingAssistant />\r\n    </>\r\n  );\r\n}"
  );

  fs.writeFileSync(path.join(__dirname, 'src/app/(tabs)/_layout.tsx'), content);
  console.log('Patched _layout.tsx');
}
