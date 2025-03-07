import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack"; // Doğru import
import { NavigationContainer } from "@react-navigation/native";
import LoginScreen from "../../src/screens/LoginScreen";
import DoctorMenu from "../../src/screens/DoctorMenu";
import PatientMenu from "../../src/screens/PatientMenu";
import RegisterScreen from "../../src/screens/RegisterScreen";
import DrRandevuButton from "../../src/screens/DrRandevuButton";
import PtRandevuButton from "../../src/screens/PtRandevuButton";
import DrHastalar from "../../src/screens/DrHastalar";
import DrMessageScreen from "../../src/screens/ChatScreen";
import DoctorMessage from "@/screens/DrMessage";



export type RootStackParamList = {
  LoginScreen: undefined;
  DoctorMenu: undefined;
  PatientMenu: undefined;
  RegisterScreen: undefined;
  DrRandevuButton: undefined;
  PtRandevuButton: undefined;
  DrHastalar: undefined;
  DrMessageScreen: undefined;
  DrMessage: undefined;

};

const Stack = createNativeStackNavigator<RootStackParamList>(); // Doğru Stack tanımı

const Navigation = () => {
  return (
      <Stack.Navigator initialRouteName="DrMessage">
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="DoctorMenu" component={DoctorMenu} />
        <Stack.Screen name="PatientMenu" component={PatientMenu} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        <Stack.Screen name="DrRandevuButton" component={DrRandevuButton} />
        <Stack.Screen name="PtRandevuButton" component={PtRandevuButton} />
        <Stack.Screen name="DrHastalar" component={DrHastalar} />
        <Stack.Screen name="DrMessageScreen" component={DrMessageScreen} />
        <Stack.Screen name="DrMessage" component={DoctorMessage} />
      </Stack.Navigator>
  );
};

export default Navigation;
