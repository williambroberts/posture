package expo.modules.mymodule
// working 
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
    private var gravitySensor: Sensor? = null
    private var gravityListener: SensorEventListener? = null

    override fun definition() = ModuleDefinition {
        Name("MyModule")

        Events("onOrientationChange")

        AsyncFunction("startOrientation") { promise: Promise ->
            try {
                startGravitySensor()
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("SENSOR_ERROR", e.message, e)
            }
        }

        AsyncFunction("stopOrientation") { promise: Promise ->
            try {
                stopGravitySensor()
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("SENSOR_ERROR", e.message, e)
            }
        }

        Function("isOrientationAvailable") {
            sensorManager?.getDefaultSensor(Sensor.TYPE_GRAVITY) != null
        }

        OnCreate {
            // Initialize sensor manager using appContext
            val activity = appContext.activityProvider?.currentActivity
            val applicationContext = activity?.applicationContext
            if(applicationContext != null) {
            sensorManager = applicationContext.applicationContext.getSystemService(Context.SENSOR_SERVICE) as? SensorManager
            gravitySensor = sensorManager?.getDefaultSensor(Sensor.TYPE_GRAVITY)
            }
        }

        OnDestroy {
            stopGravitySensor()
        }
    }

    private fun startGravitySensor() {
        if (gravityListener != null) {
            return
        }

        gravityListener = object : SensorEventListener {
            override fun onSensorChanged(event: SensorEvent) {
                sendEvent("onOrientationChange", mapOf(
                    "x" to event.values[0],  // Gravity force along x-axis
                    "y" to event.values[1],  // Gravity force along y-axis
                    "z" to event.values[2],  // Gravity force along z-axis
                    "timestamp" to event.timestamp
                ))
            }

            override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
                // Handle accuracy changes if needed
            }
        }

        sensorManager?.registerListener(
            gravityListener,
            gravitySensor,
            SensorManager.SENSOR_DELAY_UI
        )
    }

    private fun stopGravitySensor() {
        gravityListener?.let { listener ->
            sensorManager?.unregisterListener(listener)
            gravityListener = null
        }
    }
}