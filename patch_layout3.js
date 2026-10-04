const fs = require('fs');
const path = require('path');

const layoutPath = path.join(__dirname, 'src/app/(tabs)/_layout.tsx');
let layout = fs.readFileSync(layoutPath, 'utf8');

// Insert import if not exists
if (!layout.includes('import FloatingAssistant')) {
  layout = layout.replace(
    "import { useTranslation } from 'react-i18next';",
    "import { useTranslation } from 'react-i18next';\nimport FloatingAssistant from '../../components/FloatingAssistant';"
  );
}

// Wrap Tabs in Fragment and add FloatingAssistant
if (!layout.includes('<FloatingAssistant />')) {
  layout = layout.replace(
    "<Tabs\n      screenOptions=",
    "<>\n    <Tabs\n      screenOptions="
  );
  layout = layout.replace(
    "<Tabs\r\n      screenOptions=",
    "<>\r\n    <Tabs\r\n      screenOptions="
  );

  layout = layout.replace(
    "      />\n    </Tabs>\n  );\n}",
    "      />\n    </Tabs>\n    <FloatingAssistant />\n    </>\n  );\n}"
  );
  layout = layout.replace(
    "      />\r\n    </Tabs>\r\n  );\r\n}",
    "      />\r\n    </Tabs>\r\n    <FloatingAssistant />\r\n    </>\r\n  );\r\n}"
  );
  
  fs.writeFileSync(layoutPath, layout);
  console.log('Successfully added FloatingAssistant to _layout.tsx');
}
