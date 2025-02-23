import React, { useEffect, useState } from 'react'
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
  const [config,setConfig] = useState<BackgroundTaskParams>()
  //
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
      myModule.addListener("onOrientationChange",(e)=>setData(e))
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
        myModule.selectionAsync().catch(e => console.log(e)).finally(()=>console.log("oks haptics"))
        }}
      />
      <Button
      title='stop background'
      onPress={()=>BackgroundService.stop()}
      />
       <Button
      title='start background'
      disabled={BackgroundService.isRunning()}
      onPress={()=>{
        if (BackgroundService.isRunning()){
          return;
        }
        BackgroundService.start(veryIntensiveTask, options)}}
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
const configDefault = {
  delay: 5000,
  values: {y:6.94,z:6.94},
  strictness: 1
} satisfies BackgroundTaskParams
const veryIntensiveTask = async (taskData?:BackgroundTaskParams) => {
  const config = taskData ?? configDefault
  const {delay,values,strictness} = config;
  let count = 0;
  const ref: {current: number} = {current:0}//todow generic
  await new Promise( async (resolve) => {
    if (!myModule.isOrientationAvailable()){
      //notify user?
      return resolve("done");
    }
    for (let i = 0; BackgroundService.isRunning(); i++) {
      ref.current = 0;
      // delay
      console.log(values,delay,"values,delay")
      
      // listen for angle
      myModule.startOrientation(); 
      myModule.addListener("onOrientationChange",(event) => {
        if (count % 100 === 0){
          console.log(event)
        }
        count++
        const isBadAngle = shouldExecuteHaptics(event,config)
        if (isBadAngle){
          ref.current++
        }
      })
      await new Promise(r => setTimeout(r,delay));
      
      myModule.stopOrientation().finally(()=>console.log("ok"));
      myModule.removeAllListeners("onOrientationChange")

      console.log(ref.current,"ref");
      if (ref.current > strictness){
        myModule.selectionAsync();
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
  parameters: configDefault satisfies BackgroundTaskParams,
};

//npm i -g @expo/ngrok
//npx expo start --tunnel

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
function shouldExecuteHaptics(event:SensorEvent,config: BackgroundTaskParams){
  return config.values.y < event.y && config.values.z > event.z;
}