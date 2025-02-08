package expo.modules.mymodule

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.net.URL
import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import expo.modules.kotlin.Promise

class MyModule : Module() {
    private var sensorManager: SensorManager? = null
    private var gyroscope: Sensor? = null
    private var gyroscopeListener: SensorEventListener? = null

  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('MyModule')` in JavaScript.
    Name("MyModule")

    // Sets constant properties on the module. Can take a dictionary or a closure that returns a dictionary.
    Constants(
            "PI" to Math.PI,
            "SENSOR_DELAY_NORMAL" to SensorManager.SENSOR_DELAY_NORMAL,
            "SENSOR_DELAY_UI" to SensorManager.SENSOR_DELAY_UI,
            "SENSOR_DELAY_GAME" to SensorManager.SENSOR_DELAY_GAME,
            "SENSOR_DELAY_FASTEST" to SensorManager.SENSOR_DELAY_FASTEST
        )

    // Defines event names that the module can send to JavaScript.
     Events("onGyroscopeChange")

    // Function to start listening to gyroscope
        AsyncFunction("startGyroscope") { promise: Promise ->
            try {
                startGyroscope()
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("GYROSCOPE_ERROR", "Failed to start gyroscope: ${e.message}")
            }
        }

        // Function to stop listening to gyroscope
        AsyncFunction("stopGyroscope") { promise: Promise ->
            try {
                stopGyroscope()
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("GYROSCOPE_ERROR", "Failed to stop gyroscope: ${e.message}")
            }
        }

        // Function to check if gyroscope is available
        Function("isGyroscopeAvailable") {
            val sensorManager = appContext.getSystemService(Context.SENSOR_SERVICE) as SensorManager
            sensorManager.getDefaultSensor(Sensor.TYPE_GYROSCOPE) != null
        }

        OnCreate {
            sensorManager = appContext.getSystemService(Context.SENSOR_SERVICE) as SensorManager
            gyroscope = sensorManager?.getDefaultSensor(Sensor.TYPE_GYROSCOPE)
        }

        OnDestroy {
            stopGyroscope()
        }
    }

    private fun startGyroscope() {
        if (gyroscopeListener != null) {
            return
        }

        gyroscopeListener = object : SensorEventListener {
            override fun onSensorChanged(event: SensorEvent) {
                sendEvent("onGyroscopeChange", mapOf(
                    "x" to event.values[0],
                    "y" to event.values[1],
                    "z" to event.values[2],
                    "timestamp" to event.timestamp
                ))
            }

            override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
                // You can handle accuracy changes if needed
            }
        }

        sensorManager?.registerListener(
            gyroscopeListener,
            gyroscope,
            SensorManager.SENSOR_DELAY_NORMAL
        )
    }

    private fun stopGyroscope() {
        gyroscopeListener?.let { listener ->
            sensorManager?.unregisterListener(listener)
            gyroscopeListener = null
        }
    }
  }

