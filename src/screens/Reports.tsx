import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { db, auth } from "../../src/config/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import BottomMenu from "../../src/components/ui/BottomMenu";

interface Report {
    id: string;
    title: string;
    date: string;
}

interface Patient {
    id: string;
    ad: string;
    soyad: string;
}

const Reports = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [expandedPatientId, setExpandedPatientId] = useState<string | null>(null);
    const [reportsMap, setReportsMap] = useState<Record<string, Report[]>>({});
    const [loading, setLoading] = useState(true);

    // Mount durumunu izlemek için useRef
    const isMounted = useRef(true);

    useEffect(() => {
        // Cleanup fonksiyonu bileşen unmount olduğunda isMounted'i false yapar
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const doctorId = auth.currentUser?.uid;
                if (!doctorId) return;

                const patientsRef = collection(db, "patients");
                const q = query(patientsRef, where("doctorId", "==", doctorId));
                const querySnapshot = await getDocs(q);

                const fetchedPatients: Patient[] = [];
                // biome-ignore lint/complexity/noForEach: <explanation>
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    fetchedPatients.push({ id: doc.id, ad: data.ad, soyad: data.soyad });
                });

                if (isMounted.current) {
                    setPatients(fetchedPatients);
                }
            } catch (err) {
                console.log("Hasta verisi alınamadı:", err);
            } finally {
                if (isMounted.current) {
                    setLoading(false);
                }
            }
        };

        fetchPatients();
    }, []); // Sadece ilk renderda çalıştırılır

    const fetchReportsForPatient = async (patientId: string) => {
        try {
            const reportsRef = collection(db, "reports");
            const q = query(reportsRef, where("patientId", "==", patientId));
            const querySnapshot = await getDocs(q);

            const reports: Report[] = [];
            // biome-ignore lint/complexity/noForEach: <explanation>
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                reports.push({
                    id: doc.id,
                    title: data.title,
                    date: data.date,
                });
            });

            if (isMounted.current) {
                setReportsMap((prev) => ({ ...prev, [patientId]: reports }));
            }
        } catch (err) {
            console.log("Raporlar alınamadı:", err);
        }
    };

    const handlePatientPress = (patientId: string) => {
        if (expandedPatientId === patientId) {
            setExpandedPatientId(null); // kapat
        } else {
            setExpandedPatientId(patientId); // aç
            if (!reportsMap[patientId]) {
                fetchReportsForPatient(patientId);
            }
        }
    };

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
            <View style={styles.innerContainer}>
                <Text style={styles.header}>Hasta Raporları</Text>
                <ScrollView style={{ width: '100%' }}>
                    {patients.map((patient) => (
                        <View key={patient.id} style={styles.patientContainer}>
                            <TouchableOpacity onPress={() => handlePatientPress(patient.id)} style={styles.patientButton}>
                                <Text style={styles.patientName}>{patient.ad} {patient.soyad}</Text>
                                <Text style={styles.toggleIcon}>
                                    {expandedPatientId === patient.id ? "🔽" : "➕"}
                                </Text>
                            </TouchableOpacity>

                            {expandedPatientId === patient.id && (
                                <View style={styles.reportList}>
                                    {reportsMap[patient.id]?.length > 0 ? (
                                        reportsMap[patient.id].map((report) => (
                                            <View key={report.id} style={styles.reportItem}>
                                                <Text style={styles.reportTitle}>{report.title}</Text>
                                                <Text style={styles.reportDate}>{report.date}</Text>
                                            </View>
                                        ))
                                    ) : (
                                        <Text style={styles.noReportText}>Henüz rapor bulunmamaktadır.</Text>
                                    )}
                                </View>
                            )}
                        </View>
                    ))}
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
        height: 600,
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 15,
        textAlign: "center",
    },
    patientContainer: {
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        paddingBottom: 5,
    },
    patientButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
    },
    patientName: {
        fontSize: 16,
        fontWeight: "bold",
    },
    toggleIcon: {
        fontSize: 18,
    },
    reportList: {
        paddingLeft: 10,
        marginTop: 5,
    },
    reportItem: {
        backgroundColor: "#f0f0f0",
        padding: 10,
        marginBottom: 5,
        borderRadius: 5,
    },
    reportTitle: {
        fontSize: 15,
        fontWeight: "600",
    },
    reportDate: {
        fontSize: 13,
        color: "gray",
    },
    noReportText: {
        fontStyle: "italic",
        color: "#888",
        padding: 5,
    },
});

export default Reports;
