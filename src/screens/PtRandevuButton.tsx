import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import BottomMenu from "../../src/components/ui/BottomMenu";
import { useRoute } from "@react-navigation/native";
import { auth, db } from "@/config/firebaseConfig";
import { doc, collection, addDoc, getDoc } from "firebase/firestore";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Takvim from "@/components/ui/takvim";

const DrRandevuButton = () => {
  const [selectedOption, setSelectedOption] = useState<string>("none");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [hour, setHour] = useState<string>("");
  const route = useRoute();
  const { patientName, doctorName, patientId, doctorId } = route.params as {
    patientName: string;
    doctorName: string;
    patientId: string;
    doctorId: string;
  };

  const availableHours = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
  ];

  const handleOptionPress = (option: string) => {
    setSelectedOption(selectedOption === option ? "none" : option);
  };

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleCreateAppointment = async () => {
    if (!hour || !date) {
      alert("Lütfen tarih ve saat seçiniz.");
      return;
    }

    try {
      const appointmentRef = collection(db, "randevu");
      await addDoc(appointmentRef, {
        hastaId: patientId,
        doktorId: doctorId,
        tarih: date.toISOString().split("T")[0], // Yalnızca YYYY-MM-DD
        saat: hour,
        hastaAd: patientName,
        doktorAd: doctorName,
      });
      alert("Randevu başarıyla oluşturuldu.");
      setHour(""); // Formu sıfırla
    } catch (error) {
      console.error("Randevu oluşturulamadı:", error);
      alert("Randevu oluşturulamadı.");
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

        <View style={styles.infoBox}>
          <Text style={styles.doctorName}>
            {doctorName || "Doktor adı bulunamadı"}
          </Text>
          <Text style={styles.infoText}>
            Hasta: {patientName || "Hasta adı bulunamadı"}
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => handleOptionPress("randevuAl")}
          >
            <Text style={styles.optionButtonText}>Randevu Al</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => handleOptionPress("guncelRandevular")}
          >
            <Text style={styles.optionButtonText}>Güncel Randevularım</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => handleOptionPress("gecmisRandevular")}
          >
            <Text style={styles.optionButtonText}>Geçmiş Randevularım</Text>
          </TouchableOpacity>
        </View>

        {selectedOption === "randevuAl" && (
          <ScrollView style={styles.accordionPanel}>
            <Takvim />
            {showPicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()} // Geçmiş tarihleri seçmeyi engeller
              />
            )}
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={hour || ""}
                style={styles.picker}
                onValueChange={(itemValue: string) => setHour(itemValue)}
              >
                <Picker.Item
                  label="Saat Seç"
                  value=""
                  style={styles.placeholderText}
                />
                {availableHours.map((availableHour) => (
                  <Picker.Item
                    key={availableHour}
                    label={availableHour}
                    value={availableHour}
                  />
                ))}
              </Picker>
            </View>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateAppointment}
            >
              <Text style={styles.createButtonText}>Randevu Oluştur</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {selectedOption === "guncelRandevular" && (
          <View style={styles.accordionPanel}>
            <Text style={styles.noAppointmentText}>
              Güncel randevunuz bulunmamaktadır.
            </Text>
          </View>
        )}

        {selectedOption === "gecmisRandevular" && (
          <View style={styles.accordionPanel}>
            <Text style={styles.noAppointmentText}>
              Geçmiş randevunuz bulunmamaktadır.
            </Text>
          </View>
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
  dateButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    textAlign: "center",
    marginBottom: 18,
  },
  dateButtonText: {
    color: "#fff", // yazının beyaz renkte olması
    fontSize: 16,
    fontWeight: "bold",
  },
  headingText: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
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
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  optionsContainer: {
    width: "100%",
    marginVertical: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  optionButton: {
    width: 100,
    padding: 10,
    backgroundColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  accordionPanel: {
    width: "100%",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 20,
    marginTop: 15,
  },
  noAppointmentText: {
    fontSize: 16,
    fontStyle: "italic",
    fontWeight: "100", // İnce yazı tipi
    color: "rgba(0, 0, 0, 0.6)", // Soluk renk
    textAlign: "center",
  },
  pickerContainer: {
    width: "100%",
    marginBottom: 15,
  },
  picker: {
    height: 40,
    width: "100%",
  },
  placeholderText: {
    fontSize: 10,
    color: "#888",
  },
  createButton: {
    width: "100%",
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DrRandevuButton;
