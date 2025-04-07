import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView } from "react-native";
import BottomMenu from "../components/ui/BottomMenu";
import { db, auth } from "../../src/config/firebaseConfig";
import { doc, getDoc, query, where, deleteDoc, getDocs, collection } from 'firebase/firestore';
import { getAuth } from "firebase/auth";


const DrHastalar = ({ navigation, route }: any) => {

    const [patients, setPatients] = useState<{ id: string, ad: string, soyad: string }[]>([]);
    const [isPanelVisible, setIsPanelVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null); // Hata mesajı için state
    const [doctorName, setDoctorName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true); // Yükleniyor durumu için state

    const auth = getAuth();
    const doctorId = auth.currentUser?.uid;

    //Doktor bilgilerini çekiyoruz
    useEffect(() => {
        const fetchDoctorData = async () => {
            try {
                // Giriş yapan doktorun UID'sini alıyoruz
                const userId = auth.currentUser?.uid;

                if (!userId) {
                    setLoading(false);
                    return;
                }

                const userRef = doc(db, "users", userId);
                const userDoc = await getDoc(userRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const fullName = `${userData?.unvan} ${userData?.ad} ${userData?.soyad}`;
                    setDoctorName(fullName);
                }
            } catch (error) {
                console.error("Doktor verisi çekilirken hata:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctorData();
    }, []);

    // Hastaları Firestore'dan çekiyoruz
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const userId = auth.currentUser?.uid;
                console.log("Giriş yapan doktor ID'si:", userId);

    
                const patientsRef = collection(db, "patients");
                const q = query(patientsRef, where("doctorId", "==", userId));
                const querySnapshot = await getDocs(q);
    
                const patientList = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ad: data.ad,
                        soyad: data.soyad
                    };
                });
    
                setPatients(patientList);
            } catch (error) {
                console.error("Hastalar alınırken hata oluştu:", error);
            }
        };
    
        fetchPatients();
    }, []);


    // Hastaları silme işlemi
    const handleDeletePatient = (id: string) => {
        Alert.alert(
            "Hasta Sil",
            "Bu hastayı silmek istediğinize emin misiniz?",
            [
                { text: "İptal", style: "cancel" },
                {
                    text: "Sil", style: "destructive", onPress: async () => {
                        try {
                            await deleteDoc(doc(db, "patients", id));
                            setPatients(prev => prev.filter(p => p.id !== id));
                            Alert.alert("Silme işlemi başarılı");
                        } catch (error) {
                            console.error("Hasta silinirken hata oluştu:", error);
                            Alert.alert("Silme işlemi başarısız");
                        }
                    }
                }
            ]
        );
    };



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
                    <Text style={styles.hastalarButtonText}>Hastaları Listele</Text>
                </TouchableOpacity>

                {isPanelVisible && (
                    <View style={styles.patientPanel}>
                        {patients.map((patient, index) => (
                            <Text key={index} style={styles.patientText}>
                                {patient.ad} {patient.soyad}
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

                <TouchableOpacity
                    style={styles.hastalarButton}
                    onPress={() => setIsPanelVisible(!isPanelVisible)}
                >
                    <Text style={styles.hastalarButtonText}>Hasta Kayıt Sil</Text>
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