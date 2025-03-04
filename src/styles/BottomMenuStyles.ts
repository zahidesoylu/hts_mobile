import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    width: 400,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    height: 60, // Sabit yükseklik eklendi
  },
  text: {
    fontSize: 16,
    color: "#333",
  },
  menuItem: {  
    alignItems: "center",
  },
  menuText: {  
    fontSize: 14,
    color: "#333",
    marginTop: 4,
  },
  micButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 20,
  },
});

export default styles; // ✅ Default export olarak değiştirildi
