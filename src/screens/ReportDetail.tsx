import React, { useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import BottomMenu from "../../src/components/ui/BottomMenu";
import { analyseReport } from "@/utils/gemini";
import { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../config/firebaseConfig";


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
    const [reportResult, setReportResult] = useState<string>("");

    const [isQAOpen, setIsQAOpen] = useState(false);

    const { report, doctorName } = route.params;
    const reportId = report.id;
    console.log("ReportDetail route params:", route.params); // route.params'ı konsola yazdırıyoruz
    const [aiCategory, setAiCategory] = useState("");
    const [aiDescription, setAiDescription] = useState("");
    const [aiNote, setAiNote] = useState("");
    const [isResultOpen, setIsResultOpen] = useState(false);

    useEffect(() => {
        const fetchReportResult = async () => {
            try {
                const docRef = doc(db, "reports", reportId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setAiCategory(data.aiCategory || "Kategori bulunamadı");
                    setAiDescription(data.aiDescription || "Açıklama bulunamadı");
                    setAiNote(data.aiNote || "Not bulunamadı");
                } else {
                    console.warn("Rapor bulunamadı.");
                }
            } catch (err) {
                console.error("Rapor verisi alınırken hata:", err);
            }
        };

        fetchReportResult();
    }, [reportId]);


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

                {/* Soru & Cevap Kutusu (Açılır/Kapanır) */}
                <View style={styles.resultContainer}>
                    <Text style={styles.resultTitle}>Sorular & Cevaplar</Text>

                    <TouchableOpacity
                        style={[
                            styles.resultBox,
                            isQAOpen ? styles.resultGood : styles.resultNormal,
                        ]}
                        onPress={() => setIsQAOpen(!isQAOpen)}
                    >
                        <Text style={styles.resultText}>
                            {isQAOpen ? "Gizle" : "Görüntüle"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {isQAOpen && (
                    <View style={[styles.qaBox]}>
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
                )}

                {/* Rapor Sonucu */}
                <View style={styles.resultContainer}>
                    <Text style={styles.resultTitle}>Rapor Sonucu</Text>
                    <TouchableOpacity
                        style={[styles.resultBox, isResultOpen ? styles.resultGood : styles.resultNormal]}
                        onPress={() => setIsResultOpen(!isResultOpen)}
                    >
                        <Text style={styles.resultText}>
                            {isResultOpen ? "Sonucu Gizle" : "Sonucu Görüntüle"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {isResultOpen && (
                    <ScrollView style={[styles.resultContent, { maxHeight: 250 }]} nestedScrollEnabled={true}>
                        <View style={styles.resultItem}>
                            <Text style={styles.itemTitle}>📌 Kategori</Text>
                            <Text style={styles.itemText}>{aiCategory}</Text>
                        </View>
                        <View style={styles.resultItem}>
                            <Text style={styles.itemTitle}>🧠 Not</Text>
                            <Text style={styles.itemText}>{aiNote}</Text>
                        </View>
                        <View style={styles.resultItem}>
                            <Text style={styles.itemTitle}>📝 Açıklama</Text>
                            <Text style={styles.itemText}>{aiDescription}</Text>
                        </View>
                    </ScrollView>
                )}

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
        backgroundColor: "#2E5077", // istediğin renk
        width: 300,
        padding: 15,
        height: 140,
        marginBottom: 35,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",

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
        color: "white",
        alignSelf: "center",
    },
    subtitle: {
        fontSize: 12,
        marginBottom: 6,
        color: "white",
    },
    resultText: {
        color: "black",
        fontWeight: "200",
        fontSize: 12,
        textAlign: "center",
    },
    resultContent: {
        backgroundColor: "#e6f0ff",
        padding: 10,
        borderRadius: 10,
        marginTop: 10,
        width: 300,
    },
    resultNormal: {
        backgroundColor: "#1976D2",
    },
    resultGood: {
        backgroundColor: "rgba(25, 118, 210, 0.7)", // Daha şeffaf mavi
    },
    resultItem: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    itemTitle: {
        fontWeight: '600',
        fontSize: 12,
        marginBottom: 6,
        color: '#0f172a',
    },
    itemText: {
        fontSize: 10,
        color: '#334155',
        lineHeight: 20,
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
        borderWidth: 1,
        borderColor: "2E5077",
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
        width: 90, // Minimum genişlik
        height: 35, // Minimum yükseklik
    },
    resultFollowUp: {
        backgroundColor: "#F44336", // kırmızı
        transform: [{ scale: 1.05 }], // Hover benzeri etkileşim için hafif büyütme efekti
    },
    buttonContainer: {
        marginTop: 16,
        alignItems: "center",
    },
    button: {
        backgroundColor: "#1976D2",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    buttonText: {
        color: "white",
        fontSize: 14,
        fontWeight: "bold",
    },
    qaBox: {
        maxHeight: 300,
        width: "100%",
        backgroundColor: "white",
        borderRadius: 10,
        padding: 10,
        marginTop: 10,
    },

});

export default ReportDetail;
