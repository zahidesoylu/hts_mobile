import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import BottomMenu from "../../src/components/ui/BottomMenu";


interface ReportParams {
    report: {
        raporTarihi: string;
        hastaAdi: string;
        hastalik?: string;
        sorular: string[];
        cevaplar: string[];
    };
    doctorName: string;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const ReportDetail = ({ route }: any) => {
    const { report, doctorName } = route.params;
    console.log("ReportDetail route params:", route.params); // route.params'ı konsola yazdırıyoruz

    return (
        <View style={styles.container}>
            <View style={styles.innerContainer}>
                {/* Üstte Doktor/Hasta Bilgisi */}
                <View style={styles.infoBox}>
                    <Text style={styles.title}>{report.raporTarihi} Rapor Detayı</Text>
                    <Text style={styles.subtitle}>{doctorName}</Text>
                    <Text style={styles.subtitle}>Hasta: {report.hastaAdi}</Text>
                    <Text style={styles.subtitle}>Kronik Hastalık: {report.hastalik || "-"}</Text>

                </View>

                {/* Sayfa İçeriği */}
                <View style={styles.scrollContainer}>
                    <ScrollView contentContainerStyle={styles.content}>

                        {report.sorular.map((soru: string, index: number) => (
                            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                            <View key={index} style={styles.qaContainer}>
                                <Text style={styles.question}>
                                    Soru {index + 1}: {soru.replace(/["\n]/g, "").trim()}
                                </Text>
                                <Text style={styles.answer}>Cevap: {report.cevaplar[index]}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>
                <View style={styles.resultContainer}>
                    <Text style={styles.resultTitle}>Rapor Sonucu</Text>

                    <View style={[styles.resultBox, styles.resultFollowUp]}>
                        <Text style={styles.resultText}>Takip Gerektiriyor</Text>
                    </View>
                </View>

                {/* En Altta Menü */}
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
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    infoBox: {
        backgroundColor: '#e6f0ff',
        borderRadius: 8,
        alignItems: "center",
        width: "100%",
    },
    scrollContainer: {
        flex: 1,
        marginTop: 20,
        width: "100%",
    },
    content: {
        padding: 16,
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 5,
        color: "#1976D2",
    },
    subtitle: {
        fontSize: 12,
        marginBottom: 6,
        color: "#424242",
    },
    patientName: {
        fontSize: 16,
        fontWeight: "bold",
    },
    qaContainer: {
        marginBottom: 14,
        backgroundColor: '#e6f0ff',
        padding: 10,
        borderRadius: 8,
    },
    question: {
        fontWeight: "500",
        fontSize: 10,
        marginBottom: 4,
    },
    answer: {
        fontSize: 10,
        color: "#37474F",
    },
    resultContainer: {
        marginTop: 24,
        padding: 16,
        backgroundColor: "#f8f8f8",
        borderRadius: 12,
        flexDirection: 'row', // Satırda hizalamayı sağlıyor
        justifyContent: 'space-between', // Sol ve sağdaki elemanları birbirine uzaklaştırıyor
        alignItems: 'center', // Dikeyde ortalamayı sağlıyor
        height: 60,  // Sabit bir yükseklik değeri
        width: 300,
    },
    resultTitle: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#333",
        flex: 1, // Sol tarafta yer alacak kısmı büyütüyor
    },
    resultBox: {
        paddingVertical: 2,
        paddingHorizontal: 24,
        borderRadius: 10,
        backgroundColor: "#F44336", // Kırmızı arka plan
        justifyContent: "center",
        alignItems: "center",
        width: 120, // Minimum genişlik
    },
    resultText: {
        color: "white",
        fontWeight: "200",
        fontSize: 12,
        textAlign: "center",
    },
    resultGood: {
        backgroundColor: "#4CAF50", // yeşil
    },

    resultNormal: {
        backgroundColor: "#FFC107", // sarı
    },

    resultFollowUp: {
        backgroundColor: "#F44336", // kırmızı
        transform: [{ scale: 1.05 }], // Hover benzeri etkileşim için hafif büyütme efekti
    },

});

export default ReportDetail;
