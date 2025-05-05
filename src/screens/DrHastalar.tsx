import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import BottomMenu from "../components/ui/BottomMenu";
import { db, auth } from "../../src/config/firebaseConfig";
import { doc, getDoc, query, where, deleteDoc, getDocs, collection } from 'firebase/firestore';
import { getAuth } from "firebase/auth";


// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const DrHastalar = ({ navigation, route }: any) => {

    const [patients, setPatients] = useState<{ id: string, ad: string, soyad: string }[]>([]);
    const [isPanelVisible, setIsPanelVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null); // Hata mesajı için state
    const [doctorName, setDoctorName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true); // Yükleniyor durumu için state

    const [isDeletePanelVisible, setIsDeletePanelVisible] = useState(false);

    const auth = getAuth();
    const doctorId = auth.currentUser?.uid;

    //Doktor bilgilerini çekiyoruz
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
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
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
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
        console.log("Silme butonuna tıklandı. ID:", id);
        // Alert olmadan doğrudan silmeyi test edelim
        deletePatient(id);
    };


    const deletePatient = async (id: string) => {
        try {
            const patientRef = doc(db, "patients", id);
            await deleteDoc(patientRef); // Firestore'dan silme işlemi

            // Silindikten sonra listeyi güncelle
            setPatients(prev => prev.filter(patient => patient.id !== id));

            console.log(`Hasta başarıyla silindi: ${id}`);
        } catch (error) {
            console.error("Hasta silinirken hata oluştu:", error);
        }
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

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={{ gap: 1 }}>


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
                            <Text style={styles.hastalarButtonText}>Hastaları Listele</Text>
                        </TouchableOpacity>

                        {isPanelVisible && (
                            <View style={styles.patientPanel}>
                                {patients.length === 0 ? (
                                    <Text style={styles.patientText}>Henüz kayıtlı hasta yok.</Text>
                                ) : (
                                    patients.map((patient, index) => (
                                        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                                        <Text key={index} style={styles.patientText}>
                                            {patient.ad} {patient.soyad}
                                        </Text>
                                    ))
                                )}
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.hastalarButton}
                            onPress={() => setIsDeletePanelVisible(!isDeletePanelVisible)}
                        >
                            <Text style={styles.hastalarButtonText}>Hasta Kayıt Sil</Text>
                        </TouchableOpacity>

                        {isDeletePanelVisible && (
                            <View style={styles.patientPanel}>
                                {patients.length === 0 ? (
                                    <Text style={styles.patientText}>Silinecek hasta bulunamadı.</Text>
                                ) : (
                                    patients.map((patient) => (
                                        <View key={patient.id} style={styles.patientItem}>
                                            <Text style={styles.patientText}>{patient.ad} {patient.soyad}</Text>
                                            <TouchableOpacity
                                                style={styles.deleteButton}
                                                onPress={() => handleDeletePatient(patient.id)}
                                            >
                                                <Text style={styles.deleteButtonText}>Sil</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))
                                )}
                            </View>
                        )}
                    </View>
                </ScrollView>

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
        flexShrink: 0,
        justifyContent: "center"
    },
    scrollContent: {
        width: "100%",
        padding: 16,
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
        alignItems: "center", // Bu zaten var, yatayda ortalamayı sağlar
        justifyContent: "center",
        flexDirection: "column", // Dikeyde ortalamak için
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
        fontWeight: "bold",
        textAlign: "center", // Metni yatayda ortalar
        marginTop: 10,
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
    patientItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
    },
    deleteButton: {
        backgroundColor: '#FF4C4C',
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    deleteButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },

});

export default DrHastalar;