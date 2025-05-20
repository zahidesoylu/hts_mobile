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
import PtDailyReport from "../../src/screens/PtDailyReport";
import Reports from "../../src/screens/Reports";
import ReportDetail from "@/screens/ReportDetail";
import tailwind from 'tailwind-rn';


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
  PtDailyReport: undefined;
  Reports: undefined;
  ReportDetail: {
    report: {
      raporTarihi: string;
      hastalik: string;
      sorular: string[];
      cevaplar: string[];
    };
    doctorName: string;
    patientName: string;
    hastalik: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>(); // Doğru Stack tanımı

const Navigation = () => {
  return (
    <Stack.Navigator initialRouteName="LoginScreen">
      <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ title: 'Giriş' }} />
      <Stack.Screen name="DoctorMenu" component={DoctorMenu} options={{ title: 'Menü' }} />
      <Stack.Screen name="PatientMenu" component={PatientMenu} options={{ title: 'Menü' }} />
      <Stack.Screen name="RegisterScreen" component={RegisterScreen} options={{ title: 'Doktor Kayıt' }} />
      <Stack.Screen name="DrRandevuButton" component={DrRandevuButton} options={{ title: 'Randevular' }} />
      <Stack.Screen name="PtRandevuButton" component={PtRandevuButton} options={{ title: 'Randevularım' }} />
      <Stack.Screen name="DrHastalar" component={DrHastalar} options={{ title: 'Hasta İşlemleri' }} />
      <Stack.Screen name="DrMessageScreen" component={DrMessageScreen} />
      <Stack.Screen name="DrMessage" component={DoctorMessage} options={{ title: 'Mesaj' }} />
      <Stack.Screen name="PtReport" component={PtReport} options={{ title: 'Raporlarım' }} />
      <Stack.Screen name="PatientRegister" component={PatientRegister} options={{ title: 'Hasta Kayıt' }} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ title: 'Mesajlarım' }} />
      <Stack.Screen name="PtChatScreen" component={PtChatScreen} options={{ title: 'Mesajlarım' }} />
      <Stack.Screen name="Bildirimler" component={Bildirimler} options={{ title: 'Bildirimler' }} />
      <Stack.Screen name="PtDailyReport" component={PtDailyReport} options={{ title: 'Raporum' }} />
      <Stack.Screen name="Reports" component={Reports} options={{ title: 'Raporlar' }} />
      <Stack.Screen name="ReportDetail" component={ReportDetail} options={{ title: 'Rapor Detayları' }} />
    </Stack.Navigator>
  );
};

export default Navigation;
