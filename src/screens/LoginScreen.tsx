import React, { useState } from "react";
import { View, Alert, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"; // Firebase'den giriş için gerekli import
import { auth } from "../../src/config/firebaseConfig"; // Firebase konfigürasyon dosyasından auth'i alıyoruz
import { getFirestore, doc, getDoc, collection } from 'firebase/firestore';




const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState(""); // E-posta
  const [password, setPassword] = useState(""); // Şifre
  const [passwordVisible, setPasswordVisible] = useState(false); // Şifre görünürlüğü
  const [isDoctor, setIsDoctor] = useState(false); // Kullanıcı rolü (Doktor/Hasta)
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Hata mesajı
  const [loginStatus, setLoginStatus] = useState<string | null>(null); // Başarı durumu

  const firestore = getFirestore(); // firestore'u doğru şekilde referans al


  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage("Lütfen tüm alanları doldurun!");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("Giriş Başarılı!", user);

      // Başarı mesajını alert ile göster
      Alert.alert("Başarı", "Giriş Başarılı!", [
        {
          text: "Tamam",
          onPress: async () => {
            // Kullanıcı başarılı giriş yaptıktan sonra Firestore'dan veriyi kontrol et
            const userRef = doc(firestore, "users", user.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
              setErrorMessage("Kullanıcı verisi bulunamadı.");
              return;
            }

            const userRole = userDoc.data()?.role;

            // Eğer kullanıcı rolü doktor ise ve doğru giriş yapılmışsa, DoctorMenu'ya yönlendir
            if (userRole === 'doctor') {
              // Eğer doktor rolündeki kullanıcı doğruysa, DoctorMenu ekranına yönlendir
              navigation.navigate('DoctorMenu');
            } else if (userRole === 'patient') {
              // Hasta rolündeki kullanıcıyı yönlendir
              navigation.navigate('PatientMenu');
            } else {
              setErrorMessage("Geçersiz kullanıcı rolü.");
            }
          }
        }
      ]);

      setLoginStatus("Giriş Başarılı!");
      setErrorMessage(null); // Hata mesajını sıfırla
    } catch (error: any) {
      console.log("Giriş hatası:", error);
      // Firebase hata mesajları
      if (error.code === 'auth/invalid-email') {
        setErrorMessage("Geçersiz e-posta adresi.");
      } else if (error.code === 'auth/wrong-password') {
        setErrorMessage("Yanlış şifre.");
      } else if (error.code === 'auth/user-not-found') {
        setErrorMessage("Kullanıcı bulunamadı.");
      } else {
        setErrorMessage("Bilinmeyen bir hata oluştu.");
      }

      setLoginStatus(null);
    }
  };


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

        {/* Kullanıcı Bilgileri */}
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="E-posta"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Şifre"
              secureTextEntry={!passwordVisible}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setPasswordVisible(!passwordVisible)}
              style={styles.eyeIconContainer}
            >
              <Ionicons name={passwordVisible ? "eye-off" : "eye"} size={20} color="#555" />
            </TouchableOpacity>
          </View>

          {/* Butonlar */}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
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
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    borderColor: "#ccc"
  },
  passwordContainer: {
    flexDirection: "row",
    width: "100%",
    height: 45,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  passwordInput: {
    height: 45,
    fontSize: 14,
    borderWidth: 0, // Input'un kendi border'ını kaldırıyoruz
  },
  eyeIconContainer: {
    padding: 5,
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
