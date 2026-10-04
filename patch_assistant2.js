const fs = require('fs');
const path = require('path');

let content = fs.readFileSync(path.join(__dirname, 'src/components/FloatingAssistant.tsx'), 'utf8');

content = content.replace(
  "  floatingButtonContainer: {\n    position: 'absolute',\n    right: 20,\n    bottom: 100, // Above tab bar\n    zIndex: 999,\n  },",
  "  floatingButtonContainer: {\n    position: 'absolute',\n    right: 20,\n    bottom: 100, // Above tab bar\n    zIndex: 999,\n    elevation: 10,\n  },"
);
content = content.replace(
  "  floatingButtonContainer: {\r\n    position: 'absolute',\r\n    right: 20,\r\n    bottom: 100, // Above tab bar\r\n    zIndex: 999,\r\n  },",
  "  floatingButtonContainer: {\r\n    position: 'absolute',\r\n    right: 20,\r\n    bottom: 100, // Above tab bar\r\n    zIndex: 999,\r\n    elevation: 10,\r\n  },"
);

fs.writeFileSync(path.join(__dirname, 'src/components/FloatingAssistant.tsx'), content);
console.log('Patched floatingButtonContainer elevation');
