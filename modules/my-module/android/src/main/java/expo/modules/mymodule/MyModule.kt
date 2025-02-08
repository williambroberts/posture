package expo.modules.mymodule

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise

class MyModule : Module() {
    private var sensorManager: SensorManager? = null
    private var gyroscope: Sensor? = null
    private var gyroscopeListener: SensorEventListener? = null

    override fun definition() = ModuleDefinition {
        Name("MyModule")

        Constants(
            "PI" to Math.PI,
            "SENSOR_DELAY_NORMAL" to SensorManager.SENSOR_DELAY_NORMAL,
            "SENSOR_DELAY_UI" to SensorManager.SENSOR_DELAY_UI,
            "SENSOR_DELAY_GAME" to SensorManager.SENSOR_DELAY_GAME,
            "SENSOR_DELAY_FASTEST" to SensorManager.SENSOR_DELAY_FASTEST
        )

        Events("onGyroscopeChange")

        AsyncFunction("startGyroscope") { promise: Promise ->
            try {
                startGyroscope()
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("GYROSCOPE_ERROR", "Failed to start gyroscope: ${e.message}")
            }
        }

        AsyncFunction("stopGyroscope") { promise: Promise ->
            try {
                stopGyroscope()
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("GYROSCOPE_ERROR", "Failed to stop gyroscope: ${e.message}")
            }
        }

        Function("isGyroscopeAvailable") {
            sensorManager?.getDefaultSensor(Sensor.TYPE_GYROSCOPE) != null
        }

        OnCreate {
            // Initialize sensor manager using appContext
            sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as? SensorManager
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
                // Handle accuracy changes if needed
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