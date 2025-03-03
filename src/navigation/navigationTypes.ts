import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
  DoctorMenu: undefined;
  PatientMenu: undefined;
};

export type NavigationProps = NativeStackNavigationProp<RootStackParamList>;
