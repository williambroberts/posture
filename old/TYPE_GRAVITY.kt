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

import android.os.VibrationEffect
import android.os.Vibrator
import expo.modules.haptics.arguments.HapticsVibrationType
import expo.modules.haptics.arguments.HapticsSelectionType

class MyModule : Module() {
    private var sensorManager: SensorManager? = null
    private var gravitySensor: Sensor? = null
    private var gravityListener: SensorEventListener? = null
    private var vibrator: Vibrator? = null

    override fun definition() = ModuleDefinition {
        Name("MyModule")

        // val vibrator = when {
        //     Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
        //         val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
        //         vibratorManager.defaultVibrator
        //     }
        //     else -> {
        //         @Suppress("DEPRECATION")
        //         context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        //     }
        // }
        // Medium haptic feedback
        AsyncFunction("mediumHaptic") { promise: Promise ->
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createWaveform(HapticsSelectionType.timings, HapticsSelectionType.amplitudes, -1))
                    //vibrator.vibrate(VibrationEffect.createOneShot(40, VibrationEffect.DEFAULT_AMPLITUDE))
                } else {
                    @Suppress("DEPRECATION")
                    vibrator.vibrate(HapticsSelectionType.oldSDKPattern,-1)
                }
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("HAPTIC_ERROR", "Failed to execute medium haptic", e)
            }
        }
        // Check if device has vibrator
        // AsyncFunction("hasVibrator") { promise: Promise ->
        //     try {
        //         val result = vibrator.hasVibrator()
        //         promise.resolve(result)
        //     } catch (e: Exception) {
        //         promise.reject("HAPTIC_ERROR", "Failed to check vibrator availability", e)
        //     }
        // }

        // Cancel ongoing vibration
        // AsyncFunction("cancelVibration") { promise: Promise ->
        //     try {
        //         vibrator.cancel()
        //         promise.resolve(null)
        //     } catch (e: Exception) {
        //         promise.reject("HAPTIC_ERROR", "Failed to cancel vibration", e)
        //     }
        // }






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
            //haptics
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                vibrator = (context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager).defaultVibrator
            } else {
                @Suppress("DEPRECATION")
                context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
            }


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