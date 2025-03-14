import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { db } from "../../src/config/firebaseConfig"; // Firebase auth ve firestore importları
import { createUserWithEmailAndPassword } from "firebase/auth"; // Firebase auth metodları
import { doc, setDoc, collection, getDocs } from "firebase/firestore"; // Firestore'da veri yazma
import { auth } from '../config/firebaseConfig'; // Firebase'i import ettik

const RegisterScreen = () => {
  const [tc, setTc] = useState("");
  const [ad, setAd] = useState("");
  const [soyad, setSoyad] = useState("");
  const [cinsiyet, setCinsiyet] = useState("Kadın");
  const [dogumTarihi, setDogumTarihi] = useState("");
  const [telefon, setTelefon] = useState("");
  const [eposta, setEposta] = useState("");
  const [uzmanlik, setUzmanlik] = useState("Diyabet");
  const [egitim, setEgitim] = useState("");
  const [kurum, setKurum] = useState("");
  const [sifre, setSifre] = useState("");
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  const [unvanlar, setUnvanlar] = useState<string[]>([]);
  const [UzmanlikAlanlari, setUzmanlikAlanlari] = useState<string[]>([]);
  const [selectedUnvan, setSelectedUnvan] = useState("Uzman");
  const [selectedUzmanlikAlanlari, setSelectedUzmanlikAlanlari] = useState("Dahiliye");

  useEffect(() => {
    const fetchUnvanlar = async () => {
      try {
        var querySnapshot = await getDocs(collection(db, "unvanlar"));
        const unvanList: string[] = querySnapshot.docs.map((doc) => doc.data().name);
        setUnvanlar(unvanList);
        console.log("Unvanlar:", unvanList); // Verileri konsola yazdır
      } catch (error) {
        console.error("Ünvanları çekerken hata oluştu:", error);
      }
    };

    fetchUnvanlar();
  }, []);



  // Veri çekme fonksiyonu
  useEffect(() => {
    const fetchUzmanlikAlanlari = async () => {
      try {
        var querySnapshot = await getDocs(collection(db, "uzmanlikAlanlari"));
        const uzmanlikList: string[] = querySnapshot.docs.map((doc) => doc.data().name);
        setUzmanlikAlanlari(uzmanlikList);
        console.log("Uzmanlık Alanları:",uzmanlikList ); // Verileri konsola yazdır
      } catch (error) {
        console.error("Veri çekilirken hata:", error);
      }
    };

    fetchUzmanlikAlanlari();
  }, []);



  const handleRegister = async () => {
    // E-posta ve şifre kontrolü
    if (!eposta || !sifre) {
      alert("E-posta ve şifre boş olamaz!");
      return;
    }

    // Şifre doğrulaması
    if (sifre.length < 8 || !/[A-Z]/.test(sifre) || !/[0-9]/.test(sifre)) {
      alert("Şifre en az 8 karakter, bir büyük harf ve bir rakam içermelidir.");
      return;
    }

    try {
      // Firebase Authentication ile kullanıcı kaydını yap
      const userCredential = await createUserWithEmailAndPassword(auth, eposta, sifre);
      const user = userCredential.user;

      // Firestore'a kullanıcı bilgilerini kaydet
      await setDoc(doc(db, "doktorlar", user.uid), {
        tc,
        ad,
        soyad,
        unvan: selectedUnvan, // Burada seçilen unvan kaydediliyor
        cinsiyet,
        dogumTarihi,
        telefon,
        eposta,
        uzmanlik:selectedUzmanlikAlanlari,
        egitim,
        kurum,
      });

      alert("Kayıt başarılı!");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log("Hata mesajı:", error.message);
        alert(`Kayıt işlemi sırasında hata oluştu: ${error.message}`);
      } else {
        alert("Beklenmeyen bir hata oluştu.");
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.header}>Doktor Kayıt Formu</Text>

        <Text>TC Kimlik Numarası:</Text>
        <TextInput
          style={styles.input}
          placeholder="TC Kimlik Numaranızı girin"
          placeholderTextColor="#aaa"
          value={tc}
          onChangeText={setTc}
        />

        <Text>Ad:</Text>
        <TextInput
          style={styles.input}
          placeholder="Adınızı girin"
          placeholderTextColor="#aaa"
          value={ad}
          onChangeText={setAd}
        />

        <Text>Soyad:</Text>
        <TextInput
          style={styles.input}
          placeholder="Soyadınızı girin"
          placeholderTextColor="#aaa"
          value={soyad}
          onChangeText={setSoyad}
        />

        <Text>Unvan Seçin:</Text>
        {unvanlar.length > 0 ? (
          <Picker
            selectedValue={selectedUnvan}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedUnvan(itemValue)}
          >
            <Picker.Item label="Seçiniz..." value="" />
            {unvanlar.map((unvanlar, index) => (
              <Picker.Item key={index} label={unvanlar} value={unvanlar} />
            ))}
          </Picker>
        ) : (
          <Text>Veriler yükleniyor...</Text> // Eğer veriler gelmiyorsa bu mesajı göster
        )}

        <Text>Cinsiyet:</Text>
        <Picker selectedValue={cinsiyet} onValueChange={setCinsiyet} style={styles.picker}>
          <Picker.Item label="Kadın" value="Kadın" />
          <Picker.Item label="Erkek" value="Erkek" />
        </Picker>

        <Text>Doğum Tarihi:</Text>
        <TextInput
          style={styles.input}
          placeholder="Doğum Tarihinizi girin"
          placeholderTextColor="#aaa"
          value={dogumTarihi}
          onChangeText={setDogumTarihi}
        />

        <Text>Telefon:</Text>
        <TextInput
          style={styles.input}
          placeholder="Telefon Numaranızı girin"
          placeholderTextColor="#aaa"
          value={telefon}
          onChangeText={setTelefon}
          keyboardType="phone-pad"
        />

        <Text>E-Posta:</Text>
        <TextInput
          style={styles.input}
          placeholder="E-Postanızı girin"
          placeholderTextColor="#aaa"
          value={eposta}
          onChangeText={setEposta}
          keyboardType="email-address"
        />

        <Text>Uzmanlık Alanınızı Seçin:</Text>
        {UzmanlikAlanlari.length > 0 ? (
          <Picker
            selectedValue={selectedUzmanlikAlanlari}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedUzmanlikAlanlari(itemValue)}
          >
            <Picker.Item label="Seçiniz..." value="" />
            {unvanlar.map((uzmanlikAlanlari, index) => (
              <Picker.Item key={index} label={uzmanlikAlanlari} value={uzmanlikAlanlari} />
            ))}
          </Picker>
        ) : (
          <Text>Veriler yükleniyor...</Text> // Eğer veriler gelmiyorsa bu mesajı göster
        )}

        <Text>Eğitim Bilgisi:</Text>
        <TextInput
          style={styles.input}
          placeholder="Üniversite Adı"
          placeholderTextColor="#aaa"
          value={egitim}
          onChangeText={setEgitim}
        />

        <Text>Çalıştığı Kurum:</Text>
        <TextInput
          style={styles.input}
          placeholder="Kurum Adı"
          placeholderTextColor="#aaa"
          value={kurum}
          onChangeText={setKurum}
        />

        <Text>Şifre:</Text>
        <TextInput
          style={styles.input}
          placeholder="Şifre"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={sifre}
          onChangeText={setSifre}
        />

        <TouchableOpacity
          style={[styles.button, isButtonPressed && styles.buttonPressed]}
          onPress={handleRegister}
          onPressIn={() => setIsButtonPressed(true)}
          onPressOut={() => setIsButtonPressed(false)}
        >
          <Text style={styles.buttonText}>Kayıt Ol</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  formContainer: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#f8f8f8",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#f8f8f8",
  },
  button: {
    backgroundColor: "#3498db",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonPressed: {
    backgroundColor: "#2980b9",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default RegisterScreen;
