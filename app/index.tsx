import React, { useEffect, useRef, useState } from 'react'
import { Button, Text, View } from 'react-native'
// import { gyroscope, SensorData } from "react-native-sensors";
import BackgroundService from 'react-native-background-actions';
// import { NativeModules, DeviceEventEmitter } from 'react-native';
// import MyModule from '../modules/my-module';
import myModule from '../modules/my-module';
import { SensorEvent } from '@/modules/my-module/src/MyModule';

// // Access the GyroscopeModule
// const { GyroscopeModule } = NativeModules;

// Start listening for gyroscope data

export default function Index(){
  const [data,setData] = useState<SensorEvent | null>()
  const [config,setConfig] = useState<BackgroundTaskParams>(defaultConfig)
  const [isBackgroundRunning,setIsBackgroundRunning] = useState<boolean>(false)
  const myRef = useRef<number>(0)
  const [tog,setTog] = useState("")
  useEffect(()=>{
    return () => {
      myModule.removeAllListeners("onOrientationChange")
      myModule.stopOrientation();
    }
    // console.log(myModule.hello(),myModule.PI)
  },[])
  
  return (
  <View>
    <Text>{myModule.PI}</Text>
    <Button onPress={()=>{
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
      />
    <Text>{JSON.stringify(data,null,2)}</Text>

      <Button onPress={()=>{
        myModule.removeAllListeners("onOrientationChange")
        myModule.stopOrientation()
        // .catch(e => console.log(e))
        .finally(()=>console.log("stopped"))
        setData(null)
    }}
      title='stop'
      />
      <Button
      title='haptics'
      onPress={async ()=> {
        myModule.warningAsync().catch(e => console.log(e)).finally(()=>console.log("oks haptics"))
        }}
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
      title='start background'
      onPress={()=>{
        if (BackgroundService.isRunning()){
          return;
        }
        BackgroundService.start(veryIntensiveTask, options).finally(()=>setIsBackgroundRunning(true))}}
      />
      <Text>{tog}: vib</Text>
  </View>
  )
}
//region background task
type BackgroundTaskParams = {
  delay: number;// power saving var
  values:{y:number,z:number};
  strictness: number;
  //strictness: number; // max strikes at bad angle -> vibrate 
}
const angleValuesMap = {
  30:  {y:4.9,z:8.5},
  45:  {y:6.94,z:6.94},
  60:  {y:8.5,z:4.9},
}
const defaultConfig = {
  delay: 5000,
  values: angleValuesMap["30"],
  strictness: 1
} satisfies BackgroundTaskParams
const veryIntensiveTask = async (taskData?:BackgroundTaskParams) => {
  const config = taskData ?? defaultConfig
  const {delay,values,strictness} = config;
  const countRef: {current: number} = {current:0}//todow generic
  const eventRef:{current:SensorEvent| null} = {current:null} 
  const isBadAngleRef: {current:boolean} = {current: false}
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
        }
      })
      await new Promise(r => setTimeout(r,delay));
      
      myModule.stopOrientation().finally(()=>console.log("ok"));
      myModule.removeAllListeners("onOrientationChange")

      console.log(countRef.current,"ref",isBadAngleRef.current,eventRef.current);
      if (countRef.current > strictness && isBadAngleRef.current){
        myModule.warningAsync();
      }
    }
    resolve("done")
});
}
const options = {
  taskName: 'Example',
  taskTitle: 'ExampleTask title',
  taskDesc: 'ExampleTask description',
  taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
  },
  color: '#ff00ff',
  linkingURI: 'posture://', // See Deep Linking for more info
  parameters: defaultConfig satisfies BackgroundTaskParams,
};

//npm i -g @expo/ngrok
//npx expo start --tunnel
//npx eas build --platform android --profile production

function calculateAngles(event:SensorEvent) {
  const {x,y,z} = event;
  // Calculate roll: angle between the y-axis and the z-axis.
  const roll = Math.atan2(y, z);
  // Calculate pitch: angle between the x-axis and the plane formed by y and z.
  const pitch = Math.atan2(-x, Math.sqrt(y * y + z * z));

  // Convert radians to degrees
  const rollDegrees = roll * (180 / Math.PI);
  const pitchDegrees = pitch * (180 / Math.PI);

  return { rollDegrees, pitchDegrees };
}
// todow e.g number from this range 0<90;
function fromRollToComponents(rollDegrees:number, gravity = 9.81) {
  const rollRadians = rollDegrees * (Math.PI / 180);
  const gz = gravity * Math.sin(rollRadians);
  const gy = gravity * Math.cos(rollRadians);
  return { gy:gy.toFixed(2), gz:gz.toFixed(gz) };
}
function isBadAngle(event:SensorEvent,config: BackgroundTaskParams){
  return event.y < config.values.y && event.z > config.values.z;
}