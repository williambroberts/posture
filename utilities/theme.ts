import { useMemo } from "react";
import { MD3Theme, useTheme } from "react-native-paper";

//region theme
type StylesCallback<R> = (theme: MD3Theme) => R;

export const useThemedStyles = <R>(callback: StylesCallback<R>) => {
  const theme = useTheme();
  console.log(theme.colors);
  return useMemo(() => callback(theme), [theme, callback]);
};

/**
 * Combines a color with an opacity value to return an RGBA color string
 * @param {string} color - The input color (hex, rgb, rgba, or named color)
 * @param {number} opacity - The opacity value (0-1)
 * @returns {string} RGBA color string
 */
export const computeColorWithOpacity = (color: string, opacity: number) => {
  // Clamp opacity between 0 and 1
  const alpha = Math.max(0, Math.min(1, opacity));

  // Handle hex colors
  if (color.startsWith("#")) {
    const hex = color.replace("#", "");
    let r, g, b;

    if (hex.length === 3) {
      // Short hex format (#RGB)
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      // Full hex format (#RRGGBB)
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else if (hex.length === 8) {
      // Hex with alpha (#RRGGBBAA)
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
      // Ignore existing alpha
    }

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Handle rgb/rgba colors
  if (color.startsWith("rgb")) {
    const match = color.match(/\d+\.?\d*/g);
    if (match && match.length >= 3) {
      const [r, g, b] = match;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }

  // For named colors or other formats, return as-is with opacity
  // (React Native handles most named colors)
  return `rgba(${color}, ${alpha})`;
};

// Usage examples:
// colorWithOpacity('#FF5733', 0.5) // 'rgba(255, 87, 51, 0.5)'
// colorWithOpacity('#F53', 0.8) // 'rgba(255, 85, 51, 0.8)'
// colorWithOpacity('rgb(255, 87, 51)', 0.3) // 'rgba(255, 87, 51, 0.3)'
// colorWithOpacity('rgba(255, 87, 51, 0.9)', 0.5) // 'rgba(255, 87, 51, 0.5)'

// let t = {
//   backdrop: "rgba(50, 47, 55, 0.4)",
//   background: "rgba(28, 27, 31, 1)",
//   elevation: {
//     level0: "transparent",
//     level1: "rgb(37, 35, 42)",
//     level2: "rgb(44, 40, 49)",
//     level3: "rgb(49, 44, 56)",
//     level4: "rgb(51, 46, 58)",
//     level5: "rgb(52, 49, 63)",
//   },
//   error: "rgba(242, 184, 181, 1)",
//   errorContainer: "rgba(140, 29, 24, 1)",
//   inverseOnSurface: "rgba(49, 48, 51, 1)",
//   inversePrimary: "rgba(103, 80, 164, 1)",
//   inverseSurface: "rgba(230, 225, 229, 1)",
//   onBackground: "rgba(230, 225, 229, 1)",
//   onError: "rgba(96, 20, 16, 1)",
//   onErrorContainer: "rgba(242, 184, 181, 1)",
//   onPrimary: "rgba(56, 30, 114, 1)",
//   onPrimaryContainer: "rgba(234, 221, 255, 1)",
//   onSecondary: "rgba(51, 45, 65, 1)",
//   onSecondaryContainer: "rgba(232, 222, 248, 1)",
//   onSurface: "rgba(230, 225, 229, 1)",
//   onSurfaceDisabled: "rgba(230, 225, 229, 0.38)",
//   onSurfaceVariant: "rgba(202, 196, 208, 1)",
//   onTertiary: "rgba(73, 37, 50, 1)",
//   onTertiaryContainer: "rgba(255, 216, 228, 1)",
//   outline: "rgba(147, 143, 153, 1)",
//   outlineVariant: "rgba(73, 69, 79, 1)",
//   primary: "rgba(208, 188, 255, 1)",
//   primaryContainer: "rgba(79, 55, 139, 1)",
//   scrim: "rgba(0, 0, 0, 1)",
//   secondary: "rgba(204, 194, 220, 1)",
//   secondaryContainer: "rgba(74, 68, 88, 1)",
//   shadow: "rgba(0, 0, 0, 1)",
//   surface: "rgba(28, 27, 31, 1)",
//   surfaceDisabled: "rgba(230, 225, 229, 0.12)",
//   surfaceVariant: "rgba(73, 69, 79, 1)",
//   tertiary: "rgba(239, 184, 200, 1)",
//   tertiaryContainer: "rgba(99, 59, 72, 1)",
// };
