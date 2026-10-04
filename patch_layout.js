const fs = require('fs');
const path = require('path');

let content = fs.readFileSync(path.join(__dirname, 'src/app/(tabs)/_layout.tsx'), 'utf8');

if (!content.includes('FloatingAssistant')) {
  // Add import
  content = content.replace(
    "import { useSafeAreaInsets } from 'react-native-safe-area-context';",
    "import { useSafeAreaInsets } from 'react-native-safe-area-context';\nimport FloatingAssistant from '../../components/FloatingAssistant';"
  );
  
  // Wrap Tabs in a Fragment and add FloatingAssistant
  content = content.replace(
    "return (\n    <Tabs",
    "return (\n    <>\n    <Tabs"
  );
  
  content = content.replace(
    "      />\n    </Tabs>\n  );\n}",
    "      />\n    </Tabs>\n    <FloatingAssistant />\n    </>\n  );\n}"
  );
  
  fs.writeFileSync(path.join(__dirname, 'src/app/(tabs)/_layout.tsx'), content);
  console.log('Patched _layout.tsx');
}
