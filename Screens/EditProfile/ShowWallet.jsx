import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  Image,
  Pressable,
  Linking,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import Header from "../../Component/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import Loader from "../../Component/Loader";
import AppConfig from "../../AppConfig";

const ShowWallet = () => {
  const navigation = useNavigation();
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [loadingCredit, setLoadingCredit] = useState(true);

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

  const handleWallet = async () => {
    setLoading(true);
    const body = {
      amount: data?.user?.wallet,
    };
    try {
      const response = await axios.post(
        `${AppConfig.ApiUrl}api/v1/users/withdraw-amount/${data?.user?._id}`,
        body
      );
      console.log("response ----- >", response.data);

      const receivedUrl = response.data?.data?.url;
      if (receivedUrl) {
        Linking.openURL(receivedUrl);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#008767", "#00EDB4"]}
        style={styles.boxcontainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Header title="" />
        <Image
          source={require("../../assets/conghand.png")}
          style={styles.orglogo}
          resizeMode="contain"
        />
        <Text
          allowFontScaling={false}
          style={{
            fontSize: 25,
            fontWeight: "900",
            fontFamily: "Roboto-Bold",
            color: "#fff",
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          $ {data?.user?.wallet}
        </Text>
      </LinearGradient>

      <View
        style={{
          marginTop: 20,
          alignItems: "center",
          flex: 1,
        }}
      >
        <View
          style={{
            backgroundColor: "#d9d9d9",
            justifyContent: "center",
            alignItems: "center",
            width: "80%",
            padding: 15,
            borderWidth: 2,
            borderColor: "#019874",
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          <Text
            allowFontScaling={false}
            style={{ fontFamily: "Roboto-Bold", fontSize: 16 }}
          >
            You have {data?.user?.wallet} Remaining Wallets
          </Text>
        </View>

        <View
          style={{
            padding: 10,
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            bottom: 20,
          }}
        >
          <View
            style={{
              width: "90%",
              alignSelf: "center",
              gap: 15,
            }}
          >
            {loading ? (
              <Loader />
            ) : (
              <>
                <Pressable
                  disabled={data?.user?.wallet === 0}
                  onPress={handleWallet}
                  style={{
                    backgroundColor:
                      data?.user?.wallet === 0 ? "#d3d3d3" : "#338aff",
                    height: 55,
                    borderRadius: 100,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    allowFontScaling={false}
                    style={{
                      ...styles.buttonText,
                      color: data?.user?.wallet === 0 ? "#a9a9a9" : "white",
                    }}
                  >
                    WithDrawel
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ShowWallet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 40,
  },
  boxcontainer: {
    width: "100%",
    padding: 9,
  },
  orglogo: {
    resizeMode: "contain",
    alignSelf: "center",
    height: 120,
    top: -15,
  },

  buttonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 16,
    fontFamily: "Roboto-Bold",
    textTransform: "uppercase",
  },
});
