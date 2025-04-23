import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import BottomMenu from "../../src/components/ui/BottomMenu";
import { auth, db } from "@/config/firebaseConfig";
import { updateDoc, doc, getDoc, addDoc, Timestamp } from "firebase/firestore";
import { collection, query, where, getDocs } from "firebase/firestore";

const DrRandevuButton = () => {
    const [selectedDate, setSelectedDate] = useState("Bugün");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [doctorName, setDoctorName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const [appointments, setAppointments] = useState<any[]>([]);
    const [pressed, setPressed] = useState(false);


    const formatDate = (dateString: string) => {
        const [year, month, day] = dateString.split("-");
        return `${day}.${month}.${year}`;
    };

    const filteredAppointments = appointments.filter((item) => {
        const today = new Date();
        const itemDate = new Date(`${item.tarih}T${item.saat}:00`);

        if (item.doktorId !== auth.currentUser?.uid) {
            console.log("Doktor ID eşleşmiyor:", item.doktorId, auth.currentUser?.uid);
            return false;
        }

        if (selectedDate === "Bugün") {
            return (
                itemDate.toDateString() === today.toDateString() &&
                itemDate.getTime() >= today.getTime()
            );
            // biome-ignore lint/style/noUselessElse: <explanation>
        } else if (selectedDate === "Dün") {
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            return itemDate.toDateString() === yesterday.toDateString();
            // biome-ignore lint/style/noUselessElse: <explanation>
        } else if (selectedDate === "Yarın") {
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            return itemDate.toDateString() === tomorrow.toDateString();
        }
        return true;
    });

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const userId = auth.currentUser?.uid;
                if (!userId) {
                    console.error("Kullanıcı girişi yapılmamış.");
                    return;
                }

                const q = query(collection(db, "randevu"), where("doktorId", "==", userId));
                const querySnapshot = await getDocs(q);
                const fetchedAppointments = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setAppointments(fetchedAppointments);
            } catch (error) {
                console.error("Randevular çekilirken hata:", error);
            }
        };

        fetchAppointments();
    }, []);

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
                console.log("Firestore hatası:", error);
                setErrorMessage("Veri çekme hatası oluştu.");
            } finally {
                setLoading(false);
            }
        };

        fetchDoctorData();
    }, []);

    const handleApprove = async (appointmentId: string, patientId: string) => {
        try {
            const appointmentRef = doc(db, "randevu", appointmentId);
            await updateDoc(appointmentRef, { isApproved: true });

            await addNotification(patientId, "Randevu talebiniz onaylandı.");

            setAppointments((prev) =>
                prev.map((item) =>
                    item.id === appointmentId ? { ...item, isApproved: true } : item
                )
            );
        } catch (error) {
            console.error("Randevu onaylama hatası:", error);
        }
    };

    const addNotification = async (patientId: string, message: string) => {
        try {
            const docRef = await addDoc(collection(db, "bildirimler"), {
                patientId: patientId,
                message: message,
                read: false,
                timestamp: Timestamp.now(),
            });
            console.log("Bildirim başarıyla eklendi:", docRef.id);
        } catch (e) {
            console.error("Bildirim eklerken hata oluştu:", e);
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

                <Text style={styles.headingText}>Randevular</Text>

                <View style={styles.doctorNameContainer}>
                    <Text style={styles.doctorName}>{doctorName || 'Doktor adı bulunamadı'}</Text>
                </View>

                <View style={styles.dateSelector}>
                    {["Dün", "Bugün", "Yarın"].map((date) => (
                        <TouchableOpacity
                            key={date}
                            style={[
                                styles.dateButton,
                                selectedDate === date && styles.selectedDateButton,
                            ]}
                            onPress={() => setSelectedDate(date)}
                        >
                            <Text style={styles.dateButtonText}>{date}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <FlatList
                    data={filteredAppointments}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.appointmentRow}>
                            <Text style={styles.appointmentText}>
                                {item.hastaAd}{"\n"}
                                {formatDate(item.tarih)}{"\n"}
                                {item.saat}
                            </Text>

                            <TouchableOpacity
                                style={[
                                    styles.confirmButtonStyle,
                                    item.isApproved
                                        ? { backgroundColor: "#4CAF50", opacity: 0.6 }
                                        : { backgroundColor: "#4CAF50" },
                                ]}
                                disabled={item.isApproved}
                                onPress={() => handleApprove(item.id, item.hastaId)}
                            >
                                <Text style={styles.confirmButtonText}>
                                    {item.isApproved ? "ONAYLANDI" : "ONAYLA"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    style={styles.appointmentsContainer}
                />
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
    },
    dateText: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
    },
    headingText: {
        fontSize: 18,
        fontWeight: "bold",
        marginVertical: 10,
    },
    doctorNameContainer: {
        padding: 10,
        backgroundColor: '#f0f4f8',
        borderRadius: 8,
        marginVertical: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        width: "90%",
        height: 50,
        justifyContent: "center",
    },
    doctorName: {
        fontSize: 14,
        color: "black",
        fontWeight: "bold",
    },
    dateSelector: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
        marginVertical: 20,
    },
    dateButton: {
        padding: 10,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: "#ddd",
        marginTop: 15,
    },
    selectedDateButton: {
        backgroundColor: "#ddd",
    },
    dateButtonText: {
        fontSize: 16,
        fontWeight: "bold",
    },
    appointmentsContainer: {
        width: "90%",
    },
    appointmentRow: {
        backgroundColor: "#fff",
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    appointmentText: {
        fontSize: 16,
        color: "#333",
    },
    confirmButtonStyle: {
        backgroundColor: "#4CAF50",
        padding: 10,
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 20,
    },
    confirmButtonText: {
        color: "#fff",
        fontSize: 14,
    },
});

export default DrRandevuButton;
