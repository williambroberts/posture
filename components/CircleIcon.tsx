import { COLOR, computeMixedColor, useThemedStyles } from "@/utilities/theme";
import { StyleSheet, View } from "react-native";
import { Icon, MD3Theme } from "react-native-paper";

type Props = {
  iconName: string;
  variant: Variant;
};
export const CircleIcon = ({ iconName, variant }: Props) => {
  const styles = useThemedStyles(stylesCallback);
  return (
    <View style={styles[`outer${variant}`]}>
      <View style={styles[`middle${variant}`]}>
        <View style={styles[`inner${variant}`]}>
          <Icon
            size={ICON_SIZE}
            source={iconName}
            color={styles[`icon${variant}`].color}
          />
        </View>
      </View>
    </View>
  );
};
//region styles
const ICON_SIZE = 16;
const variants = ["disabled", "selected", "warning", "success"] as const;
type Variant = (typeof variants)[number];
const stylesCallback = (theme: MD3Theme) =>
  StyleSheet.create({
    [`icon${variants[0]}`]: {
      color: computeMixedColor(theme.colors.onSurfaceDisabled, COLOR),
    },
    [`outer${variants[0]}`]: {
      borderRadius: 999,
      overflow: "hidden",
      backgroundColor: "transparent",
      padding: 2,
    },
    [`middle${variants[0]}`]: {
      borderRadius: 999,
      padding: 1,
      overflow: "hidden",
      backgroundColor: "transparent",
    },
    [`inner${variants[0]}`]: {
      borderRadius: 999,
      overflow: "hidden",
      backgroundColor: computeMixedColor(theme.colors.surfaceDisabled, COLOR),
      padding: 2,
    },
    [`icon${variants[1]}`]: {
      color: computeMixedColor(theme.colors.onBackground, COLOR),
    },
    [`outer${variants[1]}`]: {
      borderRadius: 999,
      overflow: "hidden",
      backgroundColor: computeMixedColor(theme.colors.background, COLOR),
      padding: 2,
    },
    [`middle${variants[1]}`]: {
      borderRadius: 999,
      padding: 1,
      overflow: "hidden",
      backgroundColor: computeMixedColor(theme.colors.onBackground, COLOR),
    },
    [`inner${variants[1]}`]: {
      borderRadius: 999,
      overflow: "hidden",
      backgroundColor: computeMixedColor(theme.colors.elevation.level4, COLOR),
      padding: 2,
    },
    [`icon${variants[2]}`]: {
      color: computeMixedColor(theme.colors.onSurface, COLOR),
    },
    [`outer${variants[2]}`]: {
      borderRadius: 999,
      backgroundColor: computeMixedColor(theme.colors.surface, COLOR),
      padding: 2,
    },
    [`middle${variants[2]}`]: {
      borderRadius: 999,
      padding: 1,
      backgroundColor: computeMixedColor(theme.colors.surface, COLOR),
    },
    [`inner${variants[2]}`]: {
      borderRadius: 999,
      backgroundColor: computeMixedColor(theme.colors.surface, COLOR),
      padding: 2,
    },
    [`icon${variants[3]}`]: {
      color: computeMixedColor(theme.colors.elevation.level3, COLOR),
    },
    [`outer${variants[3]}`]: {
      borderRadius: 999,
      backgroundColor: computeMixedColor(theme.colors.elevation.level3, COLOR),
      padding: 2,
    },
    [`middle${variants[3]}`]: {
      borderRadius: 999,
      padding: 1,
      backgroundColor: computeMixedColor(theme.colors.elevation.level3, COLOR),
    },
    [`inner${variants[3]}`]: {
      borderRadius: 999,
      backgroundColor: computeMixedColor(theme.colors.elevation.level3, COLOR),
      padding: 2,
    },
  });
