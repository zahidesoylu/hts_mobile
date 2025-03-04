import { View, ViewProps } from "react-native";

export function ThemedView(props: ViewProps) {
  return <View {...props} style={[{ backgroundColor: "white" }, props.style]} />;
}
