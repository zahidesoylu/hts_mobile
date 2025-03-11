import React from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import BottomMenu from "../../src/components/ui/BottomMenu";
import SearchBar from "../../src/components/ui/SearchBar";

const DoctorMenu = ({ route }: any) => {
  const { doctorName } = route.params; // DoctorName parametresini alıyoruz


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
        <Text style={styles.doctorName}>{doctorName}</Text>

        {/* Arama Çubuğu */}
        <SearchBar />

        {/* Menü Butonları */}
        <View style={styles.menuContainer}>
          {["Randevular", "Hastalar", "Raporlar", "Mesajlar"].map((title, index) => (
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
    borderTopLeftRadius: 10,  
    borderTopRightRadius: 10, 
    borderBottomLeftRadius: 0, 
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
  doctorName: {
    fontSize: 14,
    color: "black",
    marginTop: 10,
    fontWeight: "bold",
  },
  menuContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-evenly", 
    width: "100%", 
  },

  menuButton: {
    width: "40%",
    height: "70%",
    marginBottom: 30,
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

export default DoctorMenu;
