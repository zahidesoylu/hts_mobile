import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import BottomMenu from "../../src/components/ui/BottomMenu";
import SearchBar from "../../src/components/ui/SearchBar";
import { useEffect, useState } from "react";
import { auth, db } from "@/config/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const PatientMenu = ({ navigation, route }: any) => {
  const [doctorName, setDoctorName] = useState<string | null>(null);
  const [patientName, setPatientName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null); // <- Yeni eklendi

  const patientId = route?.params?.patientId;
  const patientNameFromRoute = route?.params?.name;

  console.log("Route params:", route.params);
  console.log("Aktif kullanıcı UID:", auth.currentUser?.uid);

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

        <FontAwesome name="user-circle" size={50} color="gray" style={styles.profileIcon} />
        <Text style={styles.pFullName}>{patientName || 'Hasta adı bulunamadı'}</Text>

        {loading ? (
          <Text style={styles.doctorName}>Yükleniyor...</Text>
        ) : (
          <Text style={styles.doctorName}>{doctorName || 'Doktor adı bulunamadı'}</Text>
        )}

        <SearchBar />

        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('PtReport')}
          >
            <Text style={styles.cardText}>Raporlar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('PtRandevuButton', {
              patientName,
              doctorName,
              patientId,
              doctorId,
            })
            }
          >
            <Text style={styles.cardText}>Randevular</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Bildirimler', {
              patientName,
              doctorName,
              patientId,
              doctorId,
            })}
          >
            <Text style={styles.cardText}>Bildirimler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('PtChatScreen', {
                patientName,
                doctorName,
                patientId,
              })
            }
          >
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
    backgroundColor: "white",
    padding: 30,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
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
  pFullName: {
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
  card: {
    width: '35%',
    height: 120,
    margin: 10,
    backgroundColor: '#f0f0f0',
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
