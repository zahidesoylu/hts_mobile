import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { doc, getDoc, getDocs, collection, addDoc } from 'firebase/firestore';
import { db, auth } from "../../src/config/firebaseConfig";
import BottomMenu from "../components/ui/BottomMenu";
import { Picker } from "@react-native-picker/picker"; // Picker bileşenini içe aktarıyoruz


const PatientRegister = ({ navigation }: any) => {

    interface Hastalik {
        id: string; // Firestore'dan gelen her bir hastalık objesinde bir id olacak
        hastalik: string;
    }

    const [doctorName, setDoctorName] = useState<string | null>(null);
    const [patientData, setPatientData] = useState({
        ad: "",
        soyad: "",
        tc: "",
        sifre: "",
        dogumTarihi: "",
        telefon: "",
        adres: "",
        cinsiyet: "Kadın",
        hastalik: "",
        acilDurumKisiAd: "",
        acilDurumKisiSoyad: "",
        acilDurumKisiYakinlik: "",
        acilDurumKisiTelefon: "",

    });


    const [ad, setAd] = useState("");
    const [soyad, setSoyad] = useState("");
    const [tc, setTc] = useState("");
    const [cinsiyet, setCinsiyet] = useState("Kadın");
    const [telefon, setTelefon] = useState("");
    const [dogumTarihi, setDogumTarihi] = useState("");
    const [adres, setAdres] = useState("");
    const [acilDurumKisiAd, setAcilDurumKisiAd] = useState("");
    const [acilDurumKisiSoyad, setAcilDurumKisiSoyad] = useState("");
    const [acilDurumKisiYakinlik, setAcilDurumKisiYakinlik] = useState("");
    const [acilDurumKisiTelefon, setAcilDurumKisiTelefon] = useState(""); // Acil durum kişisi telefon numarası için state

    const [hastaliklar, setHastalik] = useState<Hastalik[]>([]); // Hastalıkları tutacak state
    const [selectedHastalik, setSelectedHastalik] = useState(""); // Seçilen hastalık için state
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [loading, setLoading] = useState(true);
    const [isDatePickerVisible, setDatePickerVisible] = useState(false); // Doğru tanım
    const [date, setDate] = useState(new Date());
    const showDatePicker = () => setDatePickerVisible(true);


    // Firestore'dan hastalıkları çek
    useEffect(() => {
        const fetchHastaliklar = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'hastaliklar'));
                const hastalikList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    hastalik: doc.data().hastalik, // Bu şekilde hastalık adını alıyoruz
                }));
                setHastalik(hastalikList); // Hastalıkları state'e atıyoruz
            } catch (error) {
                console.error("Hastalık verisi çekilemedi:", error);
            }
        };
        fetchHastaliklar();
    }, []);

    //doktor bilgileri
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
                console.error("Veri çekme hatası oluştu.", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctorData();
    }, []);

    //verilerin doldurulması kontrolu
    const validateInputs = () => {

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

        // hastalık bilgisini patientData'ya ekleyelim
        const newPatientData = { 
            ...patientData,
            hastalik: selectedHastalik,  // Hastalık bilgisini de buraya ekliyoruz
        };

        try {
            await addDoc(collection(db, "patients"), newPatientData);

            console.log("Hasta kaydı başarılı:", patientData);
            Alert.alert("Başarılı", "Hasta başarıyla kaydedildi!");
            navigation.goBack();
        } catch (error) {
            Alert.alert("Hata", "Kayıt sırasında bir hata oluştu.");
            console.error("Kayıt hatası:", error);
        }
    };

    const handleConfirmDate = (selectedDate: Date) => {
        setDate(selectedDate);
        setPatientData(prev => ({ ...prev, dogumTarihi: selectedDate.toLocaleDateString("tr-TR") }));
        setDatePickerVisible(false);
    };

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

                    <TextInput style={styles.input} placeholder="Ad" value={ad} onChangeText={setAd} />
                    <TextInput style={styles.input} placeholder="Soyad" value={soyad} onChangeText={setSoyad} />
                    <TextInput style={styles.input} placeholder="TC Kimlik No" value={tc} onChangeText={setTc} keyboardType="numeric" />
                    <TextInput
                        style={styles.input}
                        placeholder="Şifre"
                        secureTextEntry={true}
                        onChangeText={(text) => setPatientData({ ...patientData, sifre: text })}
                    />
                    <Text>Cinsiyet:</Text>
                    <Picker selectedValue={cinsiyet} onValueChange={setCinsiyet} style={styles.picker}>
                        <Picker.Item label="Kadın" value="Kadın" />
                        <Picker.Item label="Erkek" value="Erkek" />
                    </Picker>
                    <Text>Doğum Tarihi:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Doğum Tarihinizi girin"
                        placeholderTextColor="#aaa"
                        value={dogumTarihi}
                        onChangeText={setDogumTarihi}
                    />
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
                                    key={hastaliklar.id}
                                    label={hastaliklar.hastalik}
                                    value={hastaliklar.hastalik}
                                />
                            ))}
                        </Picker>
                    </View>
                    <TextInput style={styles.input} placeholder="Telefon" keyboardType="phone-pad" value={telefon} onChangeText={setTelefon} />
                    <TextInput style={styles.input} placeholder="Adres" onChangeText={(text) => setPatientData({ ...patientData, adres: text })} />

                    <TextInput style={styles.input} placeholder="Acil Durum Kişisi Adı" onChangeText={(text) => setPatientData({ ...patientData, acilDurumKisiAd: text })} />
                    <TextInput style={styles.input} placeholder="Acil Durum Kişisi Soyadı" onChangeText={(text) => setPatientData({ ...patientData, acilDurumKisiSoyad: text })} />
                    <TextInput style={styles.input} placeholder="Acil Durum Kişisi Yakınlık Derecesi" onChangeText={(text) => setPatientData({ ...patientData, acilDurumKisiYakinlik: text })} />
                    <TextInput style={styles.input} placeholder="Acil Durum Kişisi Telefon" onChangeText={(text) => setPatientData({ ...patientData, acilDurumKisiTelefon: text })} />
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
