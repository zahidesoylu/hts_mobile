import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import styles from "../../styles/BottomMenuStyles";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getAuth, signOut } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from "react";


const BottomMenu = () => {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const navigation = useNavigation<any>();
  const auth = getAuth();
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false); // Mikrofon tıklama kontrolü için state
  const routeName = useRoute(); // 'route' yerine 'routeName' kullanalım


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

    // navigation.replace() ile eski ekranın yerine LoginScreen'i koyuyoruz
    navigation.replace('LoginScreen');
  };


  return (
    <View style={[styles.container, {
      backgroundColor: "#F9F9F9",
      height: 80,
      borderWidth: 2,
      borderColor: "#183B4E",
      borderBottomLeftRadius: 40,
      borderBottomRightRadius: 40,
    }]}>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={handleMenuPress}
      >

        <MaterialCommunityIcons name="menu" size={24} color="black" />
        <Text style={styles.menuText}>Menü</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={24} color="black" />
        <Text style={styles.menuText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BottomMenu;
