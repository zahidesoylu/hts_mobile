import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import styles from "../../styles/BottomMenuStyles";

const BottomMenu = () => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuItem}>
        <MaterialCommunityIcons name="home" size={24} color="black" />
        <Text style={styles.menuText}>Anasayfa</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.micButton}>
        <MaterialCommunityIcons name="microphone" size={24} color="white" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <MaterialCommunityIcons name="cog" size={24} color="black" />
        <Text style={styles.menuText}>Ayarlar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BottomMenu;

