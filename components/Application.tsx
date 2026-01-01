import React, { useEffect, useRef, useState } from "react";
import { Alert, AppState, StyleSheet, TextStyle, View } from "react-native";
// import { gyroscope, SensorData } from "react-native-sensors";
import BackgroundService, {
  BackgroundTaskOptions,
} from "react-native-background-actions";
// import { NativeModules, DeviceEventEmitter } from 'react-native';
// import MyModule from '../modules/my-module';
import myModule from "../modules/my-module";
import { SensorEvent } from "@/modules/my-module/src/MyModule";
import { Icon, MD3Theme, Text } from "react-native-paper";
import { CustomButton } from "./CustomButton";
import {
  COLOR,
  COLOR_2,
  COLOR_3,
  computeColorWithOpacity,
  computeMixedColor,
  useThemedStyles,
} from "@/utilities/theme";
import * as SQLite from "expo-sqlite";
import { EventEmitter } from "expo-modules-core";
import { CircleIcon } from "./CircleIcon";
import { Chart } from "./Chart";
import { Image, ImageBackground } from "expo-image";
import { VariantProp } from "react-native-paper/lib/typescript/components/Typography/types";

//region component
export const Application = () => {
  const [options, setOptions] = useState<ExtendedOptions>(defaultOptions);
  const [debug, setDebug] = useState<any>();
  const [showLogs, setShowLogs] = useState<boolean>(false);
  const [isPositionOK, setIsPositionOk] = useState<boolean>(false);
  const [isBackgroundRunning, setIsBackgroundRunning] =
    useState<boolean>(false);
  const isBackgroundRunningRef = useRef<boolean>(false);
  const styles = useThemedStyles(stylesCallback);
  useEffect(() => {
    (async () => {
      const db = await SQLite.openDatabaseAsync("databaseName");
      await db.execAsync(`
      CREATE TABLE IF NOT EXISTS event_log (
        id INTEGER PRIMARY KEY NOT NULL, 
        value TEXT NOT NULL, 
        createdAt TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS event_history (
          id INTEGER PRIMARY KEY NOT NULL, 
          createdAt TEXT NOT NULL DEFAULT (datetime('now')),
          type TEXT NOT NULL,
          alerted INTEGER NOT NULL,
          corrected INTEGER NOT NULL
        );
      `);
      const allRows = await db.getAllAsync<EVENT_LOG_VALUES>(
        "SELECT * FROM event_log"
      );
      const errors = allRows.filter(
        (r) =>
          r.value === EVENT_LOG_VALUES[2] || r.value === EVENT_LOG_VALUES[3]
      );
      if (errors.length > 0) {
        setDebug(errors);
      } else {
        const type = options.parameters.values.name;
        const alerted = allRows.filter(
          (r) => r.value === EVENT_LOG_VALUES[1]
        ).length;
        const corrected = allRows.filter(
          (r) => r.value === EVENT_LOG_VALUES[4]
        ).length;
        if (alerted > 0 || corrected > 0) {
          await db.runAsync(
            "INSERT INTO event_history (type, alerted, corrected) VALUES (?, ?, ?)",
            type,
            alerted,
            corrected
          );
        }
        setDebug({
          type,
          alerted,
          corrected,
        });
      }
      await db.runAsync("DELETE FROM event_log");
      await db.closeAsync();
    })();
    // setDebug(isBackgroundRunning)
  }, [isBackgroundRunning]);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (event) => {
      if (event === "active") {
        console.log("stopping");
        (async () => {
          await BackgroundService.stop();
          myModule.removeAllListeners("onLinearMovementDetected");
          myModule.removeAllListeners("onOrientationChange");
          await Promise.all([
            myModule.stopLinearMovementDetection(),
            myModule.stopOrientation(),
          ]);
        })().finally(() => {
          setIsPositionOk(false);
          setIsBackgroundRunning(false);
          isBackgroundRunningRef.current = false;
        });
      } else if (event === "background") {
        console.log("backgrounding");
        if (!isBackgroundRunningRef.current) {
          return;
        }
        // launch background task from here
        console.log("Starting...", isBackgroundRunningRef.current);

        (async () => {
          const db = await SQLite.openDatabaseAsync("databaseName");
          await db.runAsync(
            "INSERT INTO event_log (value) VALUES (?)",
            options.parameters.values.name
          );
          await db.closeAsync();
          await BackgroundService.start(veryIntensiveTask3, options);
        })();

        //todow nice animation e.g success
      }
    });
    return () => {
      sub.remove();
    };
  }, []);

  useEffect(() => {
    let count = 0;
    if (isBackgroundRunning) return;
    setIsPositionOk(false);
    if (!myModule.isOrientationAvailable()) {
      return;
    }
    myModule.startOrientation();
    const handleOrientationChange = (e: SensorEvent) => {
      const badAngle = isBadAngle(e, options.parameters);
      if (badAngle) {
        count = count - 10;
        count = Math.max(count, 0);
      } else {
        count++;
      }
      if (count >= ANGLE_LIMIT * 0.5) {
        //100 seems ok.
        setIsPositionOk(true);
      }
      if (count === 0) {
        setIsPositionOk(false);
      }
    };
    myModule.addListener("onOrientationChange", handleOrientationChange);
    return () => {
      myModule.removeAllListeners("onOrientationChange");
      myModule.stopOrientation();
      setIsPositionOk(false);
    };
  }, [options, isBackgroundRunning]);

  if (showLogs) {
    return (
      <View style={styles.container}>
        <SQLite.SQLiteProvider databaseName="databaseName">
          <CustomButton disabled={false} onPress={() => setShowLogs(false)}>
            <View style={styles.buttonChildContainer}>
              <Icon
                size={ICON_SIZE}
                source={"keyboard-backspace"}
                color={styles.onBackground.color}
              />
              <Text variant="bodySmall" style={[styles.onBackground]}>
                Back
              </Text>
            </View>
          </CustomButton>
          <Chart injectedStyles={styles} />
        </SQLite.SQLiteProvider>
      </View>
    );
  }

  return (
    // <ImageBackground
    //   style={styles.imageBackground}
    //   contentFit="cover"
    //   placeholder={"L28qfp~TIb4@kGbJ9caPoiogxoD-"}
    //   source={require("../assets/images/rock.jpg")}
    // >
    <View style={styles.container}>
      <View style={styles.card}>
        {/* <Divider style={styles.divider} /> */}
        {/* <Image
          source={require("../assets/images/splash-icon.png")}
          style={styles.logo}
        /> */}
        <View style={[styles.textWarning, styles.borderDashed]}>
          <Text variant="titleMedium" style={[styles.title]}>
            {computeStyledText("P", styles.text.color)}
            {computeStyledText("O", styles.text.color)}
            {computeStyledText("S", styles.text.color)}
            {computeStyledText("T", styles.text.color)}
            {computeStyledText("U", styles.text.color)}
            {computeStyledText("R", styles.text.color)}
            {computeStyledText("E", styles.text.color)}{" "}
            {computeStyledText("K", styles.text.color)}
            {computeStyledText("E", styles.text.color)}
            {computeStyledText("E", styles.text.color)}
            {computeStyledText("P", styles.text.color)}
          </Text>
          {/* <Divider style={styles.divider} /> */}
          <View style={styles.textContainer}>
            <StyledText
              text={"Tracking"}
              variant="titleSmall"
              style={{ textAlign: "center", ...styles.textHighlight }}
            />
            <Text variant="titleSmall"> & </Text>
            <StyledText
              text={"Monitoring"}
              variant="titleSmall"
              style={{ textAlign: "center", ...styles.textHighlight }}
            />
          </View>
        </View>
        {!isBackgroundRunning && (
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <CircleIcon iconName={"cellphone"} variant={"selected"} />
            <View style={styles.textContainer}>
              <StyledText
                text={"Monitor Your "}
                variant="titleSmall"
                style={{ textAlign: "center", ...styles.text }}
              />
              <StyledText
                text={"Posture"}
                variant="titleSmall"
                style={{ textAlign: "center", ...styles.textHighlight }}
              />
            </View>
            <View style={styles.textContainer}>
              <StyledText
                variant="bodySmall"
                text={"Select"}
                style={{
                  ...styles.textHighlight,
                  textAlign: "center",
                }}
              />
              <StyledText
                variant="bodySmall"
                text={" a sensitivity level and "}
                style={{
                  ...styles.text,
                  textAlign: "center",
                }}
              />
              <StyledText
                variant="bodySmall"
                text={"hold"}
                style={{
                  ...styles.textHighlight,
                  textAlign: "center",
                }}
              />
              <StyledText
                variant="bodySmall"
                text={" your phone upright at eye level to begin"}
                style={{
                  ...styles.text,
                  textAlign: "center",
                }}
              />
            </View>
          </View>
        )}
        <Icon
          size={ICON_SIZE}
          source={"arrow-down-thin"}
          color={styles.onBackground.color}
        />
        {!isBackgroundRunning && (
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <CircleIcon iconName={"numeric-1-circle"} variant={"selected"} />
            <View style={styles.textContainer}>
              <StyledText
                variant="titleSmall"
                text={"Choose your "}
                style={{
                  ...styles.text,
                  textAlign: "center",
                }}
              />
              <StyledText
                variant="titleSmall"
                text={"sensitivity"}
                style={{
                  ...styles.textHighlight,
                  textAlign: "center",
                }}
              />
            </View>
            <Text
              variant="bodySmall"
              style={[styles.text, { textAlign: "center" }]}
            >
              Choose the setting right for you.
            </Text>
          </View>
        )}
        <CustomButton
          containerStyle={[
            options.parameters.values.name === angleValuesMap["veryLight"].name
              ? styles.selectedButton
              : {},
          ]}
          disabled={isBackgroundRunning}
          onPress={() => {
            myModule.selectionAsync();
            setOptions({
              ...defaultOptions,
              parameters: {
                ...defaultConfig,
                values: angleValuesMap["veryLight"],
              },
            });
          }}
        >
          <View style={styles.buttonChildContainer}>
            <Icon
              size={ICON_SIZE}
              color={
                options.parameters.values.name ===
                angleValuesMap["veryLight"].name
                  ? styles.selectedButtonText.color
                  : isBackgroundRunning
                  ? styles.textDisabled.color
                  : styles.text.color
              }
              source={"tally-mark-1"}
            />
            <Text
              variant="bodySmall"
              style={[
                styles.text,
                options.parameters.values.name ===
                angleValuesMap["veryLight"].name
                  ? styles.selectedButtonText
                  : isBackgroundRunning
                  ? styles.textDisabled
                  : {},
              ]}
            >
              {angleValuesMap["veryLight"].name}
            </Text>
            {options.parameters.values.name ===
              angleValuesMap["veryLight"].name && (
              <Icon
                size={ICON_SIZE}
                color={styles.selectedButtonText.color}
                source={"check"}
              />
            )}
          </View>
        </CustomButton>
        <CustomButton
          containerStyle={[
            options.parameters.values.name === angleValuesMap["light"].name
              ? styles.selectedButton
              : {},
          ]}
          disabled={isBackgroundRunning}
          onPress={() => {
            myModule.selectionAsync();
            setOptions({
              ...defaultOptions,
              parameters: {
                ...defaultConfig,
                values: angleValuesMap["light"],
              },
            });
          }}
        >
          <View style={styles.buttonChildContainer}>
            <Icon
              size={ICON_SIZE}
              color={
                options.parameters.values.name === angleValuesMap["light"].name
                  ? styles.selectedButtonText.color
                  : isBackgroundRunning
                  ? styles.textDisabled.color
                  : styles.text.color
              }
              source={"tally-mark-2"}
            />
            <Text
              variant="bodySmall"
              style={[
                styles.text,
                options.parameters.values.name === angleValuesMap["light"].name
                  ? styles.selectedButtonText
                  : isBackgroundRunning
                  ? styles.textDisabled
                  : {},
              ]}
            >
              {angleValuesMap["light"].name}
            </Text>
            {options.parameters.values.name ===
              angleValuesMap["light"].name && (
              <Icon
                size={ICON_SIZE}
                color={styles.selectedButtonText.color}
                source={"check"}
              />
            )}
          </View>
        </CustomButton>
        <CustomButton
          containerStyle={[
            options.parameters.values.name === angleValuesMap["normal"].name
              ? styles.selectedButton
              : {},
          ]}
          disabled={isBackgroundRunning}
          onPress={() => {
            myModule.selectionAsync();
            setOptions({
              ...defaultOptions,
              parameters: {
                ...defaultConfig,
                values: angleValuesMap["normal"],
              },
            });
          }}
        >
          <View style={styles.buttonChildContainer}>
            <Icon
              size={ICON_SIZE}
              color={
                options.parameters.values.name === angleValuesMap["normal"].name
                  ? styles.selectedButtonText.color
                  : isBackgroundRunning
                  ? styles.textDisabled.color
                  : styles.text.color
              }
              source={"tally-mark-3"}
            />
            <Text
              variant="bodySmall"
              style={[
                styles.text,
                options.parameters.values.name === angleValuesMap["normal"].name
                  ? styles.selectedButtonText
                  : isBackgroundRunning
                  ? styles.textDisabled
                  : {},
              ]}
            >
              {angleValuesMap["normal"].name}
            </Text>
            {options.parameters.values.name ===
              angleValuesMap["normal"].name && (
              <Icon
                size={ICON_SIZE}
                color={styles.selectedButtonText.color}
                source={"check"}
              />
            )}
          </View>
        </CustomButton>
        <CustomButton
          containerStyle={[
            options.parameters.values.name === angleValuesMap["strict"].name
              ? styles.selectedButton
              : {},
          ]}
          disabled={isBackgroundRunning}
          onPress={() => {
            myModule.selectionAsync();
            setOptions({
              ...defaultOptions,
              parameters: {
                ...defaultConfig,
                values: angleValuesMap["strict"],
              },
            });
          }}
        >
          <View style={styles.buttonChildContainer}>
            <Icon
              size={ICON_SIZE}
              color={
                options.parameters.values.name === angleValuesMap["strict"].name
                  ? styles.selectedButtonText.color
                  : isBackgroundRunning
                  ? styles.textDisabled.color
                  : styles.text.color
              }
              source={"tally-mark-4"}
            />
            <Text
              variant="bodySmall"
              style={[
                styles.text,
                options.parameters.values.name === angleValuesMap["strict"].name
                  ? styles.selectedButtonText
                  : isBackgroundRunning
                  ? styles.textDisabled
                  : {},
              ]}
            >
              {angleValuesMap["strict"].name}
            </Text>
            {options.parameters.values.name ===
              angleValuesMap["strict"].name && (
              <Icon
                size={ICON_SIZE}
                color={styles.selectedButtonText.color}
                source={"check"}
              />
            )}
          </View>
        </CustomButton>
        {isBackgroundRunning && (
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <CircleIcon iconName="chevron-right" variant="disabled" />
              <Icon
                size={ICON_SIZE}
                source={"arrow-right-thin"}
                color={styles.onBackground.color}
              />
              <CircleIcon iconName="chevron-double-right" variant="disabled" />
              <Icon
                size={ICON_SIZE}
                source={"arrow-right-thin"}
                color={styles.onBackground.color}
              />
              <CircleIcon iconName="chevron-triple-right" variant="selected" />
            </View>
            <Text variant="bodySmall">
              Using device{" "}
              {computeStyledText("sensors", styles.textHighlight.color)} for
              posture detection
            </Text>
          </View>
        )}

        {!isBackgroundRunning && (
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Icon
              size={ICON_SIZE}
              source={"arrow-down-thin"}
              color={
                isPositionOK && options.parameters.values.name !== "Init"
                  ? styles.onBackground.color
                  : styles.textDisabled.color
              }
            />
            <CircleIcon
              iconName={isPositionOK ? "graph-outline" : "numeric-2-circle"}
              variant={
                options.parameters.values.name !== "Init"
                  ? "selected"
                  : "disabled"
              }
            />
            <Text
              variant="titleSmall"
              style={
                options.parameters.values.name === "Init"
                  ? styles.textDisabled
                  : styles.onBackground
              }
            >
              {isPositionOK ? "Start Measuring" : "Put your phone upright"}
            </Text>
            <Text
              variant="bodySmall"
              style={
                options.parameters.values.name == "Init"
                  ? styles.textDisabled
                  : styles.onBackground
              }
            >
              {isPositionOK
                ? "You are ready, let's start measuring."
                : "Then we can monitor & measure your posture"}
            </Text>
          </View>
        )}

        {!isBackgroundRunning && (
          <CustomButton
            variant="highlight"
            disabled={
              isBackgroundRunning ||
              !isPositionOK ||
              options.parameters.values.name === "Init"
            }
            onPress={async () => {
              if (BackgroundService.isRunning()) {
                return;
              }
              if (
                !myModule.isOrientationAvailable() ||
                !myModule.isLinearMovementDetectionAvailable()
              ) {
                Alert.alert(
                  "Sensor Malfunction",
                  "Movement detection is unavailable at this time."
                );
                return;
              }
              myModule.warningAsync();
              setIsBackgroundRunning(true);
              isBackgroundRunningRef.current = true;
            }}
          >
            <View style={styles.buttonChildContainer}>
              <Icon
                size={ICON_SIZE}
                source={"cursor-default-click-outline"}
                color={
                  isPositionOK && options.parameters.values.name !== "Init"
                    ? styles.textOnHighlight.color
                    : styles.textDisabled.color
                }
              />
              <Text
                variant="bodySmall"
                style={[
                  !isPositionOK || options.parameters.values.name === "Init"
                    ? styles.textDisabled
                    : styles.textOnHighlight,
                ]}
              >
                {options.parameters.values.name === "Init"
                  ? "Select a difficulty"
                  : isPositionOK
                  ? `Start in ${options.parameters.values.name} mode`
                  : "Put your phone upright"}
              </Text>
            </View>
          </CustomButton>
        )}
        {/* <Divider style={[styles.divider, { marginTop: 8 }]} /> */}
        {isBackgroundRunning && (
          <>
            <Text variant="bodyMedium" style={[styles.textWarning]}>
              Now switch to a{" "}
              {computeStyledText("different", styles.textHighlight.color)} app
              and we will{" "}
              {computeStyledText("track", styles.textHighlight.color)} your
              phone position and angle.
              {/* todow icons */}
            </Text>
            <Text variant="bodyMedium" style={[styles.textWarning]}>
              When the phone vibrates,{" "}
              {computeStyledText("adjust", styles.textHighlight.color)} your
              phone to a better position!
              {/* todow icons */}
            </Text>
            <Text variant="bodySmall" style={[styles.textWarning]}>
              Please set{" "}
              {computeStyledText(
                "Allow background activity",
                styles.textHighlight.color
              )}{" "}
              on for this App in your device's{" "}
              {computeStyledText(
                "App battery management settings",
                styles.textHighlight.color
              )}
              , to allow us to freely track your phone's position, using the
              device sensors.
              {/* todow text & icons*/}
            </Text>
          </>
        )}
        {isBackgroundRunning && (
          <CustomButton
            variant="highlight"
            disabled={!isBackgroundRunning}
            onPress={() => {
              myModule.warningAsync();
              BackgroundService.stop().finally(async () => {
                myModule.removeAllListeners("onLinearMovementDetected");
                myModule.removeAllListeners("onOrientationChange");
                await Promise.all([
                  myModule.stopLinearMovementDetection(),
                  myModule.stopOrientation(),
                ]);
                setIsBackgroundRunning(false);
                isBackgroundRunningRef.current = false;
              });
            }}
          >
            <View style={styles.buttonChildContainer}>
              <Icon
                size={ICON_SIZE}
                color={
                  !isBackgroundRunning
                    ? styles.textDisabled.color
                    : styles.textOnHighlight.color
                }
                source={"stop"}
              />
              <Text
                variant="bodySmall"
                style={[
                  !isBackgroundRunning
                    ? styles.textDisabled
                    : styles.textOnHighlight,
                ]}
              >
                Stop
              </Text>
            </View>
          </CustomButton>
        )}
        {/* <Divider style={[styles.divider, { marginTop: 8 }]} /> */}
        {/* {!isBackgroundRunning && (
        <CustomButton disabled={false} onPress={() => setShowLogs(true)}>
          <View style={styles.buttonChildContainer}>
            <Icon
              size={ICON_SIZE}
              source={"chart-bar-stacked"}
              color={styles.onBackground.color}
            />
            <Text variant="bodySmall" style={[styles.onBackground]}>
              View Statistics
            </Text>
          </View>
        </CustomButton>
      )} */}
        {/* <Text>DEBUG:{JSON.stringify(debug, null, 2)}</Text> */}
      </View>
    </View>
    // </ImageBackground>
  );
};
//region styles
export const ICON_SIZE = 16;
export const GLOBAL_PADDING_HORIZONTAL = 20;
export const GLOBAL_PADDING_VERTICAL = 20;
type BadgeProps = {
  text: string;
  variant: VariantProp<never>;
  style: TextStyle;
};
export const StyledText = (props: BadgeProps) => {
  return (
    <Text variant={props.variant} style={props.style}>
      {props.text}
    </Text>
  );
};
export const computeStyledText = (
  text: string,
  color: string,
  variant: VariantProp<never>
) => (
  <Text variant={variant} style={{ color, textAlign: "center" }}>
    {text}
  </Text>
);
const stylesCallback = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      // backgroundColor: theme.colors.elevation.level5,
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: GLOBAL_PADDING_VERTICAL * 0.5,
      paddingHorizontal: GLOBAL_PADDING_HORIZONTAL * 0.5,
    },
    card: {
      borderColor: theme.colors.outline,
      paddingVertical: GLOBAL_PADDING_VERTICAL * 0.5,
      paddingHorizontal: GLOBAL_PADDING_HORIZONTAL * 0.5,
      borderWidth: 1,
      width: "100%",
      flex: 1,
      overflow: "hidden",
      borderStyle: "dashed",
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: computeColorWithOpacity(theme.colors.background, 1),
    },
    borderDashed: {
      borderStyle: "dashed",
      borderWidth: 1,
      borderColor: computeMixedColor(theme.colors.outline, COLOR),
    },
    imageBackground: {
      flex: 1,
      width: "100%",
    },
    logo: {
      height: ICON_SIZE * 2,
      aspectRatio: 1,
      borderColor: computeMixedColor(theme.colors.onSurfaceDisabled, COLOR),
      borderWidth: 2,
      borderRadius: 999,
      outlineWidth: 2,
      outlineOffset: 1,
      outlineColor: computeMixedColor(theme.colors.backdrop, COLOR),
    },
    divider: {
      backgroundColor: computeMixedColor(theme.colors.onBackground, COLOR),
      width: "100%",
    },
    title: {
      textDecorationLine: "underline",
      alignSelf: "center",
      color: computeMixedColor(theme.colors.onBackground, COLOR),
    },
    selectedButton: {
      backgroundColor: computeMixedColor(theme.colors.inverseSurface, COLOR),
    },
    selectedButtonText: {
      color: computeMixedColor(theme.colors.inverseOnSurface, COLOR),
    },
    text: {
      color: computeMixedColor(theme.colors.onBackground, COLOR),
    },
    textDisabled: {
      color: computeMixedColor(theme.colors.onSurfaceDisabled, COLOR),
    },
    onBackground: {
      color: computeMixedColor(theme.colors.onBackground, COLOR),
    },
    buttonChildContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      flex: 1,
    },
    textWarning: {
      padding: 8,
      borderRadius: 8,
      marginVertical: 4,
      color: computeMixedColor(theme.colors.onBackground, COLOR, 1),
      backgroundColor: computeMixedColor(theme.colors.background, COLOR, 1),
    },
    textHighlight: {
      borderRadius: 999,
      // backgroundColor: computeMixedColor(theme.colors.background, COLOR_3, 1),
      backgroundColor: COLOR_2,
      color: theme.colors.shadow,
      borderColor: computeMixedColor(theme.colors.onBackground, COLOR_2),
      borderWidth: 1,
      paddingHorizontal: 4,
      // color: computeMixedColor(theme.colors.onBackground, COLOR_3, 1),
    },
    textOnHighlight: {
      color: theme.colors.shadow,
    },
    textContainer: {
      flexDirection: "row",
      // gap: 1,
      flexWrap: "wrap",
      justifyContent: "center",
    },
  });
export type ApplicationStyles = ReturnType<typeof stylesCallback>;
//region background task
type BackgroundTaskParams = {
  delay: number; // power saving var
  values: (typeof angleValuesMap)[keyof typeof angleValuesMap];
  strictness: number; // max strikes at bad angle -> vibrate
};
const EVENT_LOG_VALUES = {
  0: "LOGGED",
  1: "ALERTED",
  2: "ERROR_NO_TASK_DATA_INJECTED",
  3: "ERROR_NO_ANGLE_INSERTED_TO_DB",
  4: "CORRECTED",
} as const;
const angleValuesMap = {
  init: { y: 0, z: 9.81, angle: 0, name: "Init" as const }, //not selectable,alternative to nullable options
  veryLight: { y: 2.54, z: 9.47, angle: 15, name: "Gentle" as const },
  light: { y: 4.9, z: 8.5, angle: 30, name: "Light" as const },
  normal: { y: 6.94, z: 6.94, angle: 45, name: "Normal" as const },
  strict: { y: 8.5, z: 4.9, angle: 60, name: "Strict" as const },
} satisfies {
  [key: string]: { y: number; z: number; angle: number; name: string };
};
export type ANGLE_NAMES =
  (typeof angleValuesMap)[keyof typeof angleValuesMap]["name"];
const defaultConfig = {
  delay: 5000 as const,
  values: angleValuesMap["init"],
  strictness: 1,
} satisfies BackgroundTaskParams;
type RefType<T> = { current: T };
type OrientationRef = RefType<{ y: number; count: number } | null>;
type NullableNumberRef = RefType<number | null>;
type BadAngleRef = RefType<{
  isBadAngle: boolean;
  count: number;
  eventCount: number;
}>;
const veryIntensiveTask2 = async (taskData?: BackgroundTaskParams) => {
  const config = taskData ?? defaultConfig;
  const { delay, values, strictness } = config;
  const badAngleRef: BadAngleRef = {
    current: { isBadAngle: false, count: 0, eventCount: 0 },
  };
  const orientationRef: OrientationRef = { current: { count: 0, y: 0 } };
  const runLockRef: RefType<RunLock> = { current: {} };
  const linearAccelerationRef: NullableNumberRef = { current: null };
  const linearAccelerationRef2: NullableNumberRef = { current: null };
  const VAR = 1.5;
  const key = "a-key" as const;
  // BAD ANGLE, ARCH DOWN, MOVE DOWN,

  await new Promise(async (resolve) => {
    for (let i = 0; BackgroundService.isRunning(); i++) {
      if (
        !myModule.isOrientationAvailable() ||
        !myModule.isLinearMovementDetectionAvailable()
      ) {
        //todow notify user?
        console.log("not avaivlable, bg");
        return resolve("done");
      }
      myModule.startLinearMovementDetection();
      myModule.startOrientation();
      myModule.addListener("onLinearMovementDetected", (e) => {
        // ------ ARCH -------------------//
        const NconsecutiveAcceleration = 10;
        const NconsecutiveAngleGotWorse = 10;

        // dont do anything until phone set to a good angle
        if (!orientationRef.current) {
          return;
        }
        //-	Z direction is for linear acceleration tilting bad/good reading angle (good->bad posture)
        if (Math.abs(e.z) > 2) {
          linearAccelerationRef2.current =
            (linearAccelerationRef2.current ?? 0) + 1;
        }
        if (!linearAccelerationRef2.current) {
          return;
        }
        if (
          linearAccelerationRef2.current > NconsecutiveAcceleration &&
          orientationRef.current?.count > NconsecutiveAngleGotWorse
        ) {
          linearAccelerationRef2.current = null;
          orientationRef.current = null;
          console.log("running bg !");
          myModule.errorAsync();
          // runWithLock({
          //   cb: myModule.errorAsync,
          //   key,
          //   lockTime: 500,
          //   runLock: runLockRef.current
          // })
        }

        //------ UP / DOWN ---------------//
        if (!linearAccelerationRef.current) {
          linearAccelerationRef.current = 0;
        }
        if (e.y < -VAR) {
          linearAccelerationRef.current = e.y;
          // console.log("hmm")
        }
        if (e.y > VAR && linearAccelerationRef.current < -VAR) {
          console.log(
            linearAccelerationRef.current,
            e.y,
            "background,onLinearMovementDetectedVertical"
          );
          myModule.errorAsync();
          // runWithLock({
          //   cb: myModule.errorAsync,
          //   key,
          //   lockTime: 500,
          //   runLock: runLockRef.current
          // })
          linearAccelerationRef.current = null;
        }
      });
      myModule.addListener("onOrientationChange", (e) => {
        const DIFF = 0.25;
        if (!orientationRef.current && e.y > 7) {
          //todow make configurable to "user's selected good reading angle e.g 45,60,75"
          orientationRef.current = { y: e.y, count: 1 };
          return;
        }
        // if not yet good angle, do nothing
        if (!orientationRef.current) {
          return;
        }
        // angle getting worse
        if (e.y < orientationRef.current.y - DIFF) {
          orientationRef.current = {
            y: e.y,
            count: ++orientationRef.current.count,
          };
        }
        // angle getting better
        if (e.y > orientationRef.current.y + DIFF) {
          orientationRef.current = {
            y: e.y,
            count: --orientationRef.current.count,
          };
        }
        // reset so that if the angle is bad N times will result in a haptic
        if (orientationRef.current.count < 0) {
          orientationRef.current.count = 0;
        }
        // --------- BAD ANGLE GENERALLY ---------//
        const badAngle = isBadAngle(e, config);
        if (badAngle) {
          badAngleRef.current.isBadAngle = true;
        } else {
          badAngleRef.current.isBadAngle = false;
        }
      });
      await new Promise((r) => setTimeout(r, delay));
      await Promise.all([
        myModule.stopOrientation(),
        myModule.stopLinearMovementDetection(),
      ]);
      myModule.removeAllListeners("onLinearMovementDetected");
      myModule.removeAllListeners("onOrientationChange");
      await new Promise((r) => setTimeout(r, 200));
      if (badAngleRef.current.isBadAngle) {
        //todow configure from user settings
        console.log("bad angle");
        myModule.errorAsync();
        // runWithLock({
        //   cb: myModule.warningAsync,
        //   key,
        //   lockTime: 1000,
        //   runLock: runLockRef.current
        // })
      }
    }
    resolve("done");
  });
};

const veryIntensiveTask3 = async (taskData?: BackgroundTaskParams) => {
  const db = await SQLite.openDatabaseAsync("databaseName");
  const allRows = await db.getAllAsync<EVENT_LOG_VALUES>(
    "SELECT * FROM event_log"
  );
  const dbTask = allRows.find((r) =>
    Object.values(angleValuesMap)
      .map((a) => a.name)
      .some((n) => n === r.value)
  );
  if (!dbTask) {
    console.log("no dbTask");
    db.runAsync(
      "INSERT INTO event_log (value) VALUES (?)",
      EVENT_LOG_VALUES[3]
    );
    myModule.errorAsync();
  }
  const config = taskData ?? defaultConfig;
  const { delay, values } = config;
  const badAngleRef: BadAngleRef = {
    current: { isBadAngle: false, count: 0, eventCount: 0 },
  };
  const orientationRef: OrientationRef = { current: { count: 0, y: 0 } };
  const linearAccelerationRef: NullableNumberRef = { current: null };
  const linearAccelerationEnabledRef: RefType<boolean> = { current: true };
  const VAR = 1.5;

  if (!taskData) {
    db.runAsync(
      "INSERT INTO event_log (value) VALUES (?)",
      EVENT_LOG_VALUES[2]
    );
    myModule.errorAsync();
  }
  const dbEmitter = new EventEmitter<EventsMap>();
  let eventAt: number | null = null;
  dbEmitter.addListener("insert", async (e) => {
    const now = new Date().getTime();
    myModule.errorAsync();
    const APPROX_MAX_EVENT_RATE_MS = 3000; //3 seconds in ms
    if (typeof eventAt === "number") {
      if (now - eventAt < APPROX_MAX_EVENT_RATE_MS * 1.5) {
        //delete the last optimistic correction.
        // i.e the user has not corrected their phone position for the minimum length of time.
        // MIN_CORRECTION_TIME = APPROX_MAX_EVENT_RATE_MS * 1.5
        //slight overestimate. e.g 1 evt per 3 second if phone always at bad position.
        await db.runAsync(
          "DELETE FROM event_log WHERE id = (SELECT id FROM event_log WHERE value = ? ORDER BY id DESC LIMIT 1)",
          EVENT_LOG_VALUES[4]
        );
      }
    }
    eventAt = now;
    await db.runAsync(
      "INSERT INTO event_log (value) VALUES (?)",
      EVENT_LOG_VALUES[1]
    );
    //add that they corrected. optimistic logging
    await db.runAsync(
      "INSERT INTO event_log (value) VALUES (?)",
      EVENT_LOG_VALUES[4]
    );
  });
  await new Promise(async (resolve) => {
    if (
      !myModule.isOrientationAvailable() ||
      !myModule.isLinearMovementDetectionAvailable()
    ) {
      //todow notify user?
      console.log("not avaivlable, bg");
      return resolve("done");
    }
    console.warn("3 starting...");
    let s = performance.now();
    for (let i = 0; BackgroundService.isRunning(); i++) {
      myModule.startLinearMovementDetection();
      myModule.startOrientation();
      myModule.addListener("onLinearMovementDetected", (e) => {
        // dont do anything until phone set to a good angle
        if (!orientationRef.current) {
          return;
        }

        //disabled when the phone is at a bad angle
        if (!linearAccelerationEnabledRef.current) {
          return;
        }
        //------ UP / DOWN ---------------//
        if (!linearAccelerationRef.current) {
          linearAccelerationRef.current = 0;
        }
        if (e.y < -VAR) {
          linearAccelerationRef.current = e.y;
          // console.log("hmm")
        }
        if (e.y > VAR && linearAccelerationRef.current < -VAR) {
          // console.log(linearAccelerationRef.current,e.y,"background,onLinearMovementDetectedVertical")
          //⏰🔔
          dbEmitter.emit("insert");
          linearAccelerationRef.current = null;
        }
      });
      myModule.addListener("onOrientationChange", (e) => {
        if (!orientationRef.current && e.y > values.y) {
          // configurable to "user's selected good reading angle e.g 45,60,75"
          orientationRef.current = { y: e.y, count: 1 };
          return;
        }
        // if not yet good angle, do nothing
        if (!orientationRef.current) {
          return;
        }
        //if phone is flat assume the user put phone down
        if (Math.abs(e.y) < 1) {
          return;
        }

        // --------- BAD ANGLE GENERALLY ---------//
        const badAngle = isBadAngle(e, config);
        if (badAngle) {
          badAngleRef.current.isBadAngle = true;
          ++badAngleRef.current.count;
          linearAccelerationEnabledRef.current = false;
        } else {
          badAngleRef.current.isBadAngle = false;
          --badAngleRef.current.count;
          // the user moves phone from bad to good angle, re-enable UP/DOWN tracking
          if (!linearAccelerationEnabledRef.current) {
            setTimeout(() => {
              linearAccelerationEnabledRef.current = true;
            }, 20);
          }
        }
        if (badAngleRef.current.count < 0) {
          badAngleRef.current.count = 0;
        }
        if (badAngleRef.current.count > ANGLE_LIMIT) {
          //todow make this configurable {}
          //⏰🔔
          dbEmitter.emit("insert");
          ++badAngleRef.current.eventCount;
          badAngleRef.current.count = 0;
          // console.log("bad angle from bg task",badAngleRef.current)
        }
      });
      await new Promise((r) => setTimeout(r, delay));
      myModule.removeAllListeners("onLinearMovementDetected");
      myModule.removeAllListeners("onOrientationChange");
      await Promise.all([
        myModule.stopOrientation(),
        myModule.stopLinearMovementDetection(),
      ]);
      // console.log(Math.round((performance.now() - s)/1000))//clock
      await new Promise((r) => setTimeout(r, 300)); //todow try diff values?
    }
    await db.closeAsync();
    dbEmitter.removeAllListeners("insert");
    resolve("done");
  });
};
type EVENT_LOG_VALUES = {
  id: number;
  value: string;
  createdAt: string;
};
const ANGLE_LIMIT = 200;
type EventsMap = {
  insert: (arg?: EVENT_LOG_VALUES) => void;
};
const veryIntensiveTask4 = async (taskData?: BackgroundTaskParams) => {
  const db = await SQLite.openDatabaseAsync("databaseName");
  const dbEmitter = new EventEmitter<EventsMap>();
  dbEmitter.addListener("insert", async (e) => {
    myModule.errorAsync();
    console.log(e, "here"); // myModule.warningAsync();
    //await db.runAsync('UPDATE test SET intValue = ? WHERE value = ?', 0, 'test1');
  });
  await new Promise(async (resolve) => {
    // await db.runAsync(
    //   'INSERT OR REPLACE INTO test (value, intValue) VALUES (?, ?)',
    //   'test1',
    //   0
    // );
    myModule.errorAsync();
    for (let i = 0; BackgroundService.isRunning(); i++) {
      await new Promise((r) => setTimeout(r, 5000));
    }
    dbEmitter.removeAllListeners("insert");
    resolve("done");
  });
};
//region config

type RunLock = { [key: `${string}-key`]: boolean };
type RunWithLock = {
  cb: () => void;
  key: `${string}-key`;
  runLock: RunLock;
  lockTime: number;
};
const runWithLock = (args: RunWithLock) => {
  const { cb, key, runLock, lockTime } = args;
  if (runLock[key] === true) {
    return;
  }
  runLock[key] = true;
  cb();
  setTimeout(() => {
    runLock[key] = false;
  }, lockTime);
};
//todow custom function
const defaultOptions = {
  taskName: "PostureKeep",
  taskTitle: "Posture Keep",
  taskDesc: "Monitoring, tap to stop",
  taskIcon: {
    //todow
    name: "ic_launcher",
    type: "mipmap",
  },
  color: "#75e371",
  linkingURI: "postureKeep://", // See Deep Linking for more info
  parameters: defaultConfig satisfies BackgroundTaskParams,
} satisfies ExtendedOptions;

type ExtendedOptions = BackgroundTaskOptions & {
  parameters: BackgroundTaskParams;
};

//region functions
function isBadAngle(event: SensorEvent, config: BackgroundTaskParams) {
  return event.y < config.values.y && event.z > config.values.z;
}

//region links
//https://pixabay.com/images/search/life/?order=ec
//npm i -g @expo/ngrok
//npx expo start --tunnel
//npx eas build --platform android --profile production
//npx expo start --localhost

//region todows
/**
 *  - if too close to eyes
 *  - landscape
 *  - mode into popup message
 *  - styles
 *  - add the splash image
 *  - branding stuff
 *  - help messages & explainations
 *  - animations & UI
 *  - testing
 *  - more settings
 *  - track data ? tanstack query
 *  - put your phone to good angle to unlock starting background task?
 *  - custom button abstract
 */

//kaspersky
//KL7263647
