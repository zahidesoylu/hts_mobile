import React, { useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { auth } from "../../src/config/firebaseConfig"; // Firebase konfigürasyon dosyasından auth'i alıyoruz
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { View, Alert, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

const LoginScreen = ({ navigation }: any) => {
  const [eposta, setEposta] = useState("");
  const [password, setPassword] = useState("");  // Şifreyi burada state olarak tanımlıyorsunuz
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isDoctor, setIsDoctor] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const firestore = getFirestore();

  const handleLogin = async () => {
    if (!eposta || !password) {
      setErrorMessage("Lütfen tüm alanları doldurun!");
      return;
    }

    try {
      // Doktor girişini Firebase Authentication ile kontrol et
      if (isDoctor) {
        const userCredential = await signInWithEmailAndPassword(auth, eposta, password);
        const user = userCredential.user;

        const userRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
          setErrorMessage("Kullanıcı verisi bulunamadı.");
          return;
        }

        const userRole = userDoc.data()?.role;
        if (userRole === 'doctor') {
          navigation.navigate('DoctorMenu');
        } else if (userRole === 'patient') {
          navigation.navigate('PatientMenu');
        } else {
          setErrorMessage("Geçersiz kullanıcı rolü.");
        }
      } else {
        // Hasta girişini Firestore'dan kontrol et
        const patientsRef = collection(firestore, "patients");
        const q = query(patientsRef, where("eposta", "==", eposta), where("sifre", "==", password));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setErrorMessage("Hasta bilgileri hatalı.");
          console.log("Hasta verisi bulunamadı veya bilgiler yanlış.");
          return;
        }
        // Veriler varsa hasta menüsüne yönlendir
        querySnapshot.forEach((doc) => {
          console.log("Hasta verisi:", doc.id, doc.data());
        });

        navigation.navigate('PatientMenu', { patientId: querySnapshot.docs[0].id });
      }

    } catch (error: any) {
      console.log("Giriş hatası:", error);
      setErrorMessage("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
    }
  };

  const handleRegister = async () => {
    if (!eposta || !password) {
      setErrorMessage("Lütfen tüm alanları doldurun!");
      return;
    }

    try {
      // Doktor kaydı yapmak
      const userCredential = await createUserWithEmailAndPassword(auth, eposta, password);
      const user = userCredential.user;

      // Firestore'a yeni kullanıcı kaydını ekliyoruz
      await setDoc(doc(firestore, "users", user.uid), {
        email: eposta,
        role: "doctor", // Doktor rolü ekliyoruz
      });

      console.log("Kayıt başarılı: Kullanıcı UID:", user.uid);
      navigation.navigate("DoctorMenu"); // Doktoru DoctorMenu'ya yönlendiriyoruz

    } catch (error: any) {
      console.log("Kayıt hatası:", error);
      setErrorMessage("Kayıt başarısız. Lütfen tekrar deneyin.");
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.header}>Dijital Sağlık Asistanım</Text>
        <View style={styles.roleContainer}>
          <TouchableOpacity onPress={() => setIsDoctor(false)} style={[styles.roleButton, !isDoctor && styles.selected]}>
            <Text style={[styles.roleText, !isDoctor && styles.selectedText]}>Hasta Girişi</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsDoctor(true)} style={[styles.roleButton, isDoctor && styles.selected]}>
            <Text style={[styles.roleText, isDoctor && styles.selectedText]}>Doktor Girişi</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="E-posta"
            value={eposta}
            onChangeText={setEposta}
            keyboardType="email-address"
          />
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Şifre"
              value={password}
              onChangeText={(text) => setPassword(text)} // Şifreyi alıyoruz
              secureTextEntry={!passwordVisible}
            />
            <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
              <Ionicons name={passwordVisible ? "eye-off" : "eye"} size={20} color="#555" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginText}>Giriş Yap</Text>
          </TouchableOpacity>
          {isDoctor && (
            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <Text style={styles.registerText}>Kayıt Ol</Text>
            </TouchableOpacity>
          )}
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
