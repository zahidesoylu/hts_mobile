import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import BottomMenu from "../../src/components/ui/BottomMenu";
import { useRoute } from "@react-navigation/native";
import { auth, db } from "@/config/firebaseConfig";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import Takvim from "@/components/ui/takvim";
import DateDaily from "./dateDaily";
import "react-datepicker/dist/react-datepicker.css";

const PtRandevuButton = () => {
  const [selectedOption, setSelectedOption] = useState<string>("none");
  const [hour, setHour] = useState<string>("");
  const [randevuTarihi, setRandevuTarihi] = useState(new Date());

  interface Appointment {
    hastaId: string;
    doktorId: string;
    tarih: string;
    saat: string;
    hastaAd: string;
    doktorAd: string;
  }

  const [appointments, setAppointments] = useState<Appointment[]>([]);
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

  const fetchAppointments = React.useCallback(async () => {
    try {
      const q = query(
        collection(db, "randevu"),
        where("hastaId", "==", patientId),
        where("doktorId", "==", doctorId),
      );
      const querySnapshot = await getDocs(q);
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const fetchedAppointments: any[] = [];
      for (const doc of querySnapshot.docs) {
        fetchedAppointments.push(doc.data());
      }
      setAppointments(fetchedAppointments);
    } catch (error) {
      console.error("Randevular alınırken hata oluştu: ", error);
    }
  }, [patientId, doctorId]);

  const handleCreateAppointment = async () => {
    console.log("Randevu oluşturuluyor...");
    if (!hour || !randevuTarihi) {
      alert("Lütfen tarih ve saat seçiniz.");
      return;
    }

    try {
      const appointmentRef = collection(db, "randevu");
      await addDoc(appointmentRef, {
        hastaId: patientId,
        doktorId: doctorId,
        tarih: randevuTarihi.toISOString().split("T")[0],
        saat: hour,
        hastaAd: patientName,
        doktorAd: doctorName,
      });
      alert("Randevu başarıyla oluşturuldu.");
      setHour("");
    } catch (error) {
      console.error("Randevu oluşturulamadı:", error);
      alert("Randevu oluşturulamadı.");
    }
  };

  useEffect(() => {
    if (selectedOption === "guncelRandevular") {
      fetchAppointments();
    }
  }, [selectedOption, fetchAppointments]);

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <DateDaily />

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
            <Takvim
              selectedDate={randevuTarihi}
              onDateChange={setRandevuTarihi}
            />

            <Text style={styles.selectedDateText}>
              Seçilen Tarih: {randevuTarihi.toLocaleDateString("tr-TR")}
            </Text>

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={hour || ""}
                style={styles.picker}
                onValueChange={(itemValue: string) => setHour(itemValue)}
              >
                <Picker.Item label="Saat Seç" value="" />
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
              <Text style={styles.createButtonText}>
                Randevu Talebi Oluştur
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {selectedOption === "guncelRandevular" && (
          <View style={styles.accordionPanel}>
            {appointments.length > 0 ? (
              <ScrollView
                style={{ maxHeight: 300 }}
                showsVerticalScrollIndicator={false}
              >
                {appointments.map((appointment, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  <View key={index} style={styles.appointmentCard}>
                    <Text style={styles.appointmentText}>
                      {appointment.tarih} - {appointment.saat}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.noAppointmentText}>
                Güncel randevunuz bulunmamaktadır.
              </Text>
            )}
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
    marginTop: 0,
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
    marginBottom: 20,
    marginLeft: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  picker: {
    height: 40,
    width: "80%",
    justifyContent: "center",
  },
  selectedDateText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
    marginBottom: 10,
    textAlign: "center",
  },

  placeholderText: {
    fontSize: 10,
    color: "#888",
  },
  createButton: {
    width: "80%",
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  appointmentCard: {
    backgroundColor: "#f0f0f0", // veya istediğin bir renk
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android gölgesi
  },

  appointmentText: {
    fontSize: 16,
    color: "#333",
  },
});

export default PtRandevuButton;
