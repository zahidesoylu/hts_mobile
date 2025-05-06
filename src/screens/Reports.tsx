import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db, auth } from "../../src/config/firebaseConfig";
import BottomMenu from "@/components/ui/BottomMenu";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const Reports = ({ navigation, route }: any) => {
    const [expanded, setExpanded] = useState<string | null>(null);
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { doctorName, doctorId } = route.params; // route.params'dan doktor adını alıyoruz
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const [patientReports, setPatientReports] = useState<{ [patientId: string]: any[] }>({});

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const userId = auth.currentUser?.uid;
                if (!userId) {
                    console.error("Doktor kimliği alınamadı.");
                    return;
                }
                console.log("Giriş yapan doktor ID'si:", userId);

                // Firestore'dan hastaları çekmek için query oluşturuyoruz
                const patientsRef = collection(db, "patients");
                const q = query(patientsRef, where("doctorId", "==", userId));
                const querySnapshot = await getDocs(q);

                // Verileri mapleyip hastaların listesini oluşturuyoruz
                const patientList = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ad: data.ad,
                        soyad: data.soyad,
                    };
                });

                setPatients(patientList); // Hastalar listesini state'e set ediyoruz
            } catch (error) {
                console.error("Hastalar alınırken hata oluştu:", error);
            } finally {
                setLoading(false); // Yükleme işlemi tamamlandı
            }
        };

        fetchPatients();
    }, []);

    // Bir hastanın raporlarını çekme fonksiyonu
    const fetchReports = async (patientId: string) => {
        try {
            const reportsRef = collection(db, "reports");
            const q = query(reportsRef, where("patientId", "==", patientId));
            const querySnapshot = await getDocs(q);

            const reportList = querySnapshot.docs.map(doc => {
                const data = doc.data();
                console.log("Rapor verisi:", data); // 👈 Burada konsola yazdırıyoruz

                return {
                    id: doc.id,
                    raporTarihi: data.reportDate?.toDate().toLocaleDateString("tr-TR") || "Tarih belirtilmemiş",
                    sorular: data.soruListesi || [],
                    cevaplar: data.cevapListesi || [],
                    doktorAdi: data.doctorName || "Doktor adı yok",
                    hastaAdi: data.patientName || "Hasta adı yok",
                    hastalik: data.hastalik || "Hastalık belirtilmemiş"
                };
            });


            // Her hasta ID'sine göre state'e ekle
            setPatientReports(prev => ({
                ...prev,
                [patientId]: reportList,
            }));
        } catch (error) {
            console.error("Raporlar alınırken hata oluştu:", error);
        }
    };

    // Hasta adına tıklandığında raporları açma veya kapama işlemi
    const handleExpand = (id: string) => {
        if (expanded === id) {
            setExpanded(null);  // Aynı hastaya tekrar tıklanırsa kapanacak
        } else {
            setExpanded(id);  // Raporları açmak için hastanın ID'si ile genişletiyoruz
            fetchReports(id);  // Raporları almak için fetchReports fonksiyonunu çağırıyoruz
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;  // Yükleme yapılırken gösterilen spinner
    }


    return (
        <View style={styles.container}>
            <View style={styles.innerContainer}>

                {/* Info Box */}
                <View style={styles.infoBox}>
                    <Text style={styles.doctorName}>{doctorName}</Text>
                </View>


                <View style={styles.patientListContainer}>
                    <FlatList
                        data={patients}
                        renderItem={({ item }) => (
                            <View style={styles.patientItem}>
                                <TouchableOpacity onPress={() => handleExpand(item.id)}>
                                    <Text style={styles.patientName}>{item.ad} {item.soyad}</Text>
                                </TouchableOpacity>

                                {expanded === item.id && (
                                    patientReports[item.id]?.length > 0 ? (
                                        patientReports[item.id].map((report) => (
                                            <TouchableOpacity
                                                key={report.id}
                                                style={styles.reportTouchable}
                                                onPress={() =>
                                                    navigation.navigate("ReportDetail", {
                                                        report,
                                                        doctorName,
                                                    })
                                                }
                                            >
                                                <Text style={styles.reportDate}>📄 {report.raporTarihi}</Text>
                                            </TouchableOpacity>
                                        ))
                                    ) : (
                                        <Text style={styles.reportDate}>Bu hastaya ait rapor bulunamadı.</Text>
                                    )
                                )}
                            </View>
                        )}
                        keyExtractor={(item) => item.id}
                    />
                </View>


                {/* Bottom Menu */}
                <BottomMenu />
            </View>
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
    infoBox: {
        padding: 15,
        backgroundColor: "#2F4F4F",
        marginBottom: 20,
        borderRadius: 8,
        alignItems: "center",
        width: "100%",
    },
    reportTouchable: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
        marginTop: 4,
    },
    doctorName: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    patientListContainer: {
        flex: 1,
        marginTop: 20,
        width: "100%",
    },
    patientItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderColor: "#ddd",
    },
    patientName: {
        fontSize: 16,
        fontWeight: "bold",
    },
    reportDate: {
        fontSize: 14,
        color: "#888",
        marginTop: 5,
    },
    menuItem: {
        alignItems: "center",
    },
    menuText: {
        color: "white",
        marginTop: 5,
    },
});

export default Reports;

