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

import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import expo.modules.kotlin.exception.Exceptions

class MyModule : Module() {
    private var sensorManager: SensorManager? = null
    private var gravitySensor: Sensor? = null
    private var gravityListener: SensorEventListener? = null
    
    //private val context: Context
    //get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()
    private var vibrator: Vibrator? = null
    // get() = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
    //   (context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager).defaultVibrator
    // } else {
    //   @Suppress("DEPRECATION")
    //   context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
    // }
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
    private fun vibrate(
        timings: LongArray = longArrayOf(0, 50),
        amplitudes: IntArray = intArrayOf(0, 30),
        oldSDKPattern: LongArray = longArrayOf(0,70),
    ) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator?.vibrate(
                VibrationEffect.createWaveform(
                    timings,
                    amplitudes,
                    -1
                )
            ) ?: throw Exception("Vibrator not initialized")
        } else {
            @Suppress("DEPRECATION")
            // For pre-O devices, amplitudes are not supported.
            vibrator?.vibrate(oldSDKPattern, -1)
                ?: throw Exception("Vibrator not initialized")
        }
    }
    // private fun vibrate() {
    //     if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
    //         vibrator?.vibrate(
    //             VibrationEffect.createWaveform(
    //                 longArrayOf(0, 50),
    //                 intArrayOf(0, 30),
    //                 -1
    //             )
    //         ) ?: throw Exception("Vibrator not initialized")
    //     } else {
    //         @Suppress("DEPRECATION")
    //         vibrator?.vibrate(longArrayOf(0, 70), -1) 
    //             ?: throw Exception("Vibrator not initialized")
    //     }
    // }
    override fun definition() = ModuleDefinition {
        Name("MyModule")


         AsyncFunction("warningAsync") { promise: Promise ->
            try {
                this@MyModule.vibrate(
                    longArrayOf(0, 40, 120, 60),
                    intArrayOf(0, 40, 0, 60),
                    longArrayOf(0, 40, 120, 60)
                )
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("HAPTIC_ERROR", "Failed to execute selection haptic", e)
            }
        }
        AsyncFunction("errorAsync") { promise: Promise ->
            try {
                this@MyModule.vibrate(
                    longArrayOf(0, 60, 100, 40, 80, 50),
                    intArrayOf(0, 50, 0, 40, 0, 50),
                    longArrayOf(0, 60, 100, 40, 80, 50)
                )
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("HAPTIC_ERROR", "Failed to execute selection haptic", e)
            }
        }
        
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
        // AsyncFunction("mediumHaptic") { promise: Promise ->
        //     try {
        //         if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        //             vibrator.vibrate(VibrationEffect.createWaveform(HapticsSelectionType.timings, HapticsSelectionType.amplitudes, -1))
        //             //vibrator.vibrate(VibrationEffect.createOneShot(40, VibrationEffect.DEFAULT_AMPLITUDE))
        //         } else {
        //             @Suppress("DEPRECATION")
        //             vibrator.vibrate(HapticsSelectionType.oldSDKPattern,-1)
        //         }
        //         promise.resolve(null)
        //     } catch (e: Exception) {
        //         promise.reject("HAPTIC_ERROR", "Failed to execute medium haptic", e)
        //     }
        // }
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
            sensorManager = applicationContext.getSystemService(Context.SENSOR_SERVICE) as? SensorManager
            gravitySensor = sensorManager?.getDefaultSensor(Sensor.TYPE_GRAVITY)
            // //haptics
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                vibrator = (applicationContext.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager)?.defaultVibrator
                //vibrator = (context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager).defaultVibrator
            } else {
                @Suppress("DEPRECATION")
                vibrator = applicationContext.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
            }
            // }
        }

        OnDestroy {
            stopGravitySensor()
        }
    }
    
    
}
}