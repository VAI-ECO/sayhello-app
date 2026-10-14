import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../Context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import Header from "../Component/Header";

const ProfileHeader = ({handleBack}) => {
  const { user } = useAuth();
  const navigation = useNavigation();
  return (
    <>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 5,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Header title="" handleBack={handleBack}/>
        </View>
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
    </>
  );
};

export default ProfileHeader;

const styles = StyleSheet.create({
  image: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
});
