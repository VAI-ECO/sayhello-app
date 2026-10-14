import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const MeetupHeader = () => {
  const [selectedItem, setSelectedItem] = useState(2);

  const navigation = useNavigation();

  const handleSelect = (item) => {
    if (item === 2) {
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
        // width:"90%",
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
          My
          <AntDesign name="heart" size={16} color="#F01717" />
          Meet Ups
        </Text>
      </TouchableOpacity>
      <LinearGradient
        colors={["#338AFF", "#CCCCCC"]}
        style={styles.circlecontainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Image style={styles.icon} source={require("../assets/manicon.png")} />
        <Text allowFontScaling={false} style={styles.innertext}>Meet Ups</Text>
      </LinearGradient>
      <TouchableOpacity
        style={[
          styles.maincontainer,
          isItemSelected(2) && styles.selectedContainer,
        ]}
        onPress={() => {
          handleSelect(2);
        }}
      >
        <Text allowFontScaling={false} style={[styles.text, isItemSelected(2) && styles.selectedText]}>
          Create a Meet up
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default MeetupHeader;
const styles = StyleSheet.create({
  maincontainer: {
    backgroundColor: "#fff",
    padding: 7,
    // width: 130,
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
