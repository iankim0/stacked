import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.stacked.app',
  appName: 'stacked-lifting',
  webDir: 'dist',
  server: {
    url: 'https://405231b6-7d0c-42ac-8932-c04cc535ef0b.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;