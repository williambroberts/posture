import { Stack } from "expo-router";
import { useEffect } from "react";
import { Linking } from "react-native";
import {
  Inter_900Black,
  Inter_400Regular,
  Inter_700Bold,
  Inter_300Light,
  useFonts,
} from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";
import myModule from "../modules/my-module";
import { PaperProvider } from "react-native-paper";
import { useCustomTheme } from "@/utilities/theme";
//https://egghead.io/lessons/react-native-create-a-development-build-for-android-with-eas

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_900Black,
    Inter_400Regular,
    Inter_700Bold,
    Inter_300Light,
  });
  const theme = useCustomTheme();
  useEffect(() => {
    const handleOpenURL = (event: { url: string }) => {
      //
    };
    Linking.addEventListener("url", handleOpenURL);

    return () => {
      myModule.removeAllListeners("onOrientationChange");
      myModule.stopOrientation();
      Linking.removeAllListeners("url");
    };
  }, []);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <Stack
        screenOptions={{
          headerShown: false,
          statusBarBackgroundColor: theme.colors.surfaceVariant,
          navigationBarColor: theme.colors.surfaceVariant,
        }}
      />
    </PaperProvider>
  );
}
