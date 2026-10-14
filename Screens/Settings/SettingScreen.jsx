import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import Header from "../../Component/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../../Context/i18n";

const SettingScreen = () => {
  const navigation = useNavigation();
  const [data, setData] = useState();
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (userData !== null) {
          const parsedData = JSON.parse(userData);

          setData(parsedData);
        } else {
          console.log("No userData found");
        }
      } catch (error) {
        console.error("Error fetching userData:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ImageBackground
        source={require("../../assets/imagebackgroung.jpg")}
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          flex: 1,
          left: 0,
          top: 0,
        }}
      >
        <View style={styles.container}>
          <Header title="" />

          {/* Conditionally render the "Update personal information" button */}
          {!["business", "group", "organization"].includes(
            data?.user?.user_type
          ) && (
            <TouchableOpacity
              onPress={() => navigation.navigate("EditPersonalInfo")}
              style={{
                marginVertical: 15,
                width: "90%",
                alignSelf: "center",
              }}
            >
              <View style={styles.mainbox}>
                <Text style={styles.boxtext}>
                  {i18n.t("global.updatepersonalinformation")}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Update business interests button */}
          <TouchableOpacity
            style={styles.innerbox}
            onPress={() => navigation.navigate("EditBusinesInfo")}
          >
            <View style={styles.mainbox}>
              <Text style={styles.boxtext}>
                {i18n.t("global.updatebusinessinterests")}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Change password button */}
          <TouchableOpacity
            style={styles.innerbox}
            onPress={() => navigation.navigate("ChangePassword")}
          >
            <View style={styles.mainbox}>
              <Text style={styles.boxtext}>
                {i18n.t("global.changeyourpassword")}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default SettingScreen;

const styles = StyleSheet.create({
  container: {
    paddingTop: 45,
    flex: 1,
  },
  mainbox: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Adds shadow for Android
  },
  innerbox: {
    marginVertical: 10,
    width: "90%",
    alignSelf: "center",
  },
  boxtext: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
});
