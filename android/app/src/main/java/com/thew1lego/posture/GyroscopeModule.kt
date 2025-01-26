package com.example.gyroscopemodule

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactInstanceManager
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class GyroscopeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val sensorManager: SensorManager =
        reactContext.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    private val gyroscopeSensor: Sensor? = sensorManager.getDefaultSensor(Sensor.TYPE_GYROSCOPE)
    private var gyroscopeListener: SensorEventListener? = null

    init {
        gyroscopeListener = object : SensorEventListener {
            override fun onSensorChanged(event: SensorEvent?) {
                event?.let {
                    if (it.sensor.type == Sensor.TYPE_GYROSCOPE) {
                        val x = it.values[0]
                        val y = it.values[1]
                        val z = it.values[2]
                        sendGyroscopeDataToJS(x, y, z)
                    }
                }
            }

            override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
                // Optional: Handle accuracy changes if needed
            }
        }
    }

    // Send the gyroscope data to JavaScript
    private fun sendGyroscopeDataToJS(x: Float, y: Float, z: Float) {
        val params = HashMap<String, Float>()
        params["x"] = x
        params["y"] = y
        params["z"] = z
        sendEvent(reactApplicationContext, "GyroscopeData", params)
    }

    private fun sendEvent(reactContext: ReactApplicationContext, eventName: String, params: HashMap<String, Float>) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
