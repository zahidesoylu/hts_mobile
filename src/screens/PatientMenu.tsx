import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import BottomMenu from "../../src/components/ui/BottomMenu";
import SearchBar from "../../src/components/ui/SearchBar";
import { useEffect, useState } from "react";
import { auth, db } from "@/config/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { collection, query, where, getDocs } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign } from '@expo/vector-icons';
import tailwind from "tailwind-rn"; // tailwind-rn'i kullanarak stil yapıyoruz
import Ionicons from '@expo/vector-icons/Ionicons';
import Fontisto from '@expo/vector-icons/Fontisto';


// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const PatientMenu = ({ navigation, route }: any) => {
  const [doctorName, setDoctorName] = useState<string | null>(null);
  const [patientName, setPatientName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null); // <- Yeni eklendi
  const [searchText, setSearchText] = useState<string>("");

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const [patients, setPatients] = useState<any[]>([]);  // Hastaların tam listesi
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);  // Filtrelenmiş hastalar

  const patientId = route?.params?.patientId;
  const hastalikId = route?.params?.hastalikId;
  const hastalik = route?.params?.hastalik;

  console.log("Route params:", route.params);
  console.log("Hasta ID'si:", patientId);
  console.log("Hasta adı:", patientName);


  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const patientRef = doc(db, "patients", patientId);
        const patientDoc = await getDoc(patientRef);

        if (patientDoc.exists()) {
          const patientData = patientDoc.data();

          // Hasta adı
          const pFullName = `${patientData?.ad} ${patientData?.soyad}`;
          setPatientName(pFullName);

          // Doktor adı ve ID'si hastanın içinden alınır
          if (patientData?.doktor) {
            setDoctorName(patientData.doktor);
          } else {
            setDoctorName("Doktor adı bulunamadı");
          }
          if (patientData?.doctorId) {
            setDoctorId(patientData.doctorId);
          } else {
            setDoctorId(null);
          }

          console.log("Hasta verisi:", patientData);
        } else {
          setErrorMessage("Hasta verisi bulunamadı.");
        }
      } catch (error) {
        console.log("Hasta verisi çekme hatası:", error);
        setErrorMessage("Hasta verisi alınamadı.");
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatientData();
    } else {
      setErrorMessage("Hasta kimliği eksik.");
      setLoading(false);
    }
  }, [patientId]);


  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const getPatientIdFromStorage = async () => {
      try {
        let pid = route?.params?.patientId;

        if (!pid) {
          const storedId = await AsyncStorage.getItem("patientId");
          if (storedId) {
            pid = storedId;
          } else {
            setErrorMessage("Hasta ID'si bulunamadı.");
            setLoading(false);
            return;
          }
        }

        const patientRef = doc(db, "patients", pid);
        const patientDoc = await getDoc(patientRef);

        if (patientDoc.exists()) {
          const patientData = patientDoc.data();

          const pFullName = `${patientData?.ad} ${patientData?.soyad}`;
          setPatientName(pFullName);

          setDoctorName(patientData?.doktor || "Doktor adı bulunamadı");
          setDoctorId(patientData?.doctorId || null);

          console.log("Hasta verisi:", patientData);
        } else {
          setErrorMessage("Hasta verisi bulunamadı.");
        }

        setLoading(false);
      } catch (error) {
        console.log("Hasta verisi çekme hatası:", error);
        setErrorMessage("Hasta verisi alınamadı.");
        setLoading(false);
      }
    };

    getPatientIdFromStorage();
  }, []);


  // Firebase'den hastaların alınması
  const fetchDoctorPatients = async (doctorId: string) => {
    try {
      const patientsRef = collection(db, "patients");
      const q = query(patientsRef, where("doctorId", "==", doctorId));
      const querySnapshot = await getDocs(q);

      const patients = querySnapshot.docs.map(doc => doc.data());
      return patients;
    } catch (error) {
      console.error("Hastalar alınamadı: ", error);
    }
  };


  const handleSearch = (text: string) => {
    setSearchText(text);

    // Veritabanından alınan hastaları filtreleme
    const filteredPatients = patients.filter((patient) =>
      patient?.ad?.toLowerCase().includes(text.toLowerCase()) ||
      patient?.soyad?.toLowerCase().includes(text.toLowerCase())
    );

    setFilteredPatients(filteredPatients);  // Filtrelenmiş hastaları duruma kaydet
  };


  // Verileri filtreleme
  const filteredDoctorName = doctorName?.toLowerCase().includes(searchText.toLowerCase()) || false;
  const filteredPatientName = patientName?.toLowerCase().includes(searchText.toLowerCase()) || false;

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </Text>

        <View style={styles.profileContainer}>
          <View style={styles.profileRow}>
            <FontAwesome name="user-circle" size={50} color="gray" style={styles.profileIcon} />
            <Text style={styles.pFullName}>{patientName || 'Hasta adı bulunamadı'}</Text>
          </View>

          {loading ? (
            <Text style={styles.doctorName}>Yükleniyor...</Text>
          ) : filteredDoctorName && filteredPatientName ? (
            <Text style={styles.doctorName}>Doktoru: {doctorName || 'Doktor adı bulunamadı'}</Text>
          ) : (
            <Text style={styles.doctorName}>Eşleşen veri bulunamadı</Text>
          )}
        </View>



        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('PtReport', {
              patientName,
              doctorName,
              patientId,
              doctorId,
              hastalikId,
              hastalik,
            })}

          ><AntDesign name="profile" size={30} color="black" />
            <Text style={styles.cardText}>Raporlar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('PtRandevuButton', {
              patientName,
              doctorName,
              patientId,
              doctorId,
              hastalikId,
              hastalik,
            })
            }
          >
            <Fontisto name="date" size={30} color="black" />
            <Text style={styles.cardText}>Randevular</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Bildirimler', {
              patientName,
              doctorName,
              patientId,
              doctorId,
              hastalikId,
              hastalik,
            })}
          >
            <Ionicons name="notifications-outline" size={30} color="black" />
            <Text style={styles.cardText}>Bildirimler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}

            onPress={() =>
              navigation.navigate('PtChatScreen', {
                patientName,
                doctorName,
                patientId,
                doctorId,
              })
            }
          >
            <AntDesign name="home" size={30} color="black" />

            <Text style={styles.cardText}>Mesajlar</Text>
          </TouchableOpacity>
        </View>
      </View>

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
    marginBottom: 25,
  },
  profileIcon: {
    marginBottom: 10,
    color: "white",
  },
  pFullName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    alignSelf: "center",
  },
  doctorName: {
    fontSize: 14,
    color: "white",
    marginTop: 10,
    marginBottom: 60,
    alignSelf: "center",
  },
  menuContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-evenly",
    width: "100%",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20, // Eğer desteklemiyorsa marginRight kullan
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
});

export default PatientMenu;
