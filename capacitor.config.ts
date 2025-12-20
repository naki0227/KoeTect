import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.yourname.koetekt',
    appName: 'KoeTekt',
    webDir: 'dist',
    server: {
        androidScheme: 'https'
    },
    ios: {
        // Camera, Microphone, Photo Library permissions
        // These will be added to Info.plist
        contentInset: 'automatic',
        backgroundColor: '#050508'
    },
    plugins: {
        // Future plugin configurations
    }
};

export default config;
