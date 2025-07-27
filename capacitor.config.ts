import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.stacked.app',
  appName: 'stacked-lifting',
  webDir: 'dist',
  // server: {
  //   url: 'http://192.168.1.192:8080/',
  //   cleartext: true
  // },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;