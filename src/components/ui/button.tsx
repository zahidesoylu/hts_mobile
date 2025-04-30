import { Text, TouchableOpacity, StyleSheet } from "react-native";

const Button = ({ children, onPress, style }: { children: React.ReactNode; onPress?: () => void; style?: any }) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={styles.text}>{children}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  text: {
    color: "white",
    fontWeight: "600",
  },
});

export default Button;
