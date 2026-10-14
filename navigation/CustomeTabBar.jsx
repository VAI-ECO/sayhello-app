import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Keyboard,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";

import {
  Entypo,
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome5,
} from "@expo/vector-icons";
import { useAuth } from "../Context/AuthContext";

export const CustomTabBar = ({ state, descriptors }) => {
  const navigation = useNavigation();
  const [keyboardIsVisible, setKeyboardIsVisible] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardIsVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardIsVisible(false);
      }
    );

    // Clean up listeners when component unmounts
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  if (keyboardIsVisible) {
    return null; // Hide the tab bar when keyboard is open
  }

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "white",
        padding: 10,
        elevation: 1,
        shadowColor: "#000", // Dark shadow color
        shadowOffset: { width: 0, height: -2 }, // Shadow offset
        shadowOpacity: 1, // Opacity of the shadow
        shadowRadius: 10, // Radius of the shadow
      }}
    >
      {/* Your custom tab bar content */}
      <TouchableOpacity
        onPress={() => navigation.navigate("Home")}
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            backgroundColor: "#338AFF21",
            borderRadius: 27,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Entypo name="home" size={26} color="#338AFF" />
        </View>
        <Text
          allowFontScaling={false}
          style={{ fontFamily: "Roboto-Regular", fontSize: 12 }}
        >
          Home
        </Text>
      </TouchableOpacity>
      {user?.user?.user_type === "business" ||
      user?.user?.user_type === "group" ||
      user?.user?.user_type === "organization" ? (
        <TouchableOpacity
          onPress={() => navigation.navigate("SelectedPosting")}
          style={{ justifyContent: "center", alignItems: "center" }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              backgroundColor: "#338AFF21",
              borderRadius: 27,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons
              name="message-reply-text-outline"
              size={26}
              color="#338AFF"
            />
          </View>
          <Text
            allowFontScaling={false}
            style={{ fontFamily: "Roboto-Regular", fontSize: 12 }}
          >
            Posts
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => navigation.navigate("Connections")}
          style={{ justifyContent: "center", alignItems: "center" }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              backgroundColor: "#338AFF21",
              borderRadius: 27,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons
              name="message-reply-text-outline"
              size={26}
              color="#338AFF"
            />
          </View>
          <Text
            allowFontScaling={false}
            style={{ fontFamily: "Roboto-Regular", fontSize: 12 }}
          >
            Connections
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={{ justifyContent: "center", alignItems: "center" }}
        onPress={() => navigation.navigate("WhatsHappening")}
      >
        <View
          style={{
            width: 48,
            height: 48,
            backgroundColor: "#338AFF21",
            borderRadius: 27,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={require("../assets/happening.png")}
            resizeMode="contain"
            style={{
              width: 26,
              height: 26,
            }}
          />
        </View>
        <Text
          allowFontScaling={false}
          style={{ fontFamily: "Roboto-Regular", fontSize: 12 }}
        >
          Happening
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ justifyContent: "center", alignItems: "center" }}
        onPress={() => navigation.navigate("MapScreen")}
      >
        <View
          style={{
            width: 48,
            height: 48,
            backgroundColor: "#338AFF21",
            borderRadius: 27,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <FontAwesome5 name="map-marked-alt" size={24} color="#338AFF" />
        </View>
        <Text
          allowFontScaling={false}
          style={{ fontFamily: "Roboto-Regular", fontSize: 12 }}
        >
          Hello Map
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ justifyContent: "center", alignItems: "center" }}
        onPress={() => navigation.navigate("EditProfile")}
      >
        <View
          style={{
            width: 48,
            height: 48,
            backgroundColor: "#338AFF21",
            borderRadius: 27,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="person-circle-sharp" size={29} color="#338AFF" />
        </View>
        <Text
          allowFontScaling={false}
          style={{ fontFamily: "Roboto-Regular", fontSize: 12 }}
        >
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
};
