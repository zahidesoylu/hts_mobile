import React, { useState } from "react";
import { View, Text, TextInput, Button, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { ImageBackground } from "react-native";


const RegisterScreen = () => {
  const [tc, setTc] = useState("");
  const [ad, setAd] = useState("");
  const [soyad, setSoyad] = useState("");
  const [unvan, setUnvan] = useState("Uzman");
  const [cinsiyet, setCinsiyet] = useState("Kadın");
  const [dogumTarihi, setDogumTarihi] = useState("");
  const [telefon, setTelefon] = useState("");
  const [eposta, setEposta] = useState("");
  const [uzmanlik, setUzmanlik] = useState("Diyabet");
  const [egitim, setEgitim] = useState("");
  const [kurum, setKurum] = useState("");
  const [sifre, setSifre] = useState("");
  const [isButtonPressed, setIsButtonPressed] = useState(false);


  const unvanlar = ["Pratisyen Hekim",
    "Operatör Doktor (Op. Dr.)",
    "Profesör (Prof. Dr.)",
    "Doçent (Doç. Dr.)",
    "Yardımcı Doçent (Dr. Öğr. Üyesi)",
    "Uzman Doktor (Uzm. Dr.)",
    "Başhekim"
  ];

  const uzmanlikAlanlari = [
    "Dahiliye",
    "Kardiyoloji",
    "Nöroloji",
    "Ortopedi",
    "Göz Hastalıkları",
    "Kulak Burun Boğaz",
    "Üroloji",
    "Dermatoloji",
  ];

  const handleRegister = () => {
    if (sifre.length < 8 || !/[A-Z]/.test(sifre) || !/[0-9]/.test(sifre)) {
      alert("Şifre en az 8 karakter, bir büyük harf ve bir rakam içermelidir.");
      return;
    }
    // Kayıt işlemi burada yapılacak
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formContainer}>

        <Text style={styles.header}>Doktor Kayıt Formu</Text>
        
        <Text>TC Kimlik Numarası:</Text>
        <TextInput style={styles.input} placeholder="TC Kimlik Numaranızı girin" placeholderTextColor="#aaa" value={tc} onChangeText={setTc} />

        <Text>Ad:</Text>
        <TextInput style={styles.input} placeholder="Adınızı girin" placeholderTextColor="#aaa" value={ad} onChangeText={setAd} />

        <Text>Soyad:</Text>
        <TextInput style={styles.input} placeholder="Soyadınızı girin" placeholderTextColor="#aaa" value={soyad} onChangeText={setSoyad} />

        <Text>Unvan:</Text>
        <Picker selectedValue={unvan} onValueChange={setUnvan} style={styles.picker}>
          {unvanlar.map((item) => (
            <Picker.Item key={item} label={item} value={item} />
          ))}
        </Picker>

        <Text>Cinsiyet:</Text>
        <Picker selectedValue={cinsiyet} onValueChange={setCinsiyet} style={styles.picker}>
          <Picker.Item label="Kadın" value="Kadın" />
          <Picker.Item label="Erkek" value="Erkek" />
        </Picker>

        <Text>Doğum Tarihi:</Text>
        <TextInput style={styles.input} placeholder="Doğum Tarihinizi girin" placeholderTextColor="#aaa" value={dogumTarihi} onChangeText={setDogumTarihi} />

        <Text>Telefon:</Text>
        <TextInput style={styles.input} placeholder="Telefon Numaranızı girin" placeholderTextColor="#aaa" value={telefon} onChangeText={setTelefon} keyboardType="phone-pad" />

        <Text>E-Posta:</Text>
        <TextInput style={styles.input} placeholder="E-Postanızı girin" placeholderTextColor="#aaa" value={eposta} onChangeText={setEposta} keyboardType="email-address" />

        <Text>Uzmanlık Alanı:</Text>
        <Picker selectedValue={uzmanlik} onValueChange={setUzmanlik} style={styles.picker}>
          {uzmanlikAlanlari.map((item) => (
            <Picker.Item key={item} label={item} value={item} />
          ))}
        </Picker>

        <Text>Eğitim Bilgisi:</Text>
        <TextInput style={styles.input} placeholder="Üniversite Adı" placeholderTextColor="#aaa" value={egitim} onChangeText={setEgitim} />

        <Text>Çalıştığı Kurum:</Text>
        <TextInput style={styles.input} placeholder="Kurum Adı" placeholderTextColor="#aaa" value={kurum} onChangeText={setKurum} />

        <Text>Şifre:</Text>
        <TextInput style={styles.input} placeholder="Şifre" placeholderTextColor="#aaa" secureTextEntry value={sifre} onChangeText={setSifre} />

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
      width: "30%",
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
      backgroundColor: "#fff",
    },
    picker: {
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 5,
      padding: 10,
      marginBottom: 10,
    },
    button: {
      backgroundColor: "#007bff",
      padding: 10,
      borderRadius: 5,
      alignItems: "center",
      marginTop: 10,
    },
    buttonPressed: {
      borderColor: "#0056b3",
      borderWidth: 2,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    overlay: {
        backgroundColor: "rgba(255, 255, 255, 0.8)", // Hafif beyaz şeffaf katman
        padding: 20,
        borderRadius: 10,
      },      
  });
  

export default RegisterScreen;