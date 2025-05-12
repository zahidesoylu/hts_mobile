import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRoute, type RouteProp } from "@react-navigation/native";
import BottomMenu from "../../src/components/ui/BottomMenu";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../../src/config/firebaseConfig"; // Firestore yapılandırmanızı içe aktarın
import Ionicons from 'react-native-vector-icons/Ionicons'; // en üste ekle


type PtReportRouteParams = {
    PtReport: {
        patientId: string;
        patientName: string;
        doctorName: string;
        doctorId: string;
        hastalikId: string;
        hastalik: string;
    };
};

// biome-ignore lint/suspicious/noExplicitAny: <açıklama>
const PtReport = ({ navigation }: any) => {
    const route = useRoute<RouteProp<PtReportRouteParams, "PtReport">>();

    const [todayReportFilled, setTodayReportFilled] = useState(false);
    const [reportList, setReportList] = useState<string[]>([]);
    const today = new Date().toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

    const {
        patientName,
        doctorName,
        patientId,
        doctorId,
        hastalikId,
        hastalik
    } = route.params;
    console.log("Route params in PtReport:", route.params);  // Parametreleri kontrol etmek için


    useEffect(() => {
        const checkTodayReport = async () => {
            try {
                const now = new Date();
                const todayStart = new Date(now.setHours(0, 0, 0, 0));
                const todayEnd = new Date(now.setHours(23, 59, 59, 999));

                console.log("Bugün başlangıç tarihi:", todayStart);
                console.log("Bugün bitiş tarihi:", todayEnd);

                const q = query(
                    collection(db, "reports"),
                    where("patientId", "==", patientId),
                    where("doctorId", "==", doctorId),
                    where("hastalikId", "==", hastalikId),
                    where("reportDate", ">=", todayStart),
                    where("reportDate", "<=", todayEnd),
                    where("isFilled", "==", true)
                );

                const querySnapshot = await getDocs(q);
                console.log("Firestore'dan gelen veriler:", querySnapshot.docs.map(doc => doc.data()));

                if (!querySnapshot.empty) {
                    setTodayReportFilled(true);
                } else {
                    setTodayReportFilled(false);
                }
            } catch (error) {
                console.error("Rapor kontrolü sırasında bir hata oluştu:", error);
                Alert.alert("Hata", "Rapor kontrolü sırasında bir hata oluştu.");
            }
        };

        checkTodayReport();
    }, [patientId, doctorId, hastalikId]);



    // Geçmiş raporları çekme
    useEffect(() => {
        const fetchPastReports = async () => {
            try {
                const q = query(
                    collection(db, "reports"),
                    where("patientId", "==", patientId),
                    where("doctorId", "==", doctorId),
                    where("hastalikId", "==", hastalikId)
                );

                const querySnapshot = await getDocs(q);
                const reports: string[] = [];

                // biome-ignore lint/complexity/noForEach: <explanation>
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const date = data.reportDate;

                    console.log("Raw date:", date);

                    // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
                    let reportDate;
                    if (date instanceof Timestamp) {
                        reportDate = date.toDate();
                    } else {
                        reportDate = new Date(date);
                    }

                    const formattedDate = reportDate.toLocaleDateString("tr-TR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                    });

                    reports.push(formattedDate);
                });

                setReportList(reports);
            } catch (error) {
                console.error("Geçmiş raporlar çekilirken hata oluştu:", error);
                Alert.alert("Hata", "Geçmiş raporlar çekilirken bir hata oluştu.");
            }
        };

        fetchPastReports();
    }, [patientId, doctorId, hastalikId]);

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
                    <Text style={styles.pFullName}>{patientName || "Hasta adı bulunamadı"}</Text>
                    <Text style={styles.doctorName}>{doctorName || "Doktor adı bulunamadı"}</Text>
                </View>

                <Text style={styles.sectionTitle}>Günlük Raporum</Text>

                {todayReportFilled ? (
                    <View style={[styles.reportButton, { backgroundColor: "#4caf50" }]}>
                        <Ionicons name="checkmark-circle" size={24} color="white" style={{ marginRight: 8 }} />
                        <Text style={styles.reportButtonText}>Bugünkü rapor dolduruldu</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.reportButton}
                        onPress={() =>
                            navigation.navigate("PtDailyReport", {
                                patientId,
                                patientName,
                                doctorName,
                                doctorId,
                                hastalikId,
                                hastalik,
                                date: today,
                            })
                        }
                    >
                        <Ionicons name="create" size={24} color="white" style={{ marginRight: 8 }} />
                        <Text style={styles.reportButtonText}>Günlük Raporu Doldur</Text>
                    </TouchableOpacity>
                )}

                <Text style={styles.sectionTitle}>Geçmiş Raporlar</Text>

                <ScrollView style={{ width: "100%" }}>
                    {reportList.length === 0 ? (
                        <Text style={styles.infoText}>Geçmiş bir raporunuz bulunmamaktadır.</Text>
                    ) : (
                        reportList.map((reportDate, index) => (
                            <View
                                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                                key={index}
                                style={styles.reportCard}
                            >
                                <Text>{reportDate}</Text>
                            </View>
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
        borderWidth: 2,
        borderColor: "#183B4E",
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        backgroundColor: "white",
        padding: 20,
        marginTop: 20,
        alignItems: "center",
        marginBottom: -2,

    },
    dateText: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    infoBox: {
        backgroundColor: '#2E5077',
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
        marginBottom: 15,
        color: "white",
    },
    doctorName: {
        fontSize: 14,
        color: "white",
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        alignSelf: "flex-start",
        marginVertical: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    reportButton: {
        backgroundColor: "#2E5077", // Aynı mavi renk
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
