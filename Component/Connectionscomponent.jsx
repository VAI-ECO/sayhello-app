import React, { useState } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const Connectionscomponent = ({ userName, details, event }) => {
  const [isSelected, setIsSelected] = useState(false);
  const handlePress = () => {
    setIsSelected(!isSelected);
  };

  return (
    <TouchableOpacity onPress={event} style={{ marginBottom: 10 }}>
      <LinearGradient
        colors={
          isSelected ? ["#338AFF", "#00EDB4"] : ["transparent", "transparent"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1.2, y: 0.6 }}
        style={[styles.mainContainer, isSelected && styles.selectedContainer]}
      >
        <View style={styles.innerContainer}>
          {details?.profileUrl === "" ? (
            <Image
              style={styles.profileImage}
              source={require("../assets/profile_img.png")}
            />
          ) : (
            <Image
              style={styles.profileImage}
              source={{ uri: details?.profileUrl }}
            />
          )}

          <Text allowFontScaling={false} style={styles.userName}>{userName}</Text>
          {details?.LoveRelation && (
            <View style={styles.heatBox}>
              <AntDesign name="heart" size={20} color="#D0411B" />
            </View>
          )}
          {details?.BusinessRelation && (
            <Image
              style={{
                resizeMode: "contain",
                width: 35,
                height: 35,
                marginRight: 8,
              }}
              source={require("../assets/busnisesbag.png")}
            />
          )}

          {/* <View style={styles.removebox}>
            <Text allowFontScaling={false}
              style={{
                fontSize: 10,
                fontWeight: "300",
                fontFamily: "Roboto-Regular",
                color: "#fff",
                marginHorizontal: 6,
              }}
            >
              Remove
            </Text>
            <Entypo name="cross" size={18} color="#fff" />
          </View> */}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default Connectionscomponent;

const styles = StyleSheet.create({
  mainContainer: {
    borderWidth: 1,
    borderRadius: 10,
    marginHorizontal: 20,
    borderColor: "#2E93F7",
  },
  selectedContainer: {
    backgroundColor: "#fff",
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 5,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 50,
    resizeMode: "cover",
    alignSelf: "center",
  },
  userName: {
    fontSize: 16,
    paddingLeft: 10,
    fontWeight: "bold",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    flex: 1,
  },
  heatBox: {
    width: 35,
    height: 35,
    backgroundColor: "#fff",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 15,
    borderWidth: 1,
    borderColor: "#D0411B",
    marginRight: 10,
  },
  removebox: {
    flexDirection: "row",
    alignItems: "center",
    width: 73,
    padding: 3,
    backgroundColor: "#FF3B3B",
    borderRadius: 15,
    marginRight: 6,
  },
});
