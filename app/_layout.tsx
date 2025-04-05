import { Stack } from "expo-router";
import Index from ".";
import { useEffect } from "react";
import { Linking } from "react-native";
import myModule from '../modules/my-module';
//https://egghead.io/lessons/react-native-create-a-development-build-for-android-with-eas
export default function RootLayout() {
  useEffect(()=>{
      const handleOpenURL = (event:{url:string}) => {
        //
      }
      Linking.addEventListener('url', handleOpenURL);
  
      return () => {
        myModule.removeAllListeners("onOrientationChange")
        myModule.stopOrientation();
        Linking.removeAllListeners("url")
      }
    },[])
  return (
      <Stack
        screenOptions={{
          headerShown:false
        }}
      />
    );
}
