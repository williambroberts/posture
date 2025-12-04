import React, { useEffect, useRef, useState } from 'react'
import { Alert, AppState, StyleSheet, View } from 'react-native'
// import { gyroscope, SensorData } from "react-native-sensors";
import BackgroundService, { BackgroundTaskOptions } from 'react-native-background-actions';
// import { NativeModules, DeviceEventEmitter } from 'react-native';
// import MyModule from '../modules/my-module';
import myModule from '../modules/my-module';
import { SensorEvent } from '@/modules/my-module/src/MyModule';
import { Icon, MD3Theme, Text, } from 'react-native-paper';
import { CustomButton } from './CustomButton';
import { useThemedStyles } from '@/utilities/theme';
import * as SQLite from 'expo-sqlite';
//region component
export const Application = () => {

  const [options,setOptions] = useState<ExtendedOptions>(defaultOptions)
  const [debug,setDebug] = useState<any>();
  const [isBackgroundRunning,setIsBackgroundRunning] = useState<boolean>(false)
  const isBackgroundRunningRef = useRef<boolean>(false);
  const styles = useThemedStyles(stylesCallback)
  useEffect(()=> {
   (async () => {
    const db = await SQLite.openDatabaseAsync('databaseName');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY NOT NULL, value TEXT NOT NULL, intValue INTEGER);
      `);
      const firstRow = await db.getFirstAsync('SELECT * FROM test');
      setDebug(firstRow)
      await db.closeAsync();
   })()
  // setDebug(isBackgroundRunning)
  },[isBackgroundRunning])
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
          setIsBackgroundRunning(false)
          isBackgroundRunningRef.current = false
        })
      } else if (event === "background"){
         console.log("backgrounding")
        if (!isBackgroundRunningRef.current){
          return;
        }
        // launch background task from here
        console.log("Starting...",isBackgroundRunningRef.current);

        (async () => {
          await BackgroundService
          .start(veryIntensiveTask4, options)
        })()
        
        //todow nice animation e.g success
      }
    })
    return () => {
      sub.remove();
    }
  },[])

  return (
  <View style={styles.container}>
      <CustomButton
      containerStyle={[
        options.parameters.values.name === angleValuesMap["light"].name
        ? styles.selectedButton 
        : {}
      ]}
      disabled={isBackgroundRunning}
      onPress={()=> {
        myModule.selectionAsync();
        setOptions({...defaultOptions,parameters:{...defaultConfig,values: angleValuesMap["light"]}})
      }}
      >
        <View style={styles.buttonChildContainer}>
        <Text variant="bodySmall" 
      style={[styles.text,
        options.parameters.values.name === angleValuesMap["light"].name
        ? styles.selectedButtonText 
        : {}
      ]}
      >{angleValuesMap["light"].name}
      </Text>
      {options.parameters.values.name === angleValuesMap["light"].name && (
        <Icon
        size={ICON_SIZE}
        color={styles.selectedButtonText.color}
        source={"check"}
        />
        )}
        </View>
     
      </CustomButton>
      <CustomButton
      containerStyle={[
        options.parameters.values.name === angleValuesMap["normal"].name
        ? styles.selectedButton 
        : {}
      ]}
      disabled={isBackgroundRunning}
      onPress={()=> {
        myModule.selectionAsync();
        setOptions({...defaultOptions,parameters:{...defaultConfig,values: angleValuesMap["normal"]}})
      }}
      >
        <View style={styles.buttonChildContainer}>
        <Text variant="bodySmall" style={[
          styles.text,
           options.parameters.values.name === angleValuesMap["normal"].name
           ? styles.selectedButtonText 
           : {}
        ]}>{angleValuesMap["normal"].name}</Text>
        {options.parameters.values.name === angleValuesMap["normal"].name && (
        <Icon
        size={ICON_SIZE}
        color={styles.selectedButtonText.color}
        source={"check"}
        />
        )}
        </View>
      </CustomButton>
      <CustomButton
      containerStyle={[
        options.parameters.values.name === angleValuesMap["strict"].name
        ? styles.selectedButton 
        : {}
      ]}
      disabled={isBackgroundRunning}
    
      onPress={()=> {
        myModule.selectionAsync();
        setOptions({...defaultOptions,parameters:{...defaultConfig,values: angleValuesMap["strict"]}})
      }}
      >
        <View style={styles.buttonChildContainer}>
        <Text variant="bodySmall" 
        style={[
          styles.text,
          options.parameters.values.name === angleValuesMap["strict"].name
          ? styles.selectedButtonText 
          : {}
        ]}>{angleValuesMap["strict"].name}</Text>
        {options.parameters.values.name === angleValuesMap["strict"].name && (
        <Icon
        size={ICON_SIZE}
        color={styles.selectedButtonText.color}
        source={"check"}
        />
        )}
        </View>
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
          setIsBackgroundRunning(false);
          isBackgroundRunningRef.current = false;
        })
      }}
      >
         <Text variant="bodySmall" 
         style={[!isBackgroundRunning 
          ? styles.textDisabled 
          : styles.text
          ]}
         >stop background
         
         </Text>
      </CustomButton>
       <CustomButton
       disabled={isBackgroundRunning}
      onPress={async ()=>{
        if (BackgroundService.isRunning()){
          return;
        }
        if (!myModule.isOrientationAvailable() || !myModule.isLinearMovementDetectionAvailable()){
          Alert.alert("Sensor Malfunction","Movement detection is unavailable at this time.")
          return;
        }
        myModule.warningAsync();
        setIsBackgroundRunning(true);
        // const db = await SQLite.openDatabaseAsync('databaseName');
        // const firstRow = await db.getFirstAsync('SELECT * FROM test');
        setDebug("🐻🐻🐻");

        isBackgroundRunningRef.current = true;
      }}
      > 
      <Text variant="bodySmall"
      style={[isBackgroundRunning 
        ? styles.textDisabled 
        : styles.text
        ]}>
          {`Start in ${options.parameters.values.name}`} mode</Text>
      </CustomButton>

      {/* <Text style={}>${options.parameters.values.name}</Text> */}
      {isBackgroundRunning && 
      <>
      <Text variant='bodyMedium' style={[styles.textWarning]}>
        Now switch to a different app and we will track your phone position and angle.
        {/* todow icons */}
        </Text>
        <Text variant='bodyMedium'
        style={[styles.textWarning]}
        >
           When the phone vibrates, adjust your phone to a better position!
           {/* todow icons */}
           </Text>
           <Text variant='bodySmall'
        style={[styles.textWarning]}
        >
           Please set "Allow background activity" to true for this App in your device's App battery management settings, to allow us to freely track your phone's position
           {/* todow text & icons*/}
           </Text>
      </>
      
      }
     <Text>DEBUG:{JSON.stringify(debug,null,2)}</Text>
  </View>
  )

}
//region styles
const ICON_SIZE = 16;
const GLOBAL_PADDING_HORIZONTAL = 20;
const GLOBAL_PADDING_VERTICAL = 20;
const stylesCallback = (theme:MD3Theme) => StyleSheet.create({
  container:{
    backgroundColor: theme.colors.background,
    flex:1,
    paddingVertical: GLOBAL_PADDING_VERTICAL,
    paddingHorizontal: GLOBAL_PADDING_HORIZONTAL,
  },
  selectedButton:{
    backgroundColor: theme.colors.primary,
  },
  selectedButtonText:{
    color: theme.colors.onPrimary,
  },
  text:{
    color: theme.colors.onTertiary,
  },
  textDisabled:{
    color: theme.colors.onSurfaceDisabled,
  },
  onBackground: {
    color: theme.colors.onBackground
  },
  buttonChildContainer: {
    flexDirection:"row",
    alignItems:"center",
    gap: 4,
  },
  textWarning: {
    padding: 8,
    borderRadius: 8,
    marginVertical: 4,
    color: theme.colors.onTertiary,
    backgroundColor: theme.colors.tertiary,
  },
})
//region background task
type BackgroundTaskParams = {
  delay: number;// power saving var
  values: (typeof angleValuesMap)[keyof typeof angleValuesMap];
  strictness: number;// max strikes at bad angle -> vibrate 
}
const angleValuesMap = {
  "light":  {y:4.9,z:8.5,angle:30,name:"Light" as const},
  "normal":  {y:6.94,z:6.94,angle:45,name:"Normal" as const},
  "strict":  {y:8.5,z:4.9,angle:60,name:"Strict" as const},
  
} satisfies {[key:string]:{y:number,z:number,angle:number,name:string}}
const defaultConfig = {
  delay: 5000 as const,
  values: angleValuesMap["strict"],
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
          myModule.errorAsync();
          // runWithLock({
          //   cb: myModule.errorAsync,
          //   key,
          //   lockTime: 500,
          //   runLock: runLockRef.current
          // })
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
          myModule.errorAsync();
          // runWithLock({
          //   cb: myModule.errorAsync,
          //   key,
          //   lockTime: 500,
          //   runLock: runLockRef.current
          // })
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
        myModule.errorAsync();
        // runWithLock({
        //   cb: myModule.warningAsync,
        //   key,
        //   lockTime: 1000,
        //   runLock: runLockRef.current
        // })
      }
      
    }
    resolve("done")
  })
}

const veryIntensiveTask3 = async (taskData?:BackgroundTaskParams) => {
  const config = taskData ?? defaultConfig
  const {delay,values} = config;
  const badAngleRef:BadAngleRef = {current:{isBadAngle:false,count:0,eventCount:0}}
  const orientationRef:OrientationRef = {current:{count:0,y:0}}
  const linearAccelerationRef: NullableNumberRef = {current:null}
  const linearAccelerationEnabledRef: RefType<boolean> = {current:true}
  const VAR = 1.5;
  await new Promise( async (resolve) => {
     
      if (!myModule.isOrientationAvailable() || !myModule.isLinearMovementDetectionAvailable()){
        //todow notify user?
        console.log("not avaivlable, bg")
        return resolve("done");
      }
      
      console.log("3")
      let s = performance.now();
      for (let i = 0; BackgroundService.isRunning(); i++){
        myModule.startLinearMovementDetection();
        myModule.startOrientation();
        myModule.addListener("onLinearMovementDetected",e =>{
          // dont do anything until phone set to a good angle
          if (!orientationRef.current){
            return;
          }
          
          //disabled when the phone is at a bad angle
          if (!linearAccelerationEnabledRef.current){
            return;
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
            myModule.errorAsync();
            linearAccelerationRef.current = null;
          }
  
        })
        myModule.addListener("onOrientationChange",e => {
          if (!orientationRef.current && e.y > values.y){// configurable to "user's selected good reading angle e.g 45,60,75"
            orientationRef.current ={y: e.y,count:1};
            return;
          }
          // if not yet good angle, do nothing
          if (!orientationRef.current){
            return;
          }
          //if phone is flat assume the user put phone down
          if (Math.abs(e.y) < 1){
            return;
          }
          
          // --------- BAD ANGLE GENERALLY ---------// 
          const badAngle = isBadAngle(e,config);
          if (badAngle){
            badAngleRef.current.isBadAngle = true;
            ++badAngleRef.current.count
            linearAccelerationEnabledRef.current = false;
          } else {
            badAngleRef.current.isBadAngle = false;
            --badAngleRef.current.count
            // the user moves phone from bad to good angle, re-enable UP/DOWN tracking
            if (!linearAccelerationEnabledRef.current){
              setTimeout(() => {
                linearAccelerationEnabledRef.current = true;
              }, 200);
            }
          }
          if (badAngleRef.current.count < 0){
            badAngleRef.current.count = 0;
          }
          if (badAngleRef.current.count > 200){//todow make this configurable {}
              myModule.warningAsync();
              ++badAngleRef.current.eventCount
              badAngleRef.current.count = 0;
              console.log("bad angle from bg task",badAngleRef.current)
          }
        })
        await new Promise(r => setTimeout(r,delay));
        myModule.removeAllListeners("onLinearMovementDetected")
        myModule.removeAllListeners("onOrientationChange")
        await Promise.all([
          myModule.stopOrientation(),
          myModule.stopLinearMovementDetection()
        ]);
        console.log(Math.round((performance.now() - s)/1000))//clock
        await new Promise(r => setTimeout(r,300));//todow try diff values?
      }
      await db.closeAsync();
      resolve("done")
  })
} 

const veryIntensiveTask4 = async (taskData?:BackgroundTaskParams) => {
  await new Promise(async (resolve) => {
    const db = await SQLite.openDatabaseAsync('databaseName');
    await db.runAsync(
      'INSERT OR REPLACE INTO test (value, intValue) VALUES (?, ?)',
      'test1',
      0
    );
    for (let i = 0; BackgroundService.isRunning(); i++){
      await new Promise(r => setTimeout(r,5000));
      const firstRow = await db.getFirstAsync<{intValue:string,value:string}>('SELECT * FROM test');
      if (firstRow){
        await db.runAsync('UPDATE test SET intValue = ? WHERE value = ?', Number(firstRow.intValue) + 1, 'test1'); // Binding unnamed parameters from variadic arguments
        myModule.errorAsync();
      }
    }
    resolve("done")
  })
}
//region config

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


const defaultOptions = {
  taskName:  "PostureKeep",
  taskTitle: 'MEASURING & TRACKING',
  taskDesc: 'Monitoring your phone position & angle',
  taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
  },
  color: '#75e371',
  linkingURI: 'postureKeep://', // See Deep Linking for more info
  parameters: defaultConfig satisfies BackgroundTaskParams,

} satisfies ExtendedOptions;

type ExtendedOptions = BackgroundTaskOptions & {parameters:BackgroundTaskParams}


//region functions
function isBadAngle(event:SensorEvent,config: BackgroundTaskParams){
  return event.y < config.values.y && event.z > config.values.z;
}

//region links 
//https://pixabay.com/images/search/life/?order=ec
//npm i -g @expo/ngrok
//npx expo start --tunnel
//npx eas build --platform android --profile production
//npx expo start --localhost




//region todows
/**
 *  - if too close to eyes
 *  - landscape
 *  
 *  - add the splash image
 *  - branding stuff
 *  - help messages & explainations
 *  - animations & UI
 *  - testing
 *  - more settings
 *  - track data ? tanstack query
 *  - put your phone to good angle to unlock starting background task?
 *  - custom button abstract
 */

//kaspersky
//KL7263647