// src/screens/PatientMenu.tsx

import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const PatientMenu: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hasta Paneli</Text>
      <Button title="Raporlar" onPress={() => {}} />
      <Button title="İletişim" onPress={() => {}} />
      <Button title="Randevu" onPress={() => {}} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default PatientMenu;  // Burada dışa aktarımı unutmamalısınız
