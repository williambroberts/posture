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
      color: theme.colors.primary,
    },
    [`outer${variants[1]}`]: {
      borderRadius: 999,
      overflow: "hidden",
      backgroundColor: theme.colors.primary,
      padding: 2,
    },
    [`middle${variants[1]}`]: {
      borderRadius: 999,
      padding: 1,
      overflow: "hidden",
      backgroundColor: theme.colors.primaryContainer,
    },
    [`inner${variants[1]}`]: {
      borderRadius: 999,
      overflow: "hidden",
      backgroundColor: theme.colors.surface,
      padding: 2,
    },
    [`icon${variants[2]}`]: {
      color: theme.colors.tertiary,
    },
    [`outer${variants[2]}`]: {
      borderRadius: 999,
      backgroundColor: theme.colors.tertiary,
      padding: 2,
    },
    [`middle${variants[2]}`]: {
      borderRadius: 999,
      padding: 1,
      backgroundColor: theme.colors.tertiaryContainer,
    },
    [`inner${variants[2]}`]: {
      borderRadius: 999,
      backgroundColor: theme.colors.surface,
      padding: 2,
    },
    [`icon${variants[3]}`]: {
      color: theme.colors.secondary,
    },
    [`outer${variants[3]}`]: {
      borderRadius: 999,
      backgroundColor: theme.colors.secondary,
      padding: 2,
    },
    [`middle${variants[3]}`]: {
      borderRadius: 999,
      padding: 1,
      backgroundColor: theme.colors.secondaryContainer,
    },
    [`inner${variants[3]}`]: {
      borderRadius: 999,
      backgroundColor: theme.colors.surface,
      padding: 2,
    },
  });
