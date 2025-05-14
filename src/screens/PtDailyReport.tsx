import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useRoute, type RouteProp } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
    doc,
    getDoc,
    addDoc,
    collection,
    query,
    where,
    getDocs,
    Timestamp,
} from "firebase/firestore";
import { db } from "../../src/config/firebaseConfig";
import BottomMenu from "@/components/ui/BottomMenu";
import { analyseReport } from "@/utils/gemini";
import * as Speech from "expo-speech";
import VoiceInput from "@/components/ui/VoiceInput";

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

    const [questions, setQuestions] = useState<string[]>([]);
    const [answers, setAnswers] = useState<string[]>([]);
    const [recognizedText, setRecognizedText] = useState<string>("");
    const [hastalikName, setHastalikName] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [todayReportFilled, setTodayReportFilled] = useState(false);

    const handleSpeechResult = (recognizedText: string) => {
        setRecognizedText(recognizedText);
    };

    const handleSpeechStart = () => {
        console.log("Dinleme başladı");
    };

    useEffect(() => {
        checkTodayReport();
    }, []);

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
                where("reportDate", "<=", Timestamp.fromDate(todayEnd))
            );

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                setTodayReportFilled(true);
            } else {
                setTodayReportFilled(false);
            }
        } catch (error) {
            console.error("Rapor kontrolü hatası:", error);
            Alert.alert("Hata", "Rapor kontrolü sırasında bir hata oluştu.");
        }
    };

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const ref = doc(db, "hastaliklar", hastalikId);
                const snap = await getDoc(ref);

                if (snap.exists()) {
                    const data = snap.data();
                    let questionList = data.soruListesi;

                    if (typeof questionList === "string") {
                        questionList = questionList.split(",");
                    }

                    if (Array.isArray(questionList)) {
                        setQuestions(questionList);
                        setAnswers(new Array(questionList.length).fill(""));
                    } else {
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
            let reportContent = "";
            questions.forEach((question, index) => {
                const cleanedQuestion = question.trim().replace(/^"|"$/g, "");
                const answer = answers[index].trim();
                reportContent += `${cleanedQuestion}: ${answer}\n`;
            });

            const analysisResult = await analyseReport(reportContent);

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
                aiCategory: analysisResult.category,
                aiDescription: analysisResult.description,
                aiNote: analysisResult.note,
            };

            await addDoc(collection(db, "reports"), reportData);

            setTodayReportFilled(true); // Kaydedildiği için buton durumu güncellenir


            Alert.alert("Başarılı", "Rapor kaydedildi.");
            navigation.goBack();
        } catch (error) {
            console.error("Rapor kaydı başarısız:", error);
            Alert.alert("Hata", "Rapor kaydedilirken sorun oluştu.");
        }
    };

    const dinle = (text: string) => {
        Speech.speak(text);
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.innerContainer}>
                <View style={styles.infoBox}>
                    <Text style={styles.title}>{date} - Günlük Rapor</Text>
                    <Text style={styles.subtitle}>Doktor: {doctorName}</Text>
                    <Text style={styles.subtitle}>Hasta: {patientName}</Text>
                    <Text style={styles.subtitle}>Hastalık: {hastalikName}</Text>
                </View>

                <ScrollView
                    style={styles.questionsContainer}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false} // Kaydırma çubuğunu gizler
                >
                    {questions.map((question, index) => {
                        const cleanedQuestion = question.trim().replace(/^"|"$/g, "");
                        return (
                            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                            <View key={index} style={styles.questionBox}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <TouchableOpacity onPress={() => dinle(cleanedQuestion)}>
                                        <Text style={[styles.question, { marginLeft: 4 }]}>🔊</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.question}>
                                        {index + 1}.
                                    </Text>
                                    <Text style={[styles.question, { marginLeft: 4 }]}>
                                        {cleanedQuestion}
                                    </Text>
                                </View>
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
                                <View style={[styles.assistantButtons]}>
                                    <VoiceInput onSpeechStart={handleSpeechStart} onSpeechResult={handleSpeechResult} />
                                    <TouchableOpacity style={styles.saveButton2}
                                        onPress={() => {
                                            const updatedAnswers = [...answers];
                                            updatedAnswers[index] = recognizedText;
                                            setAnswers(updatedAnswers);
                                        }}>
                                        <Text style={styles.saveButtonText2}>🎙️Cevabını Kaydet</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}

                    <TouchableOpacity
                        style={[styles.saveButton, todayReportFilled && { backgroundColor: "#ccc" }]}
                        onPress={handleSave}
                        disabled={todayReportFilled}
                        activeOpacity={0.7} // Tıklama efekti ekler (opacity düşer)

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
        borderWidth: 2,
        borderColor: "#183B4E",
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        padding: 20,
        marginTop: 20,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: -2,

    },
    infoBox: {
        backgroundColor: '#2E5077',
        padding: 15,
        borderRadius: 10,
        marginVertical: 15,
        width: '100%',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    title: {
        fontSize: 15,
        fontWeight: "bold",
        marginBottom: 5,
        color: "white",
    },
    subtitle: {
        fontSize: 12,
        marginBottom: 2,
        color: "white",

    },
    questionsContainer: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: "#183B4E",
        borderRadius: 10,
        overflow: 'hidden', // Kaydırma çubuğunun görünmesini engeller

    },
    questionBox: {
        marginBottom: 20,
    },
    question: {
        marginTop: 12,
        marginLeft: 5,
        fontSize: 12,
        fontWeight: "400",
        marginBottom: 5,

    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        fontSize: 12,
        backgroundColor: "#fff",
        margin: 5,


    },
    assistantButtons: {
        flexDirection: "row", // Butonları yatay hizalar
        justifyContent: "space-between", // Butonlar arasında boşluk bırakır
        alignItems: "center",
    },
    assistantButtonText: {
        fontSize: 14,
        color: "#007AFF",
    },
    saveButton: {
        backgroundColor: "#2E5077",
        justifyContent: "center",
        alignItems: "center",
        padding: 5,
        borderRadius: 15,
        marginTop: 10,
        opacity: 1, // Opaklık normal
        width: 100,
        alignSelf: "center",
    },
    saveButtonText: {
        color: "white",
        fontSize: 12,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    saveButton2: {
        width: 105,
        height: 30,
        backgroundColor: "#2E5077",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 25,
        marginTop: 10,
    },
    saveButtonText2: {
        color: "white",
        fontSize: 11,
    }
});

export default PtDailyReport;
