// const { withAndroidManifest, AndroidConfig } = require("expo/config-plugins");
import {withAndroidManifest,AndroidConfig} from "@expo/config-plugins"
import { ExpoConfig } from "@expo/config-types";
const { getMainApplicationOrThrow, } = AndroidConfig.Manifest;
const  {withPermissions} = AndroidConfig.Permissions

// export const

export default function withBackgroundActions(config:ExpoConfig) {
    config = withPermissions(config, [
        "android.permission.FOREGROUND_SERVICE",
        "android.permission.WAKE_LOCK",
        "android.permission.FOREGROUND_SERVICE_DATA_SYNC", // for dataSync
      ]);
    return withAndroidManifest(config, (config) => {
        if (!config.modResults.manifest.application){
            return config;
        }
        if (!config.modResults.manifest.application[0].service){
            config.modResults.manifest.application[0].service = [];
        }
        config.modResults.manifest.application[0].service.push({
            $: {
                "android:name": "com.asterinet.react.bgactions.RNBackgroundActionsTask",
                "android:foregroundServiceType": "dataSync", // Add this line
                // "android:foregroundServiceType": "shortService", // Add this line
              },
          });
       console.log("🧧")
        return config;
    })
}