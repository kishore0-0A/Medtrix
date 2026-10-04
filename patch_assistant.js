const fs = require('fs');
const path = require('path');

let content = fs.readFileSync(path.join(__dirname, 'src/components/FloatingAssistant.tsx'), 'utf8');

// 1. Change KeyboardAvoidingView behavior
content = content.replace(
  "behavior={Platform.OS === 'ios' ? 'padding' : 'height'}",
  "behavior={Platform.OS === 'ios' ? 'padding' : undefined}"
);

// 2. Change styles for chatPanel to be more robust
content = content.replace(
  "  chatPanel: {\n    height: '80%',\n    backgroundColor: 'rgba(255,255,255,0.95)',",
  "  chatPanel: {\n    flex: 1,\n    marginTop: '20%',\n    backgroundColor: 'rgba(255,255,255,0.95)',"
);
content = content.replace(
  "  chatPanel: {\r\n    height: '80%',\r\n    backgroundColor: 'rgba(255,255,255,0.95)',",
  "  chatPanel: {\r\n    flex: 1,\r\n    marginTop: '20%',\r\n    backgroundColor: 'rgba(255,255,255,0.95)',"
);

// 3. Make the ScrollView flex: 1
content = content.replace(
  "  messageList: { padding: 20 },",
  "  messageList: { padding: 20, flexGrow: 1 },"
);

// 4. Add flex: 1 to ScrollView inline style
content = content.replace(
  "<ScrollView contentContainerStyle={styles.messageList}>",
  "<ScrollView style={{ flex: 1 }} contentContainerStyle={styles.messageList} keyboardShouldPersistTaps='handled'>"
);

// 5. Ensure suggestions Row does not collapse, and input Area is correctly placed.
// Actually, flex: 1 on chatPanel, and flex: 1 on ScrollView handles everything perfectly.

// Write it back
fs.writeFileSync(path.join(__dirname, 'src/components/FloatingAssistant.tsx'), content);
console.log('Patched FloatingAssistant.tsx');
