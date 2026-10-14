import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import Header from "../../../Component/Header";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../../Context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../../../Context/i18n";
const AlsInfluncer = () => {
  const navigation = useNavigation();
  const { signIn } = useAuth();

  const [user_info, setUser_info] = useState(null);

  console.log("user_info", user_info);

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem("user_info");
      if (value !== null) {
        // value previously stored
        const new_val = JSON.parse(value);
        setUser_info(new_val);
      }
    } catch (e) {
      // error reading value
      console.log("e", e);
    }
  };

  useEffect(() => {
    getData();
  }, [navigation]);

  const handleSignIn = async () => {
    // console.log(user_info?.);
    await signIn(user_info?.email, user_info?.epassword);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* <Header title="" /> */}
      <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
        <Image
          source={require("../../../assets/handals.png")}
          style={styles.camlogo}
        />
        <Image
          source={require("../../../assets/imageaLS.png")}
          style={styles.camlogo}
        />
      </View>
      <Image
        source={require("../../../assets/SAYALS.png")}
        style={{
          resizeMode: "contain",
          width: 170,
          alignSelf: "center",
          top: -25,
        }}
      />
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: "Roboto-Regular",
          fontSize: 20,
          fontWeight: "bold",
          color: "#fff",
          alignSelf: "center",
          top: -20,
          marginBottom: 5,
        }}
      >
        {i18n.t("global.als")}
      </Text>
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: "Roboto-Regular",
          fontSize: 14,
          fontWeight: "600",
          color: "#fff",
          alignSelf: "center",
          top: -20,
          marginBottom: 8,
        }}
      >
        {i18n.t("global.louGehrigsDisease")}
      </Text>
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: "Roboto-Regular",
          fontSize: 16,
          fontWeight: "600",
          color: "#fff",
          lineHeight: 22,
          top: -20,
          marginBottom: 5,
          marginHorizontal: 22,
        }}
      >
        {i18n.t("global.alsDescription")}
      </Text>
      <View
        style={{
          position: "absolute",
          width: "100%",
          alignSelf: "center",
          bottom: 20,
        }}
      >
        {/* <LinearGradient
          colors={["#fff", "#fff"]}
          style={styles.buttonok}
          start={{ x: 0, y: 0 }}
          end={{ x: 1.2, y: 0.6 }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate("BeyondHello")}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 18,
                fontWeight: "bold",
                fontFamily: "Inter-Regular",
                color: "red",
              }}
            >
              Donate
            </Text>
          </TouchableOpacity>
        </LinearGradient> */}

        <>
          <View style={styles.buttonno}>
            <TouchableOpacity
              onPress={() => handleSignIn()}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  fontFamily: "Inter-Regular",
                  color: "red",
                }}
              >
                {i18n.t("global.complete")}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      </View>
    </SafeAreaView>
  );
};

export default AlsInfluncer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FF3B3B",
    paddingTop: 55,
  },
  camlogo: {
    resizeMode: "contain",
    width: 130,
    top: -15,
  },
  buttonok: {
    width: "90%",
    height: 50,
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 20,
  },
  buttonno: {
    width: "90%",
    height: 50,
    borderRadius: 10,
    alignSelf: "center",
    backgroundColor: "#fff",
    borderWidth: 0.5,
    borderColor: "#1F1F1F",
  },
});
