import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { db } from "../../src/config/firebaseConfig";
import { doc, updateDoc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { auth } from '../config/firebaseConfig';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";


// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const RegisterScreen = ({ navigation, route }: any) => {
  const { uid, eposta, password } = route.params; // Şifreyi de alıyoruz


  const [tc, setTc] = useState("");
  const [ad, setAd] = useState("");
  const [soyad, setSoyad] = useState("");
  const [cinsiyet, setCinsiyet] = useState("Kadın");
  const [dogumTarihi, setDogumTarihi] = useState("");
  const [telefon, setTelefon] = useState("");
  const [egitim, setEgitim] = useState("");
  const [kurum, setKurum] = useState("");
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  const [unvanlar, setUnvanlar] = useState<string[]>([]);
  const [UzmanlikAlanlari, setUzmanlikAlanlari] = useState<string[]>([]);
  const [selectedUnvan, setSelectedUnvan] = useState("Uzman");
  const [selectedUzmanlikAlanlari, setSelectedUzmanlikAlanlari] = useState("Dahiliye");
  const [errorMessage, setErrorMessage] = useState(""); // Hata mesajını tutacak state


  //Unvanları firestore dan cek
  useEffect(() => {
    const fetchUnvanlar = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "unvanlar"));
        const unvanList: string[] = querySnapshot.docs.map((doc) => doc.data().unv);
        setUnvanlar(unvanList);
      } catch (error) {
        console.error("Unvanları çekerken hata oluştu:", error);
      }
    };

    fetchUnvanlar();
  }, []);

  // Uzmanlık alanlarını firestore dan cek
  useEffect(() => {
    const fetchUzmanlikAlanlari = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "uzmanlikAlanlari"));
        const uzmanlikList: string[] = querySnapshot.docs.map((doc) => doc.data().name);
        setUzmanlikAlanlari(uzmanlikList);
      } catch (error) {
        console.error("Veri çekilirken hata:", error);
      }
    };

    fetchUzmanlikAlanlari();
  }, []);


  const handleRegister = async () => {
    // Gerekli alanların doldurulup doldurulmadığını kontrol ediyoruz
    if (!tc || !ad || !soyad || !dogumTarihi || !telefon || !selectedUnvan || !selectedUzmanlikAlanlari) {
      alert("Lütfen tüm alanları doldurun.");
      return;
    }

    // Telefon numarasının geçerli olup olmadığını kontrol ediyoruz
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(telefon)) {
      alert("Geçersiz telefon numarası. Lütfen 10 haneli bir telefon numarası girin.");
      return;
    }

    try {
      // Firebase Auth'tan mevcut kullanıcıyı alıyoruz
      const user = auth.currentUser;

      if (!user) {
        alert("Lütfen önce giriş yapın.");
        return;
      }

      // Firestore'da ilgili kullanıcıyı buluyoruz
      const doctorRef = doc(db, "users", user.uid); // Firestore'da "users" koleksiyonundaki kullanıcı verisine referans alıyoruz
      const docSnap = await getDoc(doctorRef); // Belgeyi alıyoruz

      if (!docSnap.exists()) { // Eğer kullanıcı verisi yoksa
        alert("Bu kullanıcı bulunamadı. Lütfen tekrar giriş yapın.");
        return;
      }

      // Kullanıcı verilerini güncelliyoruz
      await updateDoc(doctorRef, {
        tc,
        ad,
        soyad,
        unvan: selectedUnvan,
        cinsiyet,
        dogumTarihi,
        telefon,
        eposta, // E-posta verisi değişmeden kalacak
        uzmanlik: selectedUzmanlikAlanlari,
        egitim,
        kurum,
      });

      alert("Kayıt başarıyla tamamlandı!");

      const handleLogin = async (eposta: string, password: string) => {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, eposta, password);
          const user = userCredential.user;

          const userRef = doc(db, "users", user.uid); // db, 'users' koleksiyonu, user.uid
          const userDoc = await getDoc(userRef);
          console.log("Firestore Kullanıcı Belgesi:", userDoc.data());

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
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        } catch (error: any) {
          console.log("Giriş hatası:", error);
          setErrorMessage("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
        }
      };

      handleLogin(eposta, password); // Burada login işlemini başlatıyoruz


    } catch (error: unknown) {
      // Hata durumunda kullanıcıya mesaj veriyoruz
      if (error instanceof Error) {
        console.log("Email:", eposta);
        console.log("Password:", password);
        console.log("Hata mesajı:", error.message);

        alert(`Kayıt işlemi sırasında hata oluştu: ${error.message}`);
      } else {
        alert("Beklenmeyen bir hata oluştu.");
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.innerContainer}>

        <View style={styles.scrollViewContainer}>
          <Text style={styles.header}>Doktor Kayıt Tamamlama Formu</Text>

          <ScrollView contentContainerStyle={styles.formContainer}>

            {/* Diğer alanlar */}
            <Text>TC Kimlik Numarası:</Text>
            <TextInput
              style={styles.input}
              placeholder="TC Kimlik Numaranızı girin"
              placeholderTextColor="#aaa"
              value={tc}
              onChangeText={setTc}
              keyboardType="numeric"
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
                {unvanlar.map((unvan, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  <Picker.Item key={index} label={unvan} value={unvan} />
                ))}
              </Picker>
            ) : (
              <Text>Veriler yükleniyor...</Text>
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

            <Text>Uzmanlık Alanınızı Seçin:</Text>
            {UzmanlikAlanlari.length > 0 ? (
              <Picker
                selectedValue={selectedUzmanlikAlanlari}
                style={styles.picker}
                onValueChange={(itemValue) => setSelectedUzmanlikAlanlari(itemValue)}
              >
                <Picker.Item label="Seçiniz..." value="" />
                {UzmanlikAlanlari.map((uzmanlik, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  <Picker.Item key={index} label={uzmanlik} value={uzmanlik} />
                ))}
              </Picker>
            ) : (
              <Text>Veriler yükleniyor...</Text>
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
          </ScrollView>
        </View>
        <TouchableOpacity onPress={handleRegister} style={styles.button}>
          <Text style={styles.buttonText}>Kaydet</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  innerContainer: {
    width: 400,
    height: 600,
    backgroundColor: "white",
    padding: 30,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  formContainer: {
    width: 300,
    height: 600,
    justifyContent: "center",
    padding: 20,
    borderRadius: 12,
    marginTop: 25,
    marginBottom: 25,
    backgroundColor: "#f4f4f4",
    shadowColor: "#000", // Gölgeleme efekti
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1, // Hafif gölgeleme
    shadowRadius: 5,
    elevation: 5, // Android cihazlar için gölge
  },
  scrollViewContainer: {
    flex: 1,
    width: "100%",
    borderRadius: 10,
    justifyContent: "center",
  },
  header: {
    fontSize: 23,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 15,
  },
  picker: {
    height: 30,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
    width: 100,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    display: 'flex',
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",  // Metnin yatayda ortalanması
    lineHeight: 40,  // Metnin dikeyde ortalanması için lineHeight'i butonun yüksekliğiyle aynı yap
  }

});

export default RegisterScreen;
