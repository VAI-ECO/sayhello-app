import React, { useState } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
const BeyondHeader = () => {
  const [selectedItem, setSelectedItem] = useState(1);

  const navigation = useNavigation();
  const handleSelect = (item) => {
    setSelectedItem(item);
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
        <Text allowFontScaling={false} style={[styles.text, isItemSelected(1) && styles.selectedText]}>
          Donate
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.maincontainer]}
        onPress={() => {
          navigation.navigate("PledgeHello");
        }}
      >
        <Text allowFontScaling={false}>Pledge</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BeyondHeader;

const styles = StyleSheet.create({
  maincontainer: {
    backgroundColor: "#fff",
    padding: 6,
    paddingHorizontal: 30,
    borderWidth: 0.8,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
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
  circlecontainer: {
    width: 90,
    height: 90,
    borderRadius: 50,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  icon: {
    resizeMode: "contain",
    alignSelf: "center",
    width: 50,
    height: 50,
  },
  innertext: {
    fontSize: 13,
    fontWeight: "bold",
    fontFamily: "Roboto-Bold",
    color: "#000000",
  },
});
