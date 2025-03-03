import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const LoginScreen = ({ navigation }: any) => {
  const [tc, setTc] = useState("");
  const [password, setPassword] = useState("");
  const [isDoctor, setIsDoctor] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.header}>Dijital Sağlık Asistanım</Text>

        {/* Doktor ve Hasta Seçimi */}
        <View style={styles.roleContainer}>
          <TouchableOpacity onPress={() => setIsDoctor(false)} style={[styles.roleButton, !isDoctor && styles.selected]}>
            <Text style={[styles.roleText, !isDoctor && styles.selectedText]}>Hasta Girişi</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsDoctor(true)} style={[styles.roleButton, isDoctor && styles.selected]}>
            <Text style={[styles.roleText, isDoctor && styles.selectedText]}>Doktor Girişi</Text>
          </TouchableOpacity>
        </View>

        {/* Form Alanı */}
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="TC Kimlik No"
            keyboardType="numeric"
            value={tc}
            onChangeText={setTc}
          />

          {/* Şifre Alanı */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputField}
              placeholder="Şifre"
              secureTextEntry={!passwordVisible}
              value={password}
              onChangeText={setPassword}
              
            />
            <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.iconContainer}>
              <Ionicons name={passwordVisible ? "eye-off" : "eye"} size={18} color="#555" />
            </TouchableOpacity>
          </View>

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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    justifyContent: "center",
    alignItems: "center",
  },
  container: { 
    width: 350, 
    height: 600, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#fff", 
    borderRadius: 10, 
    elevation: 5, 
    alignSelf: "center",
    padding: 20
  },
  header: { 
    fontSize: 28, 
    fontWeight: "bold", 
    marginBottom: 20, 
    color: "#333" 
  },
  roleContainer: { 
    flexDirection: "row", 
    marginBottom: 20, 
    backgroundColor: "#fff", 
    padding: 5, 
    borderRadius: 10 
  },
  roleButton: { 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 5 
  },
  selected: { 
    backgroundColor: "#007bff" 
  },
  roleText: { 
    color: "#333", 
    fontWeight: "bold" 
  },
  selectedText: { 
    color: "#fff" 
  },
  formContainer: { 
    width: "85%", 
    backgroundColor: "#fff", 
    padding: 20, 
    borderRadius: 10, 
    elevation: 3 
  },
  input: { 
    width: "100%", 
    height: 45, 
    borderWidth: 1, 
    borderRadius: 5, 
    paddingHorizontal: 10, 
    marginBottom: 15, 
    borderColor: "#ccc" 
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 45,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    justifyContent: "space-between", // Düzgün hizalama sağlar
  },
  inputField: {
    flex: 1,
    height: "100%",  // Dikey hizalamayı korumak için
    borderWidth: 0,  // Çift çerçeveyi önlemek için kaldırıldı
    paddingHorizontal: 10, // Yazıyı biraz içeri almak için
  },
  iconContainer: {
    position: "absolute",
    right: 10, // İkonu sağa yasladım
  },
  loginButton: { 
    backgroundColor: "#fff", 
    paddingVertical: 12, 
    borderRadius: 120, 
    alignItems: "center", 
    marginBottom: 10,
    borderColor: "#007bff",
    borderWidth: 3,
  },
  loginText: { 
    color: "#007bff", 
    fontWeight: "bold", 
    fontSize: 16 
  },
  registerButton: { 
    backgroundColor: "#fff", 
    paddingVertical: 12, 
    borderRadius: 120, 
    alignItems: "center", 
    marginBottom: 10, 
    borderColor: "#007bff",
    borderWidth: 3,
  },
  registerText: { 
    color: "#007bff", 
    fontWeight: "bold", 
    fontSize: 16 
  },
  forgotPassword: { 
    color: "#007bff", 
    marginTop: 10, 
    textAlign: "center", 
    fontSize: 14 
  }
});

export default LoginScreen;
