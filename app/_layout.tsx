import { Stack } from "expo-router";
import { useEffect } from "react";
import { Linking, useColorScheme } from "react-native";
import myModule from '../modules/my-module';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
//https://egghead.io/lessons/react-native-create-a-development-build-for-android-with-eas
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" 
   ? MD3DarkTheme
   : MD3LightTheme
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
    <PaperProvider theme={theme}>
      <Stack
        screenOptions={{
          headerShown:false,
          statusBarBackgroundColor:theme.colors.surfaceVariant,
          navigationBarColor:theme.colors.surfaceVariant,
        }}
      />
    </PaperProvider>
    );
}
