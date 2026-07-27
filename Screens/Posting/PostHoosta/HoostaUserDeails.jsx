import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  ScrollView,
  ImageBackground,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import ConnectionHeader from "../../../Component/ConnectionHeader";
import HoostaService from "../../../Services/HoostaService";
import { useAuth } from "../../../Context/AuthContext";
import moment from "moment";
import i18n from "../../../Context/i18n";

const HoostaUserDeails = () => {
  const navigation = useNavigation();
  const router = useRoute();
  const pathname = router?.name;
  const from = router?.params?.from;

  console.log(from, pathname, "p2");

  const { user } = useAuth();
  const [visibleImageId, setVisibleImageId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const getDetails = async () => {
    await HoostaService.getHoostaByUserId(user?.user?._id)
      .then((res) => {
        setDetails(res);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Err on getHoostaByUserId: ", err);
        setLoading(false);
      });
  };

  useFocusEffect(
    React.useCallback(() => {
      getDetails();
    }, [router])
  );

  const toggleImageVisibility = (id) => {
    setVisibleImageId((prevId) => (prevId === id ? null : id));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([getDetails()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleBack = () => {
    navigation.navigate(from);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
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
      >
        <View style={styles.container}>
          <ConnectionHeader handleBack={handleBack} />
          <View style={{ paddingTop: 10 }}>
            <LinearGradient
              colors={["#F7CC7F", "#F60F0F"]}
              style={styles.hangoutbox}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text allowFontScaling={false} style={styles.innertext}>
                {i18n.t("global.ourHootsas")}
              </Text>
            </LinearGradient>
          </View>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                progressViewOffset={50}
              />
            }
          >
            {loading ? (
              <ActivityIndicator size={30} color="blue" />
            ) : (
              <ScrollView contentContainerStyle={{ paddingTop: 20 }}>
                {details &&
                  details?.map((location) => (
                    <View key={location._id} style={styles.detailscontainer}>
                      <View style={styles.innerContainer}>
                        <Image
                          style={styles.icon}
                          source={require("../../../assets/hosstsa.png")}
                        />
                        {location?.photos?.[0] ? (
                          <Image
                            style={styles.mainicon}
                            source={{ uri: location?.photos[0] }}
                          />
                        ) : (
                          <Image
                            style={styles.mainicon}
                            source={require("../../../assets/image large.png")}
                          />
                        )}

                        <View style={{ marginLeft: 5, flex: 1 }}>
                          <Text
                            allowFontScaling={false}
                            style={styles.nameText}
                          >
                            {moment(location.date).format("M/D/YY")}
                          </Text>
                          <Text
                            allowFontScaling={false}
                            style={styles.categoryText}
                          >
                            {location.name}
                          </Text>
                          <Text
                            allowFontScaling={false}
                            style={styles.nameText}
                          >
                            {location.address}
                          </Text>
                        </View>

                        <TouchableOpacity
                          onPress={() => toggleImageVisibility(location._id)}
                        >
                          <View style={styles.appleinercontainer}>
                            <Feather name="minimize" size={22} color="#fff" />
                          </View>
                        </TouchableOpacity>
                      </View>
                      {visibleImageId === location?._id && (
                        <View style={{ paddingTop: 20 }}>
                          <Text
                            allowFontScaling={false}
                            style={{
                              fontSize: 18,
                              fontWeight: "900",
                              fontFamily: "Roboto-Bold",
                              color: "#000000",
                              marginHorizontal: 10,
                            }}
                          >
                            {i18n.t("global.description")}
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
                            {location.description}
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
                              {location?.attendUserIds?.length}
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
            )}
          </ScrollView>
        </View>
        <View style={styles.postButtonContainer}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("HoostaDateAndTime", {
                from: from,
                from2: pathname,
                clearform: true,
              })
            }
          >
            <LinearGradient
              colors={["#2AC327", "#7C7C7C"]}
              style={styles.postbtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text allowFontScaling={false} style={styles.innertext}>
                {i18n.t("global.post")}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
};

export default HoostaUserDeails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 45,
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
    padding: 10,
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
    fontWeight: "500",
    fontFamily: "Roboto-Regular",
    color: "#262627",
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "900",
    fontFamily: "Roboto-Bold",
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

    paddingHorizontal: 22,
  },
  postbtn: {
    width: "100%",
    padding: 14,
    borderRadius: 15,
    alignItems: "center",
  },
});
