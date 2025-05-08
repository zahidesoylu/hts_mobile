import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useRoute, type RouteProp } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { doc, getDoc, addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../src/config/firebaseConfig";
import BottomMenu from "@/components/ui/BottomMenu";
import { Timestamp } from 'firebase/firestore';
import { analyseReport } from "@/utils/gemini"; // AI ile analiz için fonksiyon


type PtDailyReportParams = {
    PtDailyReport: {
        patientId: string;
        patientName: string;
        doctorId: string;
        doctorName: string;
        hastalikId: string;
        date: string;
    };
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const PtDailyReport = ({ navigation }: any) => {
    const route = useRoute<RouteProp<PtDailyReportParams, "PtDailyReport">>();
    const {
        patientId,
        patientName,
        doctorName,
        doctorId,
        hastalikId,
        date,
    } = route.params;
    console.log("Hastalık ID:", route.params.hastalikId); // Hastalık ID'sini konsola yazdırıyoruz
    console.log("Hasta ID:", route.params.patientId); // Hasta ID'sini konsola yazdırıyoruz          
    console.log("Hasta Adı:", route.params.patientName); // Hasta adını konsola yazdırıyoruz
    console.log("Doktor ID:", route.params.doctorId); // Doktor ID'sini konsola yazdırıyoruz
    console.log("Doktor Adı:", route.params.doctorName); // Doktor adını konsola yazdırıyoruz
    console.log("Tarih:", route.params.date); // Tarihi konsola yazdırıyoruz

    const [questions, setQuestions] = useState<string[]>([]);
    const [answers, setAnswers] = useState<string[]>([]);
    const [hastalikName, setHastalikName] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [todayReportFilled, setTodayReportFilled] = useState(false);


    useEffect(() => {
        checkTodayReport(); // Sayfa yüklendiğinde rapor durumu kontrolü yapılacak
    }, []);

    // Bugünkü raporun doldurulup doldurulmadığını kontrol et
    const checkTodayReport = async () => {
        try {
            const now = new Date();
            const todayStart = new Date(now);
            todayStart.setHours(0, 0, 0, 0);

            const todayEnd = new Date(now);
            todayEnd.setHours(23, 59, 59, 999);

            const q = query(
                collection(db, "reports"),
                where("patientId", "==", patientId),
                where("reportDate", ">=", Timestamp.fromDate(todayStart)),
                where("reportDate", "<=", Timestamp.fromDate(todayEnd)),
            );

            const querySnapshot = await getDocs(q);


            if (!querySnapshot.empty) {
                setTodayReportFilled(true); // Eğer rapor doldurulmuşsa
            } else {
                setTodayReportFilled(false); // Eğer rapor doldurulmamışsa
            }
        } catch (error) {
            console.error("Rapor kontrolü sırasında bir hata oluştu:", error);
            Alert.alert("Hata", "Rapor kontrolü sırasında bir hata oluştu.");
        }
    };


    // Hastalık bilgilerini ve soruları al
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const ref = doc(db, "hastaliklar", hastalikId);
                const snap = await getDoc(ref);

                if (snap.exists()) {
                    const data = snap.data();

                    let questionList = data.soruListesi;
                    if (typeof questionList === 'string') {
                        questionList = questionList.split(",");
                    }

                    if (Array.isArray(questionList)) {
                        setQuestions(questionList);
                        setAnswers(new Array(questionList.length).fill(""));
                    } else {
                        console.error("soruListesi bir dizi değil:", questionList);
                        Alert.alert("Hata", "Hastalık soruları uygun formatta değil.");
                    }

                    setHastalikName(data.hastalik || "");
                } else {
                    Alert.alert("Hata", "Hastalık bilgisi bulunamadı.");
                }
            } catch (err) {
                console.error("Hastalık verisi alınamadı:", err);
                Alert.alert("Hata", "Veri alınırken sorun oluştu.");
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [hastalikId]);

    const handleSave = async () => {
        if (answers.some((ans) => ans.trim() === "")) {
            Alert.alert("Uyarı", "Lütfen tüm soruları cevaplayınız.");
            return;
        }

        try {
            // Soruları ve cevapları formatla
            let reportContent = "";
            questions.forEach((question, index) => {
                const cleanedQuestion = question.trim().replace(/^"|"$/g, "");
                const answer = answers[index].trim();
                reportContent += `${cleanedQuestion}: ${answer}\n`;
            });

            // Veriyi AI'ye gönder
            const analysisResult = await analyseReport(reportContent);

            // Raporu Firestore'a kaydet
            const reportData = {
                patientId,
                patientName,
                doctorId,
                doctorName,
                reportDate: Timestamp.now(),
                hastalikId,
                hastalik: hastalikName,
                cevapListesi: answers,
                soruListesi: questions,
                isFilled: true,
                aiCategory: analysisResult.category,  // AI'dan gelen kategori
                aiDescription: analysisResult.description,  // AI'dan gelen açıklama
                aiNote: analysisResult.note,  // AI'dan gelen not
            };

            // Konsola veriyi yazdır
            console.log("Firestore'a kaydedilecek veriler:", reportData);

            // Raporu Firestore'a kaydet
            await addDoc(collection(db, "reports"), reportData)

            Alert.alert("Başarılı", "Rapor kaydedildi.");
            navigation.goBack();
        } catch (error) {
            console.error("Rapor kaydı başarısız:", error);
            Alert.alert("Hata", "Rapor kaydedilirken sorun oluştu.");
        }
    };


    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    console.log("checkTodayReport input:", { patientId, doctorId, hastalikId });


    return (
        <View style={styles.container}>
            <View style={styles.innerContainer}>
                <View style={styles.infoBox}>
                    <Text style={styles.title}>{date} - Günlük Rapor</Text>
                    <Text style={styles.subtitle}>Doktor: {doctorName}</Text>
                    <Text style={styles.subtitle}>Hasta: {patientName}</Text>
                    <Text style={styles.subtitle}>Hastalık: {hastalikName}</Text>
                </View>

                <ScrollView style={styles.questionsContainer} contentContainerStyle={{ paddingBottom: 20 }}>
                    {questions.map((question, index) => {
                        const cleanedQuestion = question.trim().replace(/^"|"$/g, "");
                        return (
                            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                            <View key={index} style={styles.questionBox}>
                                <Text style={styles.question}>
                                    {index + 1}. {cleanedQuestion}
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Cevabınızı yazınız"
                                    value={answers[index]}
                                    onChangeText={(text) => {
                                        const newAnswers = [...answers];
                                        newAnswers[index] = text;
                                        setAnswers(newAnswers);
                                    }}
                                />
                            </View>
                        );
                    })}
                    <TouchableOpacity
                        style={[styles.saveButton, todayReportFilled && { backgroundColor: "#ccc" }]}
                        onPress={handleSave}
                        disabled={todayReportFilled}
                    >
                        <Text style={styles.saveButtonText}>
                            {todayReportFilled ? "Bugünkü Rapor Dolduruldu" : "Kaydet"}
                        </Text>
                    </TouchableOpacity>

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
        marginTop: 20,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        alignItems: "center",
        justifyContent: "space-between",
    },
    infoBox: {
        backgroundColor: '#e6f0ff',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        width: '100%',
        height: 120,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        marginBottom: 20, // Bilgi kutusu ile sorular arasında boşluk
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: "#333", // Başlık için daha koyu bir renk
        marginBottom: 5,
    },
    questionsContainer: {
        maxHeight: 420,
        width: "100%",
        padding: 10,
    },
    subtitle: {
        fontSize: 12,
        color: "#555", // Alt başlıklar için daha hafif bir gri
        marginBottom: 8,
    },
    questionBox: {
        marginBottom: 20,
    },
    question: {
        fontSize: 12,
        fontWeight: "600",
        color: "#333", // Sorular için daha dikkat çekici bir renk
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd", // Daha açık bir kenarlık rengi
        borderRadius: 12, // Yumuşak köşeler
        padding: 12,
        marginTop: 10,
        fontSize: 12,
        color: "#333",
    },
    saveButton: {
        backgroundColor: "#336699", // Canlı bir mor renk
        padding: 6,
        borderRadius: 12,
        alignItems: "center",
        width: "50%", // Buton genişliğini %50 ile sınırladık
        alignSelf: "center", // Butonu ortaladık
        shadowColor: "#000", // Buton için gölge efekti
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
    },
    saveButtonText: {
        color: "#fff",
        fontWeight: "700", // Daha belirgin bir yazı tipi
        fontSize: 12,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    activityIndicator: {
        paddingTop: 20, // ActivityIndicator'a biraz boşluk
    },
});

export default PtDailyReport;
