import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");
const marginBottom = width <= 360 ? height * 0.001 : width < 768 ? height * 0.001 : height * 0.001;
const marginTop = width <= 360 ? height * 0.002 : width < 768 ? height * 0.01 : height * 0.01

const Header = ({ title, handleBack }) => {
  const navigation = useNavigation();
  const goBack = () => {
    navigation.goBack();
  };
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: width * 0.05,
        marginBottom: marginBottom,
        marginTop: marginTop,
      }}
    >
      <TouchableOpacity
        onPress={handleBack ? handleBack : goBack}
        style={{
          width: "14%",
          justifyContent: "flex-start",
        }}
      >
        <Image
          style={{
            width: 35,
            height: 35,
            resizeMode: "contain",
          }}
          source={require("../assets/btnbtn.png")}
        />
      </TouchableOpacity>
      <Text
        allowFontScaling={false}
        style={{
          color: "black",
          fontSize: 20,
          fontWeight: "bold",
          fontFamily: "Roboto-Regular",
        }}
      >
        {title}
      </Text>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({});
