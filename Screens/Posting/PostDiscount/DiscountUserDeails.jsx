import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import ConnectionHeader from "../../../Component/ConnectionHeader";
import HoostaService from "../../../Services/HoostaService";
import DiscountService from "../../../Services/DiscountService";
import { useAuth } from "../../../Context/AuthContext";
import moment from "moment";
import i18n from "../../../Context/i18n";

const DiscountUserDeails = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const router = useRoute();
  const pathname = router?.name;
  const from = router?.params?.from;

  console.log(from, pathname, "p2");

  const [visibleImageId, setVisibleImageId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [details, setDetails] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const getDetails = () => {
    DiscountService.getDiscountByUserId(user?.user?._id)
      .then((res) => {
        setDetails(res);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Err: ", err);
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
    <SafeAreaView style={styles.container}>
      {/* <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} progressViewOffset={50} />
        }
      >
      > */}
      <ConnectionHeader handleBack={handleBack} />
      <View style={{ paddingTop: 10 }}>
        <LinearGradient
          colors={["#F7CC7F", "#F60F0F"]}
          style={styles.hangoutbox}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text allowFontScaling={false} style={styles.innertext}>
            {i18n.t("global.ourDiscounts")}
          </Text>
        </LinearGradient>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingTop: 20 }}
        // contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            progressViewOffset={-150}
          />
        }
      >
        {loading ? (
          <ActivityIndicator size={30} color="blue" />
        ) : (
          <>
            {details &&
              details?.map((location) => (
                <View key={location._id} style={styles.detailscontainer}>
                  <View style={styles.innerContainer}>
                    <Image
                      style={styles.icon}
                      source={require("../../../assets/hookup.png")}
                    />
                    <Image
                      style={styles.mainicon}
                      source={require("../../../assets/image large.png")}
                    />
                    <View style={{ marginLeft: 5, flex: 1 }}>
                      {/* <Text allowFontScaling={false} style={styles.nameText}>
                    {location.startDate}
                  </Text> */}
                      <Text
                        allowFontScaling={false}
                        style={styles.categoryText}
                      >
                        {location.itemName}
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
                  {visibleImageId === location._id && (
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
                          {i18n.t("global.startDate")}
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
                          {moment(location?.startDate).format("DD-MMM-YYYY")}
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
                          {i18n.t("global.time")}
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
                          {location?.time}
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
                          {i18n.t("global.discount")}
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
                          {location?.itemDiscount}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              ))}
          </>
        )}
      </ScrollView>
      <View style={styles.postButtonContainer}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("PostDiscount", {
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
      {/* </ScrollView> */}
    </SafeAreaView>
  );
};

export default DiscountUserDeails;

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
    marginLeft: 5,
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
