import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { DeviceMotion, DeviceMotionMeasurement } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import BackgroundService from 'react-native-background-actions';
import { useEffect, useState } from "react";

export default function Index() {
  const [isGranted,setIsGranded] = useState(false)
  const [data,setData] = useState<DeviceMotionMeasurement|null>(null)
  useEffect(()=>{
    (async () => {
      const permissionResponse = await DeviceMotion.requestPermissionsAsync();
      if (permissionResponse.granted){
        setIsGranded(permissionResponse.granted)
        return;
      }
      if (permissionResponse.granted === false && permissionResponse.canAskAgain){
        const response = await DeviceMotion.requestPermissionsAsync();
        setIsGranded(response.granted)
        return;
      }
    })()
  },[])
  useEffect(()=>{
    if (!isGranted){
      return;
    }
    DeviceMotion.addListener(data => {
      setData(data)
      //todow check if landscape and sitting
      if (data.rotation.beta < 0.6){
        // Haptics.notificationAsync(
        //   Haptics.NotificationFeedbackType.Warning
        // )
      }
    })
    return () => {
      DeviceMotion.removeAllListeners();
    }
  },[isGranted])
  useEffect(()=>{
    if (!isGranted){
      return;
    }
    BackgroundService.start(veryIntensiveTask, options);
    return () => {
      BackgroundService.stop(); 
    }
  },[isGranted])
  return (
    <View>
      <Text>{JSON.stringify(data,null,2)}.</Text>
      <Button
          title="Success"
          onPress={
            () =>
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              )
          }
        />
    </View>
  )
}
type Interval = NodeJS.Timeout | null;
const veryIntensiveTask = async () => {
  let intervalId:Interval = null;
  const startLogging = () => {
    if (!intervalId) {
      intervalId = setInterval(() => {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error
        )
      }, 1000);
    }
  };
  const stopLogging = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
  DeviceMotion.addListener(data => {
    if (data.rotation.beta < 0.6){
      startLogging();
    } else {
      stopLogging();
    }
  })
    // return () => {
    //   stopLogging();
    //   DeviceMotion.removeAllListeners();
    // }
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
  // linkingURI: 'yourSchemeHere://chat/jane', // See Deep Linking for more info
  parameters: {
      delay: 1000,
  },
};
// npx expo start --tunnel