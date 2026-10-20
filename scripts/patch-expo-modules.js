const fs = require('fs');
const path = require('path');

// 1. Patch expo-notifications TopicSubscriptionModule.android.js for Expo Go compatibility
const topicSubAndroidPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-notifications',
  'build',
  'TopicSubscriptionModule.android.js'
);

if (fs.existsSync(topicSubAndroidPath)) {
  const content = fs.readFileSync(topicSubAndroidPath, 'utf8');
  if (content.includes("requireNativeModule('ExpoTopicSubscriptionModule')")) {
    const patched = `import { requireOptionalNativeModule } from 'expo-modules-core';

const fallback = {
  addListener: () => {},
  removeListeners: () => {},
  subscribeToTopicAsync: () => Promise.resolve(null),
  unsubscribeFromTopicAsync: () => Promise.resolve(null),
};

export default requireOptionalNativeModule('ExpoTopicSubscriptionModule') ?? fallback;
`;
    fs.writeFileSync(topicSubAndroidPath, patched, 'utf8');
    console.log('[patch-expo-modules] Patched TopicSubscriptionModule.android.js for Expo Go');
  }
}

// 2. Patch @expo/metro-file-map for Windows OneDrive reparse points
const metroCrawlPath = path.join(
  __dirname,
  '..',
  'node_modules',
  '@expo',
  'metro-file-map',
  'build',
  'crawlers',
  'node',
  'index.js'
);

if (fs.existsSync(metroCrawlPath)) {
  const content = fs.readFileSync(metroCrawlPath, 'utf8');
  if (content.includes('const isSymbolicLink = entry.isSymbolicLink();')) {
    const patched = content.replace(
      'const isSymbolicLink = entry.isSymbolicLink();',
      `let isSymbolicLink = entry.isSymbolicLink();
                    if (isSymbolicLink) {
                        try {
                            const stat = fs.lstatSync(file);
                            if (!stat.isSymbolicLink()) {
                                isSymbolicLink = false;
                                isDirectory = stat.isDirectory();
                            }
                        } catch {}
                    }`
    ).replace('const isDirectory = entry.isDirectory();', 'let isDirectory = entry.isDirectory();');
    fs.writeFileSync(metroCrawlPath, patched, 'utf8');
    console.log('[patch-expo-modules] Patched metro-file-map crawler for OneDrive reparse points');
  }
}

// 3. Patch expo-notifications tsconfig.json to remove missing expo-module-scripts dependency
const notificationsTsconfigPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-notifications',
  'tsconfig.json'
);

if (fs.existsSync(notificationsTsconfigPath)) {
  const content = fs.readFileSync(notificationsTsconfigPath, 'utf8');
  if (content.includes('"extends": "expo-module-scripts/tsconfig.base"')) {
    const patched = content.replace('"extends": "expo-module-scripts/tsconfig.base",', '');
    fs.writeFileSync(notificationsTsconfigPath, patched, 'utf8');
    console.log('[patch-expo-modules] Patched expo-notifications tsconfig.json');
  }
}

// 4. Patch expo-notifications setNotificationChannelAsync.android.js for Expo Go compatibility
const setChannelPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-notifications',
  'build',
  'setNotificationChannelAsync.android.js'
);

if (fs.existsSync(setChannelPath)) {
  const content = fs.readFileSync(setChannelPath, 'utf8');
  if (content.includes('return await NotificationChannelManager.setNotificationChannelAsync(channelId, channel);')) {
    const patched = content.replace(
      'return await NotificationChannelManager.setNotificationChannelAsync(channelId, channel);',
      `try {
        return await NotificationChannelManager.setNotificationChannelAsync(channelId, channel);
    } catch (e) {
        if (e.message && (e.message.includes('NotificationsChannelsProvider') || e.message.includes('NullPointerException'))) {
            return null;
        }
        throw e;
    }`
    );
    fs.writeFileSync(setChannelPath, patched, 'utf8');
    console.log('[patch-expo-modules] Patched setNotificationChannelAsync.android.js for Expo Go');
  }
}

// 5. Silence expo-notifications Expo Go limitation console warning in build/index.js
const notificationsIndexPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-notifications',
  'build',
  'index.js'
);

if (fs.existsSync(notificationsIndexPath)) {
  const content = fs.readFileSync(notificationsIndexPath, 'utf8');
  if (content.includes("if (isRunningInExpoGo() && !areWeTestingWithJest())")) {
    const patched = content.replace(
      /if \(isRunningInExpoGo\(\) && !areWeTestingWithJest\(\)\) {[\s\S]*?console\.warn\(message\);[\s\S]*?}/,
      '// Note: In Expo Go, local notifications are fully active while remote push tokens are handled gracefully.'
    );
    fs.writeFileSync(notificationsIndexPath, patched, 'utf8');
    console.log('[patch-expo-modules] Silenced Expo Go console.warn in expo-notifications index.js');
  }
}

// 6. Silence DevicePushTokenAutoRegistration.fx.js warning on Android Expo Go
const autoRegPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-notifications',
  'build',
  'DevicePushTokenAutoRegistration.fx.js'
);

if (fs.existsSync(autoRegPath)) {
  const content = fs.readFileSync(autoRegPath, 'utf8');
  if (content.includes("console.warn('[expo-notifications] Push notifications (remote notifications) are unavailable in Expo Go")) {
    const patched = content.replace(
      "console.warn('[expo-notifications] Push notifications (remote notifications) are unavailable in Expo Go on Android since SDK 53. Local notifications remain available. Use a development build for push notifications: https://docs.expo.dev/develop/development-builds/introduction/');",
      "// Note: Local notifications remain fully available in Expo Go on Android."
    );
    fs.writeFileSync(autoRegPath, patched, 'utf8');
    console.log('[patch-expo-modules] Silenced push notification console.warn in DevicePushTokenAutoRegistration.fx.js');
  }
}
