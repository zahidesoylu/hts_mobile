import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import BottomMenu from "../../src/components/ui/BottomMenu";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const ReportDetail = ({ route }: any) => {
    const { report, doctorName, patientName, hastalik } = route.params;
    console.log("ReportDetail route params:", route.params); // route.params'ı konsola yazdırıyoruz

    return (
        <View style={styles.container}>
            <View style={styles.innerContainer}>
                {/* Üstte Doktor/Hasta Bilgisi */}
                <View style={styles.infoBox}>
                    <Text style={styles.doctorName}>Doktor: {doctorName}</Text>
                    <Text style={styles.patientName}>Hasta: {patientName || "Seçim yapılmadı"}</Text>
                    <Text style={styles.patientName}>Hastalık: {hastalik || "-"}</Text>
                </View>

                {/* Sayfa İçeriği */}
                <ScrollView style={styles.content}>
                    <Text style={styles.title}>Rapor Detayı</Text>
                    <Text style={styles.subtitle}>Rapor Tarihi: {report.raporTarihi}</Text>
                    <Text style={styles.subtitle}>Hastalık: {report.hastalik}</Text>

                    {report.sorular.map((soru: string, index: number) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                        <View key={index} style={styles.qaContainer}>
                            <Text style={styles.question}>• {soru}</Text>
                            <Text style={styles.answer}>Cevap: {report.cevaplar[index]}</Text>
                        </View>
                    ))}
                </ScrollView>

                {/* En Altta Menü */}
                <BottomMenu />
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#E3F2FD",
        alignItems: "center",
        justifyContent: "center",
    },
    innerContainer: {
        width: 400,
        height: 600,
        backgroundColor: "#fff",
        borderRadius: 10,
        overflow: "hidden",
        paddingBottom: 60, // BottomMenu için yer bırak
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
    content: {
        padding: 16,
        flex: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#1976D2",
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 6,
        color: "#424242",
    },
    doctorName: {
        backgroundColor: "#1976D2",
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    patientName: {
        fontSize: 16,
        fontWeight: "bold",
    },
    qaContainer: {
        marginBottom: 14,
        backgroundColor: "#F1F8E9",
        padding: 10,
        borderRadius: 8,
    },
    question: {
        fontWeight: "600",
        fontSize: 15,
        marginBottom: 4,
    },
    answer: {
        fontSize: 15,
        color: "#37474F",
    },
});

export default ReportDetail;
