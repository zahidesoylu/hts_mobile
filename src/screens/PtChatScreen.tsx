import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomMenu from "../components/ui/BottomMenu";
import { auth, db } from "@/config/firebaseConfig";
import { collection, serverTimestamp, doc, getDoc, getDocs, query, where, addDoc } from "firebase/firestore";
import { orderBy, onSnapshot } from "firebase/firestore";

const PtChatScreen = ({ route }: { route: any }) => {
    const { patientId } = route.params.patient.id; // Hasta ID'sini parametre olarak alıyoruz
    const [doctorName, setDoctorName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [messages, setMessages] = useState<{ id: string; sender: string; text: string; time: string; timestamp?: { seconds: number; nanoseconds: number } }[]>([]);
    const [message, setMessage] = useState("");
    const myPatient = route.params.patient; // myPatient'ı route'dan alıyoruz

    // Mesaj gönderme fonksiyonu
    const handleSendMessage = async () => {
        if (message.trim()) {
            try {
                // Mesaj verilerini Firestore'a kaydediyoruz
                const messageData = {
                    senderId: patientId,  // Burada hasta ID'si kullanılacak
                    receiverId: auth.currentUser?.uid,  // Doktorun ID'si
                    text: message,
                    timestamp: serverTimestamp(),
                    senderName: myPatient.name, // Hasta adı
                };

                // messages koleksiyonuna yeni bir mesaj ekliyoruz
                await addDoc(collection(db, "messages"), messageData);

                // Mesajı state'e ekleyelim
                setMessages([...messages, {
                    id: (messages.length + 1).toString(),
                    sender: "Hasta",  // Mesajın kimden gönderileceğini kontrol et
                    text: message,
                    time: new Date().toLocaleTimeString(),
                    timestamp: { 
                        seconds: Math.floor(Date.now() / 1000), 
                        nanoseconds: 0 
                    }
                }]);

                setMessage("");  // Mesaj kutusunu sıfırlıyoruz
            } catch (error) {
                console.error("Mesaj gönderme hatası:", error);
            }
        }
    };

    // Mesajları çekme fonksiyonu
    useEffect(() => {
        const messagesRef = collection(db, "messages");
        const q = query(messagesRef,
            where("senderId", "in", [patientId, auth.currentUser?.uid]),  // Hasta ve doktor arasındaki mesajlar
            where("receiverId", "in", [patientId, auth.currentUser?.uid]),
            orderBy("timestamp") // Mesajları zaman sırasına göre sıralıyoruz
        );

        // Firestore'dan veri dinleme
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const messagesData = querySnapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    sender: data.senderName || "Unknown",
                    text: data.text || "",
                    time: data.timestamp?.seconds
                        ? new Date(data.timestamp.seconds * 1000).toLocaleTimeString()
                        : "Unknown time",
                };
            });
            setMessages(messagesData);
        });

        return () => unsubscribe(); // component unmount olduğunda dinlemeyi durduruyoruz
    }, [patientId]); // Hasta ID'si değiştiğinde yeniden veri çekeriz

    //Doktor verisi
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

    return (
        <View style={styles.container}>
            <View style={styles.innerContainer}>
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={() => { }}>
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
                    <Text style={styles.infoText}>Hasta: {myPatient ? myPatient.name : 'Seçilen hasta yok'}</Text>
                </View>

                <View style={styles.messagesContainer}>
                    <FlatList
                        data={messages}
                        renderItem={({ item }) => (
                            <View
                                style={[styles.messageBox, item.sender === "Doktor" ? styles.doctorMessage : styles.patientMessage]}>
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
        justifyContent: "center", 
        alignItems: "center",      
    },
    innerContainer: {
        width: 400,
        height: 550,
        backgroundColor: "white",
        padding: 20,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        overflow: "hidden",
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
        backgroundColor: "#e1f5fe",
        alignSelf: "flex-start",
    },
    patientMessage: {
        backgroundColor: "#c8e6c9",
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

export default PtChatScreen;
