import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomMenu from "../components/ui/BottomMenu";
import { auth, db } from "@/config/firebaseConfig";
import { collection, serverTimestamp, doc, getDoc, getDocs, query, where, addDoc } from "firebase/firestore";
import { orderBy, onSnapshot } from "firebase/firestore";


// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const ChatScreen = ({ route }: { route: any }) => {
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [patients, setPatients] = useState<{ id: string; name: string }[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<string | null>(null); // Selected patient state
    const myPatient = route.params.patient; // myPatient'ı route'dan alıyoruz
    const flatListRef = useRef<FlatList>(null);

    const [messages, setMessages] = useState<{ id: string; sender: string; text: string; time: string; timestamp?: { seconds: number; nanoseconds: number } }[]>([]);
    const [patientName, setPatientName] = useState<string>("");
    const [doctorName, setDoctorName] = useState<string>("");
    const { patientId, doctorId } = route.params;

    /*
    console.log("Seçilen hasta:", myPatient); // Seçilen hasta bilgisini konsola yazdırıyoruz
    console.log("Seçilen hasta ID'si:", myPatient.id); // Seçilen hasta ID'sini konsola yazdırıyoruz
    console.log("Seçilen hasta ID'si:", patientId); // Seçilen hasta ID'sini konsola yazdırıyoruz
    */

    console.log("Route params:", route.params);

    // Veritabanından hasta ve doktor adlarını çek
    useEffect(() => {
        const fetchNames = async () => {
            try {
                const patientSnap = await getDoc(doc(db, "patients", patientId));
                const doctorSnap = await getDoc(doc(db, "users", doctorId));

                if (patientSnap.exists()) {
                    setPatientName(`${patientSnap.data().ad} ${patientSnap.data().soyad}` || "Hasta");
                }
                if (doctorSnap.exists()) {
                    setDoctorName(`${doctorSnap.data().unvan} ${doctorSnap.data().ad} ${doctorSnap.data().soyad}` || "Doktor");
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
                    senderId: doctorId,
                    receiverId: patientId,  // Burada hasta ID'si seçili olmalı
                    text: message,
                    timestamp: serverTimestamp(),
                    senderName: doctorName || "Doktor",
                    receiverName: patientName || "Hasta",

                };

                // messages koleksiyonuna yeni bir mesaj ekliyoruz
                await addDoc(collection(db, "messages"), messageData);

                setMessage("");  // Mesaj kutusunu sıfırlıyoruz
                // Yeni mesaj gönderildiğinde, FlatList'in en altına kaydırıyoruz
                flatListRef.current?.scrollToEnd({ animated: true });

            } catch (error) {
                console.error("Mesaj gönderme hatası:", error);
            }
        }
    };

    // Mesajları çekme fonksiyonu
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {

        if (!doctorId || !patientId) return;

        const messagesRef = collection(db, "messages");
        const q = query(messagesRef,
            where("senderId", "in", [doctorId, patientId]),  // Kullanıcı ve hasta arasında iletişim
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

    /*

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
    }, []);*/



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
                    <Text style={styles.doctorName}>{doctorName || 'Doktor adı bulunamadı'}</Text>
                    <Text style={styles.infoText}> Mesaj Gönderilecek Hasta: {myPatient ? myPatient.name : 'Seçilen hasta yok'}</Text>
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
        flexGrow: 1,
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

export default ChatScreen;
