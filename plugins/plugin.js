// const { withAndroidManifest, AndroidConfig } = require("expo/config-plugins");
const {withAndroidManifest,AndroidConfig} =  require("@expo/config-plugins")
// import { ExpoConfig } from "@expo/config-types";
const { getMainApplicationOrThrow } = AndroidConfig.Manifest;

module.exports = function withBackgroundActions(config) {
    return withAndroidManifest(config, async config => {
        const application = getMainApplicationOrThrow(config.modResults);
        const service = !!application.service ? application.service : [];

        config.modResults = {
            "manifest": {
                ...config.modResults.manifest,
                "application": [{
                    ...application,
                    "service": [
                        ...service,
                        {
                            $:{
                                "android:name": "com.asterinet.react.bgactions.RNBackgroundActionsTask"
                            }
                        }
                    ]
                }]
            }
        }
        console.log("👍🏻👍🏻👍🏻👍🏻")
        return config;
    })
}