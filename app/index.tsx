import { Application } from "@/components/Application";
import { useThemedStyles } from "@/utilities/theme";
import React from "react";
import { StatusBar, StyleSheet, useColorScheme } from "react-native";
import {
  PaperProvider,
  MD3DarkTheme,
  MD3LightTheme,
  useTheme,
  MD3Theme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

//region component
const Index = () => {
  //jsx
  const styles = useThemedStyles(stylesCallback);
  return (
    // <PaperProvider theme={theme}>
    <SafeAreaView style={styles.safeAreaView}>
      <StatusBar />
      <Application />
    </SafeAreaView>
    // </PaperProvider>
  );
};

export default Index;

const stylesCallback = (theme: MD3Theme) =>
  StyleSheet.create({
    safeAreaView: {
      flex: 1,
      backgroundColor: theme.colors.elevation.level5,
    },
  });
