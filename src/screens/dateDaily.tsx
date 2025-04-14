// DateDaily.tsx
import React from "react";
import { Text, StyleSheet } from "react-native";

const dateDaily = () => {
  const currentDate = new Date().toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return <Text style={styles.dateText}>{currentDate}</Text>;
};

const styles = StyleSheet.create({
  dateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});

export default dateDaily;
