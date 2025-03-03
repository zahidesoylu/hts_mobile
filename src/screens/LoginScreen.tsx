import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

const LoginScreen = ({ navigation }: any) => {
  const [tc, setTc] = useState("");
  const [password, setPassword] = useState("");
  const [isDoctor, setIsDoctor] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Giriş Yap</Text>

      {/* Doktor ve Hasta Seçimi */}
      <View style={styles.roleContainer}>
        <TouchableOpacity onPress={() => setIsDoctor(false)} style={[styles.roleButton, !isDoctor && styles.selected]}>
          <Text style={styles.roleText}>Hasta Girişi</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsDoctor(true)} style={[styles.roleButton, isDoctor && styles.selected]}>
          <Text style={styles.roleText}>Doktor Girişi</Text>
        </TouchableOpacity>
      </View>

      {/* Giriş Formu */}
      <TextInput
        style={styles.input}
        placeholder="TC Kimlik No"
        keyboardType="numeric"
        value={tc}
        onChangeText={setTc}
      />
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Butonlar */}
      <TouchableOpacity style={styles.loginButton}>
        <Text style={styles.loginText}>Giriş Yap</Text>
      </TouchableOpacity>

      {isDoctor && (
        <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate("RegisterScreen")}> 
          <Text style={styles.registerText}>Kayıt Ol</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity>
        <Text style={styles.forgotPassword}>Şifremi Unuttum</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  roleContainer: { flexDirection: "row", marginBottom: 20 },
  roleButton: { padding: 10, marginHorizontal: 10, borderWidth: 1, borderRadius: 5 },
  selected: { backgroundColor: "#007bff", borderColor: "#007bff" },
  roleText: { color: "#333" },
  input: { width: "80%", height: 40, borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, marginBottom: 10 },
  loginButton: { backgroundColor: "#007bff", padding: 10, borderRadius: 5, marginBottom: 10 },
  loginText: { color: "#fff", fontWeight: "bold" },
  registerButton: { backgroundColor: "#28a745", padding: 10, borderRadius: 5, marginBottom: 10 },
  registerText: { color: "#fff", fontWeight: "bold" },
  forgotPassword: { color: "#007bff", marginTop: 10 }
});

export default LoginScreen;
