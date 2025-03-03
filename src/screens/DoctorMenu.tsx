import React from "react";
import { 
  View, 
  Text, 
  TextInput, 
  Image, 
  TouchableOpacity, 
  StyleSheet 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const DoctorMenu = () => {
  return (
    <View style={styles.container}>
      {/* Üst Kısım */}
      <View style={styles.header}>
        <Text style={styles.date}>29 Şubat 2025</Text>
        <View style={styles.profileContainer}>
          <Text style={styles.greeting}>Merhaba, Dr. X</Text>
          <Image source={{ uri: "DOKTOR_PROFIL_RESIM_URL" }} style={styles.profileImage} />
        </View>
      </View>

      {/* Arama Çubuğu */}
      <TextInput style={styles.searchBar} placeholder="Ara..." />

      {/* Özellik Kartları */}
      <View style={styles.featuresContainer}>
        <TouchableOpacity style={styles.featureBox}><Text>Randevular</Text></TouchableOpacity>
        <TouchableOpacity style={styles.featureBox}><Text>Hasta Bilgileri</Text></TouchableOpacity>
        <TouchableOpacity style={styles.featureBox}><Text>Raporlar</Text></TouchableOpacity>
        <TouchableOpacity style={styles.featureBox}><Text>Mesajlar</Text></TouchableOpacity>
      </View>

      {/* Alt Navigasyon */}
      <View style={styles.bottomNav}>
        <TouchableOpacity><Ionicons name="home" size={24} /></TouchableOpacity>
        <TouchableOpacity><Ionicons name="calendar" size={24} /></TouchableOpacity>
        <TouchableOpacity><Ionicons name="chatbubbles" size={24} /></TouchableOpacity>
        <TouchableOpacity><Ionicons name="settings" size={24} /></TouchableOpacity>
      </View>
    </View>
  );
};

// StyleSheet ile stiller
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 20,
  },
  header: {
    flexDirection: "column" as "column",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  date: {
    fontSize: 16,
    color: "#6C757D",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  searchBar: {
    height: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureBox: {
    width: "48%",
    height: 100,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 15,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 5,
  },
});

export default DoctorMenu;

