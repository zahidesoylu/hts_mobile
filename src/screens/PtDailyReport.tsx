import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRoute, type RouteProp } from "@react-navigation/native";
import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../src/config/firebaseConfig";
import BottomMenu from "@/components/ui/BottomMenu";

type PtDailyReportRouteParams = {
    PtDailyReport: {
        patientId: string;
        patientName: string;
        doctorName: string;
        doctorId: string;
    };
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const PtDailyReport = ({ navigation }: any) => {
    const route = useRoute<RouteProp<PtDailyReportRouteParams, "PtDailyReport">>();
    const { patientId, doctorId } = route.params;

    const [feeling, setFeeling] = useState("");
    const [painLevel, setPainLevel] = useState("");
    const [medication, setMedication] = useState("");

    const handleSave = async () => {
        const today = new Date().toISOString().split("T")[0];
        try {
            await addDoc(collection(db, "reports"), {
                patientId,
                doctorId,
                date: today,
                feeling,
                painLevel,
                medication,
                createdAt: new Date(),
            });

            Alert.alert("Başarılı", "Günlük rapor kaydedildi.");
            navigation.goBack(); // veya navigation.navigate("PtReport")
        } catch (error) {
            Alert.alert("Hata", "Rapor kaydedilirken bir hata oluştu.");
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.innerContainer}>
                <Text style={styles.title}>Günlük Rapor</Text>

                <Text style={styles.label}>Bugün nasılsınız?</Text>
                <TextInput
                    style={styles.input}
                    placeholder="İyi, kötü, orta..."
                    value={feeling}
                    onChangeText={setFeeling}
                />

                <Text style={styles.label}>Ağrı seviyeniz (0-10):</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Örn: 5"
                    value={painLevel}
                    onChangeText={setPainLevel}
                    keyboardType="numeric"
                />

                <Text style={styles.label}>İlaç kullandınız mı?</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Evet / Hayır"
                    value={medication}
                    onChangeText={setMedication}
                />

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Kaydet</Text>
                </TouchableOpacity>
            </View>
            <BottomMenu /> {/* BottomMenu bileşenini ekleyin */}
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
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
    },
    label: {
        alignSelf: "flex-start",
        marginTop: 10,
        fontWeight: "bold",
        fontSize: 14,
    },
    input: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginTop: 5,
        marginBottom: 10,
        backgroundColor: "#f9f9f9",
    },
    saveButton: {
        backgroundColor: "#4CAF50",
        padding: 15,
        borderRadius: 8,
        width: "100%",
        alignItems: "center",
        marginTop: 20,
    },
    saveButtonText: {
        color: "white",
        fontWeight: "bold",
    },
});

export default PtDailyReport;
