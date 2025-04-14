import React, { useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { auth } from "../../src/config/firebaseConfig";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

const LoginScreen = ({ navigation }: any) => {
  const [eposta, setEposta] = useState("");
  const [password, setPassword] = useState("");
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
        if (userRole === "doctor") {
          navigation.navigate("DoctorMenu");
        } else if (userRole === "patient") {
          navigation.navigate("PatientMenu");
        } else {
          setErrorMessage("Geçersiz kullanıcı rolü.");
        }
      } else {
        const patientsRef = collection(firestore, "patients");
        const q = query(
          patientsRef,
          where("eposta", "==", eposta),
          where("sifre", "==", password)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setErrorMessage("Hasta bilgileri hatalı.");
          return;
        }

        let patientName = "";
        let patientId = "";
        querySnapshot.forEach((doc) => {
          const patientData = doc.data();
          patientName = `${patientData.ad} ${patientData.soyad}`;
          patientId = doc.id;
        });

        navigation.navigate("PatientMenu", { patientName, patientId });
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
      const userCredential = await createUserWithEmailAndPassword(auth, eposta, password);
      const user = userCredential.user;

      await setDoc(doc(firestore, "users", user.uid), {
        email: eposta,
        role: "doctor",
      });

      navigation.navigate("RegisterScreen", { eposta, password });
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
          <TouchableOpacity
            onPress={() => setIsDoctor(false)}
            style={[styles.roleButton, !isDoctor && styles.selectedRole]}
          >
            <Text style={[styles.roleText, !isDoctor && styles.selectedText]}>Hasta Girişi</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsDoctor(true)}
            style={[styles.roleButton, isDoctor && styles.selectedRole]}
          >
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
        style={styles.passwordInput}
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!passwordVisible}
      />
      <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
        <Ionicons
          name={passwordVisible ? "eye-off" : "eye"}
          size={20}
          color="#555"
        />
      </TouchableOpacity>
          </View>

          {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

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
    backgroundColor: "#eef2f5",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: 400,
    height: 600,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 25,
    elevation: 8,
    alignItems: "center",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    padding: 5,
  },
  roleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  selectedRole: {
    backgroundColor: "#007bff",
  },
  roleText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  selectedText: {
    color: "#fff",
    fontWeight: "bold",
  },
  formContainer: {
    width: "100%",
    marginTop: 10,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 45,
    marginBottom: 15,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 45,
    marginBottom: 15,
    justifyContent: "space-between",
  },
  passwordInput: {
    flex: 1,
  },
  loginButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  loginText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#007bff",
  },
  registerText: {
    color: "#007bff",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
});

export default LoginScreen;
