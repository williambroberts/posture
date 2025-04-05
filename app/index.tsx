import { Application } from '@/components/Application';
import React from 'react'
import { useColorScheme } from 'react-native';
import { 
  PaperProvider, 
  MD3DarkTheme,
  MD3LightTheme, 
} from 'react-native-paper';

//region component
const Index = () => {
 
  //jsx
  return (
    // <PaperProvider theme={theme}>
      <Application/>
    // </PaperProvider>
  )
}

export default Index