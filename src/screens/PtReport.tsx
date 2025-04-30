import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRoute, type RouteProp } from "@react-navigation/native";
import BottomMenu from "../../src/components/ui/BottomMenu";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../src/config/firebaseConfig"; // Firestore yapılandırmanızı içe aktarın
import Ionicons from 'react-native-vector-icons/Ionicons'; // en üste ekle


type PtReportRouteParams = {
    PtReport: {
        patientId: string;
        patientName: string;
        doctorName: string;
        doctorId: string;
    };
};

// biome-ignore lint/suspicious/noExplicitAny: <açıklama>
const PtReport = ({ navigation }: any) => {
    const route = useRoute<RouteProp<PtReportRouteParams, "PtReport">>();
    const { patientId, patientName, doctorName } = route.params;

    const [todayReportFilled, setTodayReportFilled] = useState(false);
    const [reportList, setReportList] = useState<string[]>([]);

    useEffect(() => {
        const checkTodayReport = async () => {
            try {
                const today = new Date().toISOString().split("T")[0];
                const reportsRef = collection(db, "reports");
                const q = query(
                    reportsRef,
                    where("patientId", "==", patientId),
                    where("date", "==", today)
                );
                const snapshot = await getDocs(q);
                setTodayReportFilled(!snapshot.empty);
            } catch (error) {
                console.log("Bugünkü rapor kontrolü başarısız:", error);
            }
        };
        const fetchReports = async () => {
            try {
                const reportsRef = collection(db, "reports");
                const q = query(
                    reportsRef,
                    where("patientId", "==", patientId)
                );
                const snapshot = await getDocs(q);
                const reports = snapshot.docs.map((doc) => doc.data().date);
                const sorted = reports.sort().reverse(); // yeni raporlar başta
                setReportList(sorted);
            } catch (error) {
                console.log("Geçmiş raporlar alınamadı:", error);
            }
        };

        checkTodayReport();
        fetchReports();
    }, [patientId]);

    useEffect(() => {
        setTodayReportFilled(true);  // Manuel olarak raporun doldurulmuş olduğunu işaretliyoruz
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
                    <Text style={styles.pFullName}>{patientName || 'Hasta adı bulunamadı'}</Text>
                    <Text style={styles.doctorName}>{doctorName || 'Doktor adı bulunamadı'}</Text>
                </View>

                <Text style={styles.sectionTitle}>Günlük Rapor</Text>

                {!todayReportFilled ? (
                    <TouchableOpacity
                        style={styles.reportButton}
                        onPress={() => navigation.navigate("PtDailyReport", route.params)}
                    >
                        <Ionicons name="checkmark-circle" size={24} color="gray" style={{ marginRight: 8 }} /> {/* Tik işareti gri olacak */}
                        <Text style={styles.reportButtonText}>Günlük Raporu Doldur</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.reportButton}>
                        <Ionicons name="checkmark-circle" size={24} color="white" style={{ marginRight: 8 }} /> {/* Tik işareti beyaz olacak */}
                        <Text style={styles.reportButtonText}>Bugünkü rapor dolduruldu</Text>
                    </View>
                )}



                <Text style={styles.sectionTitle}>Geçmiş Raporlar</Text>
                <ScrollView style={{ width: "100%" }}>
                    {reportList.length === 0 ? (
                        <Text style={styles.infoText}>Geçmiş bir raporunuz bulunmamaktadır.</Text>
                    ) : (
                        reportList.map((reportDate, index) => (
                            <TouchableOpacity
                                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                                key={index}
                                style={styles.reportCard}
                                onPress={() =>
                                    navigation.navigate("ReportDetail", {
                                        patientId,
                                        date: reportDate,
                                    })
                                }
                            >
                                <Text>{reportDate}</Text>
                            </TouchableOpacity>
                        ))
                    )}
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
    },
    innerContainer: {
        width: 400,
        height: 600,
        backgroundColor: "white",
        padding: 20,
        marginTop: 20,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        alignItems: "center",
    },
    dateText: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    infoBox: {
        backgroundColor: '#e6f0ff',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 15,
        width: '100%',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    pFullName: {
        fontSize: 18,
        fontWeight: "bold",
    },
    doctorName: {
        fontSize: 14,
        color: "gray",
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        alignSelf: "flex-start",
        marginVertical: 10,
    },
    reportButton: {
        backgroundColor: "#336699", // Aynı mavi renk
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        width: "100%",
        alignItems: "center",
        flexDirection: "row", // İçeriği yatayda hizalamak için
        justifyContent: "center", // İçeriği ortalamak için
        position: "relative", // İçeriği ortalamak için
    },
    reportButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,  // Aynı yazı tipi boyutu
    },
    reportCard: {
        backgroundColor: "#eee",
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    infoText: {
        fontStyle: "italic",
        color: "gray",
        marginBottom: 10,
    },
    reportFilledBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2e7d32",
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        width: "100%",
    },

});

export default PtReport;
