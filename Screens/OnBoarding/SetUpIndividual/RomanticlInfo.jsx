import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import Header from "../../../Component/Header";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import userService from "../../../Services/userService";
import { useAuth } from "../../../Context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../../../Context/i18n";

const RomanticlInfo = () => {
  const { user } = useAuth();

  const [user_info, setUser_info] = useState(null);

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
  }, []);

  const navigation = useNavigation();

  const handelSave = (status) => {
    const data = {
      userId: user_info?._id,
      interestedInDating: status,
    };
    userService
      .saveDatingIntreset(data)
      .then((res) => {
        if (status === false) {
          navigation.navigate("BusinesInfo");
        } else {
          navigation.navigate("RomanticQuestion");
        }
      })
      .catch((err) => {
        console.log("error: ", err);
      });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ImageBackground
        source={require("../../../assets/ImageBackground.jpg")}
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          flex: 1,
          left: 0,
          top: 0,
        }}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <Header title="" />
          <View style={{ top: 30 }}>
            <Text allowFontScaling={false} style={styles.datingtext}>
              {i18n.t("global.areyouinterestedin")}
            </Text>
            <Text allowFontScaling={false} style={styles.datingtext}>
              {i18n.t("GeneralInterest.datingrelationship")}
            </Text>
          </View>
          <Image
            style={styles.image}
            source={require("../../../assets/hurt.png")}
          />
          <View
            style={{
              position: "absolute",
              width: "100%",
              alignSelf: "center",
              bottom: 20,
            }}
          >
            <LinearGradient
              colors={["#338AFF", "#00EDB4"]}
              style={styles.buttonok}
              start={{ x: 0, y: 0 }}
              end={{ x: 1.2, y: 0.6 }}
            >
              <TouchableOpacity
                onPress={() => handelSave(true)}
                // onPress={() => navigation.navigate("RomanticQuestion")}
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
                    color: "#fff",
                  }}
                >
                  {i18n.t("global.yes")}
                </Text>
              </TouchableOpacity>
            </LinearGradient>

            <>
              <View style={styles.buttonno}>
                <TouchableOpacity
                  onPress={() => handelSave(false)}
                  // onPress={() => navigation.navigate("BusinesInfo")}
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
                      color: "#000000",
                    }}
                  >
                    {i18n.t("global.no")}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default RomanticlInfo;

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    flex: 1,
  },
  datingtext: {
    fontSize: 20,
    fontWeight: "300",
    fontFamily: "Inter-Regular",
    color: "#000000",
    alignSelf: "center",
  },
  image: {
    resizeMode: "contain",
    alignSelf: "center",
    top: 90,
    height: 270,
    width: 270,
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
    backgroundColor: "#EAEAEA",
    borderWidth: 0.5,
    borderColor: "#1F1F1F",
  },
});
