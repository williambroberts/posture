import React from "react";
import { Text as RNText } from "react-native-paper";

type P = React.ComponentProps<typeof RNText>;
export const Text = (props: P) => {
  return (
    <RNText
      {...props}
      style={[{ fontFamily: "Inter_900Black" }, props.style]}
    />
  );
};
