import React from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import BottomMenu from "../../src/components/ui/BottomMenu";

const PatientMenu = () => {
  const patientName = "Hasta: Ayşe Yılmaz";
  const doctorName = "Doktor: Şeyma Özkaya";

  return (
    <View style={styles.container}>
      {/* Ana Konteyner */}
      <View style={styles.innerContainer}>
        {/* Üst Kısım: Tarih */}
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </Text>

        {/* Profil Bilgileri */}
        <FontAwesome name="user-circle" size={50} color="gray" style={styles.profileIcon} />
        <Text style={styles.patientName}>{patientName}</Text>
        <Text style={styles.doctorName}>{doctorName}</Text>

        {/* Arama Çubuğu */}
        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={20} color="gray" />
          <TextInput placeholder="Ara..." style={styles.searchInput} />
        </View>

        {/* Menü Butonları */}
        <View style={styles.menuContainer}>
          {["Raporlar", "Randevular", "Hatırlatmalar", "Mesajlar"].map((title, index) => (
            <TouchableOpacity key={index} style={styles.menuButton}>
              <Text style={styles.menuText}>{title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Alt Menü */}
      <BottomMenu />
    </View>
  );
};

// **STYLE KISMI ALTA AYRILDI**
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
    borderTopLeftRadius: 10,  // 🔹 Sadece sol üst köşe yuvarlak
    borderTopRightRadius: 10, // 🔹 Sadece sağ üst köşe yuvarlak
    borderBottomLeftRadius: 0, // 🔸 Alt köşeler köşeli
    borderBottomRightRadius: 0,
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
  profileIcon: {
    marginBottom: 10,
  },
  patientName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  doctorName: {
    fontSize: 14,
    color: "gray",
    marginTop: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eee",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginVertical: 35,
    width: "100%",
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    marginLeft: 15,
  },
  menuContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center", // 📌 Butonları yatayda ortalar
    width: "100%", // 📌 Konteynerin genişliği tam olsun
},

  menuButton: {
    width: "45%",
    height: "80%",
    backgroundColor: "#ddd",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: {
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default PatientMenu;
