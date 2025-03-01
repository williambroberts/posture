import React, { useEffect, useRef, useState } from 'react'
import { AppState, Button, StyleSheet, Text, View } from 'react-native'
// import { gyroscope, SensorData } from "react-native-sensors";
import BackgroundService, { BackgroundTaskOptions } from 'react-native-background-actions';
// import { NativeModules, DeviceEventEmitter } from 'react-native';
// import MyModule from '../modules/my-module';
import myModule from '../modules/my-module';
import { SensorEvent } from '@/modules/my-module/src/MyModule';
import { Icon, IconButton, MD3Colors, MD3Theme, Tooltip, TouchableRipple } from 'react-native-paper';
import { CustomButton } from './CustomButton';
import { useThemedStyles } from '@/utilities/theme';

// // Access the GyroscopeModule
// const { GyroscopeModule } = NativeModules;

// Start listening for gyroscope data
//region component
export const Application = () => {
  const [data,setData] = useState<SensorEvent | null>()
  const [options,setOptions] = useState<ExtendedOptions>(defaultOptions)
  const [isBackgroundRunning,setIsBackgroundRunning] = useState<boolean>(false)
  // const myRef = useRef<number>(0)
  // const [tog,setTog] = useState("")
  
  const styles = useThemedStyles(stylesCallback)
  useEffect(()=>{
    const sub = AppState.addEventListener("change",event => {
      if (event === "active"){
        BackgroundService.stop();
        setIsBackgroundRunning(false);
      }
    })
    return () => {
      sub.remove();
    }
  },[])
  const selected = options.parameters.values.name
  return (
    // <NavigationContainer linking={linking}>
  <View>
    <Tooltip title="Selected Camera">
    <IconButton
    icon={"camera"}
    onPress={()=>{}}
    // color={MD3Colors.error50}
    size={20}
  />
  </Tooltip>
   
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
      
      <View style={styles.controls}>

      
      <CustomButton
      disabled={isBackgroundRunning}
      text='30 deg'
      onPress={()=> {
        myModule.warningAsync();
        setOptions({...defaultOptions,parameters:{...defaultConfig,values: angleValuesMap["30"]}})
      }}
      />
      <CustomButton
      disabled={isBackgroundRunning}
      text='45 deg'
      onPress={()=> {
        myModule.warningAsync();
        setOptions({...defaultOptions,parameters:{...defaultConfig,values: angleValuesMap["45"]}})
      }}
      />
      <CustomButton
      
     
      disabled={isBackgroundRunning}
      text='60 deg'
      onPress={()=> {
        myModule.warningAsync();
        setOptions({...defaultOptions,parameters:{...defaultConfig,values: angleValuesMap["60"]}})
      }}
      />
      </View>
      <CustomButton
      text='stop background'
      disabled={!isBackgroundRunning}
      onPress={()=>{
        myModule.warningAsync();
        BackgroundService.stop().finally(() => setIsBackgroundRunning(false))
      }}
      />
       <CustomButton
       disabled={isBackgroundRunning}
      text={`start background ${options.parameters.values.angle}`}
      onPress={()=>{
        if (BackgroundService.isRunning()){
          return;
        }
        myModule.warningAsync();
        BackgroundService.start(veryIntensiveTask, options).finally(()=>setIsBackgroundRunning(true))}}
      />
      <Text>${options.parameters.values.name}</Text>
  </View>

 
  // </NavigationContainer>
  )
}
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
    backgroundColor: theme.colors.surface
  },
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
  delay: 5000,
  values: angleValuesMap["30"],
  strictness: 1
} satisfies BackgroundTaskParams
type RefType<T> = {current:T};
const veryIntensiveTask = async (taskData?:BackgroundTaskParams) => {
  const config = taskData ?? defaultConfig
  const {delay,values,strictness} = config;
  const countRef: {current: number} = {current:0}//todow generic
  const eventRef:{current:SensorEvent| null} = {current:null} 
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
        eventRef.current = event;
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

      console.log(countRef.current,"ref",isBadAngleRef.current,eventRef.current);
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