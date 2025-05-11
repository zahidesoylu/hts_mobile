import type React from "react";
import { useState, useRef } from "react";

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
        <div className="mt-2">
            {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
            <button
                onClick={isListening ? handleStop : handleStart}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                {isListening ? "🛑 Durdur" : "🎤 Konuşmaya Başla"}
            </button>
        </div>
    );
};

export default VoiceInput;
