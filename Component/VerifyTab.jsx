import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const VerifyTab = () => {
  const [selectedItem, setSelectedItem] = useState(1);

  const navigation = useNavigation();
  const handleSelect = (item) => {
    setSelectedItem(item);
  };

  const isItemSelected = (item) => {
    return selectedItem === item;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tabButton, isItemSelected(1) && styles.selectedButton]}
        onPress={() => handleSelect(1)}
      >
        <Text allowFontScaling={false}
          style={[styles.tabText, isItemSelected(1) && styles.selectedText]}
        >
          Email
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabButton, isItemSelected(2) && styles.selectedButton]}
        onPress={() => handleSelect(2)}
      >
        <Text allowFontScaling={false}
          style={[styles.tabText, isItemSelected(2) && styles.selectedText]}
        >
          Phone
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default VerifyTab;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    alignSelf: "center",
    marginTop: 25,
  },
  tabButton: {
    backgroundColor: "#fff",
    paddingVertical: 9,
    paddingHorizontal: 55,
    borderWidth: 0.8,
    borderRadius: 10,
    justifyContent: "center",
    marginHorizontal: 10,
  },
  selectedButton: {
    backgroundColor: "#338AFF",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#000000",
  },
  selectedText: {
    color: "white",
  },
});
