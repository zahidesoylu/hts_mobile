import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomMenu from "../components/ui/BottomMenu";
import { auth, db } from "@/config/firebaseConfig";
import { collection, serverTimestamp, doc, getDoc, query, where, addDoc, orderBy, onSnapshot, getDocs } from "firebase/firestore";
import { useRoute } from '@react-navigation/native';


// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const PtChatScreen = ({ route }: { route: any }) => {
    const [messages, setMessages] = useState<{ id: string; sender: string; text: string; time: string; timestamp?: { seconds: number; nanoseconds: number } }[]>([]);
    const [message, setMessage] = useState("");
    const [selectedPatient, setSelectedPatient] = useState<string | null>(null); // Selected patient state
    const flatListRef = useRef<FlatList>(null);
    const { patientName, doctorName, patientId, doctorId } = route.params;


    console.log("Route params:", route.params);


    // Mesaj gönderme fonksiyonu
    const handleSendMessage = async () => {
        if (message.trim()) {
            try {
                // Mesaj verilerini Firestore'a kaydediyoruz
                const messageData = {
                    senderId: selectedPatient,
                    receiverId: auth.currentUser?.uid,// Burada hasta ID'si seçili olmalı
                    text: message,
                    timestamp: serverTimestamp(),
                    senderName: doctorName || "Doktor",
                };

                // messages koleksiyonuna yeni bir mesaj ekliyoruz
                await addDoc(collection(db, "messages"), messageData);

                setMessage("");  // Mesaj kutusunu sıfırlıyoruz


                setMessage("");  // Mesaj kutusunu sıfırlıyoruz
                // Yeni mesaj gönderildiğinde, FlatList'in en altına kaydırıyoruz
                flatListRef.current?.scrollToEnd({ animated: true });

            } catch (error) {
                console.error("Mesaj gönderme hatası:", error);
            }
        }
    };

    // Mesajları çekme fonksiyonu
    useEffect(() => {
        const messagesRef = collection(db, "messages");
        const q = query(messagesRef,
            where("senderId", "in", [auth.currentUser?.uid, selectedPatient]),  // Kullanıcı ve hasta arasında iletişim
            where("receiverId", "in", [auth.currentUser?.uid, selectedPatient]),
            orderBy("timestamp") // Mesajları zaman sırasına göre sıralıyoruz
        );

        // Firestore'dan veri dinleme
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const messagesData = querySnapshot.docs.map((doc) => {
                const data = doc.data();
                const timestamp = data.timestamp;

                let timeString = "Bilinmeyen zaman";
                if (timestamp?.seconds) {
                    const date = new Date(timestamp.seconds * 1000);
                    timeString = date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
                }

                return {
                    id: doc.id,
                    sender: data.senderName || "Unknown",
                    text: data.text || "",
                    time: timeString,
                };
            });

            setMessages(messagesData);
        });


        return () => unsubscribe(); // component unmount olduğunda dinlemeyi durduruyoruz
    }, [selectedPatient]); // Hasta ID'si değiştiğinde yeniden veri çekeriz

    useEffect(() => {
        setSelectedPatient(patientName); // hasta adı aslında ID ise
    }, [patientName]);


    return (
        <View style={styles.container}>
            <View style={styles.innerContainer}>
                <View style={styles.topBar}>

                    <Text style={styles.dateText}>
                        {new Date().toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        })}
                    </Text>
                </View>

                <View style={styles.infoBox}>
                    {/* Doktor adı hastanın bağlı olduğu doktorun adı olacak */}
                    <Text style={styles.doctorName}>{doctorName || "Doktor adı bulunamadı"}</Text>

                    {/* Hasta adı giriş yapan kullanıcının adı olacak */}
                    <Text style={styles.infoText}>Hasta: {patientName || "Hasta adı bulunamadı"}</Text>

                </View>

                <View style={styles.messagesContainer}>
                    <FlatList
                        ref={flatListRef}
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
        justifyContent: "center",
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

    infoText: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 4,
    },
    doctorName: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
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
    infoBox: {
        width: "100%",
        padding: 15,
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
        marginVertical: 20,
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

export default PtChatScreen;
