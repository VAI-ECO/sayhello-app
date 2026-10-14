import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

const BeyondHeaderersec = () => {
  const [selectedItem, setSelectedItem] = useState(2);

  const navigation = useNavigation();

  const handleSelect = (item) => {
    if (item === 1) {
      navigation.navigate("BeyondHello");
    } else if (item === 2) {
      setSelectedItem(item);
    }
  };

  const isItemSelected = (item) => {
    return selectedItem === item;
  };

  return (
    <View
      style={{
        flexDirection: "row",
        paddingHorizontal: 20,
        alignItems: "center",
        justifyContent: "space-between",
        top: -15,
      }}
    >
      <TouchableOpacity
        style={[
          styles.maincontainer,
          isItemSelected(1) && styles.selectedContainer,
        ]}
        onPress={() => handleSelect(1)}
      >
        <Text
          allowFontScaling={false}
          style={[styles.text, isItemSelected(1) && styles.selectedText]}
        >
          Donate
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.maincontainer,
          isItemSelected(2) && styles.selectedContainer,
        ]}
        onPress={() => handleSelect(2)}
      >
        <Text
          allowFontScaling={false}
          style={[styles.text, isItemSelected(2) && styles.selectedText]}
        >
          <Text allowFontScaling={false}>Pledge</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default BeyondHeaderersec;

const styles = StyleSheet.create({
  maincontainer: {
    backgroundColor: "#fff",
    padding: 6,
    paddingHorizontal: 30,
    borderWidth: 0.8,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    top: 9,
  },
  selectedContainer: {
    backgroundColor: "#338AFF",
  },
  text: {
    fontSize: 13,
    fontWeight: "800",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    flexDirection: "row",
    alignItems: "center",
  },
  selectedText: {
    color: "white",
  },
});
