const path = require('path');
const Module = require('module');

process.env.EXPO_PUBLIC_SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project-ref.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-or-publishable-key';

// Alias react-native and native expo modules for node test execution
const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request === 'react-native') {
    return originalResolveFilename.call(this, 'react-native-web', parent, isMain, options);
  }
  if (request === 'expo-secure-store') {
    return path.resolve(__dirname, 'mock-secure-store.js');
  }
  if (request === 'expo-print') {
    return path.resolve(__dirname, 'mock-expo-print.js');
  }
  if (request === 'expo-sharing') {
    return path.resolve(__dirname, 'mock-expo-sharing.js');
  }
  if (request === 'expo-file-system/legacy' || request === 'expo-file-system') {
    return path.resolve(__dirname, 'mock-expo-file-system.js');
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

require('./mock-secure-store.js');
