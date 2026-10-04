const fs = require('fs');
const path = require('path');

// Fix notifications.tsx
const notifPath = path.join(__dirname, 'src/app/profile/notifications.tsx');
let notif = fs.readFileSync(notifPath, 'utf8');

// Move loadNotifications and checkPushPermissions up
if (notif.includes('useEffect(() => {')) {
  // We'll just replace const loadNotifications = async () => with function loadNotifications() so it hoists
  notif = notif.replace(/const loadNotifications = async \(\) => {/g, 'async function loadNotifications() {');
  notif = notif.replace(/const checkPushPermissions = async \(\) => {/g, 'async function checkPushPermissions() {');
  fs.writeFileSync(notifPath, notif);
}

// Fix personal-info.tsx
const infoPath = path.join(__dirname, 'src/app/profile/personal-info.tsx');
let info = fs.readFileSync(infoPath, 'utf8');
if (info.includes('useEffect(() => {')) {
  info = info.replace(/const loadProfile = async \(\) => {/g, 'async function loadProfile() {');
  fs.writeFileSync(infoPath, info);
}

console.log('Fixed hoisted function errors');
