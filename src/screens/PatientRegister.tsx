import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { doc, getDoc, getDocs, collection, addDoc } from 'firebase/firestore';
import { db, auth } from "../../src/config/firebaseConfig";
import BottomMenu from "../components/ui/BottomMenu";
import { Picker } from "@react-native-picker/picker"; // Picker bileşenini içe aktarıyoruz


interface Hastalik {
    id: string;
    hastalik: string;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const PatientRegister = ({ navigation }: any) => {
    const [doctorName, setDoctorName] = useState<string | null>(null);
    const [patientData, setPatientData] = useState({
        ad: "",
        soyad: "",
        tc: "",
        eposta: "",
        sifre: "",
        dogumTarihi: "",
        telefon: "",
        adres: "",
        cinsiyet: "Kadın",
        hastalik: "",
        hastalikId: "",
        acilDurumKisiAd: "",
        acilDurumKisiSoyad: "",
        acilDurumKisiYakinlik: "",
        acilDurumKisiTelefon: "",
        role: "hasta",

    });


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
        console.log('validateInputs asdasda');
        console.log('patientData:', patientData); // Burada tüm verileri kontrol edelim

        if (
            !patientData.ad.trim() ||
            !patientData.soyad.trim() ||
            !patientData.tc.trim() ||
            !patientData.sifre.trim() ||
            !patientData.eposta.trim() ||
            !patientData.dogumTarihi.trim() ||
            !patientData.telefon.trim() ||
            !patientData.adres.trim() ||
            !patientData.acilDurumKisiAd.trim() ||
            !patientData.acilDurumKisiSoyad.trim() ||
            !patientData.acilDurumKisiYakinlik.trim()

        ) {

            // Hangi alanın eksik olduğunu konsola yazdıralım
            console.log('Eksik Alanlar:');
            console.log('Ad:', patientData.ad);
            console.log('Soyad:', patientData.soyad);
            console.log('TC:', patientData.tc);
            console.log('Doğum Tarihi:', patientData.dogumTarihi);
            console.log('Telefon:', patientData.telefon);
            console.log('Adres:', patientData.adres);
            console.log('Acil Durum Kişisi Ad:', patientData.acilDurumKisiAd);
            console.log('Acil Durum Kişisi Soyad:', patientData.acilDurumKisiSoyad);
            console.log('Acil Durum Kişisi Yakınlık:', patientData.acilDurumKisiYakinlik);
            console.log('Acil Durum Kişisi Telefon:', patientData.acilDurumKisiTelefon);


            Alert.alert("Hata", "Tüm alanları doldurmanız gerekmektedir.");

            return false;
        }

        console.log('Tüm alanlar dolu.');

        return true;
    };


    const handleRegister = async () => {
        console.log('Kayıt başlatıldı');
        console.log('current patientData:', patientData);
        const userId = auth.currentUser?.uid;


        if (!validateInputs()) {
            alert('Tüm bilgileri doldurun');
            return;
        }

        const newPatientData = {
            ...patientData,
            doktor: doctorName,
            doctorId: userId,
        };

        try {
            await addDoc(collection(db, "patients"), newPatientData);

            console.log("Hasta kaydı başarılı:", newPatientData);
            Alert.alert("Başarılı", "Hasta başarıyla kaydedildi!");

            // Formu sıfırla
            setPatientData({
                ad: "",
                soyad: "",
                tc: "",
                sifre: "",
                eposta: "",
                dogumTarihi: "",
                telefon: "",
                adres: "",
                cinsiyet: "Kadın",
                hastalik: "",
                hastalikId: "",
                acilDurumKisiAd: "",
                acilDurumKisiSoyad: "",
                acilDurumKisiYakinlik: "",
                acilDurumKisiTelefon: "",
                role: "hasta",
            });

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

                <View style={styles.profileContainer}>

                    <FontAwesome name="user-md" size={50} color="white" style={styles.profileIcon} />
                    <Text style={styles.doctorName}>{doctorName || 'Doktor adı bulunamadı'}</Text>
                </View>

                <Text style={styles.ptName}>Yeni Hasta Kaydı Bilgileri</Text>

                <ScrollView style={styles.scrollContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Ad"
                        value={patientData.ad}
                        onChangeText={(text) => setPatientData({ ...patientData, ad: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Soyad"
                        value={patientData.soyad}
                        onChangeText={(text) => setPatientData({ ...patientData, soyad: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="TC Kimlik No"
                        value={patientData.tc}
                        onChangeText={(text) => setPatientData({ ...patientData, tc: text })}
                        keyboardType="numeric"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="E-posta"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={patientData.eposta}
                        onChangeText={(text) => setPatientData({ ...patientData, eposta: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Şifre"
                        secureTextEntry={true}
                        value={patientData.sifre}
                        onChangeText={(text) => setPatientData({ ...patientData, sifre: text })}
                    />
                    <Text>Cinsiyet:</Text>
                    <Picker
                        selectedValue={patientData.cinsiyet}
                        onValueChange={(itemValue) => setPatientData({ ...patientData, cinsiyet: itemValue })}
                        style={styles.picker}
                    >
                        <Picker.Item label="Kadın" value="Kadın" />
                        <Picker.Item label="Erkek" value="Erkek" />
                    </Picker>

                    <Text>Doğum Tarihi:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Doğum Tarihinizi girin"
                        placeholderTextColor="#aaa"
                        value={patientData.dogumTarihi}
                        onChangeText={(text) => setPatientData({ ...patientData, dogumTarihi: text })}
                    />

                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={patientData.hastalikId}
                            onValueChange={(itemValue) => setPatientData({ ...patientData, hastalikId: itemValue })}
                            style={styles.picker}
                            dropdownIconColor="#007bff"
                        >
                            <Picker.Item label="Hastalık Seçiniz" value="" />
                            {hastaliklar.map((hastalik) => (
                                <Picker.Item
                                    key={hastalik.id}
                                    label={hastalik.hastalik}
                                    value={hastalik.id}
                                />
                            ))}
                        </Picker>

                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="Telefon"
                        keyboardType="phone-pad"
                        value={patientData.telefon}
                        onChangeText={(text) => setPatientData({ ...patientData, telefon: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Adres"
                        value={patientData.adres}
                        onChangeText={(text) => setPatientData({ ...patientData, adres: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Acil Durum Kişisi Adı"
                        value={patientData.acilDurumKisiAd}
                        onChangeText={(text) => setPatientData({ ...patientData, acilDurumKisiAd: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Acil Durum Kişisi Soyadı"
                        value={patientData.acilDurumKisiSoyad}
                        onChangeText={(text) => setPatientData({ ...patientData, acilDurumKisiSoyad: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Acil Durum Kişisi Yakınlık Derecesi"
                        value={patientData.acilDurumKisiYakinlik}
                        onChangeText={(text) => setPatientData({ ...patientData, acilDurumKisiYakinlik: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Acil Durum Kişisi Telefon"
                        keyboardType="phone-pad"
                        value={patientData.acilDurumKisiTelefon}
                        onChangeText={(text) => setPatientData({ ...patientData, acilDurumKisiTelefon: text })}
                    />
                </ScrollView>

                <TouchableOpacity style={styles.button}
                    onPress={() => {
                        alert("Hasta Kaydı Tamamlandı!"); // Basit bir alert mesajı
                        handleRegister();
                    }}>
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
        height: 600,
        backgroundColor: "#F9F9F9",
        padding: 30,
        borderWidth: 2,
        borderColor: "#183B4E",
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        marginBottom: -2,
    },
    dateText: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    profileIcon: {
        marginBottom: 10,
        alignSelf: "center",
    },
    doctorName: {
        fontSize: 12,
        fontWeight: "bold",
        marginBottom: 20,
        color: "white",
        alignSelf: "center",
    },
    profileContainer: {
        backgroundColor: "#2E5077", // istediğin renk
        width: 300,
        padding: 15,
        height: 100,
        marginBottom: 15,
        borderRadius: 15,
    },
    ptName: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#2E5077"
    },
    input: {
        width: "100%",
        backgroundColor: "white",
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#183B4E",
    },
    button: {
        backgroundColor: "#2E5077",
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
        borderWidth: 1,
        borderColor: "#183B4E",
    },
    pickerContainer: {
        width: "100%",
    },

});

export default PatientRegister;
