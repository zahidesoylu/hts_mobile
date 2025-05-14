import type React from "react";
import { useState, useRef } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";


interface VoiceInputProps {
    onSpeechResult: (text: string) => void;
    onSpeechStart?: () => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onSpeechResult, onSpeechStart }) => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    const handleStart = () => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            alert("Tarayıcınız sesli giriş desteklemiyor.");
            return;
        }

        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.lang = "tr-TR";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            if (onSpeechStart) onSpeechStart();
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript;
            onSpeechResult(transcript);
        };

        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        recognition.onerror = (event: { error: any; }) => {
            console.error("Speech recognition error", event.error);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    const handleStop = () => {
        recognitionRef.current?.stop();
        setIsListening(false);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={isListening ? handleStop : handleStart}
                style={styles.button}
            >
                <Text style={styles.buttonText}>
                    {isListening ? "🛑 Durdur" : "🎤 Sesli Cevap Ver"}
                </Text>
            </TouchableOpacity>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        marginTop: 8, // mt-2 eşdeğeri
    },
    button: {
        width: 100, // w-48
        height: 30, // h-12
        backgroundColor: "#2E5077", // Tailwind'de bg-blue-500
        borderRadius: 12, // rounded-xl
        marginLeft: 20, // ml-5
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontSize: 10,
    },
});

export default VoiceInput;
