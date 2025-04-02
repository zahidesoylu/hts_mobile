import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker"; // Burada doğru bir şekilde içe aktarılıyor
import BottomMenu from "../components/ui/BottomMenu";
import { db , auth} from "../../src/config/firebaseConfig";
import { doc, getDoc } from 'firebase/firestore';


const DrHastalar = ({ navigation, route }: any) =>{
    

    const [patients, setPatients] = useState(["Ali Veli", "Ayşe Yılmaz", "Mehmet Kara"]);
    const [isPanelVisible, setIsPanelVisible] = useState(false);
    const [isAddingPatient, setIsAddingPatient] = useState(false);

    const [patientName, setPatientName] = useState("");
    const [patientSurname, setPatientSurname] = useState("");
    const [tcNumber, setTcNumber] = useState("");  // TC kimlik numarası için state
    const [birthDate, setBirthDate] = useState("");
    const [gender, setGender] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [chronicDisease, setChronicDisease] = useState("");
    const [emergencyName, setEmergencyName] = useState("");
    const [emergencyRelation, setEmergencyRelation] = useState("");
    const [emergencyPhone, setEmergencyPhone] = useState("");

    const [errorMessage, setErrorMessage] = useState<string | null>(null); // Hata mesajı için state
    const [doctorName, setDoctorName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true); // Yükleniyor durumu için state
    
    const chronicDiseases = [
        { label: "KOAH", value: "KOAH" },
        { label: "Astım", value: "Astım" },
        { label: "Hipertansiyon", value: "Hipertansiyon" },
        { label: "Diyabet", value: "Diyabet" },
        { label: "Kalp Hastalığı", value: "Kalp Hastalığı" },
    ];

    const handleAddPatient = () => {
        if (patientName.trim()) {
            const newPatient = `${patientName}, ${birthDate}, ${gender}, ${phoneNumber}`;
            setPatients([...patients, newPatient]);
            setPatientName("");
            setBirthDate("");
            setGender("");
            setPhoneNumber("");
            setAddress("");
            setIsAddingPatient(false);
        }
    };

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
            <View style={styles.innerContainer}>
                <Text style={styles.dateText}>
                    {new Date().toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    })}
                </Text>

                <View style={styles.infoBox}>
                          <Text style={styles.doctorName}>{doctorName || 'Doktor adı bulunamadı'}</Text>
                </View>

                <TouchableOpacity
                    style={styles.hastalarButton}
                    onPress={() => setIsPanelVisible(!isPanelVisible)}
                >
                    <Text style={styles.hastalarButtonText}>Hastalarım</Text>
                </TouchableOpacity>

                {isPanelVisible && (
                    <View style={styles.patientPanel}>
                        {patients.map((patient, index) => (
                            <Text key={index} style={styles.patientText}>
                                {patient}
                            </Text>
                        ))}
                    </View>
                )}

                <TouchableOpacity
                    style={styles.addPatientButton}
                    onPress={() => navigation.navigate("PatientRegister")} // Mesajlar sayfasına yönlendir
                >
                    <Text style={styles.addPatientButtonText}>Yeni Hasta Kaydı</Text>
                </TouchableOpacity>

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
        height: 550,
        backgroundColor: "white",
        padding: 30,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        overflow: "hidden", // Taşan içeriği gizler
        flexShrink: 0,      // İçeriğe bağlı olarak küçülmeyi engeller
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
        color: "#333",
    },
    dateText: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
    },
    infoBox: {
        width: "100%",
        padding: 15,
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
        marginVertical: 20,
    },
    infoText: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
        textAlign: "center",
    },
    hastalarButton: {
        width: "100%",
        padding: 10,
        backgroundColor: "#ddd",
        borderRadius: 8,
        alignItems: "center",
        marginVertical: 10,
    },
    hastalarButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    patientPanel: {
        width: "100%",
        marginVertical: 20,
    },
    patientText: {
        fontSize: 16,
        marginBottom: 8,
    },
    addPatientButton: {
        width: "100%",
        padding: 10,
        backgroundColor: "#ddd",
        borderRadius: 8,
        alignItems: "center",
        marginVertical: 10,
    },
    addPatientButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    newPatientForm: {
        width: "100%",
        paddingTop: 20,
    },
    doctorName: {
        fontSize: 14,
        color: "black",
        marginTop: 10,
        fontWeight: "bold",
      },
    input: {
        width: "100%",
        padding: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
    },
    saveButton: {
        width: "100%",
        padding: 10,
        backgroundColor: "#007BFF",
        borderRadius: 8,
        alignItems: "center",
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default DrHastalar;