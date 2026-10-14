import {
  Image,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import ProfileHeader from "../../Component/ProfileHeader";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import i18n from "../../Context/i18n";

const HelloAmbassador = () => {
  const navigation = useNavigation();
  const router = useRoute();
  const pathname = router?.name;
  const from = router?.params?.from;
  const from2 = router?.params?.from2;
  const from3 = router?.params?.from3;
  const businessName = router?.params?.businessName;
  const fromsecond = router?.params?.fromsecond;

  console.log(from, from2, from3, fromsecond, pathname, businessName, "p4");

  const goBack = () => {
    const params = {
      from: from,
      from2: from2,
      from3: from3,
      from4: pathname,
      businessName: businessName,
      fromsecond: fromsecond,
    };
    navigation.navigate("Embassadordetails", params);
  };
  const handleBack = () => {
    navigation.navigate(from3, {
      from: from,
      from2: from2,
      fromsecond: fromsecond,
      businessName: businessName,
    });
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
          <ProfileHeader handleBack={handleBack} />
          <Image
            style={styles.icon}
            source={require("../../assets/megapho.png")}
          />
          <Text
            allowFontScaling={false}
            style={{
              fontSize: 16,
              fontWeight: "bold",
              fontFamily: "Roboto-Regular",
              color: "#000000",
              textAlign: "center",
              marginTop: 10,
              marginHorizontal: 22,
              marginBottom: 10,
            }}
          >
            {i18n.t("HelloAmbassador.text")}
          </Text>
          <Image
            style={styles.Hello}
            source={require("../../assets/Say Hello Ambassador.png")}
          />
          <Text
            allowFontScaling={false}
            style={{
              fontSize: 16,
              fontWeight: "bold",
              fontFamily: "Roboto-Regular",
              color: "#000000",
              textAlign: "center",
              marginHorizontal: 22,
              lineHeight: 22,
            }}
          >
            {i18n.t("HelloAmbassador.textone")}
          </Text>
          <Image
            style={styles.sayHello}
            source={require("../../assets/Say Hello!.png")}
          />
          <View style={styles.btncontainer}>
            <LinearGradient
              colors={["#338AFF", "#00EDB4"]}
              style={styles.buton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1.2, y: 0.6 }}
            >
              <TouchableOpacity onPress={goBack}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 10,
                  }}
                >
                  <Text allowFontScaling={false} style={styles.textbtn}>
                    {i18n.t("global.signUp")}
                  </Text>
                </View>
              </TouchableOpacity>
            </LinearGradient>
            <LinearGradient
              colors={["#338AFF", "#00EDB4"]}
              style={styles.buton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1.2, y: 0.6 }}
            >
              <TouchableOpacity
                //   onPress={handelClick}
                onPress={() =>
                  navigation.navigate("Home", {
                    businessInfo: null,
                  })
                }
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text allowFontScaling={false} style={styles.textbtn}>
                    Home
                  </Text>
                </View>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default HelloAmbassador;

const styles = StyleSheet.create({
  container: {
    flex: 1,

    paddingTop: 45,
  },
  icon: {
    resizeMode: "contain",
    alignSelf: "center",
    height: "15%",
  },
  Hello: {
    resizeMode: "contain",
    alignSelf: "center",
    width: "62%",
  },
  sayHello: {
    resizeMode: "contain",
    alignSelf: "center",
    width: "50%",
  },
  btncontainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    position: "absolute",
    alignItems: "center",
    alignSelf: "center",
    bottom: 8,
  },
  buton: {
    width: "40%",
    height: 45,
    alignItems: "center",
    borderRadius: 6,
    justifyContent: "center",
  },
  textbtn: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Roboto-Regular",
    color: "#fff",
    textAlign: "center",
  },
});
