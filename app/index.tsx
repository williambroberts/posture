import React, { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { gyroscope, SensorData } from "react-native-sensors";

export default function Index(){
  const [data,setData] = useState<SensorData>()
  
  useEffect(()=>{
    const subscription = gyroscope.subscribe((data) =>
      setData(data)
    );
    return () =>{
      subscription.remove(()=>{
        console.log("unsubsribed")
      });
    }
    
  },[])
  return (
  <View>
    <Text>{JSON.stringify(data,null,2)}</Text>
  </View>
  )
}