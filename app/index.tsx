import React, { useEffect, useState } from 'react'
import { Button, Text, View } from 'react-native'
// import { gyroscope, SensorData } from "react-native-sensors";
import BackgroundService from 'react-native-background-actions';
// import { NativeModules, DeviceEventEmitter } from 'react-native';
// import MyModule from '../modules/my-module';
import myModule from '../modules/my-module';
import { GyroscopeEvent } from '@/modules/my-module/src/MyModule';

// // Access the GyroscopeModule
// const { GyroscopeModule } = NativeModules;

// Start listening for gyroscope data

export default function Index(){
  const [data,setData] = useState<GyroscopeEvent | null>()
  //
  const [tog,setTog] = useState(false)
  useEffect(()=>{
    
    return () => {
      myModule.removeAllListeners("onGyroscopeChange")
      myModule.stopGyroscope();
    }
    // console.log(myModule.hello(),myModule.PI)
  },[])
  
  // useEffect(()=>{
  //   (async()=>{
  //     await BackgroundService.start(veryIntensiveTask, options);
  //   })()
  //   return () => {
  //     BackgroundService.stop(); 
  //   }
  // },[])

  useEffect(() => {
    console.log(tog)
    return () => {
      console.log(tog,"return")
    }
  },[tog])
  return (
  <View>
    <Text>{myModule.PI}</Text>
    <Button onPress={()=>{
     if (myModule.isGyroscopeAvailable()){
      myModule.startGyroscope(); 
      myModule.addListener("onGyroscopeChange",(e)=>setData(e))
    }
    }}
      title='start'
      />
    <Text>{JSON.stringify(data,null,2)}</Text>

      <Button onPress={()=>{
        myModule.removeAllListeners("onGyroscopeChange")
        myModule.stopGyroscope().catch(e => console.log(e)).finally(()=>console.log("stopped"))
        setData(null)
    }}
      title='stop'
      />
      {/* <Button
      title='tog'
      onPress={()=>setTog(p => !p)}
      /> */}
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

//npm i -g @expo/ngrok
//npx expo start --tunnel