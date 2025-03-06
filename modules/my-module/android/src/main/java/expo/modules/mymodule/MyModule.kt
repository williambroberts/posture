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
    
    private var accelerationSensor: Sensor? = null
    private var movementListener: SensorEventListener? = null
    // Movement detection variables
    private var lastX: Float = 0f
    private var lastY: Float = 0f
    private var lastZ: Float = 0f
    private var lastTimestamp: Long = 0

    // Values to calculate distance
    private var velocityX: Float = 0f
    private var velocityY: Float = 0f
    private var velocityZ: Float = 0f
    private var movementThreshold: Float = 0.01f // 1cm in meters
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


    private fun startMovementDetection() {
        if (movementListener != null) {
            return
        }
    
        //movementThreshold = threshold
        lastTimestamp = 0L
        velocityX = 0f
        velocityY = 0f
        velocityZ = 0f
    
        // Will store gravity values to remove from accelerometer readings
        val gravity = FloatArray(3)
        val alpha = 0.8f // Smoothing factor for gravity low-pass filter
    
        movementListener = object : SensorEventListener {
            override fun onSensorChanged(event: SensorEvent) {
                if (event.sensor.type == Sensor.TYPE_ACCELEROMETER) {
                    val currentTime = System.currentTimeMillis()
                    
                    // Apply low-pass filter to isolate gravity
                    gravity[0] = alpha * gravity[0] + (1 - alpha) * event.values[0]
                    gravity[1] = alpha * gravity[1] + (1 - alpha) * event.values[1]
                    gravity[2] = alpha * gravity[2] + (1 - alpha) * event.values[2]
                    
                    // Remove gravity effect from accelerometer values to get linear acceleration
                    val x = event.values[0] - gravity[0]
                    val y = event.values[1] - gravity[1]
                    val z = event.values[2] - gravity[2]
                    
                    // First reading
                    if (lastTimestamp == 0L) {
                        lastTimestamp = currentTime
                        lastX = x
                        lastY = y
                        lastZ = z
                        return
                    }
                    
                    val timeElapsed = (currentTime - lastTimestamp) / 1000f // Convert to seconds
                    lastTimestamp = currentTime
                    
                    // Update velocity (integration of acceleration)
                    velocityX += (x + lastX) / 2 * timeElapsed
                    velocityY += (y + lastY) / 2 * timeElapsed
                    velocityZ += (z + lastZ) / 2 * timeElapsed
                    
                    // Calculate distance moved (integration of velocity)
                    val distanceX = velocityX * timeElapsed
                    val distanceY = velocityY * timeElapsed
                    val distanceZ = velocityZ * timeElapsed
                    
                    // Check if movement exceeds threshold
                    if (abs(distanceX) > movementThreshold || 
                        abs(distanceY) > movementThreshold || 
                        abs(distanceZ) > movementThreshold) {
                            
                        // Send event to JS
                        sendEvent("onMovementDetected", mapOf(
                            "distanceX" to distanceX,
                            "distanceY" to distanceY,
                            "distanceZ" to distanceZ,
                            "totalDistance" to Math.sqrt(
                                (distanceX * distanceX + 
                                distanceY * distanceY + 
                                distanceZ * distanceZ).toDouble()
                            )
                        ))
                        
                        // Reset velocities after reporting movement
                        velocityX = 0f
                        velocityY = 0f
                        velocityZ = 0f
                    }
                    
                    // Update last values
                    lastX = x
                    lastY = y
                    lastZ = z
                }
            }
            
            override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
                // Not needed for this implementation
            }
        }
        sensorManager?.registerListener(
            movementListener,
            accelerometerSensor,
            SensorManager.SENSOR_DELAY_GAME // Higher sampling rate for more sensitivity
        )
    }

    private fun stopMovementDetection() {
        movementListener?.let { listener ->
            sensorManager?.unregisterListener(listener)
            movementListener = null
        }
        
        // Reset state
        lastTimestamp = 0L
        velocityX = 0f
        velocityY = 0f
        velocityZ = 0f
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
   
    override fun definition() = ModuleDefinition {
        Name("MyModule")
             AsyncFunction("selectionAsync") { promise: Promise ->
            try {
                this@MyModule.vibrate(
                    longArrayOf(0, 50),
                    intArrayOf(0, 30),
                    longArrayOf(0, 70)
                )
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("HAPTIC_ERROR", "Failed to execute selection haptic", e)
            }
        }

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
        Events("onMovementDetected")

        AsyncFunction("startMovementDetection") { promise: Promise ->
            try {
                startMovementDetection()
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("SENSOR_ERROR", e.message, e)
            }
        }

        AsyncFunction("stopMovementDetection") { promise: Promise ->
            try {
                stopMovementDetection()
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("SENSOR_ERROR", e.message, e)
            }
        }

        Function("isMovementDetectionAvailable") {
            sensorManager?.getDefaultSensor(Sensor.TYPE_ACCELEROMETER) != null
        }




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
            // TYPE_GRAVITY for orientation calculation
            sensorManager = applicationContext.getSystemService(Context.SENSOR_SERVICE) as? SensorManager
            gravitySensor = sensorManager?.getDefaultSensor(Sensor.TYPE_GRAVITY)

            accelerationSensor = sensorManager?.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
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
            stopMovementDetection()
        }
    }
    
    
}
}