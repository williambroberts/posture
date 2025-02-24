import { Application } from '@/components/Application';
import React from 'react'
import { PaperProvider } from 'react-native-paper';

//region component
const Index = () => {
  //jsx
  return (
    <PaperProvider>
      <Application/>
    </PaperProvider>
  )
}

export default Index