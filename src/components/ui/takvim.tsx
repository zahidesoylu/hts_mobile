import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { StyleSheet } from "react-native";

type TakvimProps = {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
};

const Takvim = ({ selectedDate, onDateChange }: TakvimProps) => {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <h4>Randevu Tarihi Seçin</h4>
      <DatePicker
        selected={selectedDate}
        onChange={(date: Date | null) => {
          if (date) onDateChange(date);
        }}
        dateFormat="yyyy/MM/dd"
        inline // Takvimi sayfa üzerinde doğrudan göstermek için
      />
    </div>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  button: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
  },
  h4: {
    fontSize: 20,
    textAlign: "center",
  },
});

export default Takvim;
