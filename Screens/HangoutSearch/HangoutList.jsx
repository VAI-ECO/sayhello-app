import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Linking,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useState } from "react";
import ProfileHeader from "../../Component/ProfileHeader";
import {
  Feather,
  EvilIcons,
  MaterialCommunityIcons,
  AntDesign,
  MaterialIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { widthPercentageToDP } from "react-native-responsive-screen";

import axios from "axios";
import AppConfig from "../../AppConfig";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import i18n from "../../Context/i18n";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
const API_URL = `${AppConfig.ApiUrl}api/v1/business/all`;

const HangoutList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [visibleImageId, setVisibleImageId] = useState(null);
  const navigation = useNavigation();

  const fetchData = async (pageNum) => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}?page=${pageNum}&limit=10`);
      const newData = response?.data?.businesses?.filter(
        (els) => els?.name !== ""
      );

      // Prevent duplicates by filtering out existing items
      const uniqueData = newData.filter(
        (newItem) =>
          !data.some((existingItem) => existingItem._id === newItem._id)
      );

      setData((prevData) => [...prevData, ...uniqueData]);
      setHasMore(pageNum < response.data.totalPages);
      setPage(pageNum + 1);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData(1);
    }, [navigation])
  );

  const parseBusinessHours = (businessHours) => {
    return businessHours.map((entry) => {
      const [day, hours] = entry.split(": ").map((str) => str.trim());
      return { day, hours };
    });
  };

  const dayAbbreviations = {
    Monday: "Mon",
    Tuesday: "Tue",
    Wednesday: "Wed",
    Thursday: "Thu",
    Friday: "Fri",
    Saturday: "Sat",
    Sunday: "Sun",
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchData(page);
    }
  };

  const renderItem = ({ item }) => {
    const handlePhoneCall = (phone) => {
      const phoneNumber = `tel:${phone}`;
      Linking.openURL(phoneNumber).catch((err) =>
        console.error("Failed to open dialer:", err)
      );
    };

    const handleOpenMap = (address) => {
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        address
      )}`;
      Linking.openURL(mapUrl).catch((err) =>
        console.error("Failed to open Google Maps:", err)
      );
    };

    const handleWebsite = (website) => {
      Linking.openURL(website).catch((err) =>
        console.error("Failed to open website:", err)
      );
    };

    const parsedBusinessHours = parseBusinessHours(item.businessHours || []);

    return (
      <View style={styles.detailscontainer}>
        <View style={styles.innerContainer}>
          <Image
            style={styles.mainicon}
            source={
              item?.photos && item.photos.length > 0
                ? { uri: item.photos[0] }
                : require("../../assets/imagecrew.png")
            }
          />
          <View style={{ marginLeft: 5, flex: 1 }}>
            <Text allowFontScaling={false} style={styles.nameText}>
              {item?.name}
            </Text>
            <Text allowFontScaling={false} style={styles.categoryText}>
              {i18n.t("global.category")}: {item?.businessCategory}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <TouchableOpacity onPress={() => toggleImageVisibility(item?._id)}>
            <View style={styles.iconContainer}>
              <Feather name="minimize" size={22} color="#fff" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleOpenMap(`${item?.address} in ${item?.city}`)}
          >
            <View style={styles.iconContainer}>
              <EvilIcons name="location" size={26} color="#fff" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handlePhoneCall(item?.phone)}>
            <View style={styles.iconContainer}>
              <Feather name="phone-call" size={19} color="#fff" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleImageVisibility(item?._id)}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={23}
                color="#fff"
              />
            </View>
          </TouchableOpacity>
        </View>
        {visibleImageId === item?._id && (
          <View>
            <Image
              style={styles.mainimage}
              source={
                item?.photos && item.photos.length > 0
                  ? { uri: item.photos[0] }
                  : require("../../assets/imagecrew.png")
              }
              resizeMode="cover"
            />

            <View style={{}}>
              {/* <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <LinearGradient
                  colors={["#016D53", "#016D53"]}
                  style={styles.button}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1.2, y: 0.6 }}
                >
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      width: "100%",
                      justifyContent: "center",
                    }}
                    onPress={() => handleWebsite(item?.website)}
                  >
                    <MaterialIcons
                      name="notifications-active"
                      size={20}
                      color="#fff"
                      style={{ marginRight: 5 }}
                    />
                    <Text allowFontScaling={false} style={styles.textbtn}>
                      {i18n.t("global.notifyMe")}
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
                <View style={styles.iconContainer}>
                  <AntDesign name="heart" size={20} color="#fff" />
                </View>
                <View style={styles.iconContainer}>
                  <FontAwesome5 name="people-arrows" size={20} color="#fff" />
                </View>
              </View> */}
              <View style={styles.descriptionContainer}>
                <Text allowFontScaling={false} style={styles.text}>
                  {item?.description}
                </Text>
              </View>
              <View style={styles.addressHeader}>
                <Text allowFontScaling={false} style={styles.addressHeaderText}>
                  {i18n.t("global.address")}
                </Text>
                <View style={styles.hoursContainer}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={23}
                    color="#008767"
                    style={{ marginRight: 5 }}
                  />
                  <Text allowFontScaling={false} style={styles.hoursText}>
                    {i18n.t("global.hoursOfOperation")}
                  </Text>
                </View>
              </View>
              <View style={styles.addressDetails}>
                <View style={{ width: widthPercentageToDP(46) }}>
                  <Text style={styles.addressText}>
                    {item?.address}, {item?.state}, {item?.zipcode}
                  </Text>
                  {item?.phone && (
                    <View style={styles.contactRow}>
                      <Feather name="phone-call" size={17} color="#008767" />
                      <Text style={styles.contactText}>{item?.phone}</Text>
                    </View>
                  )}
                  {item?.email && (
                    <View style={styles.contactRow}>
                      <MaterialCommunityIcons
                        name="email-edit-outline"
                        size={18}
                        color="#008767"
                      />
                      <Text style={styles.contactText}>{item?.email}</Text>
                    </View>
                  )}
                  <View style={styles.socialLinksContainer}>
                    {item?.socialLinks
                      ?.filter((els) => els?.link !== "")
                      ?.map((social, index) => (
                        <TouchableOpacity
                          key={`${social.type}-${index}`}
                          onPress={() => Linking.openURL(social.link)}
                          style= {styles.linksContainer}
                        >
                          {social?.type === "Facebook" && (
                            <FontAwesome5
                              name="facebook"
                              size={30}
                              color="#338AFF"
                              style={{ marginRight: 10 }}
                            />
                          )}
                          {social?.type === "Instagram" && (
                            <FontAwesome5
                              name="instagram"
                              size={30}
                              color="#338AFF"
                              style={{ marginRight: 10 }}
                            />
                          )}
                          {social?.type === "TikTok" && (
                            <FontAwesome5
                              name="tiktok"
                              size={30}
                              color="#338AFF"
                              style={{ marginRight: 10 }}
                            />
                          )}
                          {social?.type === "YouTube" && (
                            <FontAwesome5
                              name="youtube"
                              size={30}
                              color="#338AFF"
                              style={{ marginRight: 10 }}
                            />
                          )}
                          {social?.type === "LinkedIn" && (
                            <FontAwesome5
                              name="linkedin"
                              size={30}
                              color="#338AFF"
                              style={{ marginRight: 10 }}
                            />
                          )}
                          {social?.type === "Twitter" && (
                            <FontAwesome5
                              name="twitter"
                              size={30}
                              color="#338AFF"
                              style={{ marginRight: 10 }}
                            />
                          )}
                        </TouchableOpacity>
                      ))}
                  </View>
                </View>
                <View style={{ width: widthPercentageToDP(50) }}>
                  {parsedBusinessHours.map((entry, index) => (
                    <View
                      key={`${entry.day}-${index}`}
                      style={styles.dayTimeRow}
                    >
                      <Text style={styles.dayText}>
                        {dayAbbreviations[entry.day] || entry.day}
                      </Text>
                      <Text style={styles.timeText}>{entry.hours}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  const refreshData = useCallback(async () => {
    setRefreshing(true);
    setPage(1); // Reset page to 1 for fresh data
    setData([]); // Clear the existing data

    try {
      const response = await axios.get(`${API_URL}?page=1&limit=10`);
      const newData = response?.data?.businesses?.filter(
        (els) => els?.name !== ""
      );
      setData(newData);
      setHasMore(response.data.totalPages > 1);
      setPage(2);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const toggleImageVisibility = (id) => {
    setVisibleImageId((prevId) => (prevId === id ? null : id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ProfileHeader />
      <FlatList
        data={data}
        // keyExtractor={(item, index) =>
        //   item._id ? item._id.toString() : `item-${index}`
        // }
        renderItem={renderItem}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={refreshData}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator
              size="large"
              color="#0000ff"
              style={{ alignItems: "center", alignSelf: "center" }}
            />
          ) : null
        }
        contentContainerStyle={{ paddingTop: 20 }}
      />
    </SafeAreaView>
  );
};

export default HangoutList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 45,
  },
  detailscontainer: {
    borderRadius: 6,
    marginHorizontal: 22,
    borderColor: "#000000",
    marginBottom: 10,
    borderWidth: 1,
    padding: 10, // Increased padding for better spacing
    backgroundColor: "#D9D9D9",
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginLeft: 5,
  },
  mainicon: {
    width: 50,
    height: 50,
    resizeMode: "cover",
    alignSelf: "center",
    marginRight: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  iconContainer: {
    backgroundColor: "#008767",
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
    fontSize: 16,
    fontWeight: "bold",
    // fontFamily: "Roboto-Regular", // Ensure the font is loaded
    color: "#262627",
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "600",
    // fontFamily: "Roboto-Regular",
    color: "#000000",
  },
  mainimage: {
    width: "95%",
    height: hp("35%"),
    resizeMode: "contain",
    alignSelf: "center",
    marginVertical: 10,
    borderRadius: 10,
  },
  button: {
    width: "30%",
    height: 35,
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    marginLeft: 5,
  },
  textbtn: {
    fontSize: 14,
    fontWeight: "600",
    // fontFamily: "Roboto-Regular",
    color: "#fff",
    textAlign: "center",
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
    // fontFamily: "Roboto-Regular",
    color: "#000000",
    lineHeight: 20,
    marginHorizontal: 5,
  },
  dayTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    // justifyContent: "space-between",
  },
  dayText: {
    fontSize: 11,
    fontWeight: "900",
    // fontFamily: "Roboto-Regular",
    color: "#000000",
    width: "25%", // Added width to prevent overflow
  },
  timeText: {
    fontSize: 11,
    fontWeight: "600",
    // fontFamily: "Roboto-Regular",
    color: "#262627",
    textAlign: "left",
    // width: "65%", // Adjusted width
  },
  descriptionContainer: {
    padding: 10,
    backgroundColor: "#E7F7F3",
    borderRadius: 8,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#008767",
    marginBottom: 8,
    marginTop: 8,
  },
  addressHeader: {
    flexDirection: "row",
    // justifyContent: "space-between",
    marginHorizontal: 6,
    alignItems: "center",
  },
  addressHeaderText: {
    fontSize: 14,
    fontWeight: "bold",
    // fontFamily: "Roboto-Regular",
    color: "#262627",
    paddingRight: "42%",
  },
  hoursContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  hoursText: {
    fontSize: 14,
    fontWeight: "bold",
    // fontFamily: "Roboto-Regular",
    color: "#262627",
  },
  addressDetails: {
    flexDirection: "row",
    marginHorizontal: 10,
  },
  addressText: {
    fontSize: 12,
    fontWeight: "600",
    // fontFamily: "Roboto-Regular",
    color: "#262627",
    marginBottom: 5,
    marginRight: 15,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  contactText: {
    fontSize: 11,
    fontWeight: "900",
    // fontFamily: "Roboto-Regular",
    color: "#262627",
    marginLeft: 4,
  },
  socialLinksContainer: {
    flexDirection: "row",
    alignItems: "center",
    textAlign:'center',
    marginTop: 60,
  },
  linksContainer : {
    margin:4,
  }
});