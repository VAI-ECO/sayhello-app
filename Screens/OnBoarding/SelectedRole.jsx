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
import { useNavigation } from "@react-navigation/native";
import i18n from "../../Context/i18n";

const SelectedRole = () => {
  const navigation = useNavigation();

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
          <Image
            style={styles.image}
            source={require("../../assets/logo.png")}
          />
          <TouchableOpacity
            onPress={() => navigation.navigate("PrivacyIndividual")}
            style={{
              marginTop: "35%",
              width: "90%",
            }}
          >
            <LinearGradient
              colors={["#338AFF", "#00EDB4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1.2, y: 0.6 }}
              style={{
                padding: 12,
                borderRadius: 6,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  // paddingHorizontal: 15,
                }}
              >
                <View style={styles.individualcontainer}>
                  <Ionicons name="person-outline" size={20} color="#fff" />
                </View>
                <Text
                  allowFontScaling={false}
                  style={{
                    paddingLeft: 30,
                    fontSize: 18,
                    color: "#fff",
                    fontWeight: "bold",
                    fontFamily: "Inter-Regular",
                  }}
                >
                  {i18n.t("global.individual")}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("PrivacyAmbasdor")}
            style={{
              marginTop: "5%",
              width: "90%",
            }}
          >
            <LinearGradient
              colors={["#338AFF", "#00EDB4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1.2, y: 0.6 }}
              style={{
                padding: 12,
                borderRadius: 6,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  // paddingHorizontal: 15,
                }}
              >
                <View style={styles.individualcontainer}>
                  <Ionicons name="person-outline" size={20} color="#fff" />
                </View>
                <Text
                  allowFontScaling={false}
                  style={{
                    paddingLeft: 30,
                    fontSize: 18,
                    color: "#fff",
                    fontWeight: "bold",
                    fontFamily: "Inter-Regular",
                  }}
                >
                  {i18n.t("global.ambassador")}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("ChoosegroupAndOrg")}
            style={{
              marginTop: "5%",
              width: "90%",
            }}
          >
            <LinearGradient
              colors={["#338AFF", "#00EDB4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1.2, y: 0.6 }}
              style={{
                padding: 12,
                borderRadius: 6,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  // paddingHorizontal: 15,
                }}
              >
                <View style={styles.individualcontainer}>
                  <MaterialCommunityIcons
                    name="account-group"
                    size={24}
                    color="#fff"
                  />
                </View>
                <Text
                  allowFontScaling={false}
                  style={{
                    paddingLeft: 30,
                    fontSize: 18,
                    color: "#fff",
                    fontWeight: "bold",
                    fontFamily: "Inter-Regular",
                  }}
                >
                  {i18n.t("global.organizationGroup")}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("PrivacyBusines")}
            style={{
              marginTop: "5%",
              width: "90%",
            }}
          >
            <LinearGradient
              colors={["#338AFF", "#00EDB4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1.2, y: 0.6 }}
              style={{
                padding: 12,
                borderRadius: 6,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  // paddingHorizontal: 15,
                }}
              >
                <View style={styles.individualcontainer}>
                  <Ionicons name="business" size={20} color="#fff" />
                </View>
                <Text
                  allowFontScaling={false}
                  style={{
                    paddingLeft: 30,
                    fontSize: 18,
                    color: "#fff",
                    fontWeight: "bold",
                    fontFamily: "Inter-Regular",
                  }}
                >
                  {i18n.t("global.business")}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("PrivacyInfluncer")}
            style={{
              marginTop: "5%",
              width: "90%",
            }}
          >
            <LinearGradient
              colors={["#338AFF", "#00EDB4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1.2, y: 0.6 }}
              style={{
                padding: 12,
                borderRadius: 6,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  // paddingHorizontal: 15,
                }}
              >
                <View style={styles.individualcontainer}>
                  <Image
                    style={styles.imageicon}
                    source={require("../../assets/iconinfluce.png")}
                  />
                </View>
                <Text
                  allowFontScaling={false}
                  style={{
                    paddingLeft: 30,
                    fontSize: 18,
                    color: "#fff",
                    fontWeight: "bold",
                    fontFamily: "Inter-Regular",
                  }}
                >
                  {i18n.t("global.influncer")}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default SelectedRole;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  image: {
    width: 210,
    height: 180,
    top: 90,
    resizeMode: "contain",
  },
  individualcontainer: {
    backgroundColor: "#01569E",
    height: 40,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    alignSelf: "center",
  },
  imageicon: {
    resizeMode: "contain",
    alignSelf: "center",
    width: 22,
    height: 22,
    marginLeft: 2,
  },
});
