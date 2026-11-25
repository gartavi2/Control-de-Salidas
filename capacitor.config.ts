import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cr.ed.llg.controlsalidas',
  appName: 'Control de Salidas',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
    backgroundColor: '#0f172a',
  },
  server: {
    androidScheme: 'https',
  },
};

export default config;
