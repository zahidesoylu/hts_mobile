import { createNativeStackNavigator } from "@react-navigation/native-stack"; // Doğru import
import LoginScreen from "../../src/screens/LoginScreen";
import DoctorMenu from "../../src/screens/DoctorMenu";
import PatientMenu from "../../src/screens/PatientMenu";
import RegisterScreen from "../../src/screens/RegisterScreen";
import DrRandevuButton from "../../src/screens/DrRandevuButton";
import PtRandevuButton from "../../src/screens/PtRandevuButton";
import DrHastalar from "../../src/screens/DrHastalar";
import DrMessageScreen from "../../src/screens/ChatScreen";
import DoctorMessage from "../../src/screens/DrMessage";
import PtReport from "../../src/screens/PtReport";
import PatientRegister from "../../src/screens/PatientRegister";
import ChatScreen from "../../src/screens/ChatScreen";
import PtChatScreen from "../../src/screens/PtChatScreen";
import Bildirimler from "../../src/screens/Bildirimler";
import PtDailyReport from "../../src/screens/PtDailyReport"; // Rapor ekranı için yeni bir ekran ekleyin


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
  PtReport: undefined;
  PatientRegister: undefined;
  ChatScreen: undefined;
  PtChatScreen: undefined;
  Bildirimler: undefined;
  PtDailyReport: undefined; // Rapor ekranı için yeni bir ekran ekleyin

};

const Stack = createNativeStackNavigator<RootStackParamList>(); // Doğru Stack tanımı

const Navigation = () => {
  return (
    <Stack.Navigator initialRouteName="LoginScreen">
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="DoctorMenu" component={DoctorMenu} />
      <Stack.Screen name="PatientMenu" component={PatientMenu} />
      <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
      <Stack.Screen name="DrRandevuButton" component={DrRandevuButton} />
      <Stack.Screen name="PtRandevuButton" component={PtRandevuButton} />
      <Stack.Screen name="DrHastalar" component={DrHastalar} />
      <Stack.Screen name="DrMessageScreen" component={DrMessageScreen} />
      <Stack.Screen name="DrMessage" component={DoctorMessage} />
      <Stack.Screen name="PtReport" component={PtReport} />
      <Stack.Screen name="PatientRegister" component={PatientRegister} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="PtChatScreen" component={PtChatScreen} />
      <Stack.Screen name="Bildirimler" component={Bildirimler} />
      <Stack.Screen name="PtDailyReport" component={PtDailyReport} />
    </Stack.Navigator>
  );
};

export default Navigation;
