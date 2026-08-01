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
      appId: 'ca-app-pub-3425036653232986~7419287290',
    },
  },
};

export default config;
