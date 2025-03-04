import React from "react";
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import BottomMenu from "../../src/components/ui/BottomMenu";

const DoctorMenu = () => {
  const doctorGender = "male"; // "male" veya "female" olarak değiştirilebilir

  return (
    <SafeAreaView style={styles.containerWrapper}>
      {/* İçerik */}
      <View style={styles.container}>
        <View style={styles.innerContainer}>
          {/* Tarih Alanı */}
          <View style={styles.topSection}>
            <Text style={styles.dateText}>4 Mart 2025</Text>
          </View>

          {/* Doktor Bilgileri */}
          <View style={styles.doctorInfoWrapper}>
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorTitle}>Doç. Dr.</Text>
              <Text style={styles.doctorName}>Şeyma Özkaya</Text>
            </View>
            <View style={styles.profileIconContainer}>
              <MaterialCommunityIcons
                name={doctorGender === "male" ? "doctor" : "face-woman"}
                size={50}
                color="#007AFF"
              />
            </View>
          </View>

          {/* Arama Alanı */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="gray" />
            <TextInput placeholder="Ara..." style={styles.searchInput} />
          </View>

          {/* Butonlar */}
          <View style={styles.buttonGrid}>
            {["Randevular", "Raporlar", "Hastalar", "Mesajlar"].map((item, index) => (
              <TouchableOpacity key={index} style={styles.menuButton}>
                <Text style={styles.buttonText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Alt Menü - İçeriğin en altında sabitlendi */}
          <BottomMenu />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  containerWrapper: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1, // Tüm ekranı kaplasın
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  innerContainer: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    flex: 1, // İçeriğin tüm alanı doldurmasını sağlar
    justifyContent: "flex-start",
  },
  topSection: {
    alignItems: "center",
    marginBottom: 10,
  },
  dateText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  doctorInfoWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  doctorInfo: {
    alignItems: "flex-start",
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  doctorTitle: {
    fontSize: 16,
    color: "gray",
  },
  profileIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    marginVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    padding: 10,
  },
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  menuButton: {
    width: "48%",
    height: 100,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DoctorMenu;
