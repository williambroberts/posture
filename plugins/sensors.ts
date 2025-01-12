import {withAndroidManifest,AndroidConfig,withMainApplication,withSettingsGradle,withAppBuildGradle} from "@expo/config-plugins"
import { ExpoConfig } from "@expo/config-types";
import { insertTextAfterSubstring } from "./plugin-utilities";


export function withSensorsMainApplication(config:ExpoConfig){
    return withMainApplication(config, config => {
        config.modResults.contents = insertTextAfterSubstring(
            config.modResults.contents,
            "val packages = PackageList(this).packages",
            `\npackages.add(new RNSensorsPackage())`,
        )
        config.modResults.contents = insertTextAfterSubstring(
            config.modResults.contents,
            "package com.thew1lego.posture",
            "\nimport com.sensors.RNSensorsPackage;"

        )
        return config;
    })
}

export function withSensorsSettingsGradle(config:ExpoConfig) {
    return withSettingsGradle(config,config =>{
        config.modResults.contents = config.modResults.contents + `\n\n include ':react-native-sensors'`
        config.modResults.contents = config.modResults.contents + `\n project(':react-native-sensors').projectDir = new File(rootProject.projectDir,  '../node_modules/react-native-sensors/android')`
        return config;
    })
}
export function withSensorsAppBuildGradle (config:ExpoConfig){
    return withAppBuildGradle(config,config => {
        config.modResults.contents = insertTextAfterSubstring(
            config.modResults.contents,
            "dependencies {",
            `\n  implementation project(':react-native-sensors')\n`
        )
        return config;
    })
}