import { useThemedStyles } from "@/utilities/theme";
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
      color: theme.colors.onSurfaceDisabled,
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
      backgroundColor: theme.colors.surfaceDisabled,
      padding: 2,
    },
    [`icon${variants[1]}`]: {
      color: theme.colors.onBackground,
    },
    [`outer${variants[1]}`]: {
      borderRadius: 999,
      overflow: "hidden",
      backgroundColor: theme.colors.background,
      padding: 2,
    },
    [`middle${variants[1]}`]: {
      borderRadius: 999,
      padding: 1,
      overflow: "hidden",
      backgroundColor: theme.colors.onBackground,
    },
    [`inner${variants[1]}`]: {
      borderRadius: 999,
      overflow: "hidden",
      backgroundColor: theme.colors.elevation.level4,
      padding: 2,
    },
    [`icon${variants[2]}`]: {
      color: theme.colors.onSurface,
    },
    [`outer${variants[2]}`]: {
      borderRadius: 999,
      backgroundColor: theme.colors.surface,
      padding: 2,
    },
    [`middle${variants[2]}`]: {
      borderRadius: 999,
      padding: 1,
      backgroundColor: theme.colors.surface,
    },
    [`inner${variants[2]}`]: {
      borderRadius: 999,
      backgroundColor: theme.colors.surface,
      padding: 2,
    },
    [`icon${variants[3]}`]: {
      color: theme.colors.elevation.level3,
    },
    [`outer${variants[3]}`]: {
      borderRadius: 999,
      backgroundColor: theme.colors.elevation.level3,
      padding: 2,
    },
    [`middle${variants[3]}`]: {
      borderRadius: 999,
      padding: 1,
      backgroundColor: theme.colors.elevation.level3,
    },
    [`inner${variants[3]}`]: {
      borderRadius: 999,
      backgroundColor: theme.colors.elevation.level3,
      padding: 2,
    },
  });
