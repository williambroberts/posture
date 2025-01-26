import React, { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
// import { gyroscope, SensorData } from "react-native-sensors";
import BackgroundService from 'react-native-background-actions';
import { NativeModules, DeviceEventEmitter } from 'react-native';

// Access the GyroscopeModule
const { GyroscopeModule } = NativeModules;

// Start listening for gyroscope data

export default function Index(){
  // const [data,setData] = useState<SensorData>()
  //
  // useEffect(()=>{
  //   const subscription = gyroscope.subscribe((data) =>
  //     setData(data)
  //   );
  //   return () =>{
  //     subscription.remove(()=>{
  //       console.log("unsubsribed")
  //     });
  //   }
    
  // },[])
  useEffect(()=> {
    GyroscopeModule.startListening();
    DeviceEventEmitter.addListener('GyroscopeData', (data) => {
      console.log("Gyroscope data:", data);  // {x, y, z}
    });
    return () => {
      GyroscopeModule.stopListening();
    }
  },[])
  // useEffect(()=>{
  //   (async()=>{
  //     await BackgroundService.start(veryIntensiveTask, options);
  //   })()
  //   return () => {
  //     BackgroundService.stop(); 
  //   }
  // },[])
  return (
  <View>
    {/* <Text>{JSON.stringify(data,null,2)}</Text> */}
  </View>
  )
}
// prebuild and re build try again (using 2 yr old unmaintained package)
const veryIntensiveTask = async () => {
  await new Promise( async (resolve) => {
    for (let i = 0; BackgroundService.isRunning(); i++) {
        console.log(i);
        console.warn(i);
        await new Promise(r => setTimeout(r,1000));
    }
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
  parameters: {
      delay: 1000,
  },
};