import { useThemedStyles } from '@/utilities/theme';
import React, { useMemo } from 'react'
import { StyleProp, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { MD3Theme, MD3TypescaleKey, Text, TouchableRipple, useTheme } from 'react-native-paper'

type Props = {
  text:string;
  onPress: ()=>void;
  disabled:boolean;
  containerStyle?:StyleProp<ViewStyle>
  textStyle?:StyleProp<TextStyle>

}

export const CustomButton = ({
  text,
  onPress,
  disabled,
  containerStyle,
  textStyle,
}:Props) => {
  //theme
  const styles = useThemedStyles(stylesCallback)
  //jsx
  return (
  <TouchableRipple 
  disabled={disabled}
  onPress={onPress} 
  style={[styles.container,
    disabled 
    ? styles.containerDisabled 
    : undefined,
    containerStyle,
  ]}
  >
    <Text variant='titleSmall'
     style={[styles.text,
      disabled 
      ? styles.textDisabled
      : undefined,
      textStyle,
     ]}
     >{text}</Text>
  </TouchableRipple>
  )
}
const stylesCallback = (theme:MD3Theme) => StyleSheet.create({
  container:{
    backgroundColor:theme.colors.primary,
    padding: 8,
    margin: 4,
    borderRadius: 8,
  },
  containerDisabled:{
    backgroundColor: theme.colors.surfaceDisabled,
  },
  text:{
    color:theme.colors.onPrimary,
    flexShrink:1,
  },
  textDisabled:{
    color: theme.colors.onSurfaceDisabled
  },
})

