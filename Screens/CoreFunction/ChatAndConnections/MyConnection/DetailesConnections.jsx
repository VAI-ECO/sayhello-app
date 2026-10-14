import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { useRoute } from "@react-navigation/native";
import ConnectionHeader from "../../../../Component/ConnectionHeader";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import i18n from "../../../../Context/i18n";

const DetailesConnections = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { title } = route.params || {};
  const [visibleImageId, setVisibleImageId] = useState(null);

  const hangoutData = [
    {
      id: 1,
      name: "The Crew Bar + Grill",
      category: "Bars",
      image: require("../../../../assets/alscat.png"),
    },
    {
      id: 2,
      name: "Sunset Lounge",
      category: "Lounges",
      image: require("../../../../assets/alscat.png"),
    },
  ];

  const toggleImageVisibility = (id) => {
    setVisibleImageId((prevId) => (prevId === id ? null : id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ConnectionHeader />
      <View style={{ paddingTop: 10 }}>
        <LinearGradient
          colors={["#F7CC7F", "#F60F0F"]}
          style={styles.hangoutbox}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text allowFontScaling={false} style={styles.innertext}>
            {title}
          </Text>
        </LinearGradient>
      </View>
      <ScrollView contentContainerStyle={{ paddingTop: 20 }}>
        {hangoutData.map((location) => (
          <View key={location.id} style={styles.detailscontainer}>
            <View style={styles.innerContainer}>
              <Image
                style={styles.icon}
                source={require("../../../../assets/hosstsa.png")}
              />
              <Image style={styles.mainicon} source={location.image} />
              <View style={{ marginLeft: 5, flex: 1 }}>
                <Text allowFontScaling={false} style={styles.nameText}>
                  Mon, Apr 23 · 6:00 Pm - 10:00
                </Text>
                <Text allowFontScaling={false} style={styles.categoryText}>
                  Lady’s Night
                </Text>
                <Text allowFontScaling={false} style={styles.categoryText}>
                  Alsop Night Club
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => toggleImageVisibility(location.id)}
              >
                <View style={styles.appleinercontainer}>
                  <Feather name="minimize" size={22} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>
            {visibleImageId === location.id && (
              <View style={{ paddingTop: 20 }}>
                <Text allowFontScaling={false} style={styles.textbtn}>
                  Details
                </Text>
                <View style={styles.innerContainer}>
                  <Image
                    style={styles.icon}
                    source={require("../../../../assets/hosstsa.png")}
                  />
                  <Image style={styles.mainicon} source={location.image} />
                  <View style={{ marginLeft: 5, flex: 1 }}>
                    <Text allowFontScaling={false} style={styles.nameText}>
                      Mon, Apr 23 · 6:00 Pm - 10:00
                    </Text>
                    <Text allowFontScaling={false} style={styles.categoryText}>
                      Lady’s Night
                    </Text>
                    <Text allowFontScaling={false} style={styles.categoryText}>
                      Alsop Night Club
                    </Text>
                  </View>
                </View>
                <Text
                  allowFontScaling={false}
                  style={{
                    fontSize: 18,
                    fontWeight: "900",
                    fontFamily: "Roboto-Regular",
                    color: "#000000",
                    marginHorizontal: 10,
                  }}
                >
                  Description
                </Text>
                <Text
                  allowFontScaling={false}
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    fontFamily: "Roboto-Regular",
                    color: "#000000",
                    marginHorizontal: 10,
                    marginBottom: 10,
                  }}
                >
                  Come attend our meet and greet saturday night
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginHorizontal: 10,
                    marginBottom: 10,
                  }}
                >
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontSize: 16,
                      fontWeight: "900",
                      fontFamily: "Roboto-Regular",
                      color: "#000000",
                    }}
                  >
                    {i18n.t("global.Attended")}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontSize: 16,
                      fontWeight: "900",
                      fontFamily: "Roboto-Regular",
                      color: "#000000",
                    }}
                  >
                    120
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginHorizontal: 10,
                    marginBottom: 10,
                  }}
                >
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontSize: 16,
                      fontWeight: "900",
                      fontFamily: "Roboto-Regular",
                      color: "#000000",
                    }}
                  >
                    {i18n.t("global.RSVP")}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontSize: 16,
                      fontWeight: "900",
                      fontFamily: "Roboto-Regular",
                      color: "#000000",
                    }}
                  >
                    10
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginHorizontal: 10,
                    marginBottom: 5,
                  }}
                >
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontSize: 16,
                      fontWeight: "900",
                      fontFamily: "Roboto-Regular",
                      color: "#000000",
                    }}
                  >
                    {i18n.t("global.cost")}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontSize: 16,
                      fontWeight: "900",
                      fontFamily: "Roboto-Regular",
                      color: "#000000",
                    }}
                  >
                    {i18n.t("global.free")}
                  </Text>
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
      <View style={styles.postButtonContainer}>
        <TouchableOpacity onPress={() => navigation.navigate("SelectedPosting")}>
          <LinearGradient
            colors={["#2AC327", "#7C7C7C"]}
            style={styles.postbtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text allowFontScaling={false} style={styles.innertext}>
              Post
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default DetailesConnections;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 46,
  },
  hangoutbox: {
    width: "90%",
    padding: 14,
    paddingHorizontal: 22,
    marginHorizontal: 22,
    borderRadius: 15,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  innertext: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Roboto-Bold",
    color: "#000000",
  },
  detailscontainer: {
    borderRadius: 16,
    marginHorizontal: 22,
    borderColor: "#000000",
    marginBottom: 10,
    borderWidth: 1,
    padding: 5,
    backgroundColor: "#D9D9D9",
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginLeft: 5,
  },
  mainicon: {
    width: 55,
    height: 55,
    resizeMode: "cover",
    alignSelf: "center",
    marginRight: 10,
    borderRadius: 10,
  },
  appleinercontainer: {
    backgroundColor: "#F30A0A",
    height: 35,
    width: 35,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    marginTop: 8,
    marginHorizontal: 5,
    marginBottom: 5,
  },

  nameText: {
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "Roboto-Regular",
    color: "#262627",
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Roboto-Regular",
    color: "#000000",
  },

  textbtn: {
    fontSize: 18,
    fontWeight: "900",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    textAlign: "center",
    marginBottom: 20,
  },
  icon: {
    resizeMode: "contain",
    height: 50,
    width: 50,
  },
  postButtonContainer: {
    width: "100%",
    padding: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 22,
  },
  postbtn: {
    width: "100%",
    padding: 14,
    borderRadius: 15,
    alignItems: "center",
  },
});
