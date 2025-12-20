import { useThemedStyles } from "@/utilities/theme";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Icon, MD3Theme, Text } from "react-native-paper";
import { CustomButton } from "./CustomButton";
import {
  ApplicationStyles,
  GLOBAL_PADDING_HORIZONTAL,
  ICON_SIZE,
} from "./Application";
//region main
type Props = {
  injectedStyles: ApplicationStyles;
};
export const Chart = ({ injectedStyles }: Props) => {
  //state & hooks
  type Out = { [Key: string]: { alerted: number; corrected: number } };
  const styles = useThemedStyles(stylesCallback);
  const db = useSQLiteContext();
  const [rows, setRows] = useState<Out | null>(null);
  useEffect(() => {
    (async () => {
      const allRows = await db.getAllAsync<EVENT_HISTORY>(
        "SELECT * FROM event_history"
      );
      if (allRows.length === 0) {
        setRows(null);
      }
      const out: Out = {};
      for (let i = 0, L = allRows.length; i < L; i++) {
        let cur = allRows[i];
        if (!out[cur.type]) {
          out[cur.type] = {
            alerted: cur.alerted,
            corrected: cur.corrected,
          };
        } else {
          out[cur.type] = {
            alerted: out[cur.type].alerted + cur.alerted,
            corrected: out[cur.type].corrected + cur.corrected,
          };
        }
      }
      let max: number = 1;
      for (let value of Object.values(out)) {
        if (value.alerted > max) {
          max = value.alerted;
        }
      }
      let formattedOut: Out = {};
      for (let [k, v] of Object.entries(out)) {
        formattedOut[k] = {
          alerted: v.alerted / max,
          corrected: v.corrected / max,
        };
      }
      setRows(formattedOut);
    })();
    return () => {
      //   db.closeAsync();
    };
  }, []);
  //jsx
  return (
    <View style={[styles.container, { padding: GLOBAL_PADDING_HORIZONTAL }]}>
      <Text variant="bodySmall">{JSON.stringify(rows, null, 2)}</Text>
      <View style={styles.rowContainer}>
        {rows &&
          Object.entries(rows).map(([k, v]) => {
            const widthAlerted = v.alerted * 100;
            const widthCorrected = v.corrected * 100;
            return (
              <View
                style={{
                  width: `${widthAlerted}%`,
                  height: 8,
                  backgroundColor: "red",
                  borderRadius: 8,
                }}
              >
                <View
                  style={{
                    width: `${widthCorrected}%`,
                    height: 8,
                    borderRadius: 8,
                    backgroundColor: "green",
                  }}
                />
              </View>
            );
          })}
      </View>
      {rows && (
        <CustomButton
          disabled={false}
          onPress={async () => {
            await db.runAsync(`DELETE FROM event_history`);
            setRows(null);
          }}
        >
          <View style={injectedStyles.buttonChildContainer}>
            <Icon
              size={ICON_SIZE}
              source={"trash-can"}
              color={injectedStyles.onBackground.color}
            />
            <Text variant="bodySmall" style={[injectedStyles.onBackground]}>
              Delete all
            </Text>
          </View>
        </CustomButton>
      )}
    </View>
  );
};
//region styles
const stylesCallback = (theme: MD3Theme) =>
  StyleSheet.create({
    container: { flex: 1 },
    rowContainer: {
      flexDirection: "column",
      gap: 2,
      // alignItems: "flex-end",
      // justifyContent: "space-around",
    },
  });

type EVENT_HISTORY = {
  type: string;
  alerted: number;
  createdAt: string;
  corrected: number;
  id: number;
};
