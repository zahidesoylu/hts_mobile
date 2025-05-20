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
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import Takvim from "@/components/ui/takvim";
import DateDaily from "./dateDaily";
import "react-datepicker/dist/react-datepicker.css";
import Icon from "react-native-vector-icons/FontAwesome"; // ya da MaterialIcons gibi
import { Ionicons } from "@expo/vector-icons";

const PtRandevuButton = () => {
  const [selectedOption, setSelectedOption] = useState<string>("none");
  const [hour, setHour] = useState<string>("");
  const [randevuTarihi, setRandevuTarihi] = useState(new Date());


  interface Appointment {
    id?: string;
    hastaId: string;
    doktorId: string;
    tarih: string;
    saat: string;
    hastaAd: string;
    doktorAd: string;
    isApproved: boolean; // Onay durumu ekledik
  }

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);

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
      const fetchedAppointments: Appointment[] = [];

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data() as Appointment;
        fetchedAppointments.push({
          ...data,
          id: docSnap.id, // burada Firestore doküman ID'sini ekliyoruz
        });
      }

      // BURASI ÖNEMLİ: fetchedAppointments dizisini sıralıyoruz
      fetchedAppointments.sort((a, b) => {
        const dateA = new Date(`${a.tarih}T${a.saat}`);
        const dateB = new Date(`${b.tarih}T${b.saat}`);
        return dateA.getTime() - dateB.getTime(); // En yakın en başta
      });

      setAppointments(fetchedAppointments);
    } catch (error) {
      console.error("Randevular alınırken hata oluştu: ", error);
    }
  }, [patientId, doctorId]);

  const handleCreateAppointment = async () => {
    if (!hour || !randevuTarihi) {
      alert("Lütfen tarih ve saat seçiniz.");
      return;
    }
    // Seçilen tarih ve saat birleştirilip Date objesi oluşturuluyor
    const [hourStr, minuteStr] = hour.split(":");
    const selectedDateTime = new Date(randevuTarihi);
    selectedDateTime.setHours(Number.parseInt(hourStr));
    selectedDateTime.setMinutes(Number.parseInt(minuteStr));
    selectedDateTime.setSeconds(0);
    selectedDateTime.setMilliseconds(0);

    const now = new Date();

    if (selectedDateTime < now) {
      alert("Geçmiş bir saat için randevu alınamaz.");
      return;
    } const selectedDate = randevuTarihi.toISOString().split("T")[0];

    // Önce aynı tarih ve saatte daha önce alınmış bir randevu var mı kontrol ediyoruz
    const q = query(
      collection(db, "randevu"),
      where("hastaId", "==", patientId),
      where("doktorId", "==", doctorId),
      where("tarih", "==", selectedDate),
      where("saat", "==", hour)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      alert("Bu tarih ve saatte zaten bir randevunuz mevcut.");
      return;
    }

    try {
      const appointmentRef = collection(db, "randevu");


      console.log("Firestore'a gönderilen veriler:", {
        hastaId: patientId,
        doktorId: doctorId,
        tarih: randevuTarihi.toISOString().split("T")[0],
        saat: hour,
        hastaAd: patientName,
        doktorAd: doctorName,
        isApproved: false,
      });

      await addDoc(appointmentRef, {
        hastaId: patientId,
        doktorId: doctorId,
        tarih: randevuTarihi.toISOString().split("T")[0],
        saat: hour,
        hastaAd: patientName,
        doktorAd: doctorName,
        isApproved: false, // Başlangıçta onay durumu false
      });
      alert("Randevu başarıyla oluşturuldu.");
      setHour("");
    } catch (error) {
      console.error("Randevu oluşturulamadı:", error);
      alert("Randevu oluşturulamadı.");
    }

  };

  useEffect(() => {
    if (
      selectedOption === "guncelRandevular" ||
      selectedOption === "gecmisRandevular"
    ) {
      fetchAppointments();
    }
  }, [selectedOption, fetchAppointments]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // sadece tarih kıyaslaması için

    if (selectedOption === "guncelRandevular") {
      const now = new Date(); // şu anki tarih ve saat
      const filtered = appointments.filter((randevu) => {
        const randevuDateTime = new Date(`${randevu.tarih}T${randevu.saat}`);
        return randevuDateTime >= now;
      });
      setFilteredAppointments(filtered);
    }

    if (selectedOption === "gecmisRandevular") {
      const now = new Date();
      const filtered = appointments.filter((randevu) => {
        const randevuDateTime = new Date(`${randevu.tarih}T${randevu.saat}`);
        return randevuDateTime < now;
      });
      setFilteredAppointments(filtered);
    }
  }, [selectedOption, appointments]);

  const handleApprovalToggle = async (appointment: Appointment) => {
    try {
      if (!appointment.id) {
        throw new Error("Appointment ID is undefined.");
      }
      const appointmentRef = doc(db, "randevu", appointment.id); // appointment.id veritabanındaki randevunun id'si
      await updateDoc(appointmentRef, {
        isApproved: !appointment.isApproved, // Onay durumunu değiştiriyoruz
      });
      alert(
        appointment.isApproved
          ? "Randevu onayı iptal edildi."
          : "Randevu onaylandı.",
      );
    } catch (error) {
      console.error("Randevu onaylanırken hata oluştu: ", error);
    }
  };

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
            <Text style={styles.optionButtonText}>Randevu Talebi Oluştur</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => handleOptionPress("guncelRandevular")}
          >
            <Text style={styles.optionButtonText}>Güncel Randevu Taleplerim</Text>
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

        {(selectedOption === "guncelRandevular" ||
          selectedOption === "gecmisRandevular") && (
            <View style={styles.accordionPanel}>
              {filteredAppointments.length > 0 ? (
                <ScrollView
                  style={{ maxHeight: 200 }}
                  showsVerticalScrollIndicator={false}
                >
                  {filteredAppointments.map((appointment, index) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                    <View key={index} style={styles.appointmentCard}>
                      <Text
                        style={[
                          styles.appointmentText,
                          selectedOption === "gecmisRandevular" &&
                          styles.appointmentPastText,
                        ]}
                      >
                        {appointment.saat} -{" "}
                        {new Date(appointment.tarih).toLocaleDateString("tr-TR")}
                      </Text>
                      {/* Onay Simgesi */}
                      <View style={styles.checkboxContainer}>
                        <Text
                          style={{
                            color: selectedOption === "gecmisRandevular"
                              ? "gray"
                              : appointment.isApproved
                                ? "#183B4E"
                                : "gray",
                            fontSize: 14,
                            marginLeft: 8,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {selectedOption === "gecmisRandevular"
                            ? "Geçmiş Randevu"
                            : appointment.isApproved
                              ? "Onaylandı"
                              : "Beklemede"}
                        </Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <Text style={styles.noAppointmentText}>
                  {selectedOption === "guncelRandevular"
                    ? "Güncel randevunuz bulunmamaktadır."
                    : "Geçmiş randevunuz bulunmamaktadır."}
                </Text>
              )}
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
    borderWidth: 2,
    borderColor: "#183B4E",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginBottom: -2,
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
    backgroundColor: "#2E5077",
    borderRadius: 8,
    marginVertical: 10,
  },
  infoText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "white",
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
    borderWidth: 2,
    borderColor: "#183B4E",
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
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
    color: "#888", // biraz soluk görünür
    textAlign: "center",
    textDecorationLine: "line-through",
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
    backgroundColor: "#2E5077",
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
    flexDirection: "row",
    justifyContent: "space-between",
  },
  appointmentText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24, // Metnin dikeyde daha rahat ortalanması için
    justifyContent: "center", // Dikeyde ortalama
    alignItems: "center", // Dikeyde ortalama
    height: 10, // Yükseklik vererek ortalanacak alanı sağlıyoruz
  },

  appointmentPastText: {
    textDecorationLine: "line-through",
    color: "#888", // soluk gri tonu
  },
  checked: {
    color: "green",
    fontSize: 20,
    marginLeft: 10,
  },
  unchecked: {
    color: "gray",
    fontSize: 20,
    marginLeft: 10,
  },
  checkboxContainer: {
    marginLeft: "auto", // simgeyi sağa yaslamak için
    paddingHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",

  },
});

export default PtRandevuButton;
