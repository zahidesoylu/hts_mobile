import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomMenu from "../components/ui/BottomMenu";

// Hasta tipini tanımla
type Patient = {
    id: string;
    name: string;
};

// Mesaj tipini tanımla
type Message = {
    id: string;
    sender: string;
    text: string;
    patient: string;
    timestamp: string;
};

const DoctorMessageScreen = ({ navigation }: { navigation: any }) => {
    const [patients, setPatients] = useState<Patient[]>([
        { id: "1", name: "Ayşe Yılmaz" },
        { id: "2", name: "Mehmet Ali" },
        { id: "3", name: "Fatma Can" },
        { id: "4", name: "Ali Veli" },
        { id: "5", name: "Zeynep Kaya" },
    ]);

    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [showPatientList, setShowPatientList] = useState(false); // Hastalar listesini kontrol etmek için

    const handleSendMessage = () => {
        if (message.trim() && selectedPatient) {
            const newMessage: Message = {
                id: (messages.length + 1).toString(),
                sender: "Doktor",
                text: message,
                patient: selectedPatient.name,
                timestamp: new Date().toLocaleTimeString(),
            };
            setMessages([...messages, newMessage]);
            setMessage("");
        }
    };

    const navigateToChatScreen = () => {
        if (selectedPatient) {
            navigation.navigate("ChatScreen", { patient: selectedPatient });
        }
    };

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

                {/* Hasta Seçme Kısmı */}
                <View style={styles.selectPatientContainer}>
                    <Text style={styles.selectPatientText} onPress={() => setShowPatientList(!showPatientList)}>
                        Hasta Seçin
                    </Text>

                    {/* Hastalar Listesini Göster */}
                    {showPatientList && (
                        <FlatList
                            data={patients}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.patientButton,
                                        selectedPatient?.id === item.id && styles.selectedPatientButton,
                                    ]}
                                    onPress={() => setSelectedPatient(item)}
                                >
                                    <Text style={styles.patientButtonText}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item) => item.id}
                            style={styles.scrollableList}
                        />
                    )}
                </View>

                {/* Seçilen Hasta Bilgisi */}
                {selectedPatient && (
                    <View style={styles.selectedPatientContainer}>
                        <Text style={styles.selectedPatientText}>
                            Seçilen Hasta: {selectedPatient.name}
                        </Text>
                    </View>
                )}

                {/* Mesaj Yazmaya Yönlendirme */}
                <View style={styles.messageContainer}>
                    <TouchableOpacity onPress={navigateToChatScreen}>
                        <Text style={styles.messageText}>Mesaj Gönder</Text>
                    </TouchableOpacity>
                </View>
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
        height: 550,
        backgroundColor: "white",
        padding: 30,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        overflow: "hidden",
        flexShrink: 0,
    },
    dateText: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
    },
    selectPatientContainer: {
        width: "100%",
        padding: 10,
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
        marginVertical: 20,
    },
    selectPatientText: {
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
        color: "#007BFF",
        paddingVertical: 10,
    },
    patientButton: {
        padding: 10,
        backgroundColor: "#007BFF",
        borderRadius: 8,
        marginVertical: 5,
        alignItems: "center",
    },
    patientButtonText: {
        color: "white",
        fontSize: 16,
    },
    selectedPatientButton: {
        backgroundColor: "#66bb6a", // Seçilen hasta butonunu yeşil yapalım
    },
    scrollableList: {
        maxHeight: 200, // Listede kaydırılabilir alanı sınırla
    },
    selectedPatientContainer: {
        marginVertical: 10,
        backgroundColor: "#c8e6c9",
        padding: 10,
        borderRadius: 8,
        width: "100%",
    },
    selectedPatientText: {
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },
    messageContainer: {
        width: "100%",
        marginVertical: 20,
        padding: 10,
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
        alignItems: "center",
    },
    messageText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#007BFF", // Mesaj yaz kısmı mavi renkte
        textAlign: "center",
    },
});

export default DoctorMessageScreen;


