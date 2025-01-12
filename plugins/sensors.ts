import {withAndroidManifest,AndroidConfig,withMainApplication,withSettingsGradle,withAppBuildGradle} from "@expo/config-plugins"
import { ExpoConfig } from "@expo/config-types";
import { insertTextAfterSubstring, replaceSubstring } from "./plugin-utilities";


export function withSensorsMainApplication(config:ExpoConfig){
    return withMainApplication(config, config => {
        config.modResults.contents = insertTextAfterSubstring(
            config.modResults.contents,
            "package com.thew1lego.posture",
            "\nimport com.sensors.RNSensorsPackage"
        )
        config.modResults.contents = insertTextAfterSubstring(
            config.modResults.contents,
            "val packages = PackageList(this).packages",
            `\n${" ".repeat(12)}packages.add(RNSensorsPackage())`,
        )
        config.modResults.contents = replaceSubstring(
            config.modResults.contents,
             "val packages = PackageList(this).packages",
             "val packages = PackageList(this).packages.toMutableList()"
        )
        console.log("withSensorsMainApplication")
        return config;
    })
}

export function withSensorsSettingsGradle(config:ExpoConfig) {
    return withSettingsGradle(config,config =>{
        config.modResults.contents = config.modResults.contents + `\n\ninclude ':react-native-sensors'`
        config.modResults.contents = config.modResults.contents + `\nproject(':react-native-sensors').projectDir = new File(rootProject.projectDir,  '../node_modules/react-native-sensors/android')`
        console.log("withSensorsSettingsGradle")
        return config;
    })
}
export function withSensorsAppBuildGradle (config:ExpoConfig){
    return withAppBuildGradle(config,config => {
        config.modResults.contents = insertTextAfterSubstring(
            config.modResults.contents,
            "dependencies {",
            `\n  ${" ".repeat(2)}implementation project(':react-native-sensors')\n`
        )
        console.log("withSensorsAppBuildGradle")
        return config;
    })
}