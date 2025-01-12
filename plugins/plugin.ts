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
                "android:foregroundServiceType": "shortService", // Add this line
              },
          });
          
        // config.modResults.manifest["uses-permission"]
        // config.modResults.manifest.application?.[0].service
        // const application = getMainApplicationOrThrow(config.modResults);
        // const service = !!application.service ? application.service : [];

        // config.modResults = {
        //     "manifest": {
        //         ...config.modResults.manifest,
        //         "uses-permission": [{
                    
        //         }],
        //         "application": [{
        //             ...application,
        //             "service": [
        //                 ...service,
        //                 {
        //                     $:{
        //                         "android:name": "com.asterinet.react.bgactions.RNBackgroundActionsTask",
        //                     },
                            
        //                 }
        //             ]
        //         }]
        //     }
        // }

        return config;
    })
}