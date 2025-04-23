import { type ColorSchemeName, useColorScheme as _useColorScheme } from "react-native";

/**
 * Cihazın tema (light/dark) ayarını döndüren özel bir hook.
 */
export function useColorScheme(): NonNullable<ColorSchemeName> {
  return _useColorScheme() ?? "light"; // Eğer cihaz ayarı yoksa varsayılan olarak 'light' kullan
}
