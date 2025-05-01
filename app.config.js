export default ({ config }) => {
  const variant = process.env.APP_VARIANT || 'production';
  const isDev = variant === 'development';

  return {
    ...config,
    name: isDev ? 'SkyLight Dev' : 'SkyLight',
    slug: 'skylight-app', // ✅ must match projectId
    version: '1.0.0',
    orientation: 'portrait',
    icon: isDev ? './assets/icon-dev.png' : './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: isDev ? './assets/logo-dev.png' : './assets/logo.png',
      resizeMode: 'contain',
      backgroundColor: '#000018'
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: isDev
        ? 'com.biobeat.skylightdev'
        : 'com.biobeat.skylightapp'
    },
    android: {
      package: isDev
        ? 'com.biobeat.skylightdev'
        : 'com.biobeat.skylightapp',
      adaptiveIcon: {
        foregroundImage: isDev
          ? './assets/adaptive-icon-dev.png'
          : './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
      }
    },
    web: {
      favicon: './assets/favicon.png'
    },
    extra: {
      eas: {
        projectId: '96dab9c8-1f7c-4d92-bafb-381cf4af73cf' // ✅ this must match Expo project
      },
      appVariant: variant
    },
    owner: 'biobeat'
  };
};
