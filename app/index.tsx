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
    {/* <Button onPress={()=>{
      console.log(myModule.isOrientationAvailable())
      myModule.removeAllListeners("onOrientationChange")
      myModule.stopOrientation();
     if (myModule.isOrientationAvailable()){

      myModule.startOrientation(); 
      myModule.addListener("onOrientationChange",(e)=>setData(e))
    }
    }}
      title='start'
      /> */}
    {/* <Text>{JSON.stringify(data,null,2)}</Text> */}

      {/* <Button onPress={()=>{
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
        myModule.selectionAsync().catch(e => console.log(e)).finally(()=>console.log("oks haptics"))
        }}
      />
      <Button
      title='stop background'
      onPress={()=>BackgroundService.stop()}
      />
       <Button
      title='start background'
      onPress={()=>BackgroundService.start(veryIntensiveTask, options)}
      />
      <Text>{tog}: vib</Text>
  </View>
  )
}
//region background task
type BackgroundTaskParams = {
  delay: number;// power saving var
  values:[number,number];
  //strictness: number; // max strikes at bad angle -> vibrate 
}
const configDefault = {
  delay: 5000,
  values: [6.94,6.94]
} satisfies BackgroundTaskParams
const veryIntensiveTask = async (taskData?:BackgroundTaskParams) => {
  const config = taskData ?? configDefault
  const {delay,values} = config;
  const ref: {current:null | SensorEvent} = {current:null}
  await new Promise( async (resolve) => {
    
    for (let i = 0; BackgroundService.isRunning(); i++) {
      if (!myModule.isOrientationAvailable()){
        return resolve("done");
      }
      // delay
      console.log(values,delay,"values,delay")
      //clean up any previous background task
      myModule.stopOrientation();
      myModule.removeAllListeners("onOrientationChange")
      // listen for angle
      myModule.startOrientation(); 
      await new Promise(r => setTimeout(r,delay));

      myModule.addListener("onOrientationChange",(event) => {
        ref.current = event
      })
      
      console.log(ref.current,"ref.current");
      const executeHaptics = shouldExecuteHaptics(ref.current,config);
      if (executeHaptics){
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
function shouldExecuteHaptics(event:SensorEvent | null,config: BackgroundTaskParams){
  return true;
}