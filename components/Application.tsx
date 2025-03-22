import React, { useEffect, useRef, useState } from 'react'
import { AppState, StyleSheet, View } from 'react-native'
// import { gyroscope, SensorData } from "react-native-sensors";
import BackgroundService, { BackgroundTaskOptions } from 'react-native-background-actions';
// import { NativeModules, DeviceEventEmitter } from 'react-native';
// import MyModule from '../modules/my-module';
import myModule from '../modules/my-module';
import { MovementEvent, SensorEvent } from '@/modules/my-module/src/MyModule';
import {  Button, IconButton,  MD3Theme, Text, Tooltip, } from 'react-native-paper';
import { CustomButton } from './CustomButton';
import { useThemedStyles } from '@/utilities/theme';


// // Access the GyroscopeModule
// const { GyroscopeModule } = NativeModules;

// Start listening for gyroscope data
//region component
export const Application = () => {
  // const [data,setData] = useState<{x:number,y:number,z:number} | null>()
  const [data,setData] = useState<MovementEvent | null>()
  const [options,setOptions] = useState<ExtendedOptions>(defaultOptions)
  const [isBackgroundRunning,setIsBackgroundRunning] = useState<boolean>(false)
  const myRef = useRef<number | null>(null)
  const arrayRef = useRef<any[]>([])
  const dataRef = useRef<{count:number,z:number}|null>(null)
  const [color,setColor] = useState<"red"|"green"|"yellow"|"white">("white")
  const linearAccelerationRef  = useRef<number>(0)
  const orientationRef = useRef<{y:number,count:number}| null>(null)
  // const [tog,setTog] = useState<>()
  
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
          setIsBackgroundRunning(false)
        })
      }
    })
    return () => {
      sub.remove();
    }
  },[])

  const selected = options.parameters.values.name
  return (
    // <NavigationContainer linking={linking}>
  <View style={{backgroundColor:color}}>
    <Button
       style={{margin:6}}
    mode='contained'
    onPress={()=>{
      console.log(myModule.isOrientationAvailable())
      console.log(myModule.isLinearMovementDetectionAvailable())

      if (!myModule.isOrientationAvailable()){
        return;
      }
      if (!myModule.isLinearMovementDetectionAvailable){
        return;
      }
      myModule.startOrientation();
      myModule.addListener("onOrientationChange",e => {
        const DIFF = 0.25
        myRef.current = (myRef.current ?? 0) +1;      
        // if (myRef.current % 100 ===0){
        // }
        //must have a good angle to begin with or wont do anything
        //Gyroscope
        // -	Phone vertical  ~9.81
        // -	Phone flat ~ 0
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
        // if (orientationRef.current.count > 10){
        //   // myModule.warningAsync();
        //   orientationRef.current = null;
        // }
        
      })
      myModule.startLinearMovementDetection();
      myModule.addListener("onLinearMovementDetected",e => {
        const NconsecutiveAcceleration = 10
        const NconsecutiveAngleGotWorse = 10;
        // myRef.current = (myRef.current ?? 0) +1
        // if (myRef.current > 10){
        //   myRef.current = 0
        // }
        if (!dataRef.current){
          dataRef.current = {count:0,z:0}
        }
        // dont do anything until phone set to a good angle
        if (!orientationRef.current){
          return;
        }
        //-	Z direction is for linear acceleration tilting bad/good reading angle (good->bad posture)
        if (Math.abs(e.z) > 2){
          myRef.current = (myRef.current ?? 0) +1
        }
        if (!myRef.current){
          return;
        }
        if (myRef.current > NconsecutiveAcceleration 
          && orientationRef.current?.count > NconsecutiveAngleGotWorse){
          myRef.current = null
          orientationRef.current = null
          myModule.errorAsync();
        }

        // if (orientationRef.current && orientationRef.current.y > 9 
        //   && e.y < -2 
        // ){
        //   // console.log("x,y,z",e.x,e.y,e.z)
        //   dataRef.current.count = dataRef.current.count +1;
        //   if (dataRef.current.count > 7){
        //     dataRef.current = null;
        //     // console.log("EEK")
        //     myModule.warningAsync();
        //   }
        // }
        
          // let VAR = 1;
          // if (Math.abs(e.x) > VAR || Math.abs(e.y) > VAR || Math.abs(e.z) > VAR){
          //   dataRef.current.count++
          //   if (Math.max(Math.abs(e.x),Math.abs(e.y),Math.abs(e.z)) === Math.abs(e.x)){
          //       console.log("X")
          //   }
          //   if (Math.max(Math.abs(e.x),Math.abs(e.y),Math.abs(e.z)) === Math.abs(e.y)){
          //     console.log("Y")
          // }
          // if (Math.max(Math.abs(e.x),Math.abs(e.y),Math.abs(e.z)) === Math.abs(e.z)){
          //   console.log("Z")
          // }
            // if (color !== "red" && dataRef.current.count > NconsecutiveAcceleration){
            // setColor("red")
            // }
            
            // if (color !== "green" && dataRef.current.count <=0){
            //   dataRef.current.count = 0;
            //   setColor("green")
            // }
          
        
      })
    }}
    >
      start both
    </Button>
    <Button
    onPress={async ()=>{
      await Promise.all([
        myModule.removeAllListeners("onOrientationChange"),
        myModule.removeAllListeners("onLinearMovementDetected")
      ])
      await Promise.all([
        myModule.stopOrientation(),
        myModule.stopLinearMovementDetection()
      ])
      console.log("stoped both",dataRef.current)

      orientationRef.current = null;
      myRef.current = null
      dataRef.current = null
      
    }}
       style={{margin:6}}
    mode='contained-tonal'
    >
      stop both
    </Button>
     <Button
     style={{margin:6}}
    mode='contained'
    onPress={()=>{
      console.log(myModule.isOrientationAvailable())
      if (!myModule.isOrientationAvailable()){
        return;
      }
      myModule.startOrientation();
      myModule.addListener("onOrientationChange",e => {
        myRef.current = (myRef.current ?? 0) +1;      
        // if (myRef.current % 100 ===0){
        //   console.log(e)
        // }
        //must have a good angle to begin with or wont do anything
        if (!orientationRef.current && e.y > 9){
          orientationRef.current ={y: e.y,count:1};
          return;
        }
        // if not yet good angle, do nothing
        if (!orientationRef.current){
          return;
        }
        // angle getting worse
        if (e.y < orientationRef.current.y){
        orientationRef.current = {y: e.y,count:orientationRef.current.count++}
        // angle getting better
        } else if (e.y > orientationRef.current.y){
          orientationRef.current = {y: e.y,count:orientationRef.current.count--}
        }
        // reset so that if the angle is bad N times will result in a haptic
        if (orientationRef.current.count <0){
          orientationRef.current.count = 0;
        }
        if (orientationRef.current.count > 100){
          console.log(orientationRef.current)
          orientationRef.current = null
        }
      })
    }}
    >
      start gyroscope
    </Button>
    <Button
     style={{margin:6}}
    mode='contained-tonal'
    onPress={()=>{
      myModule.removeAllListeners("onOrientationChange");
      myModule.stopOrientation().finally(()=>console.log("stop gyroscope"));
      orientationRef.current = null;
    }}
    >
      stop gyrosopce
    </Button>
   <Button
     style={{margin:6}}
    mode='contained'
    onPress={()=>{
      console.log(myModule.isMovementDetectionAvailable())
      if (!myModule.isMovementDetectionAvailable()){
        return;
      }
      myModule.startMovementDetection();
      myModule.addListener("onMovementDetected",e => {
        myRef.current = (myRef.current ?? 0) +1;      
        if (myRef.current % 100 ===0){
          console.log(e)
        }
      })
    }}
    >
      start accelerometer
    </Button>
    <Button
     style={{margin:6}}
    mode='contained-tonal'
    onPress={()=>{
      myModule.removeAllListeners("onMovementDetected");
      myModule.stopMovementDetection().finally(()=>console.log("stop accelerometer"));
      myRef.current = 0;
    }}
    >
      stop accelerometer
    </Button> 
    <Button
    mode='outlined'
    style={{margin:6}}
    onPress={()=>{
      myModule.removeAllListeners("onStepCountChange");
      myModule.stopStepDetection().finally(()=>console.log("stopped"));
      
    }}
    >
      stop step count
    </Button>
    <Button
    mode='elevated'
    onPress={()=>{
      console.log(myModule.isStepDetectionAvailable())
      if (!myModule.isStepDetectionAvailable()){
        return;
      }
      myModule.startStepDetection().finally(()=>console.log("starting..."));
      myModule.addListener("onStepCountChange",e => console.log(e))
      
    }}
    >
      start step count
    </Button>
    <Button 
    mode='contained'
    onPress={()=>{
      myModule.requestStepPermissions()
    }}
    >
      permissiosn
    </Button>
    <Button
    mode='contained'
    style={{margin:6}}
    onPress={() => {
      console.log(myModule.isLinearMovementDetectionAvailable())
      if (!myModule.isLinearMovementDetectionAvailable){
        return;
      }
      myModule.startLinearMovementDetection();
      myModule.addListener("onLinearMovementDetected",e => {
        if (!myRef.current){
          myRef.current = 0;
        }
        let VAR = 1.5
        let absX = Math.abs(e.x), absY = Math.abs(e.y), absZ = Math.abs(e.z)
        // if (e.y > 2){
        //   myRef.current = e.y
        // }
        // if (e.y < -2 && myRef.current > 2){

        //   console.log(myRef.current,e.y)
        //   myRef.current = null;
        // }        
        if (e.y < -VAR){
          myRef.current = e.y
        }
        if (e.y > VAR && myRef.current < -VAR){
          console.log(myRef.current,e.y)
          myModule.warningAsync();
          myRef.current = null;
        }
      })
    }}
    >
      start linear
    </Button>
    <Button
    style={{margin:6}}
    mode='contained'
    onPress={()=>{
      myModule.removeAllListeners("onLinearMovementDetected")
      myModule.stopLinearMovementDetection();
      console.log("stoped")
      console.log(arrayRef.current,dataRef.current)
      arrayRef.current =[]
      dataRef.current = null;
      myRef.current = null
    }}
    >
      stop linear
    </Button>
    {/* <Button onPress={()=>{
      console.log(myModule.isOrientationAvailable())
      myModule.removeAllListeners("onOrientationChange")
      myModule.stopOrientation();
     if (myModule.isOrientationAvailable()){

      myModule.startOrientation(); 
      myModule.addListener("onOrientationChange",(e)=>{
        myRef.current++;
        if (myRef.current % 100 === 0){
          setData(e)
        }
      })
    }
    }}
      title='start'
      /> */}
    {/* <Text>{JSON.stringify(data,null,2)}</Text> */}
{/* 
      <Button onPress={()=>{
        myModule.removeAllListeners("onOrientationChange")
        myModule.stopOrientation()
        // .catch(e => console.log(e))
        .finally(()=>console.log("stopped"))
        setData(null)
    }}
      title='stop'
      /> */}
      {/* <Button
      title='haptics'
      onPress={async ()=> {
        myModule.warningAsync().catch(e => console.log(e)).finally(()=>console.log("oks haptics"))
        }}
      /> */}

        {/* <Settings/> */}
        {/* <PlayButton/> */}

      {/* <View style={styles.controls}> */}

      
      <CustomButton
      disabled={isBackgroundRunning}
      onPress={()=> {
        myModule.selectionAsync();
        setOptions({...defaultOptions,parameters:{...defaultConfig,values: angleValuesMap["30"]}})
      }}
      >
      <Text variant="titleSmall" style={styles.text}>{angleValuesMap[30].name}</Text>
      </CustomButton>
      <CustomButton
      disabled={isBackgroundRunning}
      onPress={()=> {
        myModule.selectionAsync();
        setOptions({...defaultOptions,parameters:{...defaultConfig,values: angleValuesMap["45"]}})
      }}
      >
        <Text variant="titleSmall" style={styles.text}>{angleValuesMap[45].name}</Text>
      </CustomButton>
      {/* <CustomButton
      
     
      disabled={isBackgroundRunning}
      text='60 deg'
      onPress={()=> {
        myModule.warningAsync();
        setOptions({...defaultOptions,parameters:{...defaultConfig,values: angleValuesMap["60"]}})
      }}
      />
      </View> */}
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
         <Text variant="titleSmall" style={styles.text}>stop background</Text>
      </CustomButton>
       <CustomButton
       disabled={isBackgroundRunning}
      onPress={()=>{
        if (BackgroundService.isRunning()){
          return;
        }
        myModule.warningAsync();
        BackgroundService.start(veryIntensiveTask2, options).finally(()=>setIsBackgroundRunning(true))}}
      > 
      <Text variant="titleSmall"style={styles.text}>{`start background ${options.parameters.values.angle}`}</Text>
      </CustomButton>

      <Text style={styles.text}>${options.parameters.values.name}</Text>
    {/* </View> */}

        <Text style={styles.text}>{JSON.stringify(data)}</Text>
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
  delay: 10000 as const,
  values: angleValuesMap["30"],
  strictness: 1
} satisfies BackgroundTaskParams
type RefType<T> = {current:T};
type OrientationRef = RefType<{y:number,count:number}|null>
type NullableNumberRef = RefType<number|null>
type BadAngleRef = RefType<{isBadAngle:boolean,count:number}>
const veryIntensiveTask2 = async (taskData?:BackgroundTaskParams) => {
  const config = taskData ?? defaultConfig
  const {delay,values,strictness} = config;
  const badAngleRef:BadAngleRef = {current:{isBadAngle:false,count:0}}
  const orientationRef:OrientationRef = {current:{count:0,y:0}}
  const runLockRef:RefType<RunLock> = {current:{}}
  const linearAccelerationRef: NullableNumberRef = {current:null}
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
        return resolve("done");
      }
      myModule.startLinearMovementDetection();
      myModule.startOrientation();
      myModule.addListener("onLinearMovementDetected",e =>{
        onLinearMovementDetectedAngle({
          cb: myModule.errorAsync,
          e,
          linearRef: linearAccelerationRef,
          orientationRef,
        })
        onLinearMovementDetectedVertical({
          cb: myModule.errorAsync,
          e,
          linearRef: linearAccelerationRef,
          var:VAR
        })
      })
      myModule.addListener("onOrientationChange",e => {
        onOrientationChangeArch(orientationRef,e)
        // onOrientationChangeBadAngle(
        //   badAngleRef,
        //   e,
        //   config,
        // )
      })
      await new Promise(r => setTimeout(r,delay));
      myModule.removeAllListeners("onLinearMovementDetected")
      myModule.removeAllListeners("onOrientationChange")
      await Promise.all([
        myModule.stopOrientation(),
        myModule.stopLinearMovementDetection()
      ])
      await new Promise(r => setTimeout(r,200));
      // if (badAngleRef.current.isBadAngle === true){
      //   badAngleRef.current.count++
      // } else {
      //   badAngleRef.current.count = 0;
      // }
      // if (badAngleRef.current.count > strictness){
      //   runWithLock({
      //     cb: myModule.warningAsync,
      //     key,
      //     lockTime: 1000,
      //     runLock: runLockRef.current
      //   })
      // }
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
  }
  if (!linearAccelerationRef.current){
    return;
  }
  if (e.y > VAR && linearAccelerationRef.current < -VAR){
    console.log(linearAccelerationRef.current,e.y,"background,onLinearMovementDetectedVertical")
    void cb();
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