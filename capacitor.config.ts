import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.8bd6553d34084c239498ae5249ab0169',
  appName: 'aura-zen-core',
  webDir: 'dist',
  server: {
    url: 'https://8bd6553d-3408-4c23-9498-ae5249ab0169.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    AdMob: {
      appId: 'ca-app-pub-1738990657158019~1234567890',
    },
  },
};

export default config;
