import React, { useEffect, useRef, useState } from 'react'
import { AppState, Button, Text, View } from 'react-native'
// import { gyroscope, SensorData } from "react-native-sensors";
import BackgroundService, { BackgroundTaskOptions } from 'react-native-background-actions';
// import { NativeModules, DeviceEventEmitter } from 'react-native';
// import MyModule from '../modules/my-module';
import myModule from '../modules/my-module';
import { SensorEvent } from '@/modules/my-module/src/MyModule';

// // Access the GyroscopeModule
// const { GyroscopeModule } = NativeModules;

// Start listening for gyroscope data
//region component
export const Application = () => {
  const [data,setData] = useState<SensorEvent | null>()
  const [options,setOptions] = useState<ExtendedOptions>(defaultOptions)
  const [isBackgroundRunning,setIsBackgroundRunning] = useState<boolean>(false)
  const myRef = useRef<number>(0)
  const [tog,setTog] = useState("")
  
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
  
  return (
    // <NavigationContainer linking={linking}>
  <View>
    <Text>{myModule.PI}</Text>
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
      <Button
      title='haptics'
      onPress={async ()=> {
        myModule.warningAsync().catch(e => console.log(e)).finally(()=>console.log("oks haptics"))
        }}
      />
      <Button
      title='30 deg'
      onPress={()=> setOptions({...defaultOptions,parameters:{...defaultConfig,values: angleValuesMap["30"]}})}
      />
      <Button
      title='45 deg'
      onPress={()=> setOptions({...defaultOptions,parameters:{...defaultConfig,values: angleValuesMap["45"]}})}
      />
      <Button
      title='60 deg'
      onPress={()=> setOptions({...defaultOptions,parameters:{...defaultConfig,values: angleValuesMap["60"]}})}
      />
      <Button
      title='stop background'
      disabled={!isBackgroundRunning}
      onPress={()=>{
        BackgroundService.stop().finally(() => setIsBackgroundRunning(false))
      }}
      />
       <Button
       disabled={isBackgroundRunning}
      title={`start background ${options.parameters.values.angle}`}
      onPress={()=>{
        if (BackgroundService.isRunning()){
          return;
        }
        BackgroundService.start(veryIntensiveTask, options).finally(()=>setIsBackgroundRunning(true))}}
      />
      <Text>${options.parameters.values.name}</Text>
  </View>

 
  // </NavigationContainer>
  )
}

//region background task
type BackgroundTaskParams = {
  delay: number;// power saving var
  values:{y:number,z:number,angle:number,name:string};
  strictness: number;
  //strictness: number; // max strikes at bad angle -> vibrate 
}
const angleValuesMap = {
  30:  {y:4.9,z:8.5,angle:30,name:"Light"},
  45:  {y:6.94,z:6.94,angle:45,name:"normal"},
  60:  {y:8.5,z:4.9,angle:60,name:"Intense"},
} satisfies {[key:number]:BackgroundTaskParams["values"]}
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
      //notify user?
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
        if (streakRef.current > 3){// can put into var
          myModule.errorAsync();
        }else {
          myModule.warningAsync();
        }
        if (streakRef.current > 10){
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