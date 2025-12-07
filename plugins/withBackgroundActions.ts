const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function withBackgroundActions(config:any) {
  return withAndroidManifest(config, (config:any) => {
    const { manifest } = config.modResults;

    // Add permissions manually
    if (!manifest["uses-permission"]) {
      manifest["uses-permission"] = [];
    }

    const permissions = [
      "android.permission.FOREGROUND_SERVICE",
      "android.permission.WAKE_LOCK",
      "android.permission.FOREGROUND_SERVICE_DATA_SYNC",
    ];

    permissions.forEach((permission) => {
      if (!manifest["uses-permission"]?.some((p:any) => p.$["android:name"] === permission)) {
        manifest["uses-permission"]?.push({
          $: { "android:name": permission },
        });
      }
    });

    // Add service
    if (!manifest.application) {
      return config;
    }
    if (!manifest.application[0].service) {
      manifest.application[0].service = [];
    }

    manifest.application[0].service.push({
      $: {
        "android:name": "com.asterinet.react.bgactions.RNBackgroundActionsTask",
        "android:foregroundServiceType": "dataSync",
      },
    });

    console.log("🧧 Background service added");
    return config;
  });
};