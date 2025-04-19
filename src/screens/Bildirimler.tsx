import { View, Text, StyleSheet, FlatList } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import BottomMenu from "../../src/components/ui/BottomMenu";
import { useEffect, useState } from "react";
import { db, auth } from "@/config/firebaseConfig";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";

interface Notification {
    id: string;
    message: string;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    timestamp: any;
    read: boolean;
    patientId: string;
}

// Bildirimler ekranı için route parametrelerinin tipi
type RootStackParamList = {
    Bildirimler: {
        patientId: string;
        doctorName: string;
        patientName: string;
        doctorId: string;
    };
};
type BildirimlerRouteProp = RouteProp<RootStackParamList, 'Bildirimler'>;


const Bildirimler = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]); // Notifications tipi Notification[]
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const route = useRoute<BildirimlerRouteProp>(); // useRoute ile route nesnesini alıyoruz
    const { patientId, doctorName, patientName, doctorId } = route.params;
    console.log("Route params:", route.params); // Burada route parametrelerini kontrol ediyoruz

    // Bildirimleri okundu olarak işaretleme fonksiyonu
    const markAsRead = async (notificationId: string) => {
        try {
            const notificationRef = doc(db, "bildirimler", notificationId);
            await updateDoc(notificationRef, { read: true });
            setNotifications((prevNotifications) =>
                prevNotifications.map((notification) =>
                    notification.id === notificationId
                        ? { ...notification, read: true }
                        : notification
                )
            );
        } catch (error) {
            console.log("Bildirim okundu olarak işaretlenemedi:", error);
        }
    };

    // Bildirimleri çekme fonksiyonu
    const fetchNotifications = async () => {
        try {
            // `patientId`'yi route params üzerinden alıyoruz
            const { patientId } = route.params;
            console.log("Hasta ID:", patientId);  // Burada patientId'yi kontrol ediyoruz

            if (!patientId) {
                console.error("Hasta ID'si bulunamadı.");
                return;
            }

            // Sadece o kullanıcıya ait bildirimleri çekiyoruz
            const q = query(collection(db, "bildirimler"), where("patientId", "==", patientId));
            const querySnapshot = await getDocs(q);
            const fetchedNotifications = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                message: doc.data().message,
                timestamp: doc.data().timestamp,
                read: doc.data().read,
                patientId: doc.data().patientId,
            })) as Notification[];

            console.log("Fetched Notifications:", fetchedNotifications);  // Burada verileri kontrol ediyoruz

            setNotifications(fetchedNotifications);
        } catch (error) {
            console.error("Bildirimler çekilirken hata:", error);
        } finally {
            setLoading(false);
        }
    };

    // Komponent yüklendiğinde bildirimleri çek
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        fetchNotifications();  // Veriyi çeker
        console.log("Aktif kullanıcı UID:", auth.currentUser?.uid); // UID kontrolü
    }, []);

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

                <FontAwesome name="bell" size={50} color="gray" style={styles.icon} />
                <Text style={styles.title}>Bildirimler</Text>

                {loading ? (
                    <Text style={styles.loadingText}>Yükleniyor...</Text>
                ) : notifications.length > 0 ? (
                    <FlatList
                        data={notifications}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View
                                style={[
                                    styles.notificationCard,
                                    item.read ? { backgroundColor: "#e0e0e0" } : { backgroundColor: "#fff" },
                                ]}
                            >
                                <Text style={styles.notificationText}>{item.message}</Text>
                                <Text style={styles.timestamp}>
                                    {new Date(item.timestamp?.toDate()).toLocaleString()}
                                </Text>

                                {!item.read && (
                                    <Text
                                        style={styles.markAsReadText}
                                        onPress={() => markAsRead(item.id)}
                                    >
                                        Okundu olarak işaretle
                                    </Text>
                                )}
                            </View>
                        )}
                    />
                ) : (
                    <Text style={styles.noNotificationsText}>Yeni bildirim yok.</Text>
                )}
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
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    dateText: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
    },
    icon: {
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    loadingText: {
        fontSize: 18,
        color: "gray",
    },
    noNotificationsText: {
        fontSize: 18,
        color: "gray",
    },
    notificationCard: {
        width: "100%",
        padding: 15,
        marginBottom: 10,
        backgroundColor: "#f0f0f0",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    notificationText: {
        fontSize: 16,
        fontWeight: "bold",
    },
    timestamp: {
        fontSize: 12,
        color: "#666",
    },
    markAsReadText: {
        fontSize: 14,
        color: "#007bff",
        marginTop: 5,
        textDecorationLine: "underline",
    },
});

export default Bildirimler;
