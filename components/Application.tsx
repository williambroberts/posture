import React, { useEffect, useRef, useState } from 'react'
import { AppState, StyleSheet, View } from 'react-native'
// import { gyroscope, SensorData } from "react-native-sensors";
import BackgroundService, { BackgroundTaskOptions } from 'react-native-background-actions';
// import { NativeModules, DeviceEventEmitter } from 'react-native';
// import MyModule from '../modules/my-module';
import myModule from '../modules/my-module';
import { SensorEvent } from '@/modules/my-module/src/MyModule';
import { MD3Theme, Text, } from 'react-native-paper';
import { CustomButton } from './CustomButton';
import { useThemedStyles } from '@/utilities/theme';
//region component
export const Application = () => {

  const [options,setOptions] = useState<ExtendedOptions>(defaultOptions)
  const [isBackgroundRunning,setIsBackgroundRunning] = useState<boolean>(false)
  const isBackgroundRunningRef = useRef<boolean>(false);
  const styles = useThemedStyles(stylesCallback)
  useEffect(()=>{
    const sub = AppState.addEventListener("change",event => {
      if (event === "active"){
        console.log("stopping");
        (async ()=>{
          await BackgroundService.stop();
          myModule.removeAllListeners("onLinearMovementDetected")
          myModule.removeAllListeners("onOrientationChange")
          await Promise.all([
            myModule.stopLinearMovementDetection(),
            myModule.stopOrientation()
          ])
        })().finally(()=>{
          setIsBackgroundRunning(false)//todow remove this state
        })
      } else if (event === "background"){
      
        if (!isBackgroundRunningRef.current){
          return;
        }
        // launch background task from here
        console.log("Starting...",isBackgroundRunningRef.current);
        
        (async () => {
          await BackgroundService
          .start(veryIntensiveTask2, options)
        })()
        
        //todow nice animation e.g success
      }
    })
    return () => {
      sub.remove();
    }
  },[])

  return (
  <View >
      <CustomButton
      disabled={isBackgroundRunning}
      onPress={()=> {
        myModule.selectionAsync();
        setOptions({...defaultOptions,parameters:{...defaultConfig,values: angleValuesMap["30"]}})
      }}
      >
      <Text variant="bodySmall" style={styles.text}>{angleValuesMap[30].name}</Text>
      </CustomButton>
      <CustomButton
      disabled={isBackgroundRunning}
      onPress={()=> {
        myModule.selectionAsync();
        setOptions({...defaultOptions,parameters:{...defaultConfig,values: angleValuesMap["45"]}})
      }}
      >
        <Text variant="bodySmall" style={styles.text}>{angleValuesMap[45].name}</Text>
      </CustomButton>
      <CustomButton
      disabled={isBackgroundRunning}
    
      onPress={()=> {
        myModule.warningAsync();
        setOptions({...defaultOptions,parameters:{...defaultConfig,values: angleValuesMap["60"]}})
      }}
      >
        <Text variant="bodySmall" style={styles.text}>{angleValuesMap[60].name}</Text>
      </CustomButton>
      <CustomButton
      disabled={!isBackgroundRunning}
      onPress={()=>{
        myModule.warningAsync();
        BackgroundService.stop().finally(async () => {
          myModule.removeAllListeners("onLinearMovementDetected")
          myModule.removeAllListeners("onOrientationChange")
          await Promise.all([
            myModule.stopLinearMovementDetection(),
            myModule.stopOrientation()
          ])
          setIsBackgroundRunning(false)
        })
      }}
      >
         <Text variant="bodySmall" style={styles.text}>stop background</Text>
      </CustomButton>
       <CustomButton
       disabled={isBackgroundRunning}
      onPress={()=>{
        if (BackgroundService.isRunning()){
          return;
        }
        myModule.warningAsync();
        setIsBackgroundRunning(true);
        isBackgroundRunningRef.current = true;
      }}
      > 
      <Text variant="titleSmall"style={styles.text}>{`start background ${options.parameters.values.angle}`}</Text>
      </CustomButton>

      <Text style={styles.text}>${options.parameters.values.name}</Text>
      {isBackgroundRunning && 
      <Text variant='bodySmall' style={styles.text}>
        Now switch to a different task and we will track your phone posture
        </Text>}
  </View>
  )

}
//region constants
const ALPHA = 0.8; // Gravity filter constant
const DECAY = 0.98; // Helps reduce drift
//region styles
const stylesCallback = (theme:MD3Theme) => StyleSheet.create({
  controls:{
    flexDirection:"row",
    alignItems:"center",
    gap:4,
    justifyContent:"space-evenly",
    margin: 4,
    padding:4,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    // display:"none"
  },
  text:{
    color: theme.colors.onTertiary,
  }
})
//region background task
type BackgroundTaskParams = {
  delay: number;// power saving var
  values: (typeof angleValuesMap)[keyof typeof angleValuesMap];
  strictness: number;
  //strictness: number; // max strikes at bad angle -> vibrate 
}
const angleValuesMap = {
  30:  {y:4.9,z:8.5,angle:30,name:"Light" as const},
  45:  {y:6.94,z:6.94,angle:45,name:"Normal" as const},
  60:  {y:8.5,z:4.9,angle:60,name:"Strict" as const},
  
} satisfies {[key:number]:{y:number,z:number,angle:number,name:string}}
const defaultConfig = {
  delay: 5000 as const,
  values: angleValuesMap["60"],
  strictness: 1
} satisfies BackgroundTaskParams
type RefType<T> = {current:T};
type OrientationRef = RefType<{y:number,count:number}|null>
type NullableNumberRef = RefType<number|null>
type BadAngleRef = RefType<{isBadAngle:boolean,count:number,eventCount:number}>
const veryIntensiveTask2 = async (taskData?:BackgroundTaskParams) => {
  const config = taskData ?? defaultConfig
  const {delay,values,strictness} = config;
  const badAngleRef:BadAngleRef = {current:{isBadAngle:false,count:0,eventCount:0}}
  const orientationRef:OrientationRef = {current:{count:0,y:0}}
  const runLockRef:RefType<RunLock> = {current:{}}
  const linearAccelerationRef: NullableNumberRef = {current:null}
  const linearAccelerationRef2: NullableNumberRef = {current:null}
  const VAR = 1.5;
  const key = "a-key" as const;
  // BAD ANGLE, ARCH DOWN, MOVE DOWN,

  const runTheLock = () => runWithLock({
    cb: myModule.errorAsync,
    key,
    lockTime: 1000,
    runLock: runLockRef.current
  })
  await new Promise( async (resolve) => {
    
    for (let i = 0; BackgroundService.isRunning(); i++) {
      if (!myModule.isOrientationAvailable() || !myModule.isLinearMovementDetectionAvailable()){
        //todow notify user?
        console.log("not avaivlable, bg")
        return resolve("done");
      }
      myModule.startLinearMovementDetection();
      myModule.startOrientation();
      myModule.addListener("onLinearMovementDetected",e =>{
        // ------ ARCH -------------------//
        const NconsecutiveAcceleration = 10
        const NconsecutiveAngleGotWorse = 10;
       
        // dont do anything until phone set to a good angle
        if (!orientationRef.current){
          return;
        }
        //-	Z direction is for linear acceleration tilting bad/good reading angle (good->bad posture)
        if (Math.abs(e.z) > 2){
          linearAccelerationRef2.current = (linearAccelerationRef2.current ?? 0) +1
        }
        if (!linearAccelerationRef2.current){
          return;
        }
        if (linearAccelerationRef2.current > NconsecutiveAcceleration 
          && orientationRef.current?.count > NconsecutiveAngleGotWorse){
          linearAccelerationRef2.current = null
          orientationRef.current = null
          console.log("running bg !")
          // myModule.errorAsync();
          runWithLock({
            cb: myModule.errorAsync,
            key,
            lockTime: 500,
            runLock: runLockRef.current
          })
        }

        //------ UP / DOWN ---------------//
        if (!linearAccelerationRef.current){
          linearAccelerationRef.current = 0;
        }
        if (e.y < -VAR){
          linearAccelerationRef.current = e.y
          // console.log("hmm")
        }
        if (e.y > VAR && linearAccelerationRef.current < -VAR){
          console.log(linearAccelerationRef.current,e.y,"background,onLinearMovementDetectedVertical")
          // myModule.errorAsync();
          runWithLock({
            cb: myModule.errorAsync,
            key,
            lockTime: 500,
            runLock: runLockRef.current
          })
          linearAccelerationRef.current = null;
        }

      })
      myModule.addListener("onOrientationChange",e => {
        const DIFF = 0.25;
        if (!orientationRef.current && e.y > 7){//todow make configurable to "user's selected good reading angle e.g 45,60,75"
          orientationRef.current ={y: e.y,count:1};
          return;
        }
        // if not yet good angle, do nothing
        if (!orientationRef.current){
          return;
        }
        // angle getting worse
        if (e.y < orientationRef.current.y-DIFF){
        orientationRef.current = {y: e.y,count:++orientationRef.current.count}
        
        } 
        // angle getting better
        if (e.y > orientationRef.current.y+DIFF){
          orientationRef.current = {y: e.y,count:--orientationRef.current.count}
        }
        // reset so that if the angle is bad N times will result in a haptic
        if (orientationRef.current.count < 0){
          orientationRef.current.count = 0;
        } 
        // --------- BAD ANGLE GENERALLY ---------// 
        const badAngle = isBadAngle(e,config);
        if (badAngle){
          badAngleRef.current.isBadAngle = true;
        } else {
          badAngleRef.current.isBadAngle = false;
        }
        
      })
      await new Promise(r => setTimeout(r,delay));
      await Promise.all([
        myModule.stopOrientation(),
        myModule.stopLinearMovementDetection()
      ]);
      myModule.removeAllListeners("onLinearMovementDetected")
      myModule.removeAllListeners("onOrientationChange")
      await new Promise(r => setTimeout(r,200));
      if (badAngleRef.current.isBadAngle){//todow configure from user settings
        console.log("bad angle")
        runWithLock({
          cb: myModule.warningAsync,
          key,
          lockTime: 1000,
          runLock: runLockRef.current
        })
      }
      
    }
    resolve("done")
  })
}
type RunLock = {[key:`${string}-key`]:boolean}
type RunWithLock = {
    cb: () => void;
    key:`${string}-key`;
    runLock: RunLock;
    lockTime: number
}
const runWithLock = (args:RunWithLock) => {
  const {cb,key,runLock,lockTime} = args
  if (runLock[key] === true){
    return;
  }
  runLock[key] = true;
  cb();
  setTimeout(()=>{runLock[key] = false},lockTime)
}
type OnLinearMovementDetectedVertical = {
  e: SensorEvent;
  cb: () => void;
  var: number;
  linearRef:NullableNumberRef
}
const onLinearMovementDetectedVertical = (args:OnLinearMovementDetectedVertical) => {
  const {cb,e, linearRef: linearAccelerationRef,var:VAR} = args
  if (e.y < -VAR){
    linearAccelerationRef.current = e.y
    console.log("hmm")
  }
  if (!linearAccelerationRef.current){
    return;
  }
  if (e.y > VAR && linearAccelerationRef.current < -VAR){
    console.log(linearAccelerationRef.current,e.y,"background,onLinearMovementDetectedVertical")
    myModule.errorAsync();
    linearAccelerationRef.current = null;
  }
}
type OnLinearMovementDetectedAngle = {
  e:SensorEvent;
  orientationRef:OrientationRef;
  linearRef: NullableNumberRef;
  cb: () => void
}
const onLinearMovementDetectedAngle = (args:OnLinearMovementDetectedAngle) => {
  const NconsecutiveAcceleration = 10
        const NconsecutiveAngleGotWorse = 10;
        const {e,linearRef,orientationRef} = args
       
        // dont do anything until phone set to a good angle
        if (!orientationRef.current){
          return;
        }
        //-	Z direction is for linear acceleration tilting bad/good reading angle (good->bad posture)
        if (Math.abs(e.z) > 2){
          linearRef.current = (linearRef.current ?? 0) +1
        }
        if (!linearRef.current){
          return;
        }
        if (linearRef.current > NconsecutiveAcceleration 
          && orientationRef.current?.count > NconsecutiveAngleGotWorse){
          linearRef.current = null
          orientationRef.current = null
          console.log("running bg !")
          void args.cb()
        }
}
const onOrientationChangeBadAngle = (badAngleRef:BadAngleRef,e:SensorEvent,config:BackgroundTaskParams) => {
  const badAngle = isBadAngle(e,config);
  if (badAngle){
    badAngleRef.current.isBadAngle = true;
  } else {
    badAngleRef.current.isBadAngle = false;
  }
}
const onOrientationChangeArch = (orientationRef:OrientationRef,e:SensorEvent) => {
  const DIFF = 0.25;
  if (!orientationRef.current && e.y > 7){//todow make configurable to "user's selected good reading angle e.g 45,60,75"
    orientationRef.current ={y: e.y,count:1};
    return;
  }
  // if not yet good angle, do nothing
  if (!orientationRef.current){
    return;
  }
  // angle getting worse
  if (e.y < orientationRef.current.y-DIFF){
  orientationRef.current = {y: e.y,count:++orientationRef.current.count}
  
  } 
  // angle getting better
   if (e.y > orientationRef.current.y+DIFF){
    orientationRef.current = {y: e.y,count:--orientationRef.current.count}
  }
  // reset so that if the angle is bad N times will result in a haptic
  if (orientationRef.current.count < 0){
    orientationRef.current.count = 0;
  } 
}
const veryIntensiveTask = async (taskData?:BackgroundTaskParams) => {
  const config = taskData ?? defaultConfig
  const {delay,values,strictness} = config;
  const countRef: {current: number} = {current:0}//todow generic
  const sensorEventRef:{current:SensorEvent| null} = {current:null} 
  const isBadAngleRef: {current:boolean} = {current: false}
  const streakRef: RefType<number> = {current:0}
  const maxStreak = 10; // if 10 streak then stop playing
  const goToErrorOn = 3; // after streak =3 play error haptic
  await new Promise( async (resolve) => {
    if (!myModule.isOrientationAvailable()){
      //todow notify user?
      return resolve("done");
    }
    console.log(values,delay,"values,delay")
    for (let i = 0; BackgroundService.isRunning(); i++) {
      countRef.current = 0;
      // delay
      // listen for angle
      myModule.startOrientation(); 
      myModule.addListener("onOrientationChange",(event) => {
        sensorEventRef.current = event;
        const badAngle = isBadAngle(event,config)
        if (badAngle){
          countRef.current++
          isBadAngleRef.current = true;
        } else {
          isBadAngleRef.current = false;
          streakRef.current = 0;
        }
      })
      // ON for delay length of time
      await new Promise(r => setTimeout(r,delay));
      
      myModule.stopOrientation().finally(()=>console.log("ok"));
      myModule.removeAllListeners("onOrientationChange")

      console.log(countRef.current,"ref",isBadAngleRef.current,sensorEventRef.current);
      if (countRef.current > strictness && isBadAngleRef.current){
        streakRef.current++;
        if (streakRef.current > goToErrorOn){// can put into var
          myModule.errorAsync();
        }else {
          myModule.warningAsync();
        }
        if (streakRef.current > maxStreak){
          //todow warning etc notify user
          //end the background task
          resolve("done");
        }
      }
      // OFF for delay length of time
      await new Promise(r => setTimeout(r,delay));
    }
    resolve("done")
});
}


const defaultOptions = {
  taskName: 'Example',
  taskTitle: 'ExampleTask title',
  taskDesc: 'ExampleTask description',
  taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
  },
  color: '#ff00ff',
  linkingURI: 'postureKeep://', // See Deep Linking for more info
  parameters: defaultConfig satisfies BackgroundTaskParams,

} satisfies ExtendedOptions;

type ExtendedOptions = BackgroundTaskOptions & {parameters:BackgroundTaskParams}
//npm i -g @expo/ngrok
//npx expo start --tunnel
//npx eas build --platform android --profile production

//region functions
function isBadAngle(event:SensorEvent,config: BackgroundTaskParams){
  return event.y < config.values.y && event.z > config.values.z;
}
const useStateImediate = <T,>(initialData:T) => {
  const [state,setState] = useState<T>(initialData);
  const stateRef = useRef<T>(initialData);

  const handleUpdate = () => {
    
  }
}