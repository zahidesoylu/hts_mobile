import React from "react";
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import BottomMenu from "../../src/components/ui/BottomMenu";
import SearchBar from "../../src/components/ui/SearchBar";
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from "../../src/config/firebaseConfig";


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

        <FontAwesome name="user-circle" size={50} color="gray" style={styles.profileIcon} />
        <Text style={styles.doctorName}>{doctorName || 'Doktor adı bulunamadı'}</Text>
        {/* Arama Çubuğu */}
        <SearchBar />

        {/* Menü Butonları */}
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('DrHastalar')} // Hastalar sayfasına yönlendir
          >
            <Text style={styles.cardText}>Hasta İşlemleri</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('DrRandevuButton')} // Randevular sayfasına yönlendir
          >
            <Text style={styles.cardText}>Randevular</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Reports')} // Raporlar sayfasına yönlendir
          >
            <Text style={styles.cardText}>Raporlar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('DrMessage')} // Mesajlar sayfasına yönlendir
          >
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
    backgroundColor: "white",
    padding: 30,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
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
  },
  doctorName: {
    fontSize: 14,
    color: "black",
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
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Android için gölge efekti
    shadowColor: '#000', // iOS için gölge efekti
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
    backgroundColor: "#ddd",
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
