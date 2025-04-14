import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { StyleSheet } from "react-native";

const Takvim = () => {
  const [startDate, setStartDate] = useState(new Date());

  return (
    <div>
      <h3>Randevu Tarihi Seçin</h3>
      <DatePicker
        selected={startDate}
        onChange={(date: Date | null) => date && setStartDate(date)}
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
});

export default Takvim;
