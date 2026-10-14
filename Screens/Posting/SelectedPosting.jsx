import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import React from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import PosingHeader from "../../Component/PosingHeader";
import { useAuth } from "../../Context/AuthContext";
import i18n from "../../Context/i18n";

const SelectedPosting = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const router = useRoute();
  const pathname = router?.name;
  const from = router?.params?.from;

  console.log(from, pathname, "p22");

  const goBack = () => {
    navigation.goBack();
  };

  const handleBack = () => {
    navigation.navigate(from);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ImageBackground
        source={require("../../assets/ImageBackground.jpg")}
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
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginHorizontal: 20,
              }}
            >
              <TouchableOpacity onPress={handleBack ? handleBack : goBack}>
                <Image
                  style={styles.back}
                  source={require("../../assets/btnbtn.png")}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  navigation?.openDrawer();
                }}
              >
                <Ionicons name="menu" size={28} color="black" />
              </TouchableOpacity>
            </View>
            <Image
              style={styles.icon}
              source={require("../../assets/handhang.png")}
            />
          </View>
          <Text
            allowFontScaling={false}
            style={{
              fontSize: 26,
              color: "#000000",
              fontWeight: "400",
              fontFamily: "Inter-Regular",
              textAlign: "center",
            }}
          >
            {i18n.t("global.post")}
          </Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("HoostaDateAndTime", {
                from: from,
                from2: pathname,
                clearform: true,
              })
            }
            style={{
              marginTop: "10%",
              width: "85%",
              alignSelf: "center",
            }}
          >
            <LinearGradient
              colors={["#338AFF", "#00EDB4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1.2, y: 0.6 }}
              style={{
                padding: 16,
                borderRadius: 6,
              }}
            >
              <Text
                allowFontScaling={false}
                style={{
                  textAlign: "center",
                  fontSize: 18,
                  color: "#fff",
                  fontWeight: "bold",
                  fontFamily: "Inter-Regular",
                }}
              >
                {i18n.t("global.Hootsa")}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("PostDiscount", {
                from: from,
                from2: pathname,
                clearform: true,
              })
            }
            style={{
              marginTop: 15,
              width: "85%",
              alignSelf: "center",
            }}
          >
            <LinearGradient
              colors={["#338AFF", "#00EDB4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1.2, y: 0.6 }}
              style={{
                padding: 16,
                borderRadius: 6,
              }}
            >
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: 18,
                  color: "#fff",
                  fontWeight: "bold",
                  fontFamily: "Inter-Regular",
                  textAlign: "center",
                }}
              >
                {i18n.t("DiscountScan.hookup")}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate("PostNotification", {
                from: from,
                from2: pathname,
                clearform: true,
              })
            }
            style={{
              marginTop: 15,
              width: "85%",
              alignSelf: "center",
            }}
          >
            <LinearGradient
              colors={["#338AFF", "#00EDB4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1.2, y: 0.6 }}
              style={{
                padding: 16,
                borderRadius: 6,
              }}
            >
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: 18,
                  color: "#fff",
                  fontWeight: "bold",
                  fontFamily: "Inter-Regular",
                  textAlign: "center",
                }}
              >
                {i18n.t("global.holla")}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default SelectedPosting;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },

  individualcontainer: {
    backgroundColor: "#01569E",
    height: 40,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
  },
  icon: {
    resizeMode: "contain",
    alignSelf: "center",
    width: 80,
    height: 80,
    top: -30,
  },
  back: {
    resizeMode: "contain",
    alignSelf: "center",
    width: 35,
    height: 35,
  },
});
