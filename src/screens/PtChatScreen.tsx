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
    const [patientName, setPatientName] = useState<string>("");  // Firestore'dan gelecek hasta adı
    const [doctorName, setDoctorName] = useState<string>("");    // Firestore'dan gelecek doktor adı
    const flatListRef = useRef<FlatList>(null);
    const { patientId, doctorId } = route.params;


    console.log("Route params:", route.params);
    console.log("Hasta ID'si:", patientId);
    console.log("Doktor ID'si:", doctorId);



    // Veritabanından hasta ve doktor adlarını çek
    useEffect(() => {
        const fetchNames = async () => {
            try {
                const patientSnap = await getDoc(doc(db, "patients", patientId));
                const doctorSnap = await getDoc(doc(db, "users", doctorId));

                if (patientSnap.exists()) {
                    const patientData = patientSnap.data();
                    setPatientName(`${patientData.ad} ${patientData.soyad}` || "Hasta");
                    console.log("Hasta adı:", patientData.ad, patientData.soyad);
                } else {
                    console.error("Hasta bulunamadı");
                }

                if (doctorSnap.exists()) {
                    const doctorData = doctorSnap.data();
                    setDoctorName(`${doctorData.unvan} ${doctorData.ad} ${doctorData.soyad}` || "Doktor");
                    console.log("Doktor adı:", doctorData.unvan, doctorData.ad, doctorData.soyad);
                } else {
                    console.error("Doktor bulunamadı");
                }
            } catch (err) {
                console.error("Adları getirirken hata:", err);
            }
        };

        fetchNames();
    }, [patientId, doctorId]);


    // Mesaj gönderme fonksiyonu
    const handleSendMessage = async () => {
        if (message.trim()) {
            try {
                // Mesaj verilerini Firestore'a kaydediyoruz
                const messageData = {
                    senderId: patientId,
                    receiverId: doctorId,// Burada hasta ID'si seçili olmalı
                    text: message,
                    timestamp: serverTimestamp(),
                    senderName: patientName || "Hasta",
                    receiverName: doctorName || "Doktor",
                };

                // messages koleksiyonuna yeni bir mesaj ekliyoruz
                await addDoc(collection(db, "messages"), messageData);

                setMessage("");  // Mesaj kutusunu sıfırlıyoruz
                flatListRef.current?.scrollToEnd({ animated: true });
            } catch (error) {
                console.error("Mesaj gönderme hatası:", error);
            }
        }
    };

    // Mesajları çekme fonksiyonu
    useEffect(() => {

        if (!doctorId || !patientId) return; // id'ler hazır değilse çalıştırma ❌

        const messagesRef = collection(db, "messages");

        const q = query(messagesRef,
            where("senderId", "in", [doctorId, patientId]),
            where("receiverId", "in", [doctorId, patientId]),
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
    }, [doctorId, patientId]);

    useEffect(() => {
        console.log("doctorId:", doctorId);
        console.log("patientId:", patientId);
    }, [doctorId, patientId]);

    /* useEffect(() => {
         setSelectedPatient(patientId); // hasta adı aslında ID ise
     }, [patientId]);
 */

    // Burada, doktor adı ve hasta adı yüklenene kadar "Veriler yükleniyor..." mesajı gösterilir
    if (!patientName || !doctorName) {
        return <Text>Veriler yükleniyor...</Text>;  // Yükleniyor mesajı
    }

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
                    <Text style={styles.doctorName}>{doctorName || "Doktor adı bulunamadı"}</Text>
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
        height: 600, // Yüksekliği belirleyerek sabit tutuyoruz
        backgroundColor: "white",
        padding: 20,
        borderWidth: 2,
        marginBottom: -2,
        borderColor: "#183B4E",
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
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
        backgroundColor: "#2E5077",
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
        color: "white",
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
        borderWidth: 1,
        borderColor: "2E5077",
        backgroundColor: "#eee", // Hasta mesajları için yeşil tonları
        alignSelf: "flex-end",
    },
    messageText: {
        fontSize: 16,
        color: "#2E5077",
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
        borderWidth: 2,
        borderColor: "#2E5077",
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
        marginVertical: 20,
    },
    input: {
        width: "85%",
        padding: 10,
        borderWidth: 1,
        borderColor: "#2E5077",
        borderRadius: 8,
        marginRight: 10,
        fontSize: 16,
    },
    sendButton: {
        backgroundColor: "#2E5077",
        padding: 10,
        borderRadius: 8,
    },
});

export default PtChatScreen;
