import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../Context/AuthContext";

const ConnectionHeader = ({handleBack}) => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const goBack = () => {
    navigation.goBack();
  };
  
  return (
    <>
      <View
        style={styles.headrecontainer}
      >
        {/* <View style={{ flexDirection: "row", alignItems: "center" }}></View> */}
          <TouchableOpacity onPress={handleBack ? handleBack : goBack}>
                <Image
                  style={{
                    width: 35,
                    height: 35,
                    resizeMode: "contain",
                  }}
                  source={require("../assets/btnbtn.png")}
                />
              </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation?.openDrawer();
          }}
        >
          <Ionicons
            name="menu"
            size={28}
            color="black"
            style={{ paddingHorizontal: 20 }}
          />
        </TouchableOpacity>
      </View>

      <LinearGradient
        colors={["#FD2A2A", "#E90E0E26"]}
        style={styles.boxcontainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Image
          style={styles.handheart}
          source={require("../assets/organizationlogo.png")}
        />
        <Text allowFontScaling={false} style={styles.innertext}>
          Our hello
        </Text>
      </LinearGradient>
    </>
  );
};

export default ConnectionHeader;

const styles = StyleSheet.create({
  boxcontainer: {
    borderRadius: 20,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    width: 80,
    top: -10,
  },
  headrecontainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 22,
  },
  handheart: {
    resizeMode: "contain",
    alignSelf: "center",
    width: 40,
    height: 40,
    marginBottom: 5,
  },
  innertext: {
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "Roboto-Bold",
    color: "#000000",
  },
});
