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
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import userService from "../../../Services/userService";
import { useAuth } from "../../../Context/AuthContext";
import Header from "../../../Component/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";
const BusinesInfo = () => {
  const { user, updateUser } = useAuth();

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
    let userId = user?.user?._id;
    const data = {
        interestedInBusiness: status,
    };
    userService
      .updateIsIntrestedInBussiness(userId,data)
      .then((res) => {
        console.log("ali ghazanfar here: ", res)
        if (status === true) {
          navigation.navigate("EditBusinessQuestion");
          const updates = {
            interestedInBusiness: res.user.interestedInBusiness,
          };
          updateUser(updates);
        } else {
            navigation.navigate("MySettings", { screen: "SettingScreen" });
        }
        console.log("RES: ", res);
      })
      .catch((err) => {
        console.log("error: ", err);
      });
  };

  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ImageBackground
        source={require("../../../assets/imagebackgroung.jpg")}
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
            <Text
              style={{
                fontSize: 20,
                fontWeight: "300",
                fontFamily: "Inter-Regular",
                color: "#000000",
                alignSelf: "center",
              }}
            >
              Are you interested in
            </Text>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "300",
                fontFamily: "Inter-Regular",
                color: "#000000",
                alignSelf: "center",
              }}
            >
              Business Networking
            </Text>
          </View>
          <Image
            style={styles.image}
            source={require("../../../assets/busniesman.png")}
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
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    fontFamily: "Inter-Regular",
                    color: "#fff",
                  }}
                >
                  Yes
                </Text>
              </TouchableOpacity>
            </LinearGradient>

            <>
              <View style={styles.buttonno}>
                <TouchableOpacity
                  onPress={() => handelSave(false)}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      fontFamily: "Inter-Regular",
                      color: "#000000",
                    }}
                  >
                    No
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

export default BusinesInfo;

const styles = StyleSheet.create({
  container: {
    paddingTop: 45,
    flex: 1,
  },
  image: {
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: 60,
    height: 270,
    width: 270,
    top: 80,
  },
  buttonok: {
    width: "90%",
    height: 50,
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 25,
  },
  buttonno: {
    width: "90%",
    height: 50,
    borderRadius: 10,
    alignSelf: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#1F1F1F",
  },
});
