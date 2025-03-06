import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import BottomMenu from "../../src/components/ui/BottomMenu";

// Randevu tipi için bir interface tanımlıyoruz.
interface Appointment {
  hour: string;
  name: string;
  status: string;
}

const DrRandevuButton = () => {
  const [selectedDate, setSelectedDate] = useState("Bugün");

  const doctorName = "Doktor: Şeyma Özkaya";

  const appointments: Appointment[] = [
    { hour: "10:00", name: "Ali Veli", status: "Iptal Et" },
    { hour: "11:00", name: "Ayşe Yılmaz", status: "Iptal Et" },
    { hour: "13:00", name: "Murat Kaya", status: "Iptal Et" },
    { hour: "14:00", name: "Zeynep Kaya", status: "Iptal Et" },
    { hour: "16:00", name: "Kemal Aktaş", status: "Iptal Et" },
  ];

  // "İptal Et" butonuna tıklandığında yapılacak işlemi tanımlıyoruz.
  const handleCancel = (appointment: Appointment) => {
    console.log(`Randevu iptal edildi: ${appointment.hour} - ${appointment.name}`);
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

        <Text style={styles.doctorName}>{doctorName}</Text>
        
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

        {/* Randevular Listesi */}
        <FlatList
          data={appointments}
          renderItem={({ item }: { item: Appointment }) => (
            <View style={styles.appointmentRow}>
              <Text style={styles.appointmentText}>{item.hour}</Text>
              <Text style={styles.appointmentText}>{item.name}</Text>
              <TouchableOpacity 
                style={styles.cancelButtonStyle} 
                onPress={() => handleCancel(item)}
              >
                <Text style={styles.cancelButtonText}>İptal Et</Text>
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
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
  headingText: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
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
