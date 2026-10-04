const fs = require('fs');
const path = require('path');

// Fix notifications.tsx
const notifPath = path.join(__dirname, 'src/app/profile/notifications.tsx');
let notif = fs.readFileSync(notifPath, 'utf8');

if (notif.includes('useEffect(() => {')) {
  notif = notif.replace(
    /useEffect\(\(\) => \{\s+loadNotifications\(\);\s+checkPushPermissions\(\);\s+\}, \[\]\);/g,
    ''
  );
  
  notif = notif.replace(
    /const markAsRead = async \(id: string\) => \{/g,
    'useEffect(() => {\n    loadNotifications();\n    checkPushPermissions();\n  }, []);\n\n  const markAsRead = async (id: string) => {'
  );
  fs.writeFileSync(notifPath, notif);
}

// Fix personal-info.tsx
const infoPath = path.join(__dirname, 'src/app/profile/personal-info.tsx');
let info = fs.readFileSync(infoPath, 'utf8');

if (info.includes('useEffect(() => {')) {
  info = info.replace(
    /useEffect\(\(\) => \{\s+loadProfile\(\);\s+\}, \[\]\);/g,
    ''
  );
  
  info = info.replace(
    /const validate = \(\) => \{/g,
    'useEffect(() => {\n    loadProfile();\n  }, []);\n\n  const validate = () => {'
  );
  fs.writeFileSync(infoPath, info);
}

console.log('Fixed lint hoisting completely');
