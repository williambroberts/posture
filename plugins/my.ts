// C:\Users\thew1\RN\posture\android\app\src\main\java\com\thew1lego\posture\GyroscopeModule.kt

import { withMainActivity, withMainApplication } from "@expo/config-plugins";
import { ExpoConfig } from "expo/config";
import fs from "fs"
import path from "path"
import { insertTextAfterSubstring } from "./plugin-utilities";
// package com.example.gyroscopemodule

// import android.content.Context
// import android.hardware.Sensor
// import android.hardware.SensorEvent
// import android.hardware.SensorEventListener
// import android.hardware.SensorManager
// import com.facebook.react.bridge.ReactApplicationContext
// import com.facebook.react.bridge.ReactContextBaseJavaModule
// import com.facebook.react.bridge.ReactMethod
// import com.facebook.react.bridge.Callback
// import com.facebook.react.bridge.ReactInstanceManager
// import com.facebook.react.bridge.NativeModule
// import com.facebook.react.bridge.ReactApplicationContext
// import com.facebook.react.bridge.LifecycleEventListener
// import com.facebook.react.bridge.ReactContextBaseJavaModule
// import com.facebook.react.bridge.ReactMethod
// import com.facebook.react.modules.core.DeviceEventManagerModule

// class GyroscopeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

//     private val sensorManager: SensorManager =
//         reactContext.getSystemService(Context.SENSOR_SERVICE) as SensorManager
//     private val gyroscopeSensor: Sensor? = sensorManager.getDefaultSensor(Sensor.TYPE_GYROSCOPE)
//     private var gyroscopeListener: SensorEventListener? = null

//     init {
//         gyroscopeListener = object : SensorEventListener {
//             override fun onSensorChanged(event: SensorEvent?) {
//                 event?.let {
//                     if (it.sensor.type == Sensor.TYPE_GYROSCOPE) {
//                         val x = it.values[0]
//                         val y = it.values[1]
//                         val z = it.values[2]
//                         sendGyroscopeDataToJS(x, y, z)
//                     }
//                 }
//             }

//             override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
//                 // Optional: Handle accuracy changes if needed
//             }
//         }
//     }

//     // Send the gyroscope data to JavaScript
//     private fun sendGyroscopeDataToJS(x: Float, y: Float, z: Float) {
//         val params = HashMap<String, Float>()
//         params["x"] = x
//         params["y"] = y
//         params["z"] = z
//         sendEvent(reactApplicationContext, "GyroscopeData", params)
//     }

//     private fun sendEvent(reactContext: ReactApplicationContext, eventName: String, params: HashMap<String, Float>) {
//         reactContext
//             .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
//             .emit(eventName, params)


// const path = require('path');
// const fs = require('fs');

const GYROSCOPE_KOTLIN_CODE = `
package com.myapp

import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class GyroscopeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), SensorEventListener {
    private var sensorManager: SensorManager? = null
    private var gyroscope: Sensor? = null

    init {
        sensorManager = reactContext.getSystemService(SensorManager::class.java)
        gyroscope = sensorManager?.getDefaultSensor(Sensor.TYPE_GYROSCOPE)
    }

    override fun getName(): String {
        return "GyroscopeModule"
    }

    @ReactMethod
    fun startListening() {
        gyroscope?.let {
            sensorManager?.registerListener(this, it, SensorManager.SENSOR_DELAY_UI)
        }
    }

    @ReactMethod
    fun stopListening() {
        sensorManager?.unregisterListener(this)
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (event?.sensor?.type == Sensor.TYPE_GYROSCOPE) {
            val data = mapOf(
                "x" to event.values[0],
                "y" to event.values[1],
                "z" to event.values[2]
            )
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("GyroscopeData", data)
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
}
`;
const MY_CODE = `
package com.mynumbermodule

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MyNumberModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("MyNumberModule")

        // Simple function that returns a number
        Function("getNumber") {
            return@Function 42
        }

        // Optional: Async version if you need it
        AsyncFunction("getNumberAsync") {
            return@AsyncFunction 42
        }
    }
}
`
export function withGyroscopeMainApplication(config:ExpoConfig) {
  return withMainApplication(config, async (config) => {
    // Define the path where the Kotlin file will be written
    const mainJavaPath = path.join(
      config.modRequest.platformProjectRoot,
      'app/src/main/java/com/thew1lego/posture'
    );

    // Ensure the directory exists
    if (!fs.existsSync(mainJavaPath)) {
      fs.mkdirSync(mainJavaPath, { recursive: true });
    }

    // Write the Kotlin file
    const gyroscopeFilePath = path.join(mainJavaPath, 'GyroscopeModule.kt');
    fs.writeFileSync(gyroscopeFilePath, MY_CODE, { encoding: 'utf8' });
    // config.modResults.contents = `import com.thew1lego.posture.GyroscopeModule\n` + config.modResults.contents
    config.modResults.contents = insertTextAfterSubstring(
        config.modResults.contents,
        "package com.thew1lego.posture",
        "\nimport com.thew1lego.posture.GyroscopeModule\n"
    )
    
    config.modResults.contents = insertTextAfterSubstring(
            config.modResults.contents,
            "val packages = PackageList(this).packages",
            `\n${" ".repeat(12)}packages.add(GyroscopeModule())`,
        )

    return config;
  });
}
export function withGyroscopeMainActivity(config:ExpoConfig){
    return withMainActivity(config,config => {
        //config.modResults.contents = `package com.thew1lego.posture\n` + config.modResults.contents
        return config
    })
}
// module.exports = withGyroscopeModule;
