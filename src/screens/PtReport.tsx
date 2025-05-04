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


    // Bugün raporu doldurulmuş mu kontrol et
    useEffect(() => {
        const checkTodayReport = async () => {
            try {
                // Bugünün tarihi formatını oluştur
                const todayDate = new Date(today);
                const todayStart = new Date(todayDate.setHours(0, 0, 0, 0));
                const todayEnd = new Date(todayDate.setHours(23, 59, 59, 999));

                console.log("Bugün başlangıç tarihi:", todayStart);
                console.log("Bugün bitiş tarihi:", todayEnd);

                // Raporları sorgula
                const q = query(
                    collection(db, "reports"),
                    where("patientId", "==", patientId),
                    where("doctorId", "==", doctorId),
                    where("hastalikId", "==", hastalikId),
                    where("date", ">=", todayStart),
                    where("date", "<=", todayEnd),
                    where("isFilled", "==", true) // Raporun doldurulmuş olduğunu kontrol et
                );
                const querySnapshot = await getDocs(q);

                console.log("Firestore'dan gelen veriler:", querySnapshot.docs.map(doc => doc.data()));


                if (!querySnapshot.empty) {
                    setTodayReportFilled(true);  // Rapor varsa, doldurulmuş olarak işaretle
                } else {
                    setTodayReportFilled(false); // Rapor yoksa, doldurulmamış olarak işaretle
                }
            } catch (error) {
                console.error("Rapor kontrolü sırasında bir hata oluştu:", error);
                Alert.alert("Hata", "Rapor kontrolü sırasında bir hata oluştu.");
            }
        };

        checkTodayReport(); // Raporu kontrol et
    }, [today, patientId, doctorId, hastalikId]);

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
                    const date = data.date; // Burada date'yi alıyoruz

                    console.log("Raw date:", date);  // Raw date'i kontrol et

                    // Eğer date bir Firestore Timestamp ise, onu JavaScript Date objesine çeviriyoruz
                    // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
                    let reportDate;
                    if (date instanceof Timestamp) {
                        // Firestore Timestamp'ı UTC'ye çeviriyoruz
                        reportDate = date.toDate(); // Bu adımda date UTC'ye dönüşmüş olacak
                    } else {
                        reportDate = new Date(date); // Date objesi, UTC'ye çevrilecek
                    }

                    console.log("JavaScript Date objesi:", reportDate);

                    // Tarihi 'DD.MM.YYYY' formatına çevirelim
                    const formattedDate = reportDate.toLocaleDateString("tr-TR"); // Yerel tarih formatında alalım

                    reports.push(date);
                    console.log("Formatted report date:", formattedDate); // Formatlanmış tarihi kontrol et
                });

                setReportList(reports);
            } catch (error) {
                console.error("Geçmiş raporlar çekilirken hata oluştu:", error);
                Alert.alert("Hata", "Geçmiş raporlar çekilirken bir hata oluştu.");
            }
        };

        fetchPastReports(); // Geçmiş raporları al
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
                    <Text style={styles.pFullName}>{patientName || 'Hasta adı bulunamadı'}</Text>
                    <Text style={styles.doctorName}>{doctorName || 'Doktor adı bulunamadı'}</Text>
                </View>

                <Text style={styles.sectionTitle}>Günlük Rapor</Text>

                {!todayReportFilled ? (
                    <TouchableOpacity
                        style={styles.reportButton}
                        onPress={() => navigation.navigate("PtDailyReport", {
                            patientId: patientId,
                            patientName: patientName,
                            doctorName: doctorName,
                            doctorId: doctorId,
                            hastalikId: hastalikId,
                            hastalik: hastalik,
                            date: today,
                        })}
                    >
                        <Ionicons name="checkmark-circle" size={24} color="gray" style={{ marginRight: 8 }} />
                        <Text style={styles.reportButtonText}>Günlük Raporu Doldur</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.reportButton}>
                        <Ionicons name="checkmark-circle" size={24} color="white" style={{ marginRight: 8 }} />
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
                                        date: reportDate, // Burada 'reportDate' doğru şekilde kullanılıyor
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
        alignItems: "center",
        justifyContent: "center",
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
