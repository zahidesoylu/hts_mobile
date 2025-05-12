import React from "react";
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import BottomMenu from "../components/ui/BottomMenu";
import SearchBar from "../components/ui/SearchBar";
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from "../config/firebaseConfig";
import { AntDesign } from '@expo/vector-icons';
import Fontisto from '@expo/vector-icons/Fontisto';
import { Ionicons } from '@expo/vector-icons';




// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const DoctorMenu = ({ navigation, route }: any) => {

  const [doctorName, setDoctorName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Yükleniyor durumu için state
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Hata mesajı için state

  //Doktor verileri
  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        // Giriş yapan kullanıcının UID'sini alıyoruz
        const userId = auth.currentUser?.uid;

        if (!userId) {
          setErrorMessage("Kullanıcı girişi yapılmamış.");
          setLoading(false);
          return;
        }

        console.log("Giriş yapan kullanıcının UID'si:", userId);

        const userRef = doc(db, "users", userId); // Firestore'dan doktor verisini alıyoruz
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("Firestore'dan gelen veriler:", userData); // Veriyi konsola yazdıralım
          const fullName = `${userData?.unvan} ${userData?.ad} ${userData?.soyad}`;
          setDoctorName(fullName); // Firestore'dan gelen doktor adını state'e set ediyoruz        } else {
          setErrorMessage("Doktor verisi bulunamadı.");
        }
      } catch (error) {
        console.log("Firestore hatası:", error);
        setErrorMessage("Veri çekme hatası oluştu.");
      } finally {
        setLoading(false); // Veri çekme işlemi tamamlandığında loading'i false yapıyoruz
      }
    };

    fetchDoctorData(); // Veri çekme fonksiyonunu çağırıyoruz
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Yükleniyor...</Text>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      {/* Ana Konteyner */}
      <View style={styles.innerContainer}>
        {/* Üst Kısım: Tarih */}
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </Text>
        <View style={styles.profileContainer}>

          <FontAwesome name="user-circle" size={50} color="white" style={styles.profileIcon} />
          <Text style={styles.doctorName}>{doctorName || 'Doktor adı bulunamadı'}</Text>
        </View>

        {/* Menü Butonları */}
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('DrHastalar', {
              doctorName: doctorName, // Doktor adını geçiyoruz
              doctorId: auth.currentUser?.uid, // Doktorun UID'sini geçiyoruz

            })} // Hastalar sayfasına yönlendir
          >
            <Ionicons name="person-circle" size={30} color="black" />            <Text style={styles.cardText}>Hasta İşlemleri</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('DrRandevuButton', {
              doctorName: doctorName, // Doktor adını geçiyoruz
              doctorId: auth.currentUser?.uid, // Doktorun UID'sini geçiyoruz

            })} // Randevular sayfasına yönlendir
          >
            <Fontisto name="date" size={30} color="black" />
            <Text style={styles.cardText}>Randevular</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Reports', {
              doctorName: doctorName,
              doctorId: auth.currentUser?.uid,
            })}
          >
            <AntDesign name="profile" size={30} color="black" />
            <Text style={styles.cardText}>Raporlar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('DrMessage', {
              doctorName: doctorName, // Doktor adını geçiyoruz
              doctorId: auth.currentUser?.uid, // Doktorun UID'sini geçiyoruz

            })} // Mesajlar sayfasına yönlendir
          >
            <AntDesign name="home" size={30} color="black" />
            <Text style={styles.cardText}>Mesajlar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Alt Menü */}
      <BottomMenu />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  innerContainer: {
    width: 400,
    height: 600,
    backgroundColor: "#F9F9F9",
    padding: 30,
    borderWidth: 2,
    borderColor: "#183B4E",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: -2,
  },
  profileContainer: {
    backgroundColor: "#2E5077", // istediğin renk
    width: 300,
    padding: 15,
    height: 140,
    marginBottom: 35,
    borderRadius: 15,
  },
  dateText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    marginBottom: 10,
    alignSelf: "center",
  },
  doctorName: {
    fontSize: 14,
    color: "white",
    marginTop: 10,
    fontWeight: "bold",
    textAlign: "center", // ortalamak istersen
    flexShrink: 1,       // metni sığdırmak için küçültebilir
    flexWrap: 'nowrap',  // alt satıra geçmesini engeller
  },
  card: {
    width: '35%',
    height: 120,
    margin: 10,
    backgroundColor: '#eee',
    borderWidth: 2,
    borderColor: "#183B4E",
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  cardText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  menuContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-evenly",
    width: "100%",
  },
  menuButton: {
    width: "40%",
    height: "70%",
    marginBottom: 30,
    backgroundColor: "#eee",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: {
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default DoctorMenu;
