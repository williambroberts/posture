import { useThemedStyles } from "@/utilities/theme";
import React, { useMemo } from "react";
import { StyleProp, StyleSheet, TextStyle, ViewStyle } from "react-native";
import {
  MD3Theme,
  MD3TypescaleKey,
  Text,
  TouchableRipple,
  useTheme,
} from "react-native-paper";

type Props = {
  // text:string;
  onPress: () => void;
  disabled: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  // textStyle?:StyleProp<TextStyle>
  children: React.ReactNode;
};
//todow variants & compound component for the children / icon & text
export const CustomButton = ({
  onPress,
  disabled,
  containerStyle,
  children,
}: Props) => {
  //theme
  const styles = useThemedStyles(stylesCallback);
  //jsx
  return (
    <TouchableRipple
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.container,
        disabled ? styles.containerDisabled : undefined,
        containerStyle,
      ]}
    >
      {children}
    </TouchableRipple>
  );
};
const stylesCallback = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      padding: 8,
      marginVertical: 4,
      borderRadius: 8,
      minWidth: 160,
      borderWidth: 1,
      borderColor: theme.colors.onSurface,
    },
    containerDisabled: {
      backgroundColor: theme.colors.surfaceDisabled,
      borderColor: theme.colors.onSurfaceDisabled,
    },
  });
