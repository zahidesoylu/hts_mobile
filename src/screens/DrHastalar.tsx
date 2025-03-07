import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker"; // Burada doğru bir şekilde içe aktarılıyor
import BottomMenu from "../components/ui/BottomMenu";

const Hastalar = () => {
    const [patients, setPatients] = useState(["Ali Veli", "Ayşe Yılmaz", "Mehmet Kara"]);
    const [isPanelVisible, setIsPanelVisible] = useState(false);
    const [isAddingPatient, setIsAddingPatient] = useState(false);

    const [patientName, setPatientName] = useState("");
    const [patientSurname, setPatientSurname] = useState("");
    const [tcNumber, setTcNumber] = useState("");  // TC kimlik numarası için state
    const [birthDate, setBirthDate] = useState("");
    const [gender, setGender] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [chronicDisease, setChronicDisease] = useState("");
    const [emergencyName, setEmergencyName] = useState("");
    const [emergencyRelation, setEmergencyRelation] = useState("");
    const [emergencyPhone, setEmergencyPhone] = useState("");

    const chronicDiseases = [
        { label: "KOAH", value: "KOAH" },
        { label: "Astım", value: "Astım" },
        { label: "Hipertansiyon", value: "Hipertansiyon" },
        { label: "Diyabet", value: "Diyabet" },
        { label: "Kalp Hastalığı", value: "Kalp Hastalığı" },
    ];

    const handleAddPatient = () => {
        if (patientName.trim()) {
            const newPatient = `${patientName} - ${birthDate} - ${gender} - ${phoneNumber}`;
            setPatients([...patients, newPatient]);
            setPatientName("");
            setBirthDate("");
            setGender("");
            setPhoneNumber("");
            setAddress("");
            setIsAddingPatient(false);
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

                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>Dr: Şeyma Özkaya</Text>
                </View>

                <TouchableOpacity
                    style={styles.hastalarButton}
                    onPress={() => setIsPanelVisible(!isPanelVisible)}
                >
                    <Text style={styles.hastalarButtonText}>Hastalarım</Text>
                </TouchableOpacity>

                {isPanelVisible && (
                    <View style={styles.patientPanel}>
                        {patients.map((patient, index) => (
                            <Text key={index} style={styles.patientText}>
                                {patient}
                            </Text>
                        ))}
                    </View>
                )}

                <TouchableOpacity
                    style={styles.addPatientButton}
                    onPress={() => setIsAddingPatient(!isAddingPatient)}
                >
                    <Text style={styles.addPatientButtonText}>Yeni Hasta Kaydı</Text>
                </TouchableOpacity>

                {isAddingPatient && (
                    <ScrollView style={styles.newPatientForm}>
                        <TextInput
                            style={styles.input}
                            placeholder="Adı"
                            value={patientName}
                            onChangeText={setPatientName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Soyadı"
                            value={patientSurname}
                            onChangeText={setPatientSurname}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="TC Kimlik No"
                            value={tcNumber}
                            onChangeText={setTcNumber}
                            keyboardType="number-pad"
                            maxLength={11}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Doğum Tarihi (GG/AA/YYYY)"
                            value={birthDate}
                            onChangeText={setBirthDate}
                        />
                        <Picker
                            selectedValue={gender}
                            style={styles.input}
                            onValueChange={setGender}
                        >
                            <Picker.Item label="Cinsiyet Seçiniz" value={null} />
                            <Picker.Item label="Kadın" value="Kadın" />
                            <Picker.Item label="Erkek" value="Erkek" />
                        </Picker>
                        <TextInput
                            style={styles.input}
                            placeholder="Telefon Numarası"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="E-posta"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Adres"
                            value={address}
                            onChangeText={setAddress}
                        />
                        <Picker
                            selectedValue={chronicDisease}
                            style={styles.input}
                            onValueChange={(itemValue) => setChronicDisease(itemValue)}
                        >
                            <Picker.Item label="Kronik Hastalık Türünü Seçin" value="" />
                            {chronicDiseases.map((disease, index) => (
                                <Picker.Item key={index} label={disease.label} value={disease.value} />
                            ))}
                        </Picker>
                        <Text style={styles.label}>Acil Durum Kişisi</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Adı Soyadı"
                            value={emergencyName}
                            onChangeText={setEmergencyName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Yakınlık Derecesi"
                            value={emergencyRelation}
                            onChangeText={setEmergencyRelation}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Telefon Numarası"
                            value={emergencyPhone}
                            onChangeText={setEmergencyPhone}
                            keyboardType="phone-pad"
                        />
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleAddPatient}
                        >
                            <Text style={styles.saveButtonText}>Kaydet</Text>
                        </TouchableOpacity>
                    </ScrollView>
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
    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
        color: "#333",
    },
    dateText: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
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
    hastalarButton: {
        width: "100%",
        padding: 10,
        backgroundColor: "#ddd",
        borderRadius: 8,
        alignItems: "center",
        marginVertical: 10,
    },
    hastalarButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    patientPanel: {
        width: "100%",
        marginVertical: 20,
    },
    patientText: {
        fontSize: 16,
        marginBottom: 8,
    },
    addPatientButton: {
        width: "100%",
        padding: 10,
        backgroundColor: "#ddd",
        borderRadius: 8,
        alignItems: "center",
        marginVertical: 10,
    },
    addPatientButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    newPatientForm: {
        width: "100%",
        paddingTop: 20,
    },
    input: {
        width: "100%",
        padding: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
    },
    saveButton: {
        width: "100%",
        padding: 10,
        backgroundColor: "#007BFF",
        borderRadius: 8,
        alignItems: "center",
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default Hastalar;
