// const {withBackgroundActions} = require("./plugins/plugin")
import "ts-node/register"; // Add this to import TypeScript files
import { ExpoConfig } from "expo/config";
const withBackgroundActions = require("./plugins/withBackgroundActions");

// import { withPlugins } from '@expo/config-plugins';
// import { withSensorsAppBuildGradle, withSensorsMainApplication, withSensorsSettingsGradle } from './plugins/sensors';
// import { withGyroscopeMainActivity, withGyroscopeMainApplication } from './plugins/my';
const BACKGROUND_COLOR = "#ffffff";
const config: ExpoConfig = {
  name: "Posture Keep", //todow
  slug: "postureKeep",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "postureKeep",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: BACKGROUND_COLOR,
  },
  ios: {
    supportsTablet: true,
  },
  android: {
    permissions: ["VIBRATE"],
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: BACKGROUND_COLOR,
    },
    splash: {
      image: "./assets/images/splash-icon.png",
      backgroundColor: BACKGROUND_COLOR,
      resizeMode: "contain",
    },
    package: "com.thew1lego.posture",
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-sqlite",
    [
      "expo-build-properties",
      {
        android: {
          gradleVersion: "8.13",
        },
      },
    ],
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: BACKGROUND_COLOR,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: "99a91c76-bbbf-42c4-9ad3-e43f69440093",
    },
  },
};

export default withBackgroundActions(config);
