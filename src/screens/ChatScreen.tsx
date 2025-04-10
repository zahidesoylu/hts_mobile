import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomMenu from "../components/ui/BottomMenu";
import { auth, db } from "@/config/firebaseConfig";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";

const MessageScreen = () => {

    const [doctorName, setDoctorName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [messages, setMessages] = useState([
        { id: "1", sender: "Doktor", text: "İyi hissediyorum, teşekkür ederim.", time: "10:00 AM" },
        { id: "2", sender: "Hasta", text: "Merhaba, nasıl hissediyorsunuz?", time: "10:05 AM" },
    ]);
    const [message, setMessage] = useState("");
    const [patients, setPatients] = useState<{ id: string; name: string }[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<string | null>(null); // Selected patient state

    const handleSendMessage = () => {
        if (message.trim()) {
            const newMessage = {
                id: (messages.length + 1).toString(),
                sender: "Hasta", 
                text: message,
                time: new Date().toLocaleTimeString(),
            };
            setMessages([...messages, newMessage]);
            setMessage("");
        }
    };

    useEffect(() => {
        const fetchDoctorData = async () => {
            try {
                const userId = auth.currentUser?.uid;
                if (!userId) {
                    setErrorMessage("Kullanıcı girişi yapılmamış.");
                    setLoading(false);
                    return;
                }

                const userRef = doc(db, "users", userId); 
                const userDoc = await getDoc(userRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const fullName = `${userData?.unvan} ${userData?.ad} ${userData?.soyad}`;
                    setDoctorName(fullName); 
                } else {
                    setErrorMessage("Doktor verisi bulunamadı.");
                }
            } catch (error) {
                setErrorMessage("Veri çekme hatası oluştu.");
            } finally {
                setLoading(false);
            }
        };

        fetchDoctorData(); 
    }, []);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const userId = auth.currentUser?.uid;
                const patientsRef = collection(db, "patients");
                const q = query(patientsRef, where("doctorId", "==", userId));
                const querySnapshot = await getDocs(q);

                const patientList = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        name: `${data.ad} ${data.soyad}`
                    };
                });

                setPatients(patientList);
                if (patientList.length > 0) {
                    setSelectedPatient(patientList[0].name); // İlk hastayı varsayılan olarak seçiyoruz
                }
            } catch (error) {
                console.error("Hastalar alınırken hata oluştu:", error);
            }
        };

        fetchPatients();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.innerContainer}>
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={() => {}}>
                        <Ionicons name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.dateText}>
                        {new Date().toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        })}
                    </Text>
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.doctorName}>{doctorName || 'Doktor adı bulunamadı'}</Text>
                    <Text style={styles.infoText}>Hasta: {selectedPatient || 'Seçilen hasta yok'}</Text>
                </View>

                <View style={styles.messagesContainer}>
                    <FlatList
                        data={messages}
                        renderItem={({ item }) => (
                            <View
                                style={[
                                    styles.messageBox,
                                    item.sender === "Doktor" ? styles.doctorMessage : styles.patientMessage,
                                ]}
                            >
                                <Text style={styles.messageText}>{item.text}</Text>
                                <Text style={styles.timeText}>{item.time}</Text>
                            </View>
                        )}
                        keyExtractor={(item) => item.id}
                        inverted
                    />
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Mesajınızı yazın..."
                        value={message}
                        onChangeText={setMessage}
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                        <Ionicons name="send" size={24} color="white" />
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
        justifyContent: "center",  // Ortada hizalamak için
        alignItems: "center",      // Ortada hizalamak için
    },
    innerContainer: {
        width: 400,  // Genişliği küçülterek içerik alanını daraltıyoruz
        height: 550, // Yüksekliği belirleyerek sabit tutuyoruz
        backgroundColor: "white",
        padding: 20,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        overflow: "hidden", // Taşan içeriği gizler
    },
    topBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        padding: 10,
        backgroundColor: "#ffffff",
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    dateText: {
        fontSize: 18,
        fontWeight: "bold",
    },
    infoBox: {
        width: "100%",
        padding: 15,
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
        marginVertical: 20,
    },
    infoText: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
        textAlign: "center",
    },
    doctorName: {
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 5,
    },
    messagesContainer: {
        width: "100%",
        flex: 1,
        marginBottom: 20,
    },
    messageBox: {
        maxWidth: "80%",
        marginBottom: 10,
        padding: 10,
        borderRadius: 8,
    },
    doctorMessage: {
        backgroundColor: "#e1f5fe", // Doktor mesajları için mavi tonları
        alignSelf: "flex-start",
    },
    patientMessage: {
        backgroundColor: "#c8e6c9", // Hasta mesajları için yeşil tonları
        alignSelf: "flex-end",
    },
    messageText: {
        fontSize: 16,
        color: "#333",
    },
    timeText: {
        fontSize: 12,
        color: "#888",
        textAlign: "right",
    },
    inputContainer: {
        flexDirection: "row",
        width: "100%",
        alignItems: "center",
    },
    input: {
        width: "85%",
        padding: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        marginRight: 10,
        fontSize: 16,
    },
    sendButton: {
        backgroundColor: "#007BFF",
        padding: 10,
        borderRadius: 8,
    },
});

export default MessageScreen;
