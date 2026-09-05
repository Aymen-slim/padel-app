import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Court Club · Prototype',
  slug: 'court-club-prototype',
  version: '0.1.0',
  scheme: 'courtclubdemo',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  ios: { supportsTablet: true, bundleIdentifier: 'com.courtclub.prototype' },
  web: { bundler: 'metro', output: 'single', name: 'Court Club · Prototype' },
  plugins: ['expo-router'],
  extra: { mode: 'prototype' },
};

export default config;
