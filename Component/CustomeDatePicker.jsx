import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import Modal from "react-native-modal";

const CustomDatePicker = ({
  onDateSelected,
  setModalVisible,
  isModalVisible,
}) => {
  const [selectedDay, setSelectedDay] = useState("01");
  const [selectedMonth, setSelectedMonth] = useState("01");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const days = Array.from({ length: 31 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );
  const months = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );
  const years = Array.from({ length: 100 }, (_, i) =>
    (new Date().getFullYear() - i).toString()
  );

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleDateSelection = () => {
    const date = `${selectedYear}-${selectedMonth}-${selectedDay}`;
    onDateSelected(date);
    toggleModal();
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Select Date</Text>
          <View style={styles.bottomDivider} />
          <View style={styles.pickerLabels}>
            <Text style={styles.labelText}>Day</Text>
            <Text style={styles.labelText}>Month</Text>
            <Text style={styles.labelText}>Year</Text>
          </View>
          <View style={styles.pickerContainer}>
            <ScrollView style={styles.picker}>
              {days.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedDay(day)}
                  style={[
                    styles.pickerItem,
                    selectedDay === day && styles.selectedItem,
                  ]}
                >
                  <Text style={styles.pickerText}>{day}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.divider} />
            <ScrollView style={styles.picker}>
              {months.map((month, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedMonth(month)}
                  style={[
                    styles.pickerItem,
                    selectedMonth === month && styles.selectedItem,
                  ]}
                >
                  <Text style={styles.pickerText}>{month}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.divider} />
            <ScrollView style={styles.picker}>
              {years.map((year, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedYear(year)}
                  style={[
                    styles.pickerItem,
                    selectedYear.toString() === year && styles.selectedItem,
                  ]}
                >
                  <Text style={styles.pickerText}>{year}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <TouchableOpacity
            onPress={handleDateSelection}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>Select Date</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default CustomDatePicker;

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    marginBottom: 5,
  },
  pickerLabels: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 10,
  },
  labelText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  picker: {
    flex: 1,
    height: 150,
  },
  pickerItem: {
    padding: 5,
  },
  selectedItem: {
    backgroundColor: "#d3d3d3",
    borderRadius: 5,
  },
  pickerText: {
    fontSize: 20,
  },
  divider: {
    width: 1,
    height: "100%",
    backgroundColor: "#C0C0C0",
    marginHorizontal: 10,
  },
  bottomDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "#C0C0C0",
    marginVertical: 10,
  },
  closeButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
  },
});
