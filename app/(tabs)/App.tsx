import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack"; // Doğru import
import { NavigationContainer } from "@react-navigation/native";
import LoginScreen from "../../src/screens/LoginScreen";
import DoctorMenu from "../../src/screens/DoctorMenu";
import PatientMenu from "../../src/screens/PatientMenu";
import RegisterScreen from "../../src/screens/RegisterScreen";


export type RootStackParamList = {
  LoginScreen: undefined;
  DoctorMenu: undefined;
  PatientMenu: undefined;
  RegisterScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>(); // Doğru Stack tanımı

const Navigation = () => {
  return (
      <Stack.Navigator initialRouteName="PatientMenu">
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="DoctorMenu" component={DoctorMenu} />
        <Stack.Screen name="PatientMenu" component={PatientMenu} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
      </Stack.Navigator>
  );
};

export default Navigation;
