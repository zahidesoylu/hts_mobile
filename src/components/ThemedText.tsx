import { Text, TextProps } from "react-native";

interface ThemedTextProps extends TextProps {
  type?: "title" | "link";
}

export function ThemedText({ type, style, ...props }: ThemedTextProps) {
  let textStyle = {};

  if (type === "title") {
    textStyle = { fontSize: 24, fontWeight: "bold", color: "black" };
  } else if (type === "link") {
    textStyle = { fontSize: 16, color: "blue", textDecorationLine: "underline" };
  }

  return <Text {...props} style={[textStyle, style]} />;
}
