import { useMemo } from "react";
import { useColorScheme } from "react-native";
import {
  MD3Theme,
  useTheme,
  MD3LightTheme,
  MD3DarkTheme,
} from "react-native-paper";
import { MD3Colors } from "react-native-paper/lib/typescript/types";

//region theme
type StylesCallback<R> = (theme: MD3Theme) => R;

export const useThemedStyles = <R>(callback: StylesCallback<R>) => {
  const theme = useTheme();
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
type RGBAColor = { r: number; g: number; b: number; a: number };
export const addColors = (
  color1: RGBAColor,
  color2: RGBAColor,
  clamp = true
) => {
  const result = {
    r: Math.round((color1.r + color2.r) * 0.5),
    g: Math.round((color1.g + color2.g) * 0.5),
    b: Math.round((color1.b + color2.b) * 0.5),
    a: Math.round((color1.a + color2.a) * 0.5),
  };

  if (clamp) {
    result.r = Math.min(255, Math.max(0, result.r));
    result.g = Math.min(255, Math.max(0, result.g));
    result.b = Math.min(255, Math.max(0, result.b));
    result.a = color1.a !== 1 ? color1.a : Math.min(1, Math.max(0, result.a));
  }

  return result;
};
export function parseColorString(colorString: string) {
  // Remove whitespace and convert to lowercase
  const cleaned = colorString.trim().toLowerCase();

  // Check if it's rgba or rgb
  const isRgba = cleaned.startsWith("rgba");
  const regex = isRgba
    ? /rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/
    : /rgba?\((\d+),\s*(\d+),\s*(\d+)\)/;

  const match = cleaned.match(regex);

  if (!match) {
    throw new Error(`Invalid color string: ${colorString}`);
  }

  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10),
    a: isRgba ? parseFloat(match[4]) : 1,
  };
}
export const computeStringColorFromObject = (obj: RGBAColor) => {
  return `rgba(${obj.r},${obj.g},${obj.b},${obj.a})`;
};
export const computeMixedColor = (
  first: string,
  second: string,
  mixCount: number = 1
) => {
  let count: number = 0;
  let out: string = first;
  const computeOut = (color: string, toMix: string) => {
    const [firstObj, secondObj] = [
      parseColorString(color),
      parseColorString(toMix),
    ];
    const out = computeStringColorFromObject(addColors(firstObj, secondObj));
    return out;
  };

  while (count < mixCount) {
    //mix the second color mixCount times with first
    out = computeOut(out, second);
    count++;
  }
  console.log(out);
  return out;
};
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
//region light theme
export const lightTheme: MD3Colors = {
  primary: "rgb(95, 98, 0)",
  onPrimary: "rgb(255, 255, 255)",
  primaryContainer: "rgb(229, 234, 93)",
  onPrimaryContainer: "rgb(28, 29, 0)",
  secondary: "rgb(185, 12, 85)",
  onSecondary: "rgb(255, 255, 255)",
  secondaryContainer: "rgb(255, 217, 223)",
  onSecondaryContainer: "rgb(63, 0, 24)",
  tertiary: "rgb(150, 73, 0)",
  onTertiary: "rgb(255, 255, 255)",
  tertiaryContainer: "rgb(255, 220, 198)",
  onTertiaryContainer: "rgb(49, 19, 0)",
  error: "rgb(186, 26, 26)",
  onError: "rgb(255, 255, 255)",
  errorContainer: "rgb(255, 218, 214)",
  onErrorContainer: "rgb(65, 0, 2)",
  background: "rgb(255, 251, 255)",
  onBackground: "rgb(28, 28, 23)",
  surface: "rgb(255, 251, 255)",
  onSurface: "rgb(28, 28, 23)",
  surfaceVariant: "rgb(229, 227, 209)",
  onSurfaceVariant: "rgb(72, 71, 59)",
  outline: "rgb(121, 120, 105)",
  outlineVariant: "rgb(201, 199, 182)",
  shadow: "rgb(0, 0, 0)",
  scrim: "rgb(0, 0, 0)",
  inverseSurface: "rgb(49, 49, 43)",
  inverseOnSurface: "rgb(244, 240, 232)",
  inversePrimary: "rgb(200, 206, 68)",
  elevation: {
    level0: "transparent",
    level1: "rgb(247, 243, 242)",
    level2: "rgb(242, 239, 235)",
    level3: "rgb(237, 234, 227)",
    level4: "rgb(236, 233, 224)",
    level5: "rgb(233, 230, 219)",
  },
  surfaceDisabled: "rgba(28, 28, 23, 0.12)",
  onSurfaceDisabled: "rgba(28, 28, 23, 0.38)",
  backdrop: "rgba(49, 49, 37, 0.4)",
};
//region dark theme
export const darkTheme: MD3Colors = {
  primary: "rgb(200, 206, 68)",
  onPrimary: "rgb(49, 51, 0)",
  primaryContainer: "rgb(71, 74, 0)",
  onPrimaryContainer: "rgb(229, 234, 93)",
  secondary: "rgb(255, 177, 194)",
  onSecondary: "rgb(102, 0, 43)",
  secondaryContainer: "rgb(143, 0, 63)",
  onSecondaryContainer: "rgb(255, 217, 223)",
  tertiary: "rgb(255, 183, 134)",
  onTertiary: "rgb(80, 36, 0)",
  tertiaryContainer: "rgb(114, 54, 0)",
  onTertiaryContainer: "rgb(255, 220, 198)",
  error: "rgb(255, 180, 171)",
  onError: "rgb(105, 0, 5)",
  errorContainer: "rgb(147, 0, 10)",
  onErrorContainer: "rgb(255, 180, 171)",
  background: "rgb(28, 28, 23)",
  onBackground: "rgb(229, 226, 218)",
  surface: "rgb(28, 28, 23)",
  onSurface: "rgb(229, 226, 218)",
  surfaceVariant: "rgb(72, 71, 59)",
  onSurfaceVariant: "rgb(201, 199, 182)",
  outline: "rgb(147, 145, 130)",
  outlineVariant: "rgb(72, 71, 59)",
  shadow: "rgb(0, 0, 0)",
  scrim: "rgb(0, 0, 0)",
  inverseSurface: "rgb(229, 226, 218)",
  inverseOnSurface: "rgb(49, 49, 43)",
  inversePrimary: "rgb(95, 98, 0)",
  elevation: {
    level0: "transparent",
    level1: "rgb(37, 37, 25)",
    level2: "rgb(42, 42, 27)",
    level3: "rgb(47, 48, 28)",
    level4: "rgb(49, 49, 28)",
    level5: "rgb(52, 53, 29)",
  },
  surfaceDisabled: "rgba(229, 226, 218, 0.12)",
  onSurfaceDisabled: "rgba(229, 226, 218, 0.38)",
  backdrop: "rgba(49, 49, 37, 0.4)",
};
export const COLOR = "rgb(135, 115, 94)";
export const COLOR_2 = "rgba(255, 183, 0, 1)";
export const COLOR_3 = "rgba(255, 248, 123, 1)";
export const useCustomTheme = () => {
  const colorScheme = useColorScheme();
  //https://oss.callstack.com/react-native-paper/docs/guides/theming
  return colorScheme === "dark"
    ? ({
        ...MD3DarkTheme,
        colors: darkTheme,
      } as const satisfies MD3Theme)
    : ({
        ...MD3LightTheme,
        colors: lightTheme,
      } as const satisfies MD3Theme);
};
