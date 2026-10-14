import React, { useState, useContext } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
} from "react-native";
import { LanguageContext } from "../Context/LanguageContext";

const CountryLanguageModal = ({ visible, onClose, onSelect }) => {
  const { changeLanguage } = useContext(LanguageContext);
  const [selectedLanguage, setSelectedLanguage] = useState("");

  const languages = [
    { name: "Arabic", code: "ar", flag: require("../assets/flags/SA.png") },
    { name: "Bengali", code: "bn", flag: require("../assets/flags/BD.png") },
    { name: "German", code: "de", flag: require("../assets/flags/DE.png") },
    { name: "English", code: "en", flag: require("../assets/flags/US.png") },
    { name: "French", code: "fr", flag: require("../assets/flags/FR.png") },
    { name: "Hausa", code: "ha", flag: require("../assets/flags/CC.png") },
    { name: "Hindi", code: "hi", flag: require("../assets/flags/IN.png") },
    { name: "Indonesian", code: "id", flag: require("../assets/flags/ID.png") },
    { name: "Japanese", code: "ja", flag: require("../assets/flags/JP.png") },
    { name: "Korean", code: "ko", flag: require("../assets/flags/KR.png") },
    { name: "Marathi", code: "mr", flag: require("../assets/flags/IN.png") },
    { name: "Portuguese", code: "pt", flag: require("../assets/flags/PT.png") },
    { name: "Russian", code: "ru", flag: require("../assets/flags/RU.png") },
    { name: "Tamil", code: "ta", flag: require("../assets/flags/IN.png") },
    { name: "Telugu", code: "te", flag: require("../assets/flags/IN.png") },
    { name: "Turkish", code: "tr", flag: require("../assets/flags/TR.png") },
    { name: "Urdu", code: "ur", flag: require("../assets/flags/PK.png") },
    { name: "Vietnamese", code: "vi", flag: require("../assets/flags/VN.png") },
    { name: "Chinese", code: "zh", flag: require("../assets/flags/CN.png") },
    { name: "Spanish", code: "es", flag: require("../assets/flags/AR.png") },
  ];

  const handleDone = () => {
    if (selectedLanguage) {
      console.log("langObj: ", selectedLanguage);
      changeLanguage(selectedLanguage);
      onSelect && onSelect(null, selectedLanguage); // country is unused here
      onClose();
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedLanguage(item.code);
        changeLanguage(item.code);
        onSelect && onSelect(null, item.code);
        onClose();
      }}
      style={[
        styles.item,
        selectedLanguage === item.code && styles.selectedItem,
      ]}
    >
      <Image source={item.flag} style={styles.flagImage} />
      <Text style={styles.itemText}>{item.name}</Text>
      {selectedLanguage === item.code && (
        <Text style={{ marginLeft: "auto", color: "#00DFAB", fontWeight: "bold" }}>
          ✓
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.heading}>Select Language</Text>
          <FlatList
            data={languages}
            keyExtractor={(item) => item.name}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />

         
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "75%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
    paddingLeft: 17,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedItem: {
    backgroundColor: "#e0f7f5",
    borderRadius: 8,
  },
  flagImage: {
    width: 30,
    height: 20,
    resizeMode: "cover",
    marginRight: 15,
    borderRadius: 4,
  },
  itemText: {
    fontSize: 16,
  },
  doneButton: {
    marginTop: 20,
    backgroundColor: "#00DFAB",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default CountryLanguageModal;
