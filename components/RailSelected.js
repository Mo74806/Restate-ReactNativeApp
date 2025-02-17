import React, { memo } from "react";
import { StyleSheet, View } from "react-native";

const RailSelected = () => <View style={styles.root} />;

export default memo(RailSelected);

const styles = StyleSheet.create({
  root: {
    height: 3,
    color: "#0061FF",
    backgroundColor: "#0061FF",
    borderRadius: 2,
  },
});
