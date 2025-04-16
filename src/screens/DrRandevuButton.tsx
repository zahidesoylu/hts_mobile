import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import BottomMenu from "../../src/components/ui/BottomMenu";
import { auth, db } from "@/config/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { collection, query, where, getDocs } from "firebase/firestore";


const DrRandevuButton = () => {
    const [selectedDate, setSelectedDate] = useState("Bugün");
    const [errorMessage, setErrorMessage] = useState<string | null>(null); // Hata mesajı için state
    const [doctorName, setDoctorName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true); // Yükleniyor durumu için state
    const [appointments, setAppointments] = useState<any[]>([]);


    appointments.forEach((item) => {
        console.log("item.tarih:", item.tarih);
    });

    appointments.forEach((item) => {
        console.log("item.doktorId:", item.doktorId);
        console.log("typeof item.doktorId:", typeof item.doktorId);
        console.log("eşit mi:", item.doktorId === auth.currentUser?.uid);
        console.log("item.doktorId === user.uid?", item.doktorId === auth.currentUser?.uid);
        console.log("TRIM eşit mi?", item.doktorId?.trim() === auth.currentUser?.uid.trim());
    });

    const filteredAppointments = appointments.filter((item) => {
        const today = new Date();
        const itemDate = new Date(item.tarih + "T00:00:00");


        // doktor ID eşleşmesi
        if (item.doktorId !== auth.currentUser?.uid) {
            console.log("Doktor ID eşleşmiyor:", item.doktorId, auth.currentUser?.uid);
            return false;
        }

        if (selectedDate === "Bugün") {
            return itemDate.toDateString() === today.toDateString();
        } else if (selectedDate === "Dün") {
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            return itemDate.toDateString() === yesterday.toDateString();
        } else if (selectedDate === "Yarın") {
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            return itemDate.toDateString() === tomorrow.toDateString();
        }
        return true;
    });

    console.log("Filtrelenmiş Randevular (UID eşleşmeli):", filteredAppointments);


    //randevular
    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const userId = auth.currentUser?.uid;
                console.error("Kullanıcı girişi yapılmamış.");
                if (!userId) return;

                const q = query(
                    collection(db, "randevu"),
                    where("doktorId", "==", userId)
                );

                const querySnapshot = await getDocs(q);
                const fetchedAppointments = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                console.log("Randevu verileri:", fetchedAppointments);


                setAppointments(fetchedAppointments);
            } catch (error) {
                console.error("Randevular çekilirken hata:", error);
            }
        };

        fetchAppointments();
    }, []);

    //doktor verileri
    useEffect(() => {
        const fetchDoctorData = async () => {
            try {
                // Giriş yapan kullanıcının UID'sini alıyoruz
                const userId = auth.currentUser?.uid;

                if (!userId) {
                    setErrorMessage("Kullanıcı girişi yapılmamış.");
                    setLoading(false);
                    return;
                }

                console.log("Giriş yapan kullanıcının UID'si:", userId);

                const userRef = doc(db, "users", userId); // Firestore'dan doktor verisini alıyoruz
                const userDoc = await getDoc(userRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    console.log("Firestore'dan gelen veriler:", userData); // Veriyi konsola yazdıralım
                    const fullName = `${userData?.unvan} ${userData?.ad} ${userData?.soyad}`;
                    setDoctorName(fullName); // Firestore'dan gelen doktor adını state'e set ediyoruz        } else {
                    setErrorMessage("Doktor verisi bulunamadı.");
                }
            } catch (error) {
                console.log("Firestore hatası:", error);
                setErrorMessage("Veri çekme hatası oluştu.");
            } finally {
                setLoading(false); // Veri çekme işlemi tamamlandığında loading'i false yapıyoruz
            }
        };

        fetchDoctorData(); // Veri çekme fonksiyonunu çağırıyoruz
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

                <Text style={styles.headingText}>Randevular</Text>

                <View style={styles.doctorNameContainer}>
                    <Text style={styles.doctorName}>{doctorName || 'Doktor adı bulunamadı'}</Text>
                </View>

                {/* Tarih Seçim */}
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
                                {item.hastaAd} - {item.tarih} - {item.saat}
                            </Text>
                            <TouchableOpacity style={styles.cancelButtonStyle}>
                                <Text style={styles.cancelButtonText}>İptal</Text>
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

// **STYLE KISMI**
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
        marginTop: 10,
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
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 15,
        paddingHorizontal: 10,
        width: "100%",
    },
    appointmentText: {
        fontSize: 14,
        fontWeight: "bold",
        marginLeft: 20,
        marginRight: 40,
    },
    cancelButtonStyle: {
        width: 50,
        height: 20,
        backgroundColor: "#FF0000",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 30,
    },
    cancelButtonText: {
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 8,
    }
});

export default DrRandevuButton;
