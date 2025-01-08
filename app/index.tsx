import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { DeviceMotion, DeviceMotionMeasurement } from 'expo-sensors';
import * as Haptics from 'expo-haptics';

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
    })
    return () => {
      DeviceMotion.removeAllListeners();
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