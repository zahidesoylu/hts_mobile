import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BottomMenuStyles from "../../styles/BottomMenuStyles";
const BottomMenu = () => {
  return (
    <View style={BottomMenuStyles.container}>
      <TouchableOpacity style={BottomMenuStyles.menuItem}>
        <MaterialCommunityIcons name="home" size={24} color="black" />
        <Text style={BottomMenuStyles.menuText}>Anasayfa</Text>
      </TouchableOpacity>

      <TouchableOpacity style={BottomMenuStyles.micButton}>
        <MaterialCommunityIcons name="microphone" size={24} color="white" />
      </TouchableOpacity>

      <TouchableOpacity style={BottomMenuStyles.menuItem}>
        <MaterialCommunityIcons name="cog" size={24} color="black" />
        <Text style={BottomMenuStyles.menuText}>Ayarlar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BottomMenu;
