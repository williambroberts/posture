import {
  COLOR,
  COLOR_3,
  computeMixedColor,
  useThemedStyles,
} from "@/utilities/theme";
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
  variant?: "highlight" | "default";
};
//todow variants & compound component for the children / icon & text
export const CustomButton = ({
  onPress,
  disabled,
  containerStyle,
  children,
  variant = "default",
}: Props) => {
  //theme
  const styles = useThemedStyles(stylesCallback);
  //jsx
  return (
    <TouchableRipple
      disabled={disabled}
      onPress={onPress}
      style={[
        styles[`container__${variant}`],
        disabled ? styles[`containerDisabled__${variant}`] : undefined,
        containerStyle,
      ]}
    >
      {children}
    </TouchableRipple>
  );
};
const stylesCallback = (theme: MD3Theme) => {
  const base = {
    padding: 8,
    marginVertical: 4,
    borderRadius: 8,
    minWidth: 160,
    width: "100%",
    minHeight: 40,
    borderWidth: 1,
  } as const satisfies ViewStyle;
  return StyleSheet.create({
    container__default: {
      ...base,
      backgroundColor: computeMixedColor(theme.colors.surface, COLOR),
      borderColor: computeMixedColor(theme.colors.onSurface, COLOR),
    },
    container__highlight: {
      ...base,
      backgroundColor: computeMixedColor(theme.colors.surface, COLOR_3, 3),
      borderColor: computeMixedColor(theme.colors.onSurface, COLOR, 5),
    },
    containerDisabled__default: {
      backgroundColor: computeMixedColor(theme.colors.surfaceDisabled, COLOR),
      borderColor: computeMixedColor(theme.colors.onSurfaceDisabled, COLOR),
    },
    containerDisabled__highlight: {
      backgroundColor: computeMixedColor(
        theme.colors.surfaceDisabled,
        COLOR_3,
        3
      ),
      borderColor: computeMixedColor(theme.colors.onSurfaceDisabled, COLOR, 5),
    },
  });
};
