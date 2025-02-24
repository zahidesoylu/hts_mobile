import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DoctorMenu: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Doktor Menü</Text>
      <Text>Rapor Yönetimi</Text>
      <Text>Hasta Bilgileri</Text>
      <Text>İletişim</Text>
      <Text>Randevu</Text>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff',
    },
    title: {
      fontSize: 24,
      color: '#4CAF50',
    },
  });
  
  export default DoctorMenu;
