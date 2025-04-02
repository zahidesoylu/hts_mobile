import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { doc, getDoc, getDocs, collection, addDoc } from 'firebase/firestore';
import { db, auth } from "../../src/config/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import BottomMenu from "../components/ui/BottomMenu";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {Picker} from "@react-native-picker/picker"; // Picker bileşenini içe aktarıyoruz


const PatientRegister = ({ navigation }: any) => {

    const [doctorName, setDoctorName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isDatePickerVisible, setDatePickerVisible] = useState(false); // Doğru tanım
    const [date, setDate] = useState(new Date());
    const [hastaliklar, setHastaliklar] = useState<any[]>([]); 
    const [selectedHastalik, setSelectedHastalik] = useState(""); // Seçilen hastalık için state

    // Firestore'dan hastalıkları çek
    useEffect(() => {
        const fetchHastaliklar = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'hastaliklar'));
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setHastaliklar(data);
            } catch (error) {
                console.error("Hastalık verisi çekilemedi:", error);
            }
        };
        fetchHastaliklar();
    }, [])


    const [patientData, setPatientData] = useState({
        ad: "",
        soyad: "",
        tc: "",
        sifre: "", // Şifre alanı eklendi
        dogumTarihi: "",
        telefon: "",
        adres: "",  // Bu alan eklendi
        acilDurumKisiAd: "", // Acil durum kişisi adı
        acilDurumKisiSoyad: "", // Acil durum kişisi soyadı
        acilDurumKisiYakinlik: "", // Acil durum kişisi yakınlık derecesi
    });

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

    const validateInputs = () => {
        const { ad, soyad, tc, dogumTarihi, telefon, adres, acilDurumKisiAd, acilDurumKisiSoyad, acilDurumKisiYakinlik } = patientData;

        if (!ad || !soyad || !tc || !dogumTarihi || !telefon || !adres || !acilDurumKisiAd || !acilDurumKisiSoyad || !acilDurumKisiYakinlik) {
            Alert.alert("Hata", "Tüm alanları doldurmanız gerekmektedir.");
            return false;
        }

        if (tc.length !== 11 || isNaN(Number(tc))) {
            Alert.alert("Hata", "Geçerli bir TC Kimlik Numarası giriniz.");
            return false;
        }

        const phonePattern = /^[0-9]{10,11}$/;
        if (!phonePattern.test(telefon)) {
            Alert.alert("Hata", "Geçerli bir telefon numarası giriniz.");
            return false;
        }

        return true;
    };

    const handleRegister = async () => {
        if (!validateInputs()) return;

        try {
            const patientRef = collection(db, "patients");
            await addDoc(patientRef, {
                ...patientData,
                hastalik: selectedHastalik // Hastalık bilgisini ekle
            });
            Alert.alert("Başarılı", "Hasta başarıyla kaydedildi!");
            navigation.goBack();
        } catch (error: any) {
            Alert.alert("Hata", errorMessage || "Hata oluştu, tekrar deneyiniz.");
        }
    };

    const handleConfirmDate = (selectedDate: Date) => {
        setDate(selectedDate);
        setPatientData({ ...patientData, dogumTarihi: selectedDate.toLocaleDateString("tr-TR") });
        setDatePickerVisible(false);
    };

    const showDatePicker = () => setDatePickerVisible(true);
    const hideDatePicker = () => setDatePickerVisible(false);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Yükleniyor...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.innerContainer}>

                <Text style={styles.dateText}>{new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</Text>
                <FontAwesome name="user-md" size={50} color="gray" style={styles.profileIcon} />
                <Text style={styles.doctorName}>{doctorName || 'Doktor adı bulunamadı'}</Text>
                <Text style={styles.doctorName}>Yeni Hasta Kaydı Bilgileri</Text>

                <ScrollView style={styles.scrollContainer}>

                    <TextInput style={styles.input} placeholder="Ad" onChangeText={(text) => setPatientData({ ...patientData, ad: text })} />
                    <TextInput style={styles.input} placeholder="Soyad" onChangeText={(text) => setPatientData({ ...patientData, soyad: text })} />
                    <TextInput style={styles.input} placeholder="TC Kimlik No" keyboardType="numeric" onChangeText={(text) => setPatientData({ ...patientData, tc: text })} />
                    <TextInput
                        style={styles.input}
                        placeholder="Şifre"
                        secureTextEntry={true}
                        onChangeText={(text) => setPatientData({ ...patientData, sifre: text })}
                    />
                    <TouchableOpacity style={styles.input} onPress={showDatePicker}>
                        <Text>{patientData.dogumTarihi || "Doğum Tarihi Seçin"}</Text>
                    </TouchableOpacity>
                    <TextInput style={styles.input} placeholder="Telefon" keyboardType="phone-pad" onChangeText={(text) => setPatientData({ ...patientData, telefon: text })} />
                    <TextInput style={styles.input} placeholder="Adres" onChangeText={(text) => setPatientData({ ...patientData, adres: text })} />
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedHastalik}
                            onValueChange={(itemValue) => setSelectedHastalik(itemValue)}
                            style={styles.picker}
                            dropdownIconColor="#007bff"
                        >
                            <Picker.Item label="Hastalık Seçiniz" value="" />
                            {hastaliklar.map((hastaliklar) => (
                                <Picker.Item 
                                    key={hastaliklar.hastalik} 
                                    label={hastaliklar.hastalik} 
                                    value={hastaliklar.hastalik} 
                                />
                            ))}
                        </Picker>
                    </View>
                    <TextInput style={styles.input} placeholder="Acil Durum Kişisi Adı" onChangeText={(text) => setPatientData({ ...patientData, acilDurumKisiAd: text })} />
                    <TextInput style={styles.input} placeholder="Acil Durum Kişisi Soyadı" onChangeText={(text) => setPatientData({ ...patientData, acilDurumKisiSoyad: text })} />
                    <TextInput style={styles.input} placeholder="Acil Durum Kişisi Yakınlık Derecesi" onChangeText={(text) => setPatientData({ ...patientData, acilDurumKisiYakinlik: text })} />
                </ScrollView>
                <TouchableOpacity style={styles.button} onPress={handleRegister}>
                    <Text style={styles.buttonText}>Kaydet</Text>
                </TouchableOpacity>
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
        overflow: "hidden", // Taşan içeriği gizler
        flexShrink: 0,      // İçeriğe bağlı olarak küçülmeyi engeller
    },
    dateText: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    profileIcon: {
        marginBottom: 10,
    },
    doctorName: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 20,
    },
    input: {
        width: "100%",
        backgroundColor: "white",
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    button: {
        backgroundColor: "#007bff",
        padding: 10,
        borderRadius: 15,
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
    },
    scrollContainer: {
        flex: 1,
        width: 270,
        height: 400,
        marginBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    picker: {
        width: "100%",
        height: 50,
        backgroundColor: "#f0f0f0",
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
      },
      pickerContainer: {
        width: "100%",
      },
      
});

export default PatientRegister;
