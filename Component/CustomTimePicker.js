import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import Modal from "react-native-modal";

const CustomTimePicker = ({ onTimeSelected }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState("01");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const [selectedPeriod, setSelectedPeriod] = useState("AM");

  const opacity = useRef(new Animated.Value(0)).current;

  const toggleModal = () => {
    setModalVisible(!isModalVisible);

    Animated.timing(opacity, {
      toValue: isModalVisible ? 0 : 1,
      duration: 500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const hours = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );
  const periods = ["AM", "PM"];

  useEffect(() => {
    let time = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;

    onTimeSelected(time);
  }, [selectedHour, selectedMinute, selectedPeriod]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TouchableOpacity onPress={toggleModal}>
        <Text style={{ fontSize: 20 }}>
          {selectedHour}:{selectedMinute} {selectedPeriod}
        </Text>
      </TouchableOpacity>

      <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
        <Animated.View style={[styles.modalContent, { opacity }]}>
          <Text style={styles.title}>Select Time</Text>

          <View style={styles.pickerContainer}>
            <ScrollView style={styles.picker}>
              {hours.map((hour, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedHour(hour)}
                  style={[
                    styles.pickerItem,
                    selectedHour === hour && styles.selectedItem,
                  ]}
                >
                  <Text style={styles.pickerText}>{hour}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.separator}>:</Text>
            <ScrollView style={styles.picker}>
              {minutes.map((minute, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedMinute(minute)}
                  style={[
                    styles.pickerItem,
                    selectedMinute === minute && styles.selectedItem,
                  ]}
                >
                  <Text style={styles.pickerText}>{minute}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.separator}>:</Text>
            <ScrollView style={styles.picker}>
              {periods.map((period, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedPeriod(period)}
                  style={[
                    styles.pickerItem,
                    selectedPeriod === period && styles.selectedItem,
                  ]}
                >
                  <Text style={styles.pickerText}>{period}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity onPress={toggleModal} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Select</Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </View>
  );
};

export default CustomTimePicker;

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
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
    padding: 10,
  },
  selectedItem: {
    backgroundColor: "#d3d3d3",
    borderRadius: 5,
  },
  pickerText: {
    fontSize: 20,
  },
  separator: {
    fontSize: 20,
    marginHorizontal: 10,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#2196F3",
    width: 120,
    height: 40,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
