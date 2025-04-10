import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import BottomMenu from "../../src/components/ui/BottomMenu";
import SearchBar from "../../src/components/ui/SearchBar";
import { useEffect, useState } from "react";
import { auth, db } from "@/config/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const PatientMenu = ({ navigation, route }: any) => {

    const [doctorName, setDoctorName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true); // Yükleniyor durumu için state
    const [errorMessage, setErrorMessage] = useState<string | null>(null); // Hata mesajı için state
    const [patientName, setPatientName] = useState<string | null>(null); // Hasta adı için state
  

    
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

        {/* Profil Bilgileri */}
        <FontAwesome name="user-circle" size={50} color="gray" style={styles.profileIcon} />
        <Text style={styles.patientName}>{patientName}</Text>
        <Text style={styles.doctorName}>{doctorName || 'Doktor adı bulunamadı'}</Text>

        {/* Arama Çubuğu */}
        <SearchBar />


        {/* Menü Butonları */}
                <View style={styles.menuContainer}>
                  <TouchableOpacity
                    style={styles.card}
                    onPress={() => navigation.navigate('PtReport')} // Hastalar sayfasına yönlendir
                  >
                    <Text style={styles.cardText}>Raporlar</Text>
                  </TouchableOpacity>
        
                  <TouchableOpacity
                    style={styles.card}
                    onPress={() => navigation.navigate('PtRandevuButton')} // Randevular sayfasına yönlendir
                  >
                    <Text style={styles.cardText}>Randevular</Text>
                  </TouchableOpacity>
        
                  <TouchableOpacity
                    style={styles.card}
                    onPress={() => navigation.navigate('')} // Raporlar sayfasına yönlendir
                  >
                    <Text style={styles.cardText}>Hatırlatmalar</Text>
                  </TouchableOpacity>
        
                  <TouchableOpacity
                    style={styles.card}
                    onPress={() => navigation.navigate('PtChatScreen')} // Mesajlar sayfasına yönlendir
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
  profileIcon: {
    marginBottom: 10,
  },
  patientName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  doctorName: {
    fontSize: 14,
    color: "gray",
    marginTop: 10,
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
});

export default PatientMenu;
