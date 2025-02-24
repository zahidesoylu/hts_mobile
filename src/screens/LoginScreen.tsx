import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigate } from 'react-router-dom'; // useNavigate import edilmelidir

const LoginScreen: React.FC = () => {
  const [role, setRole] = useState<'doctor' | 'patient' | null>(null); // Başlangıçta rol seçilmemiş
  const [tc, setTc] = useState(''); // TC kimlik numarası
  const [password, setPassword] = useState(''); // Şifre
  const navigate = useNavigate(); // React Router'dan useNavigate hook'u

  const handleLogin = () => {
    console.log('Role:', role);
    console.log('TC:', tc);
    console.log('Password:', password);

    // Eğer doktor rolü seçildiyse doktor menüsüne yönlendirme yapalım
    if (role === 'doctor') {
      navigate('/doctor-menu'); // Bu yolu tanımladınız mı?
    } else if (role === 'patient') {
      navigate('/patient-menu'); // Hasta menüsü için de aynı şey
    }
  };

  const buttonColor = '#4CAF50';
  const defaultColor = '#fff';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DİJİTAL ASİSTANIM</Text>
      
      <View style={styles.roleSelection}>
        <TouchableOpacity
          style={[styles.roleButton, { backgroundColor: role === 'doctor' ? buttonColor : defaultColor }]}
          onPress={() => setRole('doctor')}
        >
          <Text style={[styles.roleText, { color: role === 'doctor' ? '#fff' : '#4CAF50' }]}>Doktor</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.roleButton, { backgroundColor: role === 'patient' ? buttonColor : defaultColor }]}
          onPress={() => setRole('patient')}
        >
          <Text style={[styles.roleText, { color: role === 'patient' ? '#fff' : '#4CAF50' }]}>Hasta</Text>
        </TouchableOpacity>
      </View>
      
      {/* TC Kimlik Numarası */}
      <TextInput
        style={styles.input}
        placeholder="TC Kimlik Numarası"
        value={tc}
        onChangeText={setTc}
        keyboardType="numeric"
      />
      
      {/* Şifre Girişi */}
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Giriş Yap</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
    color: '#4CAF50',
  },
  roleSelection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  roleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  roleText: {
    fontSize: 16,
  },
  input: {
    height: 40,
    borderColor: '#4CAF50',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  loginButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
  },
});

export default LoginScreen;
