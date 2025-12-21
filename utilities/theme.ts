import { useMemo } from "react";
import { MD3Theme, useTheme } from "react-native-paper";

//region theme
type StylesCallback<R> = (theme: MD3Theme) => R;

export const useThemedStyles = <R>(callback: StylesCallback<R>) => {
  const theme = useTheme();
  return useMemo(() => callback(theme), [theme, callback]);
};
