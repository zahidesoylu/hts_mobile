import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import styles from "../../styles/BottomMenuStyles";
import { useNavigation } from "@react-navigation/native";
import { getAuth, signOut } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';


const BottomMenu = () => {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const navigation = useNavigation<any>();
  const auth = getAuth();

  const handleMenuPress = async () => {
    const role = await AsyncStorage.getItem('userRole');
    if (role === 'doctor') {
      navigation.navigate('DoctorMenu');
    } else if (role === 'patient') {
      navigation.navigate('PatientMenu');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userRole');
    await auth.signOut();
    navigation.navigate('LoginScreen');
  };


  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={handleMenuPress}
      >

        <MaterialCommunityIcons name="menu" size={24} color="black" />
        <Text style={styles.menuText}>Menü</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.micButton}>
        <MaterialCommunityIcons name="microphone" size={24} color="white" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={24} color="black" />
        <Text style={styles.menuText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BottomMenu;
